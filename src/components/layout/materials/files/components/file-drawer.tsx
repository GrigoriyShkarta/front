'use client';

import { 
  Drawer, 
  Stack, 
  TextInput, 
  Button, 
  Group, 
  Text, 
  Paper, 
  ActionIcon, 
  Progress,
  Box,
  MultiSelect,
  Tooltip,
  rem
} from '@mantine/core';
import { Dropzone, FileWithPath } from '@mantine/dropzone';
import { IoCloudUploadOutline, IoDocumentOutline, IoCloseOutline, IoTrashOutline, IoAddOutline } from 'react-icons/io5';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { FileMaterial } from '../schemas/file-schema';
import { useCategories } from '@/components/layout/categories/hooks/use-categories';
import { CategoryDrawer as CreateCategoryDrawer } from '@/components/layout/categories/components/category-drawer';
import { CreateCategoryForm } from '@/components/layout/categories/schemas/category-schema';

interface FileWithMetadata {
  file: FileWithPath;
  id: string;
  name: string;
  progress: number;
  status: 'idle' | 'uploading' | 'success' | 'error';
  errorMessage?: string;
  categories: string[];
}

interface Props {
  opened: boolean;
  onClose: () => void;
  file?: FileMaterial | null; // If present, we are editing
  initial_files?: FileWithMetadata[];
  on_submit: (
    files: FileWithMetadata[], 
    update_file: (id: string, update: Partial<FileWithMetadata>) => void
  ) => Promise<void>;
  is_loading: boolean;
}

