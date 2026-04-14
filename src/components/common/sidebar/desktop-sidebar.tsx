'use client';

import { useState } from 'react';
import { Stack, Box, ActionIcon, Title, ScrollArea, Avatar, Group } from '@mantine/core';
import { IoMenuOutline, IoArrowBackOutline } from 'react-icons/io5';
import { SidebarItem } from './sidebar-item';
import { SidebarControls } from './sidebar-controls';
import { MAIN_NAVIGATION } from '../navigation-config';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

/**
 * Desktop version of the sidebar.
 * Supports expanding/collapsing and role-based filtering.
 */
export function DesktopSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();
  const space = user?.space;
  
  const filtered_nav = MAIN_NAVIGATION.filter(item => 
    item.roles.includes(user?.role || 'student')
  );

  const show_icon = space?.personalization?.is_show_sidebar_icon ?? true;

  return (
    <Box 
      component="aside"
      className={cn(
        'hidden md:flex flex-col h-screen transition-all duration-300 relative z-20',
        collapsed ? 'w-[50px]' : ''
      )}
      style={{ 
        width: !collapsed ? `${space?.personalization?.sidebar_width ?? 250}px` : '50px',
        background: 'var(--space-primary-bg)',
        color: 'var(--space-sidebar-text)'
      }}
    >
      {/* Header */}
      <Box className={cn(
        'border-b border-white/10 flex relative w-full overflow-hidden transition-all duration-300',
        collapsed ? 'flex-col items-center py-6 gap-6' : 'h-20 items-center px-4 justify-between gap-2'
      )}>
        {/* Full Logo Container */}
        {!collapsed && (
          <Group gap="sm" className="flex-1 overflow-hidden" wrap="nowrap">
            {show_icon && (
              <Avatar 
                src={space?.personalization?.icon} 
                size={36} 
                radius="lg"
                className="shadow-md shrink-0"
              >
                {(space?.personalization?.title_space?.[0] || 'L').toUpperCase()}
              </Avatar>
            )}
            <Title order={3} fw={700} className="truncate flex-1 text-[16px]!" style={{ color: 'var(--space-sidebar-text)' }}>
              {space?.personalization?.title_space || 'Lirnexa'}
            </Title>
          </Group>
        )}

        {/* Collapsed Logo */}
        {collapsed && show_icon && (
          <Avatar 
            src={space?.personalization?.icon} 
            size={36} 
            radius="md"
            className="shrink-0 shadow-sm"
          >
            {(space?.personalization?.title_space?.[0] || 'L').toUpperCase()}
          </Avatar>
        )}

        {/* Toggle Button */}
        <ActionIcon
          onClick={() => setCollapsed(!collapsed)}
          variant="subtle"
          className={cn(
             'transition-all duration-300 rounded-lg shadow-sm',
             collapsed ? 'w-8 h-8' : 'w-7 h-7',
             'bg-white/10 hover:bg-white/20'
          )}
          style={{ 
            color: 'inherit',
            borderColor: 'rgba(255,255,255,0.1)'
          }}
        >
          {collapsed ? <IoMenuOutline size={20} color={space?.personalization?.is_white_sidebar_color !== false ? 'white' : 'black'}/> :
           <IoArrowBackOutline size={20} color={space?.personalization?.is_white_sidebar_color !== false ? 'white' : 'black'}/>}
        </ActionIcon>
      </Box>

      {/* Navigation Items */}
      <ScrollArea 
        className="flex-1 px-2 py-4" 
        offsetScrollbars 
        type="scroll" 
        scrollbarSize={4}
        styles={{
          viewport: { overflowX: 'hidden' }
        }}
      >
        <Stack gap="xs">
          {filtered_nav.map((item) => (
            <SidebarItem 
              key={item.href} 
              item={item} 
              collapsed={collapsed} 
              onExpand={() => setCollapsed(false)} 
            />
          ))}
        </Stack>
      </ScrollArea>

      {/* Footer Area */}
      <Box className={cn(
        'mt-auto transition-all duration-300',
        (space?.personalization?.select_mode || (space?.personalization?.languages?.length || 0) > 1) && 'border-t border-white/10'
      )}>
        <SidebarControls collapsed={collapsed} />
      </Box>
    </Box>
  );
}
