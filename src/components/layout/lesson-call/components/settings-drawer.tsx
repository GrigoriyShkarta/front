'use client';

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
  Loader
} from '@mantine/core';
import { 
  useCall, 
  useCallStateHooks
} from '@stream-io/video-react-sdk';
import { useTranslations } from 'next-intl';
import { useEffect, useState, useMemo, useRef } from 'react';
import { notifications } from '@mantine/notifications';
import { 
  IoSettingsOutline, 
  IoVideocamOutline, 
  IoMicOutline, 
  IoVolumeHighOutline,
  IoShieldCheckmarkOutline
} from 'react-icons/io5';

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
  userRole
}: SettingsDrawerProps) {
  const t = useTranslations('Calendar.lesson_room');
  const call = useCall();
  const { useMicrophoneState, useCameraState, useSpeakerState } = useCallStateHooks();
  
  const micState = useMicrophoneState();
  const camState = useCameraState();
  const speakerState = useSpeakerState();
  
  const [is_nc_enabled, set_is_nc_enabled] = useState(false);
  const [is_nc_loading, set_is_nc_loading] = useState(false);
  const nc_ref = useRef<any>(null);

  const toggleNoiseCancellation = async (checked: boolean) => {
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
      console.error('Failed to toggle noise cancellation', e);
      set_is_nc_enabled(false);
      
      // If it's a permission issue from Stream side
      if (e?.message?.includes('not available')) {
         notifications.show({
            title: t('error'),
            message: t('noise_suppression_not_available'),
            color: 'red',
         });
      } else {
         notifications.show({
            title: t('error'),
            message: t('noise_suppression_failed'),
            color: 'red',
         });
      }
    } finally {
      set_is_nc_loading(false);
    }
  };

  const [speakerDevices, setSpeakerDevices] = useState<MediaDeviceInfo[]>([]);
  const [localVolume, setLocalVolume] = useState(Math.round((speakerState?.volume ?? 1) * 100));
  const [localMicVolume, setLocalMicVolume] = useState(100);

  // Load speaker devices
  useEffect(() => {
    if (!call || !opened) return;
    const sub = call.speaker.listDevices().subscribe(setSpeakerDevices);
    return () => sub.unsubscribe();
  }, [call, opened]);

  const handleVolumeChange = (val: number) => {
    setLocalVolume(val);
    call?.speaker.setVolume(val / 100);
  };

  const handleMicVolumeChange = (val: number) => {
    setLocalMicVolume(val);
    // Note: Stream SDK doesn't support direct mic gain yet, 
    // but we track it for UI and future implementation or Web Audio API wrapper
  };

  const deviceToSelectData = useMemo(() => (devices: MediaDeviceInfo[]) => 
    devices.map(d => ({ value: d.deviceId, label: d.label || 'Unknown Device' })), []);

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
          borderBottom: '1px solid var(--call-border)' 
        },
        body: { padding: 0 }
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
            }
          },
          list: {
            padding: '16px',
            borderBottom: '1px solid var(--call-border)'
          },
          panel: {
            padding: '20px'
          }
        }}
      >
        <Tabs.List>
          {userRole !== 'student' && <Tabs.Tab value="lesson">{t('tab_lesson')}</Tabs.Tab>}
          <Tabs.Tab value="tech">{t('tab_tech')}</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="lesson">
          <Stack gap="xl">
            <Box>
              <Group justify="space-between" mb="xs">
                <Box style={{ flex: 1 }}>
                  <Text fw={600} size="sm">{t('recording_permanent')}</Text>
                  <Text size="xs" opacity={0.6}>{t('recording_permanent_desc')}</Text>
                </Box>
                <Switch 
                  checked={settings.is_recording_enabled}
                  onChange={(e) => onUpdate('is_recording_enabled', e.currentTarget.checked)}
                  disabled={isLoading}
                  color="var(--space-primary)"
                />
              </Group>
            </Box>

            <Divider color="var(--call-border)" />

            <Box>
              <Group justify="space-between" mb="xs">
                <Box style={{ flex: 1 }}>
                  <Text fw={600} size="sm">{t('student_download')}</Text>
                  <Text size="xs" opacity={0.6}>{t('student_download_desc')}</Text>
                </Box>
                <Switch 
                  checked={settings.can_student_download_recording}
                  onChange={(e) => onUpdate('can_student_download_recording', e.currentTarget.checked)}
                  disabled={isLoading}
                  color="var(--space-primary)"
                />
              </Group>
              {isLoading && (
                <Center mt="md">
                  <Loader size="xs" color="var(--space-primary)" />
                </Center>
              )}
            </Box>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="tech">
          <Stack gap="xl">
            {/* Noise Suppression */}
            <Box>
              <Group justify="space-between" mb="xs">
                <Group gap="xs">
                  <IoShieldCheckmarkOutline size={18} />
                  <Box>
                    <Text fw={600} size="sm">{t('noise_suppression')}</Text>
                    <Text size="xs" opacity={0.6}>{t('noise_suppression_desc')}</Text>
                  </Box>
                </Group>
                <Switch 
                  disabled={is_nc_loading}
                  checked={is_nc_enabled}
                  onChange={(e) => toggleNoiseCancellation(e.currentTarget.checked)}
                  color="var(--space-primary)"
                />
              </Group>
            </Box>
            <Divider color="var(--call-border)" />

            {/* Speaker & Mic Volume */}
            <Box>
              <Stack gap="md">
                <Box>
                  <Group gap="xs" mb="xs">
                    <IoVolumeHighOutline size={18} />
                    <Text fw={600} size="sm">{t('output_volume')}</Text>
                  </Group>
                  <Slider 
                    value={localVolume}
                    onChange={handleVolumeChange}
                    color="var(--space-primary)"
                    label={(v) => `${v}%`}
                    size="sm"
                    styles={{
                      markLabel: { color: 'var(--call-text)' }
                    }}
                  />
                </Box>

                <Box>
                  <Group gap="xs" mb="xs">
                    <IoMicOutline size={18} />
                    <Text fw={600} size="sm">{t('mic_volume')}</Text>
                  </Group>
                  <Slider 
                    value={localMicVolume}
                    onChange={handleMicVolumeChange}
                    color="var(--space-primary)"
                    label={(v) => `${v}%`}
                    size="sm"
                    styles={{
                      markLabel: { color: 'var(--call-text)' }
                    }}
                  />
                </Box>
              </Stack>
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
                styles={{
                  input: { backgroundColor: 'var(--call-surface)', color: 'var(--call-text)', border: '1px solid var(--call-border)' },
                  dropdown: { backgroundColor: 'var(--call-surface)', border: '1px solid var(--call-border)' }
                }}
              />

              <Select
                label={<Group gap="xs" mb={4}><IoMicOutline size={16} />{t('microphone')}</Group>}
                data={deviceToSelectData(micState.devices)}
                value={micState.selectedDevice}
                onChange={(v) => call?.microphone.select(v!)}
                variant="filled"
                styles={{
                  input: { backgroundColor: 'var(--call-surface)', color: 'var(--call-text)', border: '1px solid var(--call-border)' },
                  dropdown: { backgroundColor: 'var(--call-surface)', border: '1px solid var(--call-border)' }
                }}
              />

              <Select
                label={<Group gap="xs" mb={4}><IoVolumeHighOutline size={16} />{t('speaker')}</Group>}
                data={deviceToSelectData(speakerDevices)}
                value={speakerState.selectedDevice}
                onChange={(v) => call?.speaker.select(v!)}
                variant="filled"
                styles={{
                  input: { backgroundColor: 'var(--call-surface)', color: 'var(--call-text)', border: '1px solid var(--call-border)' },
                  dropdown: { backgroundColor: 'var(--call-surface)', border: '1px solid var(--call-border)' }
                }}
              />
            </Stack>
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </Drawer>
  );
}
