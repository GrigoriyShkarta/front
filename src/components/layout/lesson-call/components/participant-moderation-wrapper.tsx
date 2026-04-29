'use client';

import { useState } from 'react';
import { Menu } from '@mantine/core';
import { useCall, useCallStateHooks } from '@stream-io/video-react-sdk';
import { useTranslations } from 'next-intl';
import { 
  IoMicOffOutline, 
  IoVideocamOffOutline, 
  IoDesktopOutline, 
  IoMicOutline, 
  IoVideocamOutline,
  IoShieldCheckmarkOutline,
  IoBanOutline
} from 'react-icons/io5';
import { useAuth } from '@/hooks/use-auth';

interface ParticipantModerationWrapperProps {
  participant: any;
  children: React.ReactNode;
}

/**
 * Wraps a participant view with a context menu for moderation actions.
 * Only available for teachers/admins.
 */
export function ParticipantModerationWrapper({ 
  participant, 
  children 
}: ParticipantModerationWrapperProps) {
  const t = useTranslations('Calendar.lesson_room');
  const { user } = useAuth();
  const call = useCall();
  const { useParticipants } = useCallStateHooks();
  const participants = useParticipants();

  // Only show moderation menu for non-students (teachers/admins) 
  // and only for OTHER participants (don't moderate yourself)
  const is_teacher = user?.role !== 'student';
  const is_self = participant.sessionId === participants.find(p => p.userId === user?.id)?.sessionId;

  if (!is_teacher || is_self || !call) {
    return <>{children}</>;
  }

  const handleMute = async (type: 'audio' | 'video' | 'screenshare') => {
    try {
      await call.muteUser(participant.userId, type);
    } catch (e) {
      console.error(`Failed to mute ${type}:`, e);
    }
  };

  const handlePermission = async (permission: string, grant: boolean) => {
    try {
      if (grant) {
        await call.grantPermissions(participant.userId, [permission]);
      } else {
        await call.revokePermissions(participant.userId, [permission]);
      }
    } catch (e) {
      console.error(`Failed to ${grant ? 'grant' : 'revoke'} permission ${permission}:`, e);
    }
  };
  
  const is_audio_muted = participant.isMuted;
  const is_video_muted = !participant.videoStream;
  const is_sharing = !!participant.screenShareStream;

  const [opened, setOpened] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleContextMenu = (e: React.MouseEvent) => {
    // Only teachers can moderate
    if (!is_teacher || is_self) return;
    
    e.preventDefault();
    setPosition({ x: e.clientX, y: e.clientY });
    setOpened(true);
  };

  return (
    <>
      <div onContextMenu={handleContextMenu} className="w-full h-full">
        {children}
      </div>

      <Menu 
        opened={opened} 
        onChange={setOpened} 
        offset={0} 
        width={220} 
        withinPortal
        position="bottom-start"
      >
        <Menu.Target>
          <div 
            style={{ 
              position: 'fixed', 
              left: position.x, 
              top: position.y, 
              width: 1, 
              height: 1,
              visibility: 'hidden',
              pointerEvents: 'none'
            }} 
          />
        </Menu.Target>

        <Menu.Dropdown style={{ backgroundColor: 'var(--call-surface)', borderColor: 'var(--call-border)' }}>
          <Menu.Label>{t('moderation')}: {participant.name}</Menu.Label>

        <Menu.Item
          leftSection={is_audio_muted ? <IoMicOutline size={16} /> : <IoMicOffOutline size={16} />}
          onClick={() => handleMute('audio')}
          style={{ color: 'var(--call-text)' }}
        >
          {is_audio_muted ? t('unmute_student') : t('mute_student')}
        </Menu.Item>

        <Menu.Item
          leftSection={is_video_muted ? <IoVideocamOutline size={16} /> : <IoVideocamOffOutline size={16} />}
          onClick={() => handleMute('video')}
          style={{ color: 'var(--call-text)' }}
        >
          {is_video_muted ? t('start_student_video') : t('stop_student_video')}
        </Menu.Item>

        {is_sharing && (
          <>
            <Menu.Divider color="var(--call-border)" />
            <Menu.Item
              leftSection={<IoBanOutline size={16} />}
              onClick={() => handleMute('screenshare')}
              style={{ color: 'var(--call-text)' }}
            >
              {t('prohibit_student_screen_share')}
            </Menu.Item>
          </>
        )}
      </Menu.Dropdown>
    </Menu>
    </>
  );
}
