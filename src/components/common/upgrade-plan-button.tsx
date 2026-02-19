'use client';

import { Button, ButtonProps } from '@mantine/core';
import { IoRocketOutline } from 'react-icons/io5';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface Props extends ButtonProps {
  collapsed?: boolean;
  className?: string;
}

/**
 * Reusable "Upgrade Plan" button with a premium feel.
 * Redirects the user to the pricing/billing page.
 */
export function UpgradePlanButton({ collapsed, className, ...props }: Props) {
  const router = useRouter();
  const t = useTranslations('Common');

  if (collapsed) {
    return (
      <Button
        radius="lg"
        className={cn(
          "w-10 h-10 p-0 shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0",
          className
        )}
        style={{
          background: 'var(--space-primary-bg)',
        }}
        onClick={() => router.push('/main/billing')}
        title={t('upgrade_plan')}
        {...props}
      >
        <IoRocketOutline size={20} />
      </Button>
    );
  }

  return (
    <Button
      leftSection={<IoRocketOutline size={20} />}
      radius="xl"
      className={cn(
        "shadow-lg hover:shadow-blue-500/20 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0",
        className
      )}
      style={{
        background: 'var(--space-primary-bg)',
        color: 'var(--space-sidebar-text)'
      }}
      onClick={() => router.push('/main/billing')}
      {...props}
    >
      {t('upgrade_plan')}
    </Button>
  );
}
