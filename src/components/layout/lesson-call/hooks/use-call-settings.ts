'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useCall, useCallStateHooks } from '@stream-io/video-react-sdk';
import { notifications } from '@mantine/notifications';

export type VideoBackground = 'none' | 'blur' | 'blur-strong';
export type VideoQuality = 'auto' | '1440p' | '1080p' | '720p' | '480p' | '360p';

// MediaTrackConstraints — C type for CameraManager (no { video: ... } wrapper)
const QUALITY_CONSTRAINTS: Record<VideoQuality, MediaTrackConstraints> = {
  auto: {},
  '1440p': { width: { ideal: 2560 }, height: { ideal: 1440 } },
  '1080p': { width: { ideal: 1920 }, height: { ideal: 1080 } },
  '720p': { width: { ideal: 1280 }, height: { ideal: 720 } },
  '480p': { width: { ideal: 854 }, height: { ideal: 480 } },
  '360p': { width: { ideal: 640 }, height: { ideal: 360 } },
};

/**
 * Hook encapsulating all advanced A/V call settings:
 * noise cancellation, background blur, video mirror, video quality, mic constraints.
 */
export function useCallSettings() {
  const call = useCall();

  // ──────────────────────────────────────────
  // 1. Noise Cancellation (Krisp)
  // ──────────────────────────────────────────
  const [is_nc_enabled, set_is_nc_enabled] = useState(false);
  const [is_nc_loading, set_is_nc_loading] = useState(false);
  const nc_ref = useRef<any>(null);

  const [echo_cancel, set_echo_cancel] = useState(false);
  const [auto_gain, set_auto_gain] = useState(false);
  const [mic_volume, set_mic_volume] = useState(100);
  const mic_filter_ref = useRef<(() => void) | null>(null);

  const applyMicConstraints = useCallback(async (echo: boolean, gain: boolean, software_nc_active: boolean) => {
    if (!call) return;
    
    const constraints = {
      echoCancellation: echo,
      autoGainControl: gain,
      // If software NC is active, we MUST disable browser-level suppression 
      // to prevent artifacts and ensure Krisp gets the raw audio stream.
      noiseSuppression: !software_nc_active,
    };

    // Update default constraints for future enable() calls
    call.microphone.setDefaultConstraints(constraints);

    // Apply to active track immediately if it exists (no flicker/drop)
    const active_stream = call.microphone.state.mediaStream;
    const audio_track = active_stream?.getAudioTracks()[0];
    
    if (audio_track) {
      try {
        await audio_track.applyConstraints(constraints);
      } catch (e) {
        console.error('Failed to apply mic constraints live, falling back to restart', e);
        // Fallback: only restart if live update fails
        if (call.microphone.state.status === 'enabled') {
          await call.microphone.disable();
          await call.microphone.enable();
        }
      }
    }
  }, [call]);

  const toggleNoiseCancellation = useCallback(async (
    checked: boolean,
    t: (key: string) => string
  ) => {
    if (!call) return;
    set_is_nc_loading(true);
    try {
      if (!checked) {
        await call.microphone.disableNoiseCancellation();
        set_is_nc_enabled(false);
        // Re-enable browser-level suppression when software NC is off
        await applyMicConstraints(echo_cancel, auto_gain, false);
      } else {
        const { NoiseCancellation } = await import('@stream-io/audio-filters-web');

        if (!nc_ref.current) {
          const nc = new NoiseCancellation();
          await nc.init();
          nc_ref.current = nc;
        }

        // Disable browser-level suppression to let software NC work with raw audio
        await applyMicConstraints(echo_cancel, auto_gain, true);
        await call.microphone.enableNoiseCancellation(nc_ref.current);
        set_is_nc_enabled(true);
      }
    } catch (e: any) {
      set_is_nc_enabled(false);
      notifications.show({
        title: t('error'),
        message: e?.message?.includes('not available')
          ? t('noise_suppression_not_available')
          : t('noise_suppression_failed'),
        color: 'red',
      });
    } finally {
      set_is_nc_loading(false);
    }
  }, [call, echo_cancel, auto_gain, applyMicConstraints]);

  // ──────────────────────────────────────────
  // 2. Background Blur
  // ──────────────────────────────────────────
  const [bg_filter, set_bg_filter] = useState<VideoBackground>('none');
  const [bg_loading, set_bg_loading] = useState(false);
  const bg_unregister_ref = useRef<(() => void) | null>(null);
  const bg_options_ref = useRef<any>(null);
  
  const applyBackgroundFilter = useCallback(async (
    value: VideoBackground,
    t: (key: string) => string
  ) => {
    if (!call) return;
    set_bg_loading(true);

    try {
      if (value === 'none') {
        if (bg_unregister_ref.current) {
          bg_unregister_ref.current();
          bg_unregister_ref.current = null;
        }
        set_bg_filter('none');
        return;
      }

      const { isPlatformSupported, VirtualBackground } = await import('@stream-io/video-filters-web');
      const supported = await isPlatformSupported();
      if (!supported) {
        notifications.show({
          title: t('error'),
          message: t('bg_filter_not_supported'),
          color: 'orange',
        });
        return;
      }

      const blurLevel = value === 'blur-strong' ? 'high' : 'medium';

      // If we already have an active filter, try to update it dynamically
      if (bg_unregister_ref.current && bg_options_ref.current) {
        try {
          if (typeof bg_options_ref.current.updateOptions === 'function') {
            await bg_options_ref.current.updateOptions({ backgroundFilter: 'blur', backgroundBlurLevel: blurLevel });
            set_bg_filter(value);
            return;
          }
          if (typeof bg_options_ref.current.update === 'function') {
            await bg_options_ref.current.update({ backgroundFilter: 'blur', backgroundBlurLevel: blurLevel });
            set_bg_filter(value);
            return;
          }
        } catch (err) {
          console.warn('Could not update background filter dynamically', err);
        }
      }

      // We must unregister the old filter BEFORE registering the new one.
      // If we don't, the new filter will receive the old filter's output track as input.
      // Then, when we eventually unregister the old filter, it stops its output track,
      // which kills the input to the new filter, resulting in the camera turning off permanently.
      if (bg_unregister_ref.current) {
        bg_unregister_ref.current();
        bg_unregister_ref.current = null;
      }
      
      const { unregister } = call.camera.registerFilter((ms: MediaStream) => {
        const video_track = ms.getVideoTracks()[0];
        if (!video_track) return { output: ms };

        const processor = new VirtualBackground(
          video_track as any,
          { backgroundFilter: 'blur', backgroundBlurLevel: blurLevel }
        );
        
        bg_options_ref.current = processor;

        return {
          output: processor.start().then((processed_track) =>
            new MediaStream([processed_track, ...ms.getAudioTracks()])
          ),
          stop: () => {
            processor.stop();
            if (bg_options_ref.current === processor) {
              bg_options_ref.current = null;
            }
          },
        };
      });
      
      bg_unregister_ref.current = () => {
        unregister();
      };

      set_bg_filter(value);
    } catch (e) {
      console.error('Background filter error:', e);
      notifications.show({ title: t('error'), message: t('bg_filter_failed'), color: 'red' });
    } finally {
      set_bg_loading(false);
    }
  }, [call]);

  // ──────────────────────────────────────────
  // 3. Mirror local video
  // ──────────────────────────────────────────
  const { useLocalParticipant } = useCallStateHooks();
  const localParticipant = useLocalParticipant();

  const [is_mirrored, set_is_mirrored] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('call_mirror_video') === 'true';
    }
    return false;
  });

  const toggleMirror = useCallback((checked: boolean) => {
    set_is_mirrored(checked);
    localStorage.setItem('call_mirror_video', String(checked));
  }, []);

  // Effect to apply mirror CSS reliably by finding the local video element
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const applyMirror = () => {
      const localTrack = call?.camera.state.mediaStream?.getVideoTracks()[0];
      if (!localTrack) return;

      const videos = document.querySelectorAll('video');
      videos.forEach((video) => {
        const stream = video.srcObject as MediaStream | null;
        if (stream && stream.getVideoTracks().includes(localTrack)) {
          // This is the local participant's video!
          // Stream SDK often applies inline 'transform: rotateY(180deg)'
          // We override it safely with !important
          video.style.setProperty(
            'transform',
            is_mirrored ? 'scaleX(-1)' : 'scaleX(1)',
            'important'
          );
        }
      });
    };

    // Apply immediately and whenever new video elements appear
    applyMirror();
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.addedNodes.length > 0) {
          applyMirror();
          break;
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [is_mirrored, call?.camera.state.mediaStream]);

  // ──────────────────────────────────────────
  // 4. Video Quality
  // ──────────────────────────────────────────
  const [video_quality, set_video_quality] = useState<VideoQuality>('auto');

  const applyVideoQuality = useCallback(async (value: VideoQuality) => {
    if (!call) return;

    let constraintsToApply: MediaTrackConstraints = {};

    if (value === 'auto') {
      call.camera.setDefaultConstraints({});
      // For auto we clear target resolution and let SDK decide
      await call.camera.selectTargetResolution(undefined as any).catch(() => {});
    } else {
      constraintsToApply = QUALITY_CONSTRAINTS[value];
      call.camera.setDefaultConstraints(constraintsToApply);

      const w = typeof constraintsToApply.width === 'object' ? constraintsToApply.width.ideal : constraintsToApply.width;
      const h = typeof constraintsToApply.height === 'object' ? constraintsToApply.height.ideal : constraintsToApply.height;

      if (w && h) {
        await call.camera.selectTargetResolution({
          width: w as number,
          height: h as number,
        }).catch(console.error);
      }
    }

    // Apply to live track to prevent flashing/restarting
    const active_stream = call.camera.state.mediaStream;
    const video_track = active_stream?.getVideoTracks()[0];

    if (video_track) {
      try {
        await video_track.applyConstraints(constraintsToApply);
        set_video_quality(value);
        return; // Success, no need to restart
      } catch (e) {
        console.error('applyConstraints failed, falling back to restart', e);
      }
    }

    // Only restart if the live apply failed
    if (call.camera.state.status === 'enabled') {
      await call.camera.disable();
      await call.camera.enable();
    }
    set_video_quality(value);
  }, [call]);

  // ──────────────────────────────────────────
  // 5. Browser-level mic constraints & Volume
  // ──────────────────────────────────────────

  const mic_volume_ref = useRef(100);
  const gain_node_ref = useRef<GainNode | null>(null);

  // Use Web Audio API to manually set gain when auto_gain is off
  const applyMicVolume = useCallback((volume: number) => {
    if (!call) return;
    set_mic_volume(volume);
    mic_volume_ref.current = volume;

    // If auto_gain is ON, we must remove the manual filter
    if (auto_gain) {
      if (mic_filter_ref.current) {
        mic_filter_ref.current();
        mic_filter_ref.current = null;
        gain_node_ref.current = null;
      }
      return;
    }

    // If filter is already active, just update the gain value.
    // We keep it active even at 100% to avoid flickering during adjustment.
    if (mic_filter_ref.current && gain_node_ref.current) {
      const targetGain = volume / 100;
      // Use a slightly longer ramp to make it even smoother
      gain_node_ref.current.gain.setTargetAtTime(targetGain, 0, 0.05);
      return;
    }

    // Don't register filter if it's 100% and not yet active
    if (volume === 100) return;

    // Register filter
    try {
      const { unregister } = call.microphone.registerFilter((ms: MediaStream) => {
        // Double check auto_gain here as it might have changed during async import/setup
        const audioCtx = new window.AudioContext();
        const source = audioCtx.createMediaStreamSource(ms);
        const gainNode = audioCtx.createGain();
        
        gainNode.gain.value = mic_volume_ref.current / 100;
        gain_node_ref.current = gainNode;
        
        source.connect(gainNode);
        const dest = audioCtx.createMediaStreamDestination();
        gainNode.connect(dest);

        return {
          output: dest.stream,
          stop: () => {
            audioCtx.close();
            gain_node_ref.current = null;
          },
        };
      });

      mic_filter_ref.current = unregister;
    } catch (e) {
      console.error('Error applying mic volume filter', e);
    }
  }, [call, auto_gain]);

  const toggleEchoCancel = useCallback(async (checked: boolean) => {
    set_echo_cancel(checked);
    await applyMicConstraints(checked, auto_gain, is_nc_enabled);
  }, [applyMicConstraints, auto_gain, is_nc_enabled]);

  const toggleAutoGain = useCallback(async (checked: boolean) => {
    set_auto_gain(checked);
    
    // If we turn auto-gain back on, remove our manual volume filter
    if (checked && mic_filter_ref.current) {
      mic_filter_ref.current();
      mic_filter_ref.current = null;
      set_mic_volume(100);
    }
    
    await applyMicConstraints(echo_cancel, checked, is_nc_enabled);
  }, [applyMicConstraints, echo_cancel, is_nc_enabled]);

  return {
    // NC
    is_nc_enabled, is_nc_loading, toggleNoiseCancellation,
    // Background
    bg_filter, bg_loading, applyBackgroundFilter,
    // Mirror
    is_mirrored, toggleMirror,
    // Video quality
    video_quality, applyVideoQuality,
    // Mic constraints
    echo_cancel, auto_gain, toggleEchoCancel, toggleAutoGain,
    mic_volume, set_mic_volume, applyMicVolume,
  };
}
