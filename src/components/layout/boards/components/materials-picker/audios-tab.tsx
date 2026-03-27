'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

import { 
  Table, 
  Text, 
  Stack, 
  LoadingOverlay,
  Center,
  Badge,
  Group,
  Button,
  ScrollArea
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';

import { audioActions } from '../../../materials/audios/actions/audio-actions';
import { AudioPlayer } from '@/components/ui/audio-player';
import { FiltersBar } from './filters-bar';
import { UploadArea } from './upload-area';
import { PickerItem } from './types';

interface AudiosTabProps {
  categories: { value: string; label: string }[];
  onSelect: (item: PickerItem) => void;
}

/**
 * Tab for selecting and uploading audio. 
 * Shows items in a table with a built-in player.
 */
export function AudiosTab({ categories, onSelect }: AudiosTabProps) {
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
      const res = await audioActions.get_audios({ 
        search: debouncedSearch, 
        category_ids: selectedCats,
        page,
        limit: 10
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
        await audioActions.create_audio({ name, file, categories: selectedCats });
      }
      fetchItems();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack gap="md" mt="md" pos="relative">
      <LoadingOverlay visible={loading} zIndex={100} overlayProps={{ blur: 1 }} />
      
      <UploadArea onUpload={handleUpload} loading={loading} accept={['audio/*']} />
      
      <FiltersBar 
        search={search} onSearchChange={setSearch}
        categories={categories} selectedCategories={selectedCats} onCategoriesChange={setSelectedCats}
        page={page} total={totalPages} onPageChange={setPage}
        loading={loading}
      />

      <ScrollArea mah={400} offsetScrollbars>
        {items.length > 0 ? (
          <Table verticalSpacing="sm" className="bg-white/5 rounded-xl overflow-hidden border border-white/10">
            <Table.Tbody>
              {items.map((item) => (
                <Table.Tr key={item.id} className="hover:bg-white/[0.05] transition-colors border-b border-white/5">
                  <Table.Td>
                    <Stack gap={4}>
                       <Text size="sm" fw={600}>{item.name}</Text>
                       <Group gap={4}>
                         {item.categories?.map(c => (
                            <Badge key={c.id} variant="light" size="xs" color={c.color || 'blue'}>{c.name}</Badge>
                         ))}
                       </Group>
                    </Stack>
                  </Table.Td>
                  <Table.Td w={300}>
                     <AudioPlayer key={item.id} src={item.file_url || ''} />
                  </Table.Td>
                  <Table.Td align="right">
                    <Button 
                        size="xs" 
                        variant="gradient" 
                        gradient={{ from: 'var(--space-primary)', to: 'var(--space-secondary)', deg: 45 }}
                        radius="md"
                        onClick={() => onSelect(item)}
                    >
                      {common_t('add')}
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        ) : !loading && (
          <Center h={200}>
            <Text c="dimmed">{common_t('no_data')}</Text>
          </Center>
        )}
      </ScrollArea>
    </Stack>
  );
}
