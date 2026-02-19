'use client';

import { useState } from 'react';
import { Paper, Stack, Group, Button, Title, LoadingOverlay, Box, Text, Center, Breadcrumbs, Anchor, Pagination, Select } from '@mantine/core';
import { Link } from '@/i18n/routing';
import { IoAddOutline, IoTrashOutline, IoPricetagOutline } from 'react-icons/io5';
import { useTranslations } from 'next-intl';
import { CategoryTable } from './components/category-table';
import { CategoryDrawer } from './components/category-drawer';
import { CategoryDeleteModal } from './components/category-delete-modal';
import { useCategories } from './hooks/use-categories';
import { CategoryMaterial, CreateCategoryForm } from './schemas/category-schema';

/**
 * Main Layout for Category Management
 */
export default function CategoriesLayout() {
  const t = useTranslations('Categories');
  const tNav = useTranslations('Navigation');
  const common_t = useTranslations('Common');

  const breadcrumb_items = [
    { title: tNav('dashboard'), href: '/main' },
    { title: tNav('categories'), href: '/main/categories' },
  ].map((item, index) => (
    <Anchor component={Link} href={item.href} key={index} size="sm">
      {item.title}
    </Anchor>
  ));

  // State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState('15');
  const [opened, setOpened] = useState(false);
  const [editing, setEditing] = useState<CategoryMaterial | null>(null);
  const [selected_ids, setSelectedIds] = useState<string[]>([]);
  
  // Deletion modal state
  const [delete_modal_opened, setDeleteModalOpened] = useState(false);
  const [id_to_delete, setIdToDelete] = useState<string | null>(null);

  const { 
    categories, 
    total_pages,
    is_loading, 
    create_category, 
    create_categories,
    update_category, 
    delete_category, 
    bulk_delete_categories, 
    is_pending 
  } = useCategories({ page, limit: Number(limit) });

  const handle_add = () => {
    setEditing(null);
    setOpened(true);
  };

  const handle_edit = (category: CategoryMaterial) => {
    setEditing(category);
    setOpened(true);
  };

  const handle_submit = async (data: CreateCategoryForm | CreateCategoryForm[]) => {
    if (Array.isArray(data)) {
      await create_categories(data);
    } else if (editing) {
      await update_category({ id: editing.id, data });
    } else {
      await create_category(data);
    }
  };

  const handle_delete_click = (id: string) => {
    setIdToDelete(id);
    setDeleteModalOpened(true);
  };

  const handle_bulk_delete_click = () => {
    setIdToDelete(null);
    setDeleteModalOpened(true);
  };

  const confirm_delete = async () => {
    if (id_to_delete) {
      await delete_category(id_to_delete);
    } else {
      await bulk_delete_categories(selected_ids);
      setSelectedIds([]);
    }
    setDeleteModalOpened(false);
  };

  const has_data = categories.length > 0;

  return (
    <Stack gap="xl">
      <Breadcrumbs mb="xs" separator="→">
        {breadcrumb_items}
      </Breadcrumbs>
      
      <Group justify="space-between" align="center">
        <Stack gap={0}>
          <Title order={2}>{t('title')}</Title>
        </Stack>
        <Group gap="sm">
          {selected_ids.length > 0 && (
            <Button 
              variant="light" 
              color="red" 
              leftSection={<IoTrashOutline size={18} />}
              onClick={handle_bulk_delete_click}
              radius="md"
            >
              {t('bulk_delete', { count: selected_ids.length })}
            </Button>
          )}
          <Button 
            leftSection={<IoAddOutline size={18} />} 
            onClick={handle_add}
            radius="md"
          >
            {t('add_category')}
          </Button>
        </Group>
      </Group>

      <Paper withBorder radius="md" p="md" pos="relative" className="bg-white/5 border-white/10 overflow-hidden">
        <LoadingOverlay visible={is_loading} overlayProps={{ blur: 2 }} zIndex={50} />
        {is_loading && <Box mih="calc(100vh - 400px)" />}
        
        {!is_loading && (
          has_data ? (
            <Box>
              <CategoryTable 
                data={categories} 
                selected_ids={selected_ids}
                on_select={setSelectedIds}
                on_edit={handle_edit}
                on_delete={handle_delete_click}
              />

              <Box className="p-4 border-t border-white/10 bg-white/2">
                <Group justify="center">
                  <Group gap="xs">
                    <Text size="sm" c="dimmed">{common_t('show')}</Text>
                    <Select
                      data={['15', '30', '50']}
                      value={limit}
                      onChange={(val) => setLimit(val || '15')}
                      size="xs"
                      w={70}
                    />
                    <Text size="sm" c="dimmed">{common_t('per_page')}</Text>
                  </Group>

                  <Pagination
                    total={total_pages}
                    value={page}
                    onChange={setPage}
                    size="sm"
                    withEdges
                    boundaries={1}
                    siblings={1}
                  />
                </Group>
              </Box>
            </Box>
          ) : (
            <Center py={60}>
              <Stack align="center" gap="md">
                <Box 
                  className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg"
                  style={{ 
                    backgroundColor: 'var(--mantine-primary-color-light)',
                    color: 'var(--mantine-primary-color-filled)',
                    border: '1px solid var(--mantine-primary-color-light-hover)',
                    boxShadow: '0 0 20px rgba(var(--mantine-primary-color-filled-rgb), 0.15)'
                  }}
                >
                  <IoPricetagOutline size={40} />
                </Box>
                <Title order={4}>{t('table.empty')}</Title>
                <Text c="dimmed" size="sm" ta="center" maw={400}>
                  {t('subtitle_empty', { defaultValue: 'You haven\'t created any categories yet. Add categories to organize your materials.' })}
                </Text>
                <Button variant="light" mt="sm" onClick={handle_add} leftSection={<IoAddOutline size={18} />}>
                  {t('add_category')}
                </Button>
              </Stack>
            </Center>
          )
        )}
      </Paper>

      <CategoryDrawer 
        opened={opened} 
        onClose={() => setOpened(false)} 
        onSubmit={handle_submit}
        editing_category={editing}
        loading={is_pending}
      />

      <CategoryDeleteModal 
        opened={delete_modal_opened}
        onClose={() => setDeleteModalOpened(false)}
        onConfirm={confirm_delete}
        is_loading={is_pending}
        count={id_to_delete ? 1 : selected_ids.length}
      />
    </Stack>
  );
}
