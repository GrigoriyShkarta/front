'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { ActionIcon, Menu, useComputedColorScheme, Divider } from '@mantine/core';
import { CallControls, useCall, useCallStateHooks } from '@stream-io/video-react-sdk';
import { BsGrid3X3Gap, BsLayoutSidebar, BsLayoutSidebarReverse, BsPip, BsFullscreen, BsLayoutThreeColumns } from "react-icons/bs";
import {  
  IoSettingsOutline, 
  IoPersonOutline, 
  IoMicOffOutline,
  IoVideocamOffOutline,
  IoDesktopOutline,
  IoGridOutline,
  IoAnalyticsOutline
} from 'react-icons/io5';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { FaChalkboard } from 'react-icons/fa';
import { IoListOutline, IoCreateOutline } from 'react-icons/io5';
import { useFloatingNotes } from '@/context/floating-notes-context';

interface CallControlsBarProps {
  userRole: string | undefined;
  layout: string;
  is_fullscreen: boolean;
  studentId?: string;
  studentSessionId?: string;
  onLayoutChange: (layout: any) => void;
  onToggleFullscreen: () => void;
  onOpenSettings: () => void;
  onToggleParticipants: () => void;
  onLeave: () => void;
}

const BOTTOM_ZONE_PX = 80;
const HIDE_DELAY_MS = 2000;

/**
 * Bottom controls bar with layout switching, fullscreen, and settings toggles.
 * Auto-hides in fullscreen mode; appears when mouse is near the bottom edge.
 */
