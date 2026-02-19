'use client';

import { Menu, UnstyledButton, Group, Avatar, Text, Box, rem, Modal, Button, Stack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IoPersonOutline, IoChevronUpOutline, IoChevronDownOutline, IoLogOutOutline } from 'react-icons/io5';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { useState } from 'react';
import { useParams } from 'next/navigation';

interface Props {
  collapsed: boolean;
}

/**
 * User dropdown component for the sidebar footer.
 * Provides access to profile and logout.
 */
export function UserDropdown({ collapsed }: Props) {
  const { user, logout } = useAuth();
  const t = useTranslations('Navigation');
  const [opened, setOpened] = useState(false);
  const [confirm_logout_opened, { open: open_confirm_logout, close: close_confirm_logout }] = useDisclosure(false);
  const [is_logging_out, set_is_logging_out] = useState(false);
  const router = useRouter();
  const params = useParams();
  const current_locale = params.locale as string;

  if (!user) return null;

  const handle_logout = async () => {
    set_is_logging_out(true);
    try {
      await logout();
      router.push('/login');
    } finally {
      set_is_logging_out(false);
      close_confirm_logout();
    }
  };

  return (
    <Menu 
      width={220} 
      position="right-end" 
      offset={10} 
      onOpen={() => setOpened(true)} 
      onClose={() => setOpened(false)}
      transitionProps={{ transition: 'pop-bottom-right' }}
      withinPortal
    >
      <Menu.Target>
        <UnstyledButton 
          className={cn(
            "w-full rounded-lg transition-all hover:bg-white/10 active:scale-[0.98]",
            collapsed ? "p-2 aspect-square flex items-center justify-center" : "p-3"
          )}
        >
          <Group gap="sm" wrap="nowrap" justify={collapsed ? "center" : "flex-start"}>
            <Avatar src={user.avatar} radius="md" size="sm" fw={700}>
              {user.name.charAt(0)}
            </Avatar>
            
            {!collapsed && (
              <Box className="flex-1 overflow-hidden">
                <Text size="sm" fw={600} truncate inherit style={{ color: 'var(--space-sidebar-text)' }}>
                  {user.name}
                </Text>
                <Text size="xs" opacity={0.6} truncate inherit style={{ color: 'var(--space-sidebar-text)' }}>
                  {user.email}
                </Text>
              </Box>
            )}

            {!collapsed && (
               opened ? <IoChevronUpOutline size={14} opacity={0.5} /> : <IoChevronDownOutline size={14} opacity={0.5} />
            )}
          </Group>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>{t('profile')}</Menu.Label>
        <Menu.Item 
          component={Link} 
          href="/main/profile"
          leftSection={<IoPersonOutline style={{ width: rem(14), height: rem(14) }} />}
        >
          {t('profile')}
        </Menu.Item>
        
        <Menu.Divider />
        
        <Menu.Item 
          color="red"
          onClick={open_confirm_logout}
          leftSection={<IoLogOutOutline style={{ width: rem(14), height: rem(14) }} />}
        >
          {t('logout')}
        </Menu.Item>
      </Menu.Dropdown>

      {/* Logout Confirmation Modal */}
      <Modal
        opened={confirm_logout_opened}
        onClose={close_confirm_logout}
        title={t('logout_confirm_title')}
        centered
        size="sm"
        classNames={{
          header: 'px-6 py-4',
          content: 'transition-colors duration-300',
          body: 'p-6'
        }}
        styles={{
          header: { 
            backgroundColor: 'var(--mantine-color-body)', 
          },
          content: { 
            backgroundColor: 'var(--mantine-color-body)', 
            color: 'var(--foreground)'
          }
        }}
      >
        <Stack gap="xl">
          <Text size="sm">
            {t('logout_confirm_message')}
          </Text>

          <Group justify="flex-end" gap="sm">
            <Button variant="subtle" color="gray" onClick={close_confirm_logout} disabled={is_logging_out}>
              {t('cancel')}
            </Button>
            <Button color="red" onClick={handle_logout} loading={is_logging_out}>
              {t('logout')}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Menu>
  );
}
