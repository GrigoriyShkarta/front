'use client';

import { useAuth } from '@/hooks/use-auth';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { PageContainer } from '@/components/common/page-container';
import { Title, Text, Button, Stack, Box } from '@mantine/core';
import { IoLogOutOutline } from 'react-icons/io5';

export default function MainPage() {
  const { user, logout } = useAuth();
  const t = useTranslations('Auth.login');
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <></>
  );
}
