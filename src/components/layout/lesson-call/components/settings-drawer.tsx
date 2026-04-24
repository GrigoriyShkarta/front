'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  Drawer,
  Stack,
  Box,
  Group,
  Text,
  Switch,
  Divider,
  Tabs,
  Slider,
  Select,
  Center,
  Loader,
  SegmentedControl,
} from '@mantine/core';
import { useCall, useCallStateHooks } from '@stream-io/video-react-sdk';
import { useTranslations } from 'next-intl';
import {
  IoSettingsOutline,
  IoVideocamOutline,
  IoMicOutline,
  IoVolumeHighOutline,
  IoShieldCheckmarkOutline,
  IoScanOutline,
  IoLayersOutline,
  IoSwapHorizontalOutline,
} from 'react-icons/io5';
import { useCallSettings } from '@/components/layout/lesson-call/hooks/use-call-settings';

interface SettingsDrawerProps {
  opened: boolean;
  onClose: () => void;
  fullscreenEl: Element | null;
  settings: {
    is_recording_enabled: boolean;
    can_student_download_recording: boolean;
  };
  onUpdate: (key: 'is_recording_enabled' | 'can_student_download_recording', value: boolean) => void;
  isLoading: boolean;
  userRole?: string;
}

const SELECT_STYLES = {
  input: { backgroundColor: 'var(--call-surface)', color: 'var(--call-text)', border: '1px solid var(--call-border)' },
  dropdown: { backgroundColor: 'var(--call-surface)', border: '1px solid var(--call-border)' },
};

/**
 * Drawer containing lesson recording settings and technical A/V controls.
 */
