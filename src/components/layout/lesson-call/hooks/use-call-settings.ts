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
      } else {
        if (!nc_ref.current) {
          const { NoiseCancellation } = await import('@stream-io/audio-filters-web');
          const nc = new NoiseCancellation();
          await nc.init();
          nc_ref.current = nc;
        }
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
  }, [call]);

  // ──────────────────────────────────────────
  // 2. Background Blur
  // ──────────────────────────────────────────
  const [bg_filter, set_bg_filter] = useState<VideoBackground>('none');
  const [bg_loading, set_bg_loading] = useState(false);
  const bg_unregister_ref = useRef<(() => void) | null>(null);

  const applyBackgroundFilter = useCallback(async (
    value: VideoBackground,
    t: (key: string) => string
  ) => {
    if (!call) return;
    set_bg_loading(true);

    // Unregister previous filter first
    if (bg_unregister_ref.current) {
      bg_unregister_ref.current();
      bg_unregister_ref.current = null;
    }

    try {
      if (value === 'none') {
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

      // MediaStreamFilter must be synchronous and return MediaStreamFilterResult:
      // { output: MediaStream | Promise<MediaStream>, stop?: () => void }
      // The SDK calls stop() automatically when unregistering.
      const { unregister } = call.camera.registerFilter((ms: MediaStream) => {
        const video_track = ms.getVideoTracks()[0];
        if (!video_track) return { output: ms };

        const processor = new VirtualBackground(
          video_track as any,
          { backgroundFilter: 'blur', backgroundBlurLevel: blurLevel }
        );

        return {
          // output can be a Promise<MediaStream> — SDK awaits it internally
          output: processor.start().then((processed_track) =>
            new MediaStream([processed_track, ...ms.getAudioTracks()])
          ),
          // SDK calls stop() when the filter is unregistered or stream changes
          stop: () => processor.stop(),
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

    if (value === 'auto') {
      call.camera.setDefaultConstraints({});
      // For auto we clear target resolution and let SDK decide
      await call.camera.selectTargetResolution(undefined as any).catch(() => {});
    } else {
      const constraints = QUALITY_CONSTRAINTS[value];
      call.camera.setDefaultConstraints(constraints);

      const w = typeof constraints.width === 'object' ? constraints.width.ideal : constraints.width;
      const h = typeof constraints.height === 'object' ? constraints.height.ideal : constraints.height;

      // This explicitly tells the Stream SFU server what resolution to target
      if (w && h) {
        await call.camera.selectTargetResolution({
          width: w as number,
          height: h as number,
        }).catch(console.error);
      }

      // Try to apply constraints to the already-running track (live change, no flicker)
      const active_stream = call.camera.state.mediaStream;
      const video_track = active_stream?.getVideoTracks()[0];

      if (video_track) {
        try {
          await video_track.applyConstraints(constraints);
          set_video_quality(value);
          return;
        } catch (e) {
          console.error('applyConstraints failed', e);
        }
      }
    }

    // Fallback: restart the camera with new constraints
    if (call.camera.state.status === 'enabled') {
      await call.camera.disable();
      await call.camera.enable();
    }
    set_video_quality(value);
  }, [call]);

  // ──────────────────────────────────────────
  // 5. Browser-level mic constraints & Volume
  // ──────────────────────────────────────────
  const [echo_cancel, set_echo_cancel] = useState(false);
  const [auto_gain, set_auto_gain] = useState(false);
  const [mic_volume, set_mic_volume] = useState(100);
  const mic_filter_ref = useRef<(() => void) | null>(null);

  const applyMicConstraints = useCallback(async (echo: boolean, gain: boolean) => {
    if (!call) return;
    call.microphone.setDefaultConstraints({
      echoCancellation: echo,
      autoGainControl: gain,
      noiseSuppression: true,
    });
    if (call.microphone.state.status === 'enabled') {
      await call.microphone.disable();
      await call.microphone.enable();
    }
  }, [call]);

  // Use Web Audio API to manually set gain when auto_gain is off
  const applyMicVolume = useCallback((volume: number) => {
    if (!call) return;
    set_mic_volume(volume);

    if (mic_filter_ref.current) {
      mic_filter_ref.current();
      mic_filter_ref.current = null;
    }

    // Only apply filter if auto_gain is off and we need to change volume
    if (auto_gain || volume === 100) return;

    try {
      const { unregister } = call.microphone.registerFilter((ms: MediaStream) => {
        const audioCtx = new window.AudioContext();
        const source = audioCtx.createMediaStreamSource(ms);
        const gainNode = audioCtx.createGain();
        gainNode.gain.value = volume / 100;
        
        source.connect(gainNode);
        const dest = audioCtx.createMediaStreamDestination();
        gainNode.connect(dest);

        return {
          output: dest.stream,
          stop: () => audioCtx.close(),
        };
      });

      mic_filter_ref.current = unregister;
    } catch (e) {
      console.error('Error applying mic volume filter', e);
    }
  }, [call, auto_gain]);

  const toggleEchoCancel = useCallback(async (checked: boolean) => {
    set_echo_cancel(checked);
    await applyMicConstraints(checked, auto_gain);
  }, [applyMicConstraints, auto_gain]);

  const toggleAutoGain = useCallback(async (checked: boolean) => {
    set_auto_gain(checked);
    
    // If we turn auto-gain back on, remove our manual volume filter
    if (checked && mic_filter_ref.current) {
      mic_filter_ref.current();
      mic_filter_ref.current = null;
      set_mic_volume(100);
    }
    
    await applyMicConstraints(echo_cancel, checked);
  }, [applyMicConstraints, echo_cancel]);

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
    mic_volume, applyMicVolume,
  };
}
