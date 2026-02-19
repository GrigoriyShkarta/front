'use client';

import { useDisclosure } from '@mantine/hooks';
import { Drawer, Box, Burger, Group, Stack, Title, ActionIcon, Avatar } from '@mantine/core';
import { SidebarItem } from './sidebar-item';
import { MAIN_NAVIGATION } from '../navigation-config';
import { useAuth } from '@/hooks/use-auth';
import { IoCloseOutline } from 'react-icons/io5';
import { SidebarControls } from './sidebar-controls';
import { UserDropdown } from './user-dropdown';
import { cn } from '@/lib/utils';

/**
 * Mobile version of the sidebar shown as a header with a burger menu.
 * When burger is clicked, it opens a full-screen drawer.
 */
export function MobileSidebar() {
  const [opened, { open, close }] = useDisclosure(false);
  const { user } = useAuth();
  const space = user?.space?.personalization;
  const show_icon = space?.is_show_sidebar_icon ?? true;

  const filtered_nav = MAIN_NAVIGATION.filter(item => 
    item.roles.includes(user?.role || 'student')
  );

  return (
    <Box component="nav" className="md:hidden">
      {/* Mobile Header */}
      <Box 
        className="h-14 px-4 flex items-center justify-between border-b sticky top-0 z-20 shadow-sm transition-colors duration-300"
        style={{ 
          background: 'var(--space-primary-bg)',
          color: 'var(--space-sidebar-text)',
          borderColor: 'rgba(255,255,255,0.1)'
        }}
      >
        <Group gap="sm">
          {show_icon && (
            <Avatar 
              src={space?.icon} 
              size={32} 
              radius="md"
              className="border border-white/10"
            >
              {(space?.title_space?.[0] || 'L').toUpperCase()}
            </Avatar>
          )}
          <Title order={5} style={{ color: 'inherit' }}>{space?.title_space || 'Lirnexa'}</Title>
        </Group>
        <Burger 
          opened={opened} 
          onClick={open} 
          size="sm" 
          aria-label="Toggle navigation" 
          color="var(--space-sidebar-text)"
        />
      </Box>

      {/* Mobile Menu Drawer */}
      <Drawer
        opened={opened}
        onClose={close}
        size="100%"
        padding="md"
        withCloseButton={false}
        className="md:hidden"
        styles={{
          content: { 
            background: 'var(--space-primary-bg)',
            color: 'var(--space-sidebar-text)'
          },
          body: {
            height: '100%'
          }
        }}
      >
        <Stack h="100%">
          <Group justify="space-between" mb="xl">
             <Group gap="sm">
                {show_icon && (
                  <Avatar 
                    src={space?.icon} 
                    size={32} 
                    radius="md"
                    className="border border-white/10"
                  >
                    {(space?.title_space?.[0] || 'L').toUpperCase()}
                  </Avatar>
                )}
                <Title order={5} style={{ color: 'inherit' }}>{space?.title_space || 'Lirnexa'}</Title>
             </Group>
             <ActionIcon onClick={close} variant="subtle" color="gray" size="lg" style={{ color: 'var(--space-sidebar-text)' }}>
                <IoCloseOutline size={28} />
             </ActionIcon>
          </Group>

          <Stack gap="sm">
            {filtered_nav.map((item) => (
              <SidebarItem key={item.href} item={item} collapsed={false} onClick={close} />
            ))}
          </Stack>

          <Box className={cn(
            "mt-auto pt-4 space-y-2",
            (space?.select_mode || (space?.languages?.length || 0) > 1) && "border-t border-white/10"
          )}>
            <SidebarControls collapsed={false} />
            <UserDropdown collapsed={false} />
          </Box>
        </Stack>
      </Drawer>
    </Box>
  );
}
