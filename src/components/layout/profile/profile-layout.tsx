'use client';

import { Tabs, Stack, Title, Paper, Text, Breadcrumbs, Anchor, Box } from '@mantine/core';
import { IoPersonOutline, IoLockClosedOutline } from 'react-icons/io5';
import { useAuth } from '@/hooks/use-auth';
import { useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { ProfileInfoForm } from './components/profile-info-form';
import { SecurityForm } from './components/security-form';
import { useProfile } from './hooks/use-profile';

/**
 * Main profile layout for non-student roles.
 * Supports nested routing for consistency.
 */
export function ProfileLayout({ children }: { children?: React.ReactNode }) {
  const { user } = useAuth();
  const t = useTranslations('Profile');
  const tNav = useTranslations('Navigation');
  const pathname = usePathname();
  const router = useRouter();
  const { update_profile, is_updating, change_password, is_changing_password } = useProfile();

  if (!user) return null;

  const active_tab = pathname.endsWith('/security') ? 'security' : 'general';

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
        <Tabs 
          value={active_tab} 
          variant="outline" 
          onChange={(val) => {
            if (val === 'general') router.push('/main/profile');
            if (val === 'security') router.push('/main/profile/security');
          }}
          classNames={{
            list: 'pl-5 border-b border-white/10',
            tab: 'h-[50px] border-b-2 border-transparent data-[active=true]:border-primary transition-colors'
          }}
        >
          <Tabs.List>
            <Tabs.Tab value="general" leftSection={<IoPersonOutline size={16} />}>
              {t('tabs.general')}
            </Tabs.Tab>
            <Tabs.Tab value="security" leftSection={<IoLockClosedOutline size={16} />}>
              {t('tabs.security')}
            </Tabs.Tab>
          </Tabs.List>

          <Box p="xl">
            {children || (
               active_tab === 'general' ? 
               <Box maw={1000}>
                 <ProfileInfoForm user={user} on_submit={update_profile} is_loading={is_updating} />
               </Box> : 
               <SecurityForm on_submit={change_password} is_loading={is_changing_password} />
            )}
          </Box>
        </Tabs>
      </Paper>
    </Stack>
  );
}