export function FileDrawer({ opened, onClose, file, initial_files, on_submit, is_loading }: Props) {
  const t = useTranslations('Materials.file');
  const common_t = useTranslations('Common');
  const tCat = useTranslations('Categories');

  const [files, setFiles] = useState<FileWithMetadata[]>([]);
  const { categories: all_categories, create_category, create_categories, is_pending: is_cat_pending } = useCategories();
  const [category_drawer_opened, setCategoryDrawerOpened] = useState(false);
  const [active_item_id, setActiveItemId] = useState<string | null>(null);

  const update_file_internal = (id: string, update: Partial<FileWithMetadata>) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, ...update } : f));
  };

  useEffect(() => {
    if (!opened) {
      setFiles([]);
    } else if (file) {
      setFiles([{
        id: file.id,
        name: file.name,
        file: null as any,
        progress: 0,
        status: 'idle',
        categories: file.categories?.map(c => c.id) || []
      }]);
    } else if (initial_files && initial_files.length > 0) {
      setFiles(initial_files);
    }
  }, [opened, file, initial_files]);

  const handle_drop = (dropped_files: FileWithPath[]) => {
    const new_files = dropped_files.map(f => ({
      file: f,
      id: Math.random().toString(36).substring(7),
      name: f.name.replace(/\.[^/.]+$/, ""), // Remove extension
      progress: 0,
      status: 'idle' as const,
      categories: []
    }));
    setFiles(prev => [...prev.slice(0, 10 - new_files.length), ...new_files].slice(0, 10));
  };

  const remove_file = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const update_file_name = (id: string, name: string) => {
    update_file_internal(id, { name });
  };

  const update_file_categories = (id: string, categories: string[]) => {
    update_file_internal(id, { categories });
  };

  const handle_submit = async () => {
    await on_submit(files, update_file_internal);
  };

  const handle_category_create_submit = async (data: CreateCategoryForm | CreateCategoryForm[]) => {
    let new_ids: string[] = [];
    if (Array.isArray(data)) {
        const new_cats = await create_categories(data);
        new_ids = new_cats.map(c => c.id);
    } else {
        const new_cat = await create_category(data);
        new_ids = [new_cat.id];
    }
    
    if (active_item_id) {
        const current = files.find(f => f.id === active_item_id)?.categories || [];
        update_file_categories(active_item_id, [...current, ...new_ids]);
    }
    
    setCategoryDrawerOpened(false);
    setActiveItemId(null);
  };

  const has_empty_names = files.some(f => !f.name.trim());
  const is_submit_disabled = files.length === 0 || has_empty_names || is_loading;

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={file ? t('edit_file') : t('add_file')}
      position="right"
      size="md"
      classNames={{
        header: 'px-6 py-4',
        body: 'p-6'
      }}
      styles={{
        header: { backgroundColor: 'var(--mantine-color-body)' },
        content: { backgroundColor: 'var(--mantine-color-body)', color: 'var(--foreground)' }
      }}
    >
      <Stack gap="xl">
        {!file && (
          <Dropzone
            onDrop={handle_drop}
            maxSize={100 * 1024 ** 2}
            maxFiles={10 - files.length}
            className="border-2 border-dashed border-white/10 hover:border-blue-500/50 bg-white/5 transition-colors rounded-xl"
          >
            <Group justify="center" gap="xl" mih={120} style={{ pointerEvents: 'none' }}>
              <Dropzone.Accept>
                <IoCloudUploadOutline size={50} color="var(--mantine-primary-color-filled)" />
              </Dropzone.Accept>
              <Dropzone.Reject>
                <IoCloseOutline size={50} color="var(--mantine-color-red-6)" />
              </Dropzone.Reject>
              <Dropzone.Idle>
                <IoDocumentOutline size={50} color="var(--mantine-primary-color-filled)" />
              </Dropzone.Idle>

              <div className="text-center">
                <Text size="lg" inline fw={600}>
                  {t('form.file')}
                </Text>
                <Text size="xs" c="dimmed" inline mt={7}>
                  {t('form.drop_hint')}
                </Text>
              </div>
            </Group>
          </Dropzone>
        )}

        <Stack gap="sm">
          {files.map((fileObj) => (
            <Paper key={fileObj.id} withBorder p="sm" radius="md" className="bg-white/5 border-white/10">
              <Stack gap="xs">
                <Group justify="space-between" align="flex-start" wrap="nowrap">
                  <Box className="flex-1 space-y-3">
                    <TextInput
                        size="xs"
                        placeholder={t('form.name')}
                        label={t('table.name')}
                        withAsterisk
                        required
                        value={fileObj.name}
                        error={!fileObj.name.trim() && common_t('errors.required')}
                        onChange={(e) => update_file_name(fileObj.id, e.currentTarget.value)}
                        variant="filled"
                        styles={{ input: { backgroundColor: 'transparent' } }}
                    />

                    <Group align="flex-end" gap={8} className="w-full" wrap="nowrap">
                        <MultiSelect
                            data={all_categories.map(c => ({ value: c.id, label: c.name }))}
                            value={fileObj.categories}
                            onChange={(val) => update_file_categories(fileObj.id, val)}
                            label={tCat('title')}
                            placeholder={tCat('select_categories')}
                            searchable
                            clearable
                            className="flex-1"
                            size="xs"
                            variant="filled"
                            styles={{ input: { backgroundColor: 'transparent' } }}
                        />
                        <Tooltip label={tCat('add_category')}>
                            <ActionIcon 
                                 variant="light" 
                                 color="primary" 
                                 size={30}
                                 onClick={() => {
                                    setActiveItemId(fileObj.id);
                                    setCategoryDrawerOpened(true);
                                 }}
                            >
                                <IoAddOutline size={16} />
                            </ActionIcon>
                        </Tooltip>
                    </Group>
                  </Box>
                  {!is_loading && (
                    <ActionIcon variant="subtle" color="red" onClick={() => remove_file(fileObj.id)}>
                      <IoTrashOutline size={14} />
                    </ActionIcon>
                  )}
                </Group>

                {fileObj.status === 'uploading' && (
                  <Stack gap={4}>
                    <Group justify="space-between">
                      <Text size="xs" c="dimmed">{t('form.uploading')}</Text>
                      <Text size="xs" fw={500}>{fileObj.progress}%</Text>
                    </Group>
                    <Progress value={fileObj.progress} size="xs" animated color="blue" />
                  </Stack>
                )}

                {fileObj.errorMessage && (
                   <Text size="xs" c="red">{fileObj.errorMessage}</Text>
                )}
              </Stack>
            </Paper>
          ))}
        </Stack>

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" color="gray" onClick={onClose} disabled={is_loading}>
            {common_t('cancel')}
          </Button>
          <Button
            onClick={handle_submit}
            loading={is_loading}
            disabled={is_submit_disabled || files.length === 0}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {common_t('save')}
          </Button>
        </Group>
      </Stack>

      <CreateCategoryDrawer 
        opened={category_drawer_opened} 
        onClose={() => setCategoryDrawerOpened(false)}
        onSubmit={handle_category_create_submit}
        loading={is_cat_pending}
      />
    </Drawer>
  );
}
