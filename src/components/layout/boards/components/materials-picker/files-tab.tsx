'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

import { 
  Table, 
  Text, 
  Box, 
  UnstyledButton, 
  Stack, 
  LoadingOverlay,
  Center,
  Badge,
  Group,
  Button,
  ScrollArea
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { 
  IoFileTrayFullOutline, 
  IoDocumentTextOutline, 
  IoArchiveOutline, 
  IoReaderOutline,
  IoCodeWorkingOutline
} from 'react-icons/io5';

import { fileActions } from '../../../materials/files/actions/file-actions';
import { FiltersBar } from './filters-bar';
import { UploadArea } from './upload-area';
import { PickerItem } from './types';

interface FilesTabProps {
  categories: { value: string; label: string }[];
  onSelect: (item: PickerItem) => void;
}

/**
 * Tab for selecting and uploading generic files.
 * Highlights file name and extension.
 */
export function FilesTab({ categories, onSelect }: FilesTabProps) {
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
      const res = await fileActions.get_files({ 
        search: debouncedSearch, 
        category_ids: selectedCats,
        page,
        limit: 15
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
        await fileActions.create_file({ name, file, categories: selectedCats });
      }
      fetchItems();
    } finally {
      setLoading(false);
    }
  };

  const getExtensionIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase() || '';
    if (['pdf', 'doc', 'docx'].includes(ext)) return <IoReaderOutline size={20} className="text-red-400" />;
    if (['zip', 'rar', '7z'].includes(ext)) return <IoArchiveOutline size={20} className="text-yellow-400" />;
    if (['txt', 'md'].includes(ext)) return <IoDocumentTextOutline size={20} className="text-gray-400" />;
    if (['json', 'js', 'ts', 'html', 'css'].includes(ext)) return <IoCodeWorkingOutline size={20} className="text-blue-400" />;
    return <IoFileTrayFullOutline size={20} className="text-blue-400" />;
  };

  return (
    <Stack gap="md" mt="md" pos="relative">
      <LoadingOverlay visible={loading} zIndex={100} overlayProps={{ blur: 1 }} />
      
      <UploadArea onUpload={handleUpload} loading={loading} />
      
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
              {items.map((item) => {
                const ext = item.name.split('.').pop()?.toUpperCase() || 'FILE';
                return (
                  <Table.Tr key={item.id} className="hover:bg-white/[0.05] transition-colors border-b border-white/5">
                    <Table.Td>
                      <Group gap="sm" wrap="nowrap">
                        {getExtensionIcon(item.name)}
                        <Stack gap={0} className="flex-1 overflow-hidden">
                          <Text 
                            size="sm" 
                            fw={600} 
                            lineClamp={1}
                            variant="gradient"
                            gradient={{ from: 'white', to: 'white', deg: 0 }}
                           >
                            {item.name}
                          </Text>
                          <Group gap={4}>
                            <Badge size="xs" variant="outline" color="gray">{ext}</Badge>
                            {item.categories?.map(c => (
                               <Badge key={c.id} variant="light" size="xs" color={c.color || 'blue'}>{c.name}</Badge>
                            ))}
                          </Group>
                        </Stack>
                      </Group>
                    </Table.Td>
                    <Table.Td align="right">
                       <Button 
                          onClick={() => onSelect(item)} 
                          size="xs" 
                          variant="light" 
                          radius="md" 
                          color="primary"
                        >
                         {common_t('add')}
                       </Button>
                    </Table.Td>
                  </Table.Tr>
                );
              })}
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
