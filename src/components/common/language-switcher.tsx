'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { Select } from '@mantine/core';
import { SUPPORTED_LANGUAGES } from '@/lib/constants';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = (value: string | null) => {
    if (!value) return;
    router.replace(pathname, { locale: value as any });
  };

  return (
    <Select
      data={SUPPORTED_LANGUAGES.map((lang) => ({ 
        value: lang.id, 
        label: lang.label 
      }))}
      value={locale}
      onChange={handleChange}
      allowDeselect={false}
      w={140}
    />
  );
}
