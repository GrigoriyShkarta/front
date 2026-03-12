import { Table, Checkbox, Text, Group, Badge, Anchor } from '@mantine/core';
import { useTranslations } from 'next-intl';
import { AudioPlayer } from '@/components/ui/audio-player';

interface Props {
  items: any[];
  type: 'audio' | 'photo' | 'video' | 'file';
  on_toggle_access: (id: string, has_access: boolean) => void;
  is_mutating: boolean;
}

export function StudentMaterialTable({ items, type, on_toggle_access, is_mutating }: Props) {
  const t = useTranslations('Materials');

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
          {items.map((item) => (
            <Table.Tr key={item.id}>
              <Table.Td>
                <Checkbox 
                  checked={item.has_access}
                  onChange={(e) => on_toggle_access(item.id, e.currentTarget.checked)}
                  disabled={is_mutating}
                />
              </Table.Td>
              <Table.Td>
                <Text size="sm" fw={500}>{item.name}</Text>
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
          ))}
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
