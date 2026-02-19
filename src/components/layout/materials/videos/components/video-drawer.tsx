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
  Tabs,
  AspectRatio,
  MultiSelect,
  Tooltip,
  rem
} from '@mantine/core';
import { IoCloudUploadOutline, IoVideocamOutline, IoCloseOutline, IoTrashOutline, IoLogoYoutube, IoLinkOutline, IoAddOutline } from 'react-icons/io5';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Dropzone, FileWithPath } from '@mantine/dropzone';
import { VideoMaterial } from '../schemas/video-schema';
import { useCategories } from '@/components/layout/categories/hooks/use-categories';
import { CategoryDrawer as CreateCategoryDrawer } from '@/components/layout/categories/components/category-drawer';
import { CreateCategoryForm } from '@/components/layout/categories/schemas/category-schema';

interface FileWithMetadata {
  file?: FileWithPath;
  youtube_url?: string;
  id: string;
  name: string;
  progress: number;
  status: 'idle' | 'uploading' | 'success' | 'error';
  errorMessage?: string;
  type: 'file' | 'url';
  categories: string[];
}

interface Props {
  opened: boolean;
  onClose: () => void;
  video?: VideoMaterial | null;
  initial_files?: FileWithMetadata[];
  on_submit: (
    items: FileWithMetadata[], 
    update_item: (id: string, update: Partial<FileWithMetadata>) => void
  ) => Promise<void>;
  is_loading: boolean;
}

