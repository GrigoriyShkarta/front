'use client';

import { Table, Checkbox, ActionIcon, Group, Text, Box, Menu, rem, Tooltip, Badge, Image, useMantineTheme } from '@mantine/core';
import { IoEllipsisVertical, IoTrashOutline, IoPencilOutline, IoVideocamOutline, IoLogoYoutube, IoPlayOutline } from 'react-icons/io5';
import { VideoMaterial } from '../schemas/video-schema';
import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';
import { cn } from '@/lib/utils';

interface Props {
  data: VideoMaterial[];
  selected_ids: string[];
  on_selection_change: (ids: string[]) => void;
  on_edit: (video: VideoMaterial) => void;
  on_delete: (id: string) => void;
  on_play: (video: VideoMaterial) => void;
  on_select?: (video: VideoMaterial) => void;
  is_loading?: boolean;
  is_picker?: boolean;
}

export function VideoTable({ 
    data, 
    selected_ids, 
    on_selection_change, 
    on_edit, 
    on_delete, 
    on_play, 
    on_select, 
    is_loading,
    is_picker = false
}: Props) {
  const t = useTranslations('Materials.video.table');
  const common_t = useTranslations('Common');
  const tCat = useTranslations('Categories');

  const toggle_all = () => {
    on_selection_change(
      selected_ids.length === data.length ? [] : data.map((item) => item.id)
    );
  };

  const toggle_one = (id: string) => {
    on_selection_change(
      selected_ids.includes(id)
        ? selected_ids.filter((i) => i !== id)
        : [...selected_ids, id]
    );
  };

  const theme = useMantineTheme();

  const get_youtube_id = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  return (
    <Table.ScrollContainer minWidth={800}>
      <Table verticalSpacing="sm" highlightOnHover>
        <Table.Thead className="bg-white/5 border-b border-white/10">
          <Table.Tr>
            <Table.Th w={40}>
              {!is_picker && (
                <Checkbox
                  checked={data.length > 0 && selected_ids.length === data.length}
                  indeterminate={selected_ids.length > 0 && selected_ids.length < data.length}
                  onChange={toggle_all}
                />
              )}
            </Table.Th>
            {!is_picker && <Table.Th w={40}>{t('actions')}</Table.Th>}
            <Table.Th>{t('name')}</Table.Th>
            <Table.Th>{tCat('title')}</Table.Th>
            <Table.Th>{t('type')}</Table.Th>
            <Table.Th>{t('date')}</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {data.map((item) => {
            const is_selected = selected_ids.includes(item.id);
            const is_youtube = !!item.youtube_url || (!item.file_key && !!item.file_url);
            const youtube_target_url = item.youtube_url || (!item.file_key ? item.file_url : null);
            const youtube_id = youtube_target_url ? get_youtube_id(youtube_target_url) : null;

            return (
              <Table.Tr 
                key={item.id} 
                className={cn(
                  'transition-colors border-b border-white/5 last:border-0',
                  is_selected ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'hover:bg-white/5'
                )}
              >
                <Table.Td>
                  <Checkbox
                    checked={is_selected}
                    onChange={() => {
                      if (is_picker && on_select) {
                        on_select(item);
                      } else {
                        toggle_one(item.id);
                      }
                    }}
                  />
                </Table.Td>
                {!is_picker && (
                  <Table.Td>
                    <Menu shadow="md" width={160} position="left-start" withArrow>
                      <Menu.Target>
                        <ActionIcon variant="subtle" color="gray">
                          <IoEllipsisVertical size={16} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown className="bg-[var(--space-card-bg)] border-white/10 backdrop-blur-md">
                        {on_select && (
                          <Menu.Item 
                            leftSection={<IoVideocamOutline style={{ width: rem(14), height: rem(14) }} />}
                            onClick={() => on_select(item)}
                            color="blue"
                          >
                            {common_t('confirm')}
                          </Menu.Item>
                        )}
                        <Menu.Item 
                          leftSection={<IoPencilOutline style={{ width: rem(14), height: rem(14) }} />}
                          onClick={() => on_edit(item)}
                        >
                          {common_t('edit')}
                        </Menu.Item>
                        <Menu.Item 
                          color="red"
                          leftSection={<IoTrashOutline style={{ width: rem(14), height: rem(14) }} />}
                          onClick={() => on_delete(item.id)}
                        >
                          {common_t('delete')}
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Table.Td>
                )}
                <Table.Td>
                  <Group gap="sm" wrap="nowrap">
                    <Box 
                      className="w-10 h-7 rounded overflow-hidden flex-shrink-0 flex items-center justify-center shadow-sm cursor-pointer hover:opacity-80 transition-opacity group relative bg-black"
                      onClick={() => on_play(item)}
                    >
                      {is_youtube && youtube_id ? (
                        <Image 
                          src={`https://img.youtube.com/vi/${youtube_id}/mqdefault.jpg`} 
                          alt="" 
                          fit="cover"
                        />
                      ) : (
                        item.thumbnail_url ? (
                          <Image src={item.thumbnail_url} alt="" fit="cover" />
                        ) : item.file_url ? (
                          <video
                            key={item.file_url}
                            src={`${item.file_url}#t=0.5`}
                            className="w-full h-full object-cover"
                            preload="metadata"
                            muted
                            playsInline
                          />
                        ) : (
                          <Box 
                            className="w-full h-full flex items-center justify-center shadow-inner"
                            style={{ backgroundColor: `var(--mantine-color-${theme.primaryColor}-light)` }}
                          >
                            <IoVideocamOutline size={14} style={{ color: `var(--mantine-color-${theme.primaryColor}-filled)` }} />
                          </Box>
                        )
                      )}
                      <Box className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <IoPlayOutline size={14} color="white" />
                      </Box>
                    </Box>
                    <Tooltip label={item.name} position="top-start" withArrow multiline maw={300}>
                      <Text 
                        size="sm" 
                        fw={500} 
                        className="truncate max-w-[500px] cursor-pointer hover:text-blue-500 transition-colors"
                        onClick={() => on_play(item)}
                      >
                        {item.name}
                      </Text>
                    </Tooltip>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Group gap={4}>
                    {item.categories?.map((cat) => (
                      <Badge key={cat.id} color={cat.color || 'blue'} variant="light" size="xs">
                        {cat.name}
                      </Badge>
                    ))}
                  </Group>
                </Table.Td>
                <Table.Td>
                  {is_youtube ? (
                    <Badge 
                      variant="filled" 
                      color="red" 
                      size="sm"
                      leftSection={<IoLogoYoutube size={10} />}
                    >
                      YouTube
                    </Badge>
                  ) : (
                    <Badge 
                      variant="filled" 
                      color={theme.primaryColor} 
                      size="sm"
                      leftSection={<IoVideocamOutline size={10} />}
                    >
                      FILE
                    </Badge>
                  )}
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="dimmed">
                    {dayjs(item.created_at).format('DD.MM.YYYY')}
                  </Text>
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
