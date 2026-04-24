import { Table, Checkbox, Text, Group, Badge, Avatar, UnstyledButton, Box } from '@mantine/core';
import { useTranslations } from 'next-intl';
import { AudioPlayer } from '@/components/ui/audio-player';
import { IoPlayCircleOutline, IoDocumentTextOutline, IoMusicalNotesOutline } from 'react-icons/io5';

interface Props {
  items: any[];
  type: 'audio' | 'photo' | 'video' | 'file' | 'note';
  on_toggle_access: (id: string, has_access: boolean) => void;
  on_item_click?: (item: any) => void;
  is_mutating: boolean;
}

export function StudentMaterialTable({ items, type, on_toggle_access, on_item_click, is_mutating }: Props) {
  const t = useTranslations('Materials');

  const get_youtube_id = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const get_thumbnail = (item: any) => {
    if (type === 'video') {
       const url = item.youtube_url || (!item.file_key ? item.file_url : null);
       if (url) {
         const id = get_youtube_id(url);
         return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null;
       }
       return item.thumbnail_url || null;
    }
    if (type === 'photo') {
        return item.file_url;
    }
    return null;
  };

  return (
    <Table.ScrollContainer minWidth={500}>
      <Table verticalSpacing="sm">
        <Table.Thead>
          <Table.Tr>
            <Table.Th w={40}>{t('additional.access') || 'Access'}</Table.Th>
            <Table.Th>{t(`${type}.table.name`) || 'Name'}</Table.Th>
            {type === 'audio' && <Table.Th w={300}>{t('audio.table.file') || 'File'}</Table.Th>}
            <Table.Th>{t('additional.categories') || 'Categories'}</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {items.map((item) => {
            const thumbnail = get_thumbnail(item);
            
            return (
              <Table.Tr key={item.id}>
                <Table.Td>
                  <Checkbox 
                    checked={item.has_access}
                    onChange={(e) => on_toggle_access(item.id, e.currentTarget.checked)}
                    disabled={is_mutating}
                  />
                </Table.Td>
                <Table.Td>
                  <Group gap="sm" wrap="nowrap">
                    {(type === 'photo' || type === 'video' || type === 'audio' || type === 'note') && (
                      <UnstyledButton onClick={() => on_item_click?.(item)}>
                        <Box pos="relative" w={40} h={40}>
                           {(type === 'photo' || type === 'video') && (
                             <Avatar 
                              src={thumbnail} 
                              radius="md" 
                              size={40}
                              styles={{
                                root: { border: '1px solid rgba(255,255,255,0.1)' }
                              }}
                            />
                           )}
                           {type === 'audio' && (
                             <Box 
                               pos="absolute" 
                               inset={0} 
                               style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--mantine-color-gray-light)', borderRadius: 'var(--mantine-radius-md)' }}
                             >
                               <IoMusicalNotesOutline size={20} />
                             </Box>
                           )}
                           {type === 'note' && (
                             <Box 
                               pos="absolute" 
                               inset={0} 
                               style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--mantine-color-gray-light)', borderRadius: 'var(--mantine-radius-md)' }}
                             >
                               <IoDocumentTextOutline size={20} />
                             </Box>
                           )}
                           {type === 'video' && thumbnail && (
                            <Box 
                              pos="absolute" 
                              inset={0} 
                              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 'var(--mantine-radius-md)' }}
                            >
                              <IoPlayCircleOutline size={20} color="white" />
                            </Box>
                          )}
                        </Box>
                      </UnstyledButton>
                    )}
                    <UnstyledButton onClick={() => on_item_click?.(item)}>
                      <Text size="sm" fw={500} className="hover:underline">{item.title || item.name}</Text>
                    </UnstyledButton>
                  </Group>
                </Table.Td>
                {type === 'audio' && (
                  <Table.Td>
                      <AudioPlayer src={item.file_url} />
                  </Table.Td>
                )}
                <Table.Td>
                  <Group gap={4}>
                    {item.categories?.map((cat: any) => (
                      <Badge 
                        key={cat.id} 
                        variant="light" 
                        size="xs" 
                        color={cat.color || 'primary'}
                      >
                        {cat.name}
                      </Badge>
                    ))}
                    {(!item.categories || item.categories.length === 0) && (
                      <Text size="xs" c="dimmed">-</Text>
                    )}
                  </Group>
                </Table.Td>
              </Table.Tr>
            );
          })}
          {items.length === 0 && (
            <Table.Tr>
              <Table.Td colSpan={type === 'audio' ? 4 : 3}>
                <Text ta="center" py="xl" c="dimmed">
                  {t(`${type}.empty_title`) || 'No materials found'}
                </Text>
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