export function CallControlsBar({
  userRole,
  layout,
  is_fullscreen,
  onLayoutChange,
  onToggleFullscreen,
  onOpenSettings,
  onToggleParticipants,
  onLeave,
  studentId,
  studentSessionId,
}: CallControlsBarProps) {
  const t = useTranslations('Calendar.lesson_room');
  const { openNote } = useFloatingNotes();
  const colorScheme = useComputedColorScheme('light');
  const isDark = colorScheme === 'dark';
  const call = useCall();
  const { useParticipants, useHasOngoingScreenShare } = useCallStateHooks();
  const participants = useParticipants();
  const hasOngoingScreenShare = useHasOngoingScreenShare();
  
  const studentParticipant = participants.find(p => p.sessionId === studentSessionId) || participants.find(p => p.userId === studentId);
  const studentName = studentParticipant?.name || 'Student';
  // const isPinned = studentParticipant?.isPinned;

  const [visible, set_visible] = useState(true);
  const hide_timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear_timer = useCallback(() => {
    if (hide_timer.current) {
      clearTimeout(hide_timer.current);
      hide_timer.current = null;
    }
  }, []);

  const schedule_hide = useCallback(() => {
    clear_timer();
    hide_timer.current = setTimeout(() => set_visible(false), HIDE_DELAY_MS);
  }, [clear_timer]);

  // const handlePin = async () => {
  //   if (!call || !studentSessionId) return;
  //   try {
  //     if (isPinned) {
  //       // await call.unpinParticipant(studentSessionId);
  //     } else {
  //       // await call.pinParticipant(studentSessionId);
  //     }
  //   } catch (e) {
  //     console.error('Failed to pin/unpin:', e);
  //   }
  // };

  const handleMute = async (type: 'audio' | 'video' | 'screenshare') => {
    if (!call || !studentId) return;
    try {
      await call.muteUser(studentId, type);
    } catch (e) {
      console.error(`Failed to mute ${type}:`, e);
    }
  };

  // Track mouse position in fullscreen mode
  useEffect(() => {
    if (!is_fullscreen) {
      set_visible(true);
      clear_timer();
      return;
    }

    // Initially show the bar, then auto-hide after delay
    set_visible(true);
    schedule_hide();

    const on_mouse_move = (e: MouseEvent) => {
      const from_bottom = window.innerHeight - e.clientY;
      if (from_bottom <= BOTTOM_ZONE_PX) {
        set_visible(true);
        clear_timer();
      } else {
        if (!hide_timer.current) {
          schedule_hide();
        }
      }
    };

    window.addEventListener('mousemove', on_mouse_move);
    return () => {
      window.removeEventListener('mousemove', on_mouse_move);
      clear_timer();
    };
  }, [is_fullscreen, clear_timer, schedule_hide]);

  const bar_classes = is_fullscreen
    ? `absolute bottom-0 left-0 right-0 transition-all duration-300 ease-in-out ${
        visible
          ? 'translate-y-0 opacity-100'
          : 'translate-y-full opacity-0 pointer-events-none'
      }`
    : '';

  const layoutIcons: Record<string, React.ReactNode> = {
    grid: <IoGridOutline size={20} />,
    pip: <BsPip size={20} />,
    'speaker-left': <BsLayoutSidebar size={20} />,
    'speaker-right': <BsLayoutSidebarReverse size={20} />,
  };

  return (
    <div 
      className={`w-full shrink-0 flex items-center justify-center gap-5 flex-wrap px-4 py-3 z-50 ${userRole === 'student' ? 'hide-record-button' : ''} ${bar_classes}`}
      style={{ backgroundColor: 'var(--call-bg)', borderTop: '1px solid var(--call-border)' }}
      onMouseEnter={() => {
        if (is_fullscreen) {
          set_visible(true);
          clear_timer();
        }
      }}
      onMouseLeave={() => {
        if (is_fullscreen) schedule_hide();
      }}
    >
      <CallControls onLeave={onLeave} />

      <ActionIcon
        variant="filled"
        size="xl"
        radius="xl"
        onClick={onToggleFullscreen}
        title={t('fullscreen')}
        style={{ backgroundColor: 'var(--call-surface)', color: 'var(--call-text)' }}
        className="h-[46px] w-[46px] rounded-full flex items-center justify-center cursor-pointer transition-all hover:opacity-80"
      >
        <BsFullscreen size={20} />
      </ActionIcon>

      <Menu shadow="md" width={200} position="top" withArrow withinPortal={false}>
        <Menu.Target>
          <ActionIcon 
            variant="filled" 
            size="xl" 
            radius="xl" 
            title={t('layout')}
            style={{ backgroundColor: 'var(--call-surface)', color: 'var(--call-text)' }}
            className="h-[46px] w-[46px] rounded-full flex items-center justify-center cursor-pointer transition-all hover:opacity-80"
          >
            {layoutIcons[layout] || <IoGridOutline size={20} />}
          </ActionIcon>
        </Menu.Target>

        <Menu.Dropdown style={{ backgroundColor: 'var(--call-surface)', borderColor: 'var(--call-border)' }}>
          <Menu.Label>{t('layout')}</Menu.Label>
          {[
            { 
              key: 'grid', 
              label: t('layout_grid'), 
              icon: <IoGridOutline size={16} />
            },
            { 
              key: 'pip', 
              label: t('layout_pip'), 
              icon: <BsPip size={16} />
            },
            { key: 'speaker-left', label: t('layout_speaker_left'), icon: <BsLayoutSidebar size={16} /> },
            { key: 'speaker-right', label: t('layout_speaker_right'), icon: <BsLayoutSidebarReverse size={16} /> }
          ].map((item) => (
            <Menu.Item
              key={item.key}
              onClick={() => onLayoutChange(item.key)}
              leftSection={item.icon}
              style={{ 
                backgroundColor: layout === item.key ? 'var(--space-primary)' : 'transparent',
                color: layout === item.key ? 'var(--space-primary-text)' : 'var(--call-text)',
                transition: 'all 0.2s ease'
              }}
            >
              {item.label}
            </Menu.Item>
          ))}
        </Menu.Dropdown>
      </Menu>

      {/* <ActionIcon 
        variant="filled" 
        size="xl" 
        radius="xl" 
        onClick={onToggleParticipants}
        title={t('participants')}
        style={{ backgroundColor: 'var(--call-surface)', color: 'var(--call-text)' }}
        className="h-[46px] w-[46px] rounded-full flex items-center justify-center cursor-pointer transition-all hover:opacity-80"
      >
        <IoPeopleOutline size={20} />
      </ActionIcon> */}

      <ActionIcon 
        variant="filled" 
        size="xl" 
        radius="xl" 
        onClick={onOpenSettings}
        title={t('settings')}
        style={{ backgroundColor: 'var(--call-surface)', color: 'var(--call-text)' }}
        className="h-[46px] w-[46px] rounded-full flex items-center justify-center cursor-pointer transition-all hover:opacity-80"
      >
        <IoSettingsOutline size={20} />
      </ActionIcon>

      

      

      {(userRole !== 'student' ? studentId : true) && (
        <Menu shadow="md" width={220} position="top" withArrow withinPortal={false}>
          <Menu.Target>
            <ActionIcon 
              variant="filled" 
              size="xl" 
              radius="xl" 
              title={userRole === 'student' ? t('my_links') : t('student_actions')}
              style={{ backgroundColor: 'var(--call-surface)', color: 'var(--call-text)' }}
              className="h-[46px] w-[46px] rounded-full flex items-center justify-center cursor-pointer transition-all hover:opacity-80"
            >
              <IoPersonOutline size={20} />
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown style={{ backgroundColor: 'var(--call-surface)', borderColor: 'var(--call-border)' }}>
            <Menu.Label>
              {userRole === 'student' ? t('my_links') : t('student_actions')}
            </Menu.Label>
            
            <Menu.Item
              leftSection={<IoPersonOutline size={16} />}
              component={Link}
              href={userRole === 'student' ? '/main/profile' : `/main/users/${studentId}`}
              style={{ color: 'var(--call-text)' }}
            >
              {userRole === 'student' ? t('my_profile') : t('student_profile')}
            </Menu.Item>

            <Menu.Item
              leftSection={<FaChalkboard size={16} />}
              component={Link}
              href={userRole === 'student' ? '/main/boards' : `/main/boards/${studentId}`}
              style={{ color: 'var(--call-text)' }}
            >
              {userRole === 'student' ? t('my_boards') : t('student_boards')}
            </Menu.Item>

            <Menu.Item
              leftSection={<IoListOutline size={16} />}
              component={Link}
              href={userRole === 'student' ? '/main/tracker' : `/main/tracker/${studentId}`}
              style={{ color: 'var(--call-text)' }}
            >
              {userRole === 'student' ? t('my_tracker') : t('student_tracker')}
            </Menu.Item>

            {userRole !== 'student' && studentId && (
              <Menu.Item
                leftSection={<IoCreateOutline size={16} />}
                onClick={() => openNote({ 
                    student_id: studentId, 
                    student_name: studentName 
                })}
                style={{ color: 'var(--call-text)' }}
              >
                {t('quick_note')}
              </Menu.Item>
            )}

            {userRole !== 'student' && studentSessionId && (
              <>
                <Divider my="xs" color="var(--call-border)" />
                <Menu.Label>{t('moderation')}</Menu.Label>
                
                {/* <Menu.Item
                  leftSection={<IoPinOutline size={16} />}
                  onClick={handlePin}
                  style={{ color: isPinned ? 'var(--space-primary)' : 'var(--call-text)' }}
                >
                  {isPinned ? t('unpin_student') : t('pin_student')}
                </Menu.Item> */}

                <Menu.Item
                  leftSection={<IoMicOffOutline size={16} />}
                  onClick={() => handleMute('audio')}
                  style={{ color: 'var(--call-text)' }}
                >
                  {t('mute_student')}
                </Menu.Item>

                <Menu.Item
                  leftSection={<IoVideocamOffOutline size={16} />}
                  onClick={() => handleMute('video')}
                  style={{ color: 'var(--call-text)' }}
                >
                  {t('stop_student_video')}
                </Menu.Item>

                <Menu.Item
                  leftSection={<IoDesktopOutline size={16} />}
                  onClick={() => handleMute('screenshare')}
                  style={{ color: 'var(--call-text)' }}
                >
                  {t('stop_student_screen_share')}
                </Menu.Item>
              </>
            )}
          </Menu.Dropdown>
        </Menu>
      )}
    </div>
  );
}