export function SettingsDrawer({
  opened,
  onClose,
  fullscreenEl,
  settings,
  onUpdate,
  isLoading,
  userRole,
}: SettingsDrawerProps) {
  const t = useTranslations('Calendar.lesson_room');
  const call = useCall();
  const { useMicrophoneState, useCameraState, useSpeakerState } = useCallStateHooks();
  const micState = useMicrophoneState();
  const camState = useCameraState();
  const speakerState = useSpeakerState();

  const {
    is_nc_enabled, is_nc_loading, toggleNoiseCancellation,
    bg_filter, bg_loading, applyBackgroundFilter,
    is_mirrored, toggleMirror,
    video_quality, applyVideoQuality,
    echo_cancel, auto_gain, toggleEchoCancel, toggleAutoGain,
    mic_volume, applyMicVolume,
  } = useCallSettings();

  const [speakerDevices, setSpeakerDevices] = useState<MediaDeviceInfo[]>([]);
  const [localVolume, setLocalVolume] = useState(Math.round((speakerState?.volume ?? 1) * 100));

  useEffect(() => {
    if (!call || !opened) return;
    const sub = call.speaker.listDevices().subscribe(setSpeakerDevices);
    return () => sub.unsubscribe();
  }, [call, opened]);

  const deviceToSelectData = useMemo(() => (devices: MediaDeviceInfo[]) =>
    devices.map(d => ({ value: d.deviceId, label: d.label || 'Unknown Device' })), []);

  const bg_options = [
    { label: t('bg_none'), value: 'none' },
    { label: t('bg_blur'), value: 'blur' },
    { label: t('bg_blur_strong'), value: 'blur-strong' },
  ];

  const quality_options = [
    { label: 'Auto', value: 'auto' },
    { label: '1440p', value: '1440p' },
    { label: '1080p', value: '1080p' },
    { label: '720p', value: '720p' },
    { label: '480p', value: '480p' },
    { label: '360p', value: '360p' },
  ];

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <IoSettingsOutline size={20} />
          <Text fw={600} size="md">{t('settings')}</Text>
        </Group>
      }
      position="right"
      size="md"
      portalProps={{ target: (fullscreenEl as HTMLElement) || undefined }}
      styles={{
        content: { backgroundColor: 'var(--call-bg)', color: 'var(--call-text)' },
        header: {
          backgroundColor: 'var(--call-bg)',
          color: 'var(--call-text)',
          borderBottom: '1px solid var(--call-border)',
        },
        body: { padding: 0 },
      }}
    >
      <Tabs
        defaultValue={userRole === 'student' ? 'tech' : 'lesson'}
        variant="pills"
        radius="xl"
        styles={{
          tab: {
            color: 'var(--call-text)',
            '&[data-active]': {
              backgroundColor: 'var(--space-primary)',
              color: 'var(--space-primary-text)',
            },
          },
          list: { padding: '16px', borderBottom: '1px solid var(--call-border)' },
          panel: { padding: '20px' },
        }}
      >
        <Tabs.List>
          {userRole !== 'student' && <Tabs.Tab value="lesson">{t('tab_lesson')}</Tabs.Tab>}
          <Tabs.Tab value="tech">{t('tab_tech')}</Tabs.Tab>
        </Tabs.List>

        {/* ── LESSON TAB ────────────────────────────────── */}
        <Tabs.Panel value="lesson">
          <Stack gap="xl">
            <Box>
              <Group justify="space-between" wrap="nowrap" mb="xs">
                <Box style={{ flex: 1 }}>
                  <Text fw={600} size="sm">{t('recording_permanent')}</Text>
                  <Text size="xs" opacity={0.6}>{t('recording_permanent_desc')}</Text>
                </Box>
                <Switch
                  checked={settings.is_recording_enabled}
                  onChange={(e) => onUpdate('is_recording_enabled', e.currentTarget.checked)}
                  disabled={isLoading}
                  color="var(--space-primary)"
                  style={{ flexShrink: 0 }}
                />
              </Group>
            </Box>
            <Divider color="var(--call-border)" />
            <Box>
              <Group justify="space-between" wrap="nowrap" mb="xs">
                <Box style={{ flex: 1 }}>
                  <Text fw={600} size="sm">{t('student_download')}</Text>
                  <Text size="xs" opacity={0.6}>{t('student_download_desc')}</Text>
                </Box>
                <Switch
                  checked={settings.can_student_download_recording}
                  onChange={(e) => onUpdate('can_student_download_recording', e.currentTarget.checked)}
                  disabled={isLoading}
                  color="var(--space-primary)"
                  style={{ flexShrink: 0 }}
                />
              </Group>
              {isLoading && (
                <Center mt="md"><Loader size="xs" color="var(--space-primary)" /></Center>
              )}
            </Box>
          </Stack>
        </Tabs.Panel>

        {/* ── TECH TAB ──────────────────────────────────── */}
        <Tabs.Panel value="tech">
          <Stack gap="xl">

            {/* Noise Suppression */}
            <Box>
              <Group justify="space-between" wrap="nowrap">
                <Group gap="xs" wrap="nowrap" style={{ flex: 1 }}>
                  <IoShieldCheckmarkOutline size={18} style={{ flexShrink: 0 }} />
                  <Box>
                    <Text fw={600} size="sm">{t('noise_suppression')}</Text>
                    <Text size="xs" opacity={0.6}>{t('noise_suppression_desc')}</Text>
                  </Box>
                </Group>
                <Switch
                  disabled={is_nc_loading}
                  checked={is_nc_enabled}
                  onChange={(e) => toggleNoiseCancellation(e.currentTarget.checked, t)}
                  color="var(--space-primary)"
                  style={{ flexShrink: 0 }}
                />
              </Group>
            </Box>
            <Divider color="var(--call-border)" />

            {/* Background Blur */}
            <Box>
              <Group gap="xs" mb="sm">
                <IoLayersOutline size={18} />
                <Box>
                  <Text fw={600} size="sm">{t('bg_filter')}</Text>
                  <Text size="xs" opacity={0.6}>{t('bg_filter_desc')}</Text>
                </Box>
              </Group>
              <SegmentedControl
                fullWidth
                size="xs"
                value={bg_filter}
                onChange={(v) => applyBackgroundFilter(v as any, t)}
                disabled={bg_loading}
                data={bg_options}
                styles={{
                  root: { backgroundColor: 'var(--call-surface)', border: '1px solid var(--call-border)' },
                  label: { color: 'var(--call-text)' },
                }}
              />
            </Box>
            <Divider color="var(--call-border)" />

            {/* Mirror Video */}
            <Box>
              <Group justify="space-between" wrap="nowrap">
                <Group gap="xs" wrap="nowrap" style={{ flex: 1 }}>
                  <IoSwapHorizontalOutline size={18} style={{ flexShrink: 0 }} />
                  <Box>
                    <Text fw={600} size="sm">{t('mirror_video')}</Text>
                    <Text size="xs" opacity={0.6}>{t('mirror_video_desc')}</Text>
                  </Box>
                </Group>
                <Switch
                  checked={is_mirrored}
                  onChange={(e) => toggleMirror(e.currentTarget.checked)}
                  color="var(--space-primary)"
                  style={{ flexShrink: 0 }}
                />
              </Group>
            </Box>
            <Divider color="var(--call-border)" />

            {/* Video Quality */}
            <Box>
              <Group gap="xs" mb="sm">
                <IoScanOutline size={18} />
                <Box>
                  <Text fw={600} size="sm">{t('video_quality')}</Text>
                  <Text size="xs" opacity={0.6}>{t('video_quality_desc')}</Text>
                </Box>
              </Group>
              <SegmentedControl
                fullWidth
                size="xs"
                value={video_quality}
                onChange={(v) => applyVideoQuality(v as any)}
                data={quality_options}
                styles={{
                  root: { backgroundColor: 'var(--call-surface)', border: '1px solid var(--call-border)' },
                  label: { color: 'var(--call-text)' },
                }}
              />
            </Box>
            <Divider color="var(--call-border)" />

            {/* Echo Cancellation & Auto Gain */}
            <Box>
              <Group gap="xs" mb="sm">
                <IoMicOutline size={18} />
                <Text fw={600} size="sm">{t('mic_processing')}</Text>
              </Group>
              <Stack gap="sm">
                <Group justify="space-between" wrap="nowrap">
                  <Box style={{ flex: 1 }}>
                    <Text size="sm">{t('echo_cancellation')}</Text>
                    <Text size="xs" opacity={0.6}>{t('echo_cancellation_desc')}</Text>
                  </Box>
                  <Switch
                    checked={echo_cancel}
                    onChange={(e) => toggleEchoCancel(e.currentTarget.checked)}
                    color="var(--space-primary)"
                    style={{ flexShrink: 0 }}
                  />
                </Group>
                <Group justify="space-between" wrap="nowrap">
                  <Box style={{ flex: 1 }}>
                    <Text size="sm">{t('auto_gain')}</Text>
                    <Text size="xs" opacity={0.6}>{t('auto_gain_desc')}</Text>
                  </Box>
                  <Switch
                    checked={auto_gain}
                    onChange={(e) => toggleAutoGain(e.currentTarget.checked)}
                    color="var(--space-primary)"
                    style={{ flexShrink: 0 }}
                  />
                </Group>
                
                {!auto_gain && (
                  <Box mt={4} mb={8}>
                    <Text size="xs" fw={500} mb={6}>{t('mic_volume')}</Text>
                    <Slider
                      value={mic_volume}
                      onChange={applyMicVolume}
                      color="var(--space-primary)"
                      label={(v) => `${v}%`}
                      size="sm"
                      styles={{ markLabel: { color: 'var(--call-text)' } }}
                    />
                  </Box>
                )}
              </Stack>
            </Box>
            <Divider color="var(--call-border)" />

            {/* Output Volume */}
            <Box>
              <Group gap="xs" mb="xs">
                <IoVolumeHighOutline size={18} />
                <Text fw={600} size="sm">{t('output_volume')}</Text>
              </Group>
              <Slider
                value={localVolume}
                onChange={(val) => { setLocalVolume(val); call?.speaker.setVolume(val / 100); }}
                color="var(--space-primary)"
                label={(v) => `${v}%`}
                size="sm"
                styles={{ markLabel: { color: 'var(--call-text)' } }}
              />
            </Box>
            <Divider color="var(--call-border)" />

            {/* Devices Selection */}
            <Stack gap="md">
              <Select
                label={<Group gap="xs" mb={4}><IoVideocamOutline size={16} />{t('camera')}</Group>}
                data={deviceToSelectData(camState.devices)}
                value={camState.selectedDevice}
                onChange={(v) => call?.camera.select(v!)}
                variant="filled"
                styles={SELECT_STYLES}
              />
              <Select
                label={<Group gap="xs" mb={4}><IoMicOutline size={16} />{t('microphone')}</Group>}
                data={deviceToSelectData(micState.devices)}
                value={micState.selectedDevice}
                onChange={(v) => call?.microphone.select(v!)}
                variant="filled"
                styles={SELECT_STYLES}
              />
              <Select
                label={<Group gap="xs" mb={4}><IoVolumeHighOutline size={16} />{t('speaker')}</Group>}
                data={deviceToSelectData(speakerDevices)}
                value={speakerState.selectedDevice}
                onChange={(v) => call?.speaker.select(v!)}
                variant="filled"
                styles={SELECT_STYLES}
              />
            </Stack>
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </Drawer>
  );
}
