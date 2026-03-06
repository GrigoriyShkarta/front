'use client';

import { 
  Stack, 
  Drawer, 
  Title, 
  ScrollArea, 
  Switch, 
  Button,
  Box
} from '@mantine/core';
import { useTranslations } from 'next-intl';
import { TrackerSettings } from '../schemas/tracker-schema';
import { useState, useEffect } from 'react';

interface Props {
  opened: boolean;
  settings: TrackerSettings;
  onClose: () => void;
  onSubmit: (settings: TrackerSettings) => void;
}

export function SettingsDrawer({ opened, onClose, settings, onSubmit }: Props) {
  const t = useTranslations('Tracker');
  const common_t = useTranslations('Common');
  const [localSettings, setLocalSettings] = useState<TrackerSettings>(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size="sm"
      padding={0}
      title={
        <Title order={3} px={{ base: 'xl', sm: 32 }} component="p" className='text-[20px]! leading-tight'>
          {t('settings.drawer_title')}
        </Title>
      }
      styles={{
        root: {
          overflowX: 'hidden',
        },
        content: { 
          overflow: 'visible',
          background: 'var(--mantine-color-body)',
        },
        body: { 
          height: 'calc(100vh - 60px)',
          overflow: 'visible',
          position: 'relative',
          padding: 0
        },
        inner: {
          overflow: 'visible',
        }
      }}
    >
      <ScrollArea h="100%" p="xl">
        <Stack gap="xl">
          <Stack gap="md">
            <Switch
              label={t('settings.can_student_create')}
              checked={localSettings.can_student_create_tracker}
              onChange={(e) => {
                const checked = e.currentTarget.checked;
                setLocalSettings(prev => ({ ...prev, can_student_create_tracker: checked }));
              }}
            />
            <Switch
              label={t('settings.can_student_edit')}
              checked={localSettings.can_student_edit_tracker}
              onChange={(e) => {
                const checked = e.currentTarget.checked;
                setLocalSettings(prev => ({ ...prev, can_student_edit_tracker: checked }));
              }}
            />
          </Stack>

          <Button 
            fullWidth 
            onClick={() => onSubmit(localSettings)}
            mt="md"
          >
            {common_t('save')}
          </Button>
        </Stack>
      </ScrollArea>
    </Drawer>
  );
}
