'use client';

import { Stack, Group, Box, LoadingOverlay, TextInput, Button, Drawer, Pagination, MultiSelect, Text, Select } from '@mantine/core';
import { IoSearchOutline, IoOptionsOutline, IoFilterOutline } from 'react-icons/io5';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useCategories } from '@/components/layout/categories/hooks/use-categories';
import { useAdditionalMaterials } from '../hooks/use-additional-materials';
import { AdditionalMaterialsTable } from './additional-materials-table';

interface Props {
  student_id: string;
}

export function AdditionalMaterials({ student_id }: Props) {
  const t = useTranslations('Materials');
  const common_t = useTranslations('Common');
  
  const { 
    lessons, 
    is_loading, 
    grant_access, 
    is_granting, 
    revoke_access, 
    is_revoking, 
    total_pages,
    page,
    setPage,
    search,
    setSearch,
    category_ids,
    setCategoryIds,
    limit,
    setLimit
  } = useAdditionalMaterials(student_id);
  
  const { categories } = useCategories();
  const tCat = useTranslations('Categories');
  
  const [filter_drawer_opened, set_filter_drawer_opened] = useState(false);

  const handle_toggle_access = async (lesson_id: string, should_have_access: boolean) => {
    if (should_have_access) {
      await grant_access({
        student_ids: [student_id],
        material_ids: [lesson_id],
        material_type: 'lesson',
        full_access: true,
      });
    } else {
      await revoke_access({
        student_ids: [student_id],
        material_ids: [lesson_id],
        material_type: 'lesson',
      });
    }
  };

  return (
    <Stack gap="md" pos="relative">
      <LoadingOverlay visible={is_loading} zIndex={10} overlayProps={{ blur: 1 }} />
      
      <Group justify="space-between" align="flex-end">
        <TextInput 
          placeholder={t('additional.search_placeholder') || 'Search by lesson name...'}
          leftSection={<IoSearchOutline size={16} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          className="flex-1"
          maw={400}
        />
        <Button 
          variant={category_ids.length > 0 ? "light" : "default"} 
          color={category_ids.length > 0 ? "primary" : "gray"}
          leftSection={<IoOptionsOutline size={18} />}
          onClick={() => set_filter_drawer_opened(true)}
        >
          {common_t('filters') || 'Filters'}
          {category_ids.length > 0 && (
              <Box 
                  ml={8} 
                  className="w-5 h-5 rounded-full text-white flex items-center justify-center text-[10px] font-bold shadow-sm"
                  style={{ backgroundColor: 'var(--mantine-primary-color-filled)' }}
              >
                  {category_ids.length}
              </Box>
          )}
        </Button>
      </Group>

      <AdditionalMaterialsTable 
        lessons={lessons} 
        on_toggle_access={handle_toggle_access}
        is_mutating={is_granting || is_revoking}
      />

      <Group justify="center" mt="md">
        <Group gap="xs">
          <Text size="sm" c="dimmed">{common_t('show')}</Text>
          <Select
            data={['10', '20', '30', '50']}
            value={limit.toString()}
            onChange={(val) => setLimit(Number(val || '10'))}
            size="xs"
            w={70}
          />
          <Text size="sm" c="dimmed">{common_t('per_page')}</Text>
        </Group>

        <Pagination 
          total={total_pages} 
          value={page} 
          onChange={setPage} 
          radius="md"
          color="primary"
        />
      </Group>

      <Drawer
        opened={filter_drawer_opened}
        onClose={() => set_filter_drawer_opened(false)}
        title={common_t('filters') || 'Filters'}
        position="right"
      >
        <Stack gap="lg">
            <MultiSelect
              label={tCat('title')}
              placeholder={tCat('select_categories')}
              data={categories.map(c => ({ value: c.id, label: c.name }))}
              value={category_ids}
              onChange={setCategoryIds}
              searchable
              clearable
              leftSection={<IoFilterOutline />}
            />

            <Group justify="flex-end">
              <Button 
                variant="subtle" 
                color="gray" 
                onClick={() => {
                  setCategoryIds([]);
                  set_filter_drawer_opened(false);
                }}
              >
                {common_t('clear')}
              </Button>
              <Button 
                onClick={() => set_filter_drawer_opened(false)}
                color="primary"
                className="bg-primary hover:opacity-90 transition-all shadow-md shadow-primary/20"
              >
                {common_t('apply')}
              </Button>
            </Group>
        </Stack>
      </Drawer>
    </Stack>
  );
}
