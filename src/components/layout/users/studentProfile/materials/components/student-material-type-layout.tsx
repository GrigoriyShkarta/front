'use client';

import { Stack, Group, Box, LoadingOverlay, TextInput, Button, Drawer, Pagination, MultiSelect, Text, Select, SegmentedControl } from '@mantine/core';
import { IoSearchOutline, IoOptionsOutline, IoFilterOutline, IoGridOutline, IoListOutline } from 'react-icons/io5';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { useCategories } from '@/components/layout/categories/hooks/use-categories';
import { useStudentMaterialsData } from '../hooks/use-student-materials-data';
import { StudentMaterialTable } from './student-material-table';
import { StudentMaterialGrid } from './student-material-grid';
import { PhotoPreviewModal } from '@/components/common/photo-preview-modal';
import { VideoPlayerModal } from '@/components/layout/materials/videos/components/video-player-modal';

interface Props {
  student_id: string;
  type: 'audio' | 'photo' | 'video' | 'file';
}

export function StudentMaterialTypeLayout({ student_id, type }: Props) {
  const t = useTranslations('Materials');
  const common_t = useTranslations('Common');
  
  const { 
    items, 
    is_loading, 
    is_granting, 
    is_revoking, 
    total_pages,
    page,
    search,
    category_ids,
    limit,
    grant_access, 
    revoke_access, 
    setPage,
    setSearch,
    setCategoryIds,
    setLimit
  } = useStudentMaterialsData(student_id, type);
  
  const { categories } = useCategories();
  const tCat = useTranslations('Categories');
  
  const [filter_drawer_opened, set_filter_drawer_opened] = useState(false);
  const [view_mode, set_view_mode] = useState<'grid' | 'table'>('table');
  
  // Modals state
  const [preview_opened, set_preview_opened] = useState(false);
  const [preview_item, set_preview_item] = useState<any | null>(null);

  useEffect(() => {
    if (type === 'photo' || type === 'video') {
       const saved_view = localStorage.getItem(`${type}_view_mode`) as 'grid' | 'table';
       if (saved_view) set_view_mode(saved_view);
       else set_view_mode('grid');
    } else {
       set_view_mode('table');
    }
  }, [type]);

  const handle_view_change = (val: string) => {
    const mode = val as 'grid' | 'table';
    set_view_mode(mode);
    localStorage.setItem(`${type}_view_mode`, mode);
  };

  const handle_toggle_access = async (id: string, should_have_access: boolean) => {
    if (should_have_access) {
      await grant_access({
        student_ids: [student_id],
        material_ids: [id],
        material_type: type,
        full_access: true,
      });
    } else {
      await revoke_access({
        student_ids: [student_id],
        material_ids: [id],
        material_type: type,
      });
    }
  };

  const handle_item_click = (item: any) => {
    if (type === 'photo' || type === 'video') {
        set_preview_item(item);
        set_preview_opened(true);
    } else {
        if (item.url) window.open(item.url, '_blank');
    }
  };

  return (
    <Stack gap="md" pos="relative">
      <LoadingOverlay visible={is_loading} zIndex={10} overlayProps={{ blur: 1 }} />
      
      <Group justify="space-between" align="flex-end">
        <Group className="flex-1" align="flex-end">
          <TextInput 
            placeholder={t(`${type}.search_placeholder`) || t('additional.search_placeholder') || 'Search...'}
            leftSection={<IoSearchOutline size={16} />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            maw={400}
            className="flex-1"
          />
          
          {(type === 'photo' || type === 'video') && (
            <SegmentedControl
              size="sm"
              value={view_mode}
              onChange={handle_view_change}
              color="primary"
              data={[
                { label: <Group gap={6} wrap="nowrap"><IoGridOutline size={14} /><Box ml={4}>{t(`${type}.gallery`) || 'Gallery'}</Box></Group>, value: 'grid' },
                { label: <Group gap={6} wrap="nowrap"><IoListOutline size={14} /><Box ml={4}>{t(`${type}.table_view`) || 'Table'}</Box></Group>, value: 'table' },
              ]}
            />
          )}
        </Group>

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

      {view_mode === 'grid' ? (
        <StudentMaterialGrid 
            items={items}
            type={type}
            on_toggle_access={handle_toggle_access}
            on_item_click={handle_item_click}
            is_mutating={is_granting || is_revoking}
        />
      ) : (
        <StudentMaterialTable 
            items={items} 
            type={type}
            on_toggle_access={handle_toggle_access}
            is_mutating={is_granting || is_revoking}
        />
      )}

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

      {type === 'photo' && (
        <PhotoPreviewModal 
            opened={preview_opened}
            onClose={() => set_preview_opened(false)}
            photo={preview_item}
            photos={items}
            onPhotoChange={set_preview_item}
        />
      )}

      {type === 'video' && (
        <VideoPlayerModal 
            opened={preview_opened}
            onClose={() => set_preview_opened(false)}
            video={preview_item}
        />
      )}
    </Stack>
  );
}
