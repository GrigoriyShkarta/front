'use client';

import { ActionIcon, Text, Drawer, ScrollArea, Group } from '@mantine/core';
import { CallParticipantsList } from '@stream-io/video-react-sdk';
import { IoPeopleOutline } from 'react-icons/io5';
import { useTranslations } from 'next-intl';

interface ParticipantsPanelProps {
  opened: boolean;
  onClose: () => void;
  fullscreenEl: Element | null;
}

/**
 * Side panel displaying the list of call participants.
 * Uses Mantine Drawer with a dynamic portal target to stay within the lesson room area in fullscreen,
 * but cover the full screen in normal mode.
 */
export function ParticipantsPanel({ opened, onClose, fullscreenEl }: ParticipantsPanelProps) {
  const t = useTranslations('Calendar.lesson_room');

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size="md"
      title={
        <Group gap="xs">
          <IoPeopleOutline size={20} style={{ color: 'var(--space-primary)' }} />
          <Text fw={600} size="md">{t('participants')}</Text>
        </Group>
      }
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
      <ScrollArea h="100%" p="md">
        <CallParticipantsList onClose={onClose} />
      </ScrollArea>
    </Drawer>
  );
}
