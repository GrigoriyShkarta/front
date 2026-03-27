'use client';

import { useTranslations } from 'next-intl';

import { Group, TextInput, MultiSelect, Pagination, Box } from '@mantine/core';
import { IoSearchOutline } from 'react-icons/io5';

interface FiltersBarProps {
  search: string;
  onSearchChange: (v: string) => void;
  categories: { value: string; label: string }[];
  selectedCategories: string[];
  onCategoriesChange: (v: string[]) => void;
  page: number;
  total: number;
  onPageChange: (v: number) => void;
  loading?: boolean;
}

/**
 * Unified filter section with Search, Category select, and Pagination.
 */
export function FiltersBar({
  search, onSearchChange, 
  categories, selectedCategories, onCategoriesChange,
  page, total, onPageChange, loading
}: FiltersBarProps) {
  const common_t = useTranslations('Common');
  
  return (
    <Box>
      <Group grow mb="md" gap="sm">
        <TextInput 
          placeholder={common_t('search')} 
          leftSection={<IoSearchOutline className="opacity-40" />}
          value={search}
          onChange={(e) => onSearchChange(e.currentTarget.value)}
          radius="md"
          className="flex-1"
        />
        <MultiSelect 
          placeholder={common_t('filters') || 'Categories'} 
          data={categories}
          value={selectedCategories}
          onChange={onCategoriesChange}
          radius="md"
          className="max-w-[300px]"
          clearable
          searchable
          maxValues={3}
        />
      </Group>

      {total > 1 && (
        <Group justify="center" mb="md">
          <Pagination 
            value={page} 
            onChange={onPageChange} 
            total={total} 
            size="sm" 
            radius="md" 
            color="primary"
            disabled={loading}
          />
        </Group>
      )}
    </Box>
  );
}