export function VideoDrawer({ opened, onClose, video, initial_files, on_submit, is_loading }: Props) {
  const t = useTranslations('Materials.video');
  const common_t = useTranslations('Common');
  const tCat = useTranslations('Categories');

  const [items, setItems] = useState<FileWithMetadata[]>([]);
  const [active_tab, setActiveTab] = useState<string | null>('file');

  const { categories: all_categories, create_category, create_categories, is_pending: is_cat_pending } = useCategories();
  const [category_drawer_opened, setCategoryDrawerOpened] = useState(false);
  const [active_item_id, setActiveItemId] = useState<string | null>(null);

  const update_item_internal = (id: string, update: Partial<FileWithMetadata>) => {
    setItems(prev => prev.map(f => f.id === id ? { ...f, ...update } : f));
  };

  useEffect(() => {
    if (!opened) {
      setItems([]);
      setActiveTab('file');
    } else if (video) {
        setItems([{
            id: video.id,
            name: video.name,
            youtube_url: video.youtube_url || undefined,
            progress: 0,
            status: 'idle',
            type: video.youtube_url ? 'url' : 'file',
            categories: video.categories?.map(c => c.id) || []
        }]);
        setActiveTab(video.youtube_url ? 'url' : 'file');
    } else if (initial_files && initial_files.length > 0) {
      setItems(initial_files);
    }
  }, [opened, video, initial_files]);

  const handle_drop = (dropped_files: FileWithPath[]) => {
    const new_items: FileWithMetadata[] = dropped_files.map(f => ({
      file: f,
      id: Math.random().toString(36).substring(7),
      name: f.name.replace(/\.[^/.]+$/, ""),
      progress: 0,
      status: 'idle',
      type: 'file',
      categories: []
    }));
    setItems(prev => [...prev.slice(0, 10 - new_items.length), ...new_items].slice(0, 10));
  };

  const add_url_item = () => {
    const new_item: FileWithMetadata = {
        id: Math.random().toString(36).substring(7),
        name: '',
        youtube_url: '',
        progress: 0,
        status: 'idle',
        type: 'url',
        categories: []
    };
    setItems(prev => [...prev.slice(0, 9), new_item]);
  };

  const remove_item = (id: string) => {
    setItems(prev => prev.filter(f => f.id !== id));
  };

  const get_youtube_id = (url: string) => {
      if (!url) return null;
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? match[2] : null;
  };

  const validate_youtube_url = (url: string) => {
      if (!url) return false;
      return !!get_youtube_id(url);
  };

  const fetch_youtube_title = async (url: string) => {
    try {
      const response = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
      if (!response.ok) return '';
      const text = await response.text();
      try {
        const data = JSON.parse(text);
        return data.title || '';
      } catch {
        return '';
      }
    } catch (error) {
      console.error('Failed to fetch YouTube title:', error);
      return '';
    }
  };

  const handle_url_change = async (id: string, url: string) => {
    update_item_internal(id, { youtube_url: url });
    
    if (url && validate_youtube_url(url)) {
      const title = await fetch_youtube_title(url);
      if (title) {
        update_item_internal(id, { name: title });
      }
    }
  };

  const update_item_categories = (id: string, categories: string[]) => {
    update_item_internal(id, { categories });
  };

  const handle_submit = async () => {
    await on_submit(items, update_item_internal);
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
        const current = items.find(f => f.id === active_item_id)?.categories || [];
        update_item_categories(active_item_id, [...current, ...new_ids]);
    }
    
    setCategoryDrawerOpened(false);
    setActiveItemId(null);
  };

  const has_errors = items.some(f => {
      if (!f.name.trim()) return true;
      if (f.type === 'url' && (!f.youtube_url || !validate_youtube_url(f.youtube_url))) return true;
      return false;
  });

  const is_submit_disabled = items.length === 0 || has_errors || is_loading;

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={video ? t('edit_video') : t('add_video')}
      position="right"
      size="md"
      classNames={{
        header: 'px-6 py-4',
        content: 'bg-[var(--mantine-color-body)] transition-colors duration-300',
        body: 'p-6'
      }}
    >
      <Stack gap="xl">
        {!video && (
          <Tabs value={active_tab} onChange={setActiveTab} variant="pills" radius="xl">
            <Tabs.List className="border border-white/10 p-1 rounded-full w-fit mx-auto">
              <Tabs.Tab value="file" leftSection={<IoCloudUploadOutline size={14} />}>
                {t('tabs.file')}
              </Tabs.Tab>
              <Tabs.Tab value="url" leftSection={<IoLogoYoutube size={14} />}>
                {t('tabs.url')}
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="file" pt="md">
              {active_tab === 'file' && (
                <Dropzone
                  onDrop={handle_drop}
                  maxSize={500 * 1024 ** 2} // 500MB for video
                  accept={['video/mp4', 'video/webm', 'video/ogg']}
                  maxFiles={10 - items.length}
                  className="border-2 border-dashed border-white/10 hover:border-blue-500/50 bg-white/5 transition-colors rounded-xl"
                >
                  <Group justify="center" gap="xl" mih={120} style={{ pointerEvents: 'none' }}>
                    <IoVideocamOutline size={50} color="var(--mantine-primary-color-filled)" />
                    <div className="text-center">
                      <Text size="lg" inline fw={600}>{t('form.file')}</Text>
                      <Text size="xs" c="dimmed" inline mt={7}>{t('form.drop_hint')}</Text>
                    </div>
                  </Group>
                </Dropzone>
              )}
            </Tabs.Panel>

            <Tabs.Panel value="url" pt="md">
              {active_tab === 'url' && (
                <Button 
                    fullWidth 
                    variant="outline" 
                    leftSection={<IoLogoYoutube size={18} />} 
                    onClick={add_url_item}
                    disabled={items.length >= 10}
                    radius="md"
                    size="md"
                >
                    {t('form.add_youtube')}
                </Button>
              )}
            </Tabs.Panel>
          </Tabs>
        )}

        <Stack gap="sm">
          {items.map((item) => {
            const youtube_id = item.youtube_url ? get_youtube_id(item.youtube_url) : null;
            
            return (
              <Paper key={item.id} withBorder p="sm" radius="md" className="bg-white/5 border-white/10">
                <Stack gap="sm">
                  <Group justify="space-between" align="flex-start" wrap="nowrap">
                    <Box className="flex-1 space-y-3">
                      <TextInput
                        size="xs"
                        label={t('table.name')}
                        placeholder={t('form.name_placeholder')}
                        withAsterisk
                        value={item.name}
                        error={!item.name.trim() && common_t('errors.required')}
                        onChange={(e) => update_item_internal(item.id, { name: e.currentTarget.value })}
                        variant="filled"
                        styles={{ input: { backgroundColor: 'transparent' } }}
                      />

                      {item.type === 'url' && (
                        <Stack gap="xs">
                          <TextInput
                            size="xs"
                            label="YouTube URL"
                            placeholder="https://www.youtube.com/watch?v=..."
                            leftSection={<IoLinkOutline size={14} />}
                            withAsterisk
                            value={item.youtube_url}
                            error={!item.youtube_url ? common_t('errors.required') : (!validate_youtube_url(item.youtube_url) && t('errors.invalid_youtube'))}
                            onChange={(e) => handle_url_change(item.id, e.currentTarget.value)}
                            variant="filled"
                            styles={{ input: { backgroundColor: 'transparent' } }}
                          />
                          
                          {youtube_id && (
                            <Box pos="relative" className="rounded-lg overflow-hidden border border-white/10 bg-black/20 shadow-lg">
                              <AspectRatio ratio={16 / 9}>
                                <iframe
                                  src={`https://www.youtube.com/embed/${youtube_id}`}
                                  title="YouTube video player"
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                  allowFullScreen
                                  style={{ border: 0 }}
                                />
                              </AspectRatio>
                            </Box>
                          )}
                        </Stack>
                      )}

                      {item.type === 'file' && (
                          <Text size="xs" c="dimmed" className="truncate">
                             {item.file?.name}
                          </Text>
                      )}

                      <Group align="flex-end" gap={8} className="w-full" wrap="nowrap">
                        <MultiSelect
                            data={all_categories.map(c => ({ value: c.id, label: c.name }))}
                            value={item.categories}
                            onChange={(val) => update_item_categories(item.id, val)}
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
                                    setActiveItemId(item.id);
                                    setCategoryDrawerOpened(true);
                                 }}
                            >
                                <IoAddOutline size={16} />
                            </ActionIcon>
                        </Tooltip>
                     </Group>
                    </Box>
                    
                    {!is_loading && (
                      <ActionIcon variant="subtle" color="red" onClick={() => remove_item(item.id)}>
                        <IoTrashOutline size={14} />
                      </ActionIcon>
                    )}
                  </Group>
                
                {item.status === 'uploading' && (
                  <Stack gap={4}>
                    <Group justify="space-between">
                      <Text size="xs" c="dimmed">{t('form.uploading')}</Text>
                      <Text size="xs" fw={500}>{item.progress}%</Text>
                    </Group>
                    <Progress value={item.progress} size="xs" animated color="blue" />
                  </Stack>
                )}

                {item.errorMessage && (
                   <Text size="xs" c="red">{item.errorMessage}</Text>
                )}
              </Stack>
            </Paper>
          );
        })}
      </Stack>

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" color="gray" onClick={onClose} disabled={is_loading}>
            {common_t('cancel')}
          </Button>
          <Button
            onClick={handle_submit}
            loading={is_loading}
            disabled={is_submit_disabled}
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
