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
  Group
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';

import { photoActions } from '../../../materials/photos/actions/photo-actions';
import { FiltersBar } from './filters-bar';
import { UploadArea } from './upload-area';
import { PickerItem } from './types';

interface PhotosTabProps {
  categories: { value: string; label: string }[];
  onSelect: (item: PickerItem) => void;
}

/**
 * Gallery-style tab for selecting and uploading photos.
 */
export function PhotosTab({ categories, onSelect }: PhotosTabProps) {
  const t = useTranslations('Materials');
  const common_t = useTranslations('Common');

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<PickerItem[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebouncedValue(search, 300);
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await photoActions.get_photos({ 
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
        await photoActions.create_photo({ name, file, categories: selectedCats });
      }
      fetchItems();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack gap="md" mt="md" pos="relative">
      <LoadingOverlay visible={loading} zIndex={100} overlayProps={{ blur: 1 }} />
      
      <UploadArea onUpload={handleUpload} loading={loading} accept={['image/*']} />
      
      <FiltersBar 
        search={search} onSearchChange={setSearch}
        categories={categories} selectedCategories={selectedCats} onCategoriesChange={setSelectedCats}
        page={page} total={totalPages} onPageChange={setPage}
        loading={loading}
      />

      {items.length > 0 ? (
        <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="sm">
          {items.map((item) => (
            <UnstyledButton key={item.id} onClick={() => onSelect(item)}>
              <Paper 
                withBorder radius="lg"
                className="overflow-hidden bg-white/5 border-white/10 hover:border-[var(--space-primary)] hover:bg-white/[0.08] transition-all group"
              >
                <Box className="aspect-square relative overflow-hidden">
                  <Image 
                    src={item.file_url || undefined} 
                    h="100%" w="100%" 
                    fit="cover"
                    className="group-hover:scale-105 transition-transform"
                    fallbackSrc="https://placehold.co/400x400?text=No+Image"
                  />
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
          ))}
        </SimpleGrid>
      ) : !loading && (
        <Center h={200}>
          <Text c="dimmed">{common_t('no_data')}</Text>
        </Center>
      )}
    </Stack>
  );
}
