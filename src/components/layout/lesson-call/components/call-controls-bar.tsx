'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { ActionIcon, Menu, useComputedColorScheme } from '@mantine/core';
import { CallControls } from '@stream-io/video-react-sdk';
import { IoGridOutline, IoExpandOutline, IoSettingsOutline, IoPeopleOutline } from 'react-icons/io5';
import { useTranslations } from 'next-intl';

interface CallControlsBarProps {
  userRole: string | undefined;
  layout: string;
  is_fullscreen: boolean;
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
}: CallControlsBarProps) {
  const t = useTranslations('Calendar.lesson_room');
  const colorScheme = useComputedColorScheme('light');
  const isDark = colorScheme === 'dark';

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
        <IoExpandOutline size={20} />
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
            <IoGridOutline size={20} />
          </ActionIcon>
        </Menu.Target>

        <Menu.Dropdown style={{ backgroundColor: 'var(--call-surface)', borderColor: 'var(--call-border)' }}>
          <Menu.Label style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>{t('layout')}</Menu.Label>
          {[
            { key: 'grid', label: t('layout_grid') },
            { key: 'pip', label: t('layout_pip') },
            { key: 'speaker-left', label: t('layout_speaker_left') },
            { key: 'speaker-right', label: t('layout_speaker_right') }
          ].map((item) => (
            <Menu.Item
              key={item.key}
              onClick={() => onLayoutChange(item.key)}
              style={{ 
                backgroundColor: layout === item.key ? 'var(--space-primary)' : 'transparent',
                color: layout === item.key ? 'var(--space-primary-text)' : 'var(--call-text)'
              }}
            >
              {item.label}
            </Menu.Item>
          ))}
        </Menu.Dropdown>
      </Menu>
{/* 
      <ActionIcon 
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

      {userRole !== 'student' && (
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
      )}
    </div>
  );
}
