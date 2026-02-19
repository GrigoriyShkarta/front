'use client';

import { Group } from '@mantine/core';
import { ThemeToggle } from '@/components/common/theme-toggle';
import { LanguageSwitcher } from '@/components/common/language-switcher';

export function AuthHeader() {
  return (
    <Group justify="flex-end" p="md" className="absolute top-0 right-0 w-full z-10">
      <LanguageSwitcher />
      <ThemeToggle />
    </Group>
  );
}
