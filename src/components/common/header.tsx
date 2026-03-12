'use client';

import { Group, Box, Container, useMantineTheme } from '@mantine/core';
import { UserDropdown } from './sidebar/user-dropdown';
import { NotificationDropdown } from './notification-dropdown';
import { useAuth } from '@/hooks/use-auth';

/**
 * Shared Header component for desktop view.
 * Displays user profile info (avatar + name) and other global actions.
 */
export function Header() {
  const { user } = useAuth();
  const theme = useMantineTheme();
  
  return (
    <Box 
      component="header" 
      className="hidden md:block h-[44px] border-b sticky top-0 z-30 transition-colors duration-300"
      style={{ 
        backgroundColor: 'var(--mantine-color-body)',
        borderColor: 'var(--space-secondary)'
      }}
    >
      <Container fluid h="44px" px="xl" className="max-w-[1920px] mx-auto">
        <Group justify="flex-end" h="100%" gap="md">
          <NotificationDropdown />

          <UserDropdown 
            collapsed={false} 
            hide_email={true} 
            className="px-5 py-2.5 hover:bg-black/5 dark:hover:bg-white/5 shadow-md border"
            style={{ 
              borderColor: 'var(--space-secondary)',
              borderRadius: '12px'
            }}
          />
        </Group>
      </Container>
    </Box>
  );
}
