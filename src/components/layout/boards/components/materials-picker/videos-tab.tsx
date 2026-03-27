'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

import { 
  SimpleGrid, 
  Paper, 
  Image, 
  Text, 
  Box, 
  UnstyledButton, 
  Stack, 
  LoadingOverlay,
  Center,
  Badge,
  Group,
  TextInput,
  ActionIcon
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IoVideocamOutline, IoLogoYoutube } from 'react-icons/io5';

import { videoActions } from '../../../materials/videos/actions/video-actions';
import { FiltersBar } from './filters-bar';
import { UploadArea } from './upload-area';
import { PickerItem } from './types';

interface VideosTabProps {
  categories: { value: string; label: string }[];
  onSelect: (item: PickerItem) => void;
}

/**
 * Gallery-style tab for selecting and uploading videos (files or YouTube links).
 */
export function VideosTab({ categories, onSelect }: VideosTabProps) {
  const t = useTranslations('Materials');
  const common_t = useTranslations('Common');

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<PickerItem[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebouncedValue(search, 300);
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [ytUrl, setYtUrl] = useState('');
  const [ytName, setYtName] = useState('');

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await videoActions.get_videos({ 
        search: debouncedSearch, 
        category_ids: selectedCats,
        page,
        limit: 12
      });
      setItems(res.data as any);
      setTotalPages(res.meta?.total_pages || 1);
    } catch (e) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, [debouncedSearch, selectedCats, page]);

  const handleUpload = async (files: any[], name: string) => {
    setLoading(true);
    try {
      for (const file of files) {
        await videoActions.create_video({ name, file, categories: selectedCats });
      }
      fetchItems();
    } finally {
      setLoading(false);
    }
  };

  const handleYoutubeAdd = async () => {
    if (!ytUrl.trim()) return;
    setLoading(true);
    try {
      await videoActions.create_video({ 
        name: ytName || 'YouTube Video',
        youtube_url: ytUrl, 
        categories: selectedCats 
      });
      setYtUrl('');
      setYtName('');
      fetchItems();
    } finally {
      setLoading(false);
    }
  };

  const getThumbnail = (item: PickerItem) => {
    if (item.thumbnail_url) return item.thumbnail_url;
    const url = item.youtube_url || item.file_url;
    if (!url) return null;

    const yt_match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
    if (yt_match) {
      return `https://i.ytimg.com/vi/${yt_match[1]}/mqdefault.jpg`;
    }
    return null;
  };

  return (
    <Stack gap="md" mt="md" pos="relative">
      <LoadingOverlay visible={loading} zIndex={100} overlayProps={{ blur: 1 }} />
      
      <Group gap="sm" align="stretch" mb="lg">
        <Box className="flex-1">
          <UploadArea onUpload={handleUpload} loading={loading} accept={['video/*']} />
        </Box>
        <Paper withBorder p="10px" radius="md" className="bg-white/5 border-white/10 flex-1 flex flex-col justify-center">
          <Stack gap="sm">
            <Group gap="xs" align="center">
               <IoLogoYoutube size={24} color="#FF0000" />
               <Text size="sm" fw={600}>{t('video.form.youtube_url') || 'YouTube Link'}</Text>
            </Group>
             <TextInput 
              placeholder={t('video.form.name') || 'Display Name'} 
              value={ytName}
              onChange={(e) => setYtName(e.currentTarget.value)}
              size="xs" radius="md"
              disabled={loading}
            />
            <Group gap="xs">
              <TextInput 
                placeholder="https://youtube.com/..." 
                size="xs" 
                className="flex-1"
                value={ytUrl}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setYtUrl(e.currentTarget.value)}
                radius="md"
                disabled={loading}
              />
              <ActionIcon 
                variant="light" 
                color="primary" 
                size="lg" 
                radius="md"
                disabled={loading}
                onClick={handleYoutubeAdd}
              >
                <IoLogoYoutube size={18} />
              </ActionIcon>
            </Group>
          </Stack>
        </Paper>
      </Group>
      
      <FiltersBar 
        search={search} onSearchChange={setSearch}
        categories={categories} selectedCategories={selectedCats} onCategoriesChange={setSelectedCats}
        page={page} total={totalPages} onPageChange={setPage}
        loading={loading}
      />

      {items.length > 0 ? (
        <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="sm">
          {items.map((item) => {
            const thumb = getThumbnail(item);
            return (
              <UnstyledButton key={item.id} onClick={() => onSelect(item)}>
                <Paper 
                  withBorder radius="lg" className="overflow-hidden bg-white/5 border-white/10 hover:border-[var(--space-primary)] hover:bg-white/[0.08] transition-all group"
                >
                  <Box className="aspect-video relative bg-black/40 overflow-hidden">
                    {thumb ? (
                      <Image 
                        src={thumb} 
                        h="100%" w="100%" 
                        fit="cover" 
                        className="group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <Center h="100%">
                         <IoVideocamOutline size={40} className="opacity-20" />
                      </Center>
                    )}
                    
                    <Box className="absolute top-2 right-2 z-10">
                       {item.youtube_url ? <IoLogoYoutube color="#FF0000" size={20} /> : <IoVideocamOutline size={18} className="opacity-50" />}
                    </Box>

                    {item.categories && item.categories.length > 0 && (
                      <Group gap={4} className="absolute bottom-2 left-2 z-10">
                        {item.categories.slice(0, 1).map(c => (
                          <Badge key={c.id} size="xs" variant="filled" color={c.color || 'blue'}>
                            {c.name}
                          </Badge>
                        ))}
                      </Group>
                    )}
                  </Box>
                  <Box p={8}>
                    <Text size="xs" fw={600} lineClamp={1} ta="center" className="opacity-80">
                      {item.name}
                    </Text>
                  </Box>
                </Paper>
              </UnstyledButton>
            );
          })}
        </SimpleGrid>
      ) : !loading && (
        <Center h={200}>
          <Text c="dimmed">{common_t('no_data')}</Text>
        </Center>
      )}
    </Stack>
  );
}
