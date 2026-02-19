'use client';

import { Group, TextInput } from '@mantine/core';
import { useTranslations } from 'next-intl';
import { IoSearchOutline } from 'react-icons/io5';

interface Props {
  search: string;
  onSearchChange: (value: string) => void;
}

export function UserFilters({ 
  search, 
  onSearchChange 
}: Props) {
  const t = useTranslations('Users.filters');

  return (
    <Group>
      <TextInput
        placeholder={t('search_placeholder')}
        leftSection={<IoSearchOutline size={16} />}
        value={search}
        onChange={(e) => onSearchChange(e.currentTarget.value)}
        w={300}
      />
    </Group>
  );
}
