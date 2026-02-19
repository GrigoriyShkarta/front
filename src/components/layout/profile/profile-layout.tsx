'use client';

import { Tabs, Stack, Title, Paper, Text, Breadcrumbs, Anchor, Box } from '@mantine/core';
import { IoPersonOutline, IoLockClosedOutline } from 'react-icons/io5';
import { useAuth } from '@/hooks/use-auth';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ProfileInfoForm } from './components/profile-info-form';
import { SecurityForm } from './components/security-form';
import { useProfile } from './hooks/use-profile';

/**
 * Main profile layout with tabs for different sections.
 * Displays user's name and breadcrumbs.
 */
export function ProfileLayout() {
  const { user } = useAuth();
  const t = useTranslations('Profile');
  const tNav = useTranslations('Navigation');
  const { update_profile, is_updating, change_password, is_changing_password } = useProfile();

  if (!user) return null;

  console.log('user', user);

  const breadcrumb_items = [
    { title: tNav('dashboard'), href: '/main' },
    { title: t('title'), href: '/main/profile' },
  ].map((item, index) => (
    <Anchor component={Link} href={item.href} key={index} size="sm">
      {item.title}
    </Anchor>
  ));

  return (
    <Stack gap="lg">
      <Stack gap="xs">
        <Breadcrumbs separator="→">{breadcrumb_items}</Breadcrumbs>
        <Title order={2}>{t('title')}</Title>
        <Text c="dimmed" size="sm" mt={-4}>{t('subtitle')}</Text>
      </Stack>

      <Paper withBorder radius="md" p={0} className="bg-white/5 border-white/10 overflow-hidden">
        <Tabs defaultValue="general" variant="outline" classNames={{
           list: 'pl-5 border-b border-white/10',
           tab: 'h-[50px] border-b-2 border-transparent data-[active=true]:border-blue-500 transition-colors'
        }}>
          <Tabs.List>
            <Tabs.Tab value="general" leftSection={<IoPersonOutline size={16} />}>
              {t('tabs.general')}
            </Tabs.Tab>
            <Tabs.Tab value="security" leftSection={<IoLockClosedOutline size={16} />}>
              {t('tabs.security')}
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="general" p="xl">
            <Box maw={1000}>
              <ProfileInfoForm user={user} on_submit={update_profile} is_loading={is_updating} />
            </Box>
          </Tabs.Panel>

          <Tabs.Panel value="security" p="xl">
            <SecurityForm on_submit={change_password} is_loading={is_changing_password} />
          </Tabs.Panel>
        </Tabs>
      </Paper>
    </Stack>
  );
}
