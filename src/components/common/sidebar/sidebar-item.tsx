'use client';

import { Link } from '@/i18n/routing';
import { usePathname } from '@/i18n/routing';
import { Tooltip, UnstyledButton, Text, Box, Collapse, Stack } from '@mantine/core';
import { useTranslations } from 'next-intl';
import { NavItem } from '../navigation-config';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { IoChevronDownOutline, IoChevronUpOutline } from 'react-icons/io5';

interface Props {
  item: NavItem;
  collapsed: boolean;
  onClick?: () => void;
  onExpand?: () => void;
}

/**
 * Sidebar link component with icon and label.
 * Handles active state, collapsed mode and sub-items.
 */
export function SidebarItem({ item, collapsed, onClick, onExpand }: Props) {
  const pathname = usePathname();
  const t = useTranslations('Navigation');
  const [opened, setOpened] = useState(false);
  
  const has_items = !!item.items?.length;
  const is_active = pathname === item.href || item.items?.some(sub => pathname === sub.href);

  useEffect(() => {
    if (is_active && has_items && !collapsed) {
      setOpened(true);
    }
  }, [is_active, has_items, collapsed]);

  const handle_click = (e: React.MouseEvent) => {
    if (has_items) {
      e.preventDefault();
      if (collapsed) {
        onExpand?.();
        setOpened(true);
      } else {
        setOpened((o) => !o);
      }
    } else if (onClick) {
      onClick();
    }
  };

  const button_content = (
    <UnstyledButton
      component={(has_items ? 'button' : Link) as any}
      href={item.href}
      onClick={handle_click}
      className={cn(
        'flex items-center w-full rounded-lg transition-all duration-200 h-10 group relative',
        collapsed ? 'justify-center px-0' : 'px-3',
        is_active && !has_items
          ? 'bg-primary-hover shadow-md' 
          : 'hover:bg-white/10 active:scale-98',
        !collapsed && !is_active && 'hover:translate-x-1',
        collapsed && !is_active && 'hover:scale-110'
      )}
      style={{ 
        color: is_active ? 'var(--space-sidebar-text)' : 'var(--space-sidebar-text-muted)'
      }}
    >
      <item.icon size={20} className={cn(!collapsed ? 'mr-3' : 'mr-0')} />
      {!collapsed && (
        <>
          <Text size="sm" fw={500} className="flex-1">
            {t(item.label)}
          </Text>
          {has_items && (
            opened ? <IoChevronUpOutline size={14} /> : <IoChevronDownOutline size={14} />
          )}
        </>
      )}
    </UnstyledButton>
  );

  const sub_items_list = has_items && !collapsed && (
    <Collapse in={opened}>
      <Stack gap={4} mt={4} className="border-l border-white/10 ml-6 pl-4 overflow-hidden">
        {item.items?.map((sub) => {
          const sub_active = pathname === sub.href;
          return (
            <UnstyledButton
              key={sub.href}
              component={Link}
              href={sub.href}
              onClick={onClick}
              className={cn(
                'flex items-center w-full h-8 px-3 rounded-md transition-all duration-200 group/sub overflow-hidden',
                sub_active 
                  ? 'bg-white/10 text-[var(--space-sidebar-text)]' 
                  : 'text-[var(--space-sidebar-text-muted)] hover:bg-white/5 hover:text-[var(--space-sidebar-text)] hover:translate-x-1'
              )}
            >
              {sub.icon && <sub.icon size={14} className="mr-3 opacity-70 group-hover/sub:opacity-100 transition-opacity" />}
              <Text size="sm" fw={sub_active ? 500 : 400} className="truncate">
                {t(sub.label)}
              </Text>
            </UnstyledButton>
          );
        })}
      </Stack>
    </Collapse>
  );

  if (collapsed) {
    return (
      <Tooltip label={t(item.label)} position="right" withArrow transitionProps={{ transition: 'fade', duration: 200 }}>
        <Box>{button_content}</Box>
      </Tooltip>
    );
  }

  return (
    <Box>
      {button_content}
      {sub_items_list}
    </Box>
  );
}

