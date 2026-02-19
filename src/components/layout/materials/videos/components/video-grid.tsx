'use client';

import { SimpleGrid, Card, Image, Text, Group, Checkbox, ActionIcon, Menu, rem, Box, Badge, useMantineTheme } from '@mantine/core';
import { IoEllipsisVertical, IoTrashOutline, IoPencilOutline, IoPlayOutline, IoLogoYoutube, IoVideocamOutline } from 'react-icons/io5';
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
  is_loading?: boolean;
}

export function VideoGrid({ data, selected_ids, on_selection_change, on_edit, on_delete, on_play, is_loading }: Props) {
  const common_t = useTranslations('Common');

  const get_youtube_id = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const get_thumbnail = (item: VideoMaterial) => {
    // If it's a YouTube video (has youtube_url OR has file_url but no file_key)
    const url = item.youtube_url || (!item.file_key ? item.file_url : null);
    
    if (url) {
      const id = get_youtube_id(url);
      return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null;
    }
    return item.thumbnail_url || null;
  };

  const toggle_one = (id: string) => {
    on_selection_change(
      selected_ids.includes(id)
        ? selected_ids.filter((i) => i !== id)
        : [...selected_ids, id]
    );
  };

  const theme = useMantineTheme();

  return (
    <SimpleGrid cols={{ base: 1, xs: 2, sm: 3, md: 4, lg: 5 }} spacing="lg">
      {data.map((item) => {
        const is_selected = selected_ids.includes(item.id);
        const is_youtube = !!item.youtube_url || (!item.file_key && !!item.file_url);
        const thumbnail = get_thumbnail(item);

        return (
          <Card
            key={item.id}
            padding="xs"
            radius="md"
            withBorder
            className={cn(
              'group transition-all duration-300 hover:shadow-md h-full cursor-pointer',
              is_selected ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50/5 dark:bg-blue-900/10' : 'bg-white/5 border-white/10'
            )}
            onClick={() => on_play(item)}
          >
            <Card.Section className="relative overflow-hidden aspect-video flex items-center justify-center bg-black">
              {is_youtube ? (
                thumbnail ? (
                  <Image
                    src={thumbnail}
                    alt={item.name}
                    className="transition-transform duration-500 group-hover:scale-105"
                    fit="cover"
                    h="100%"
                  />
                ) : (
                  <Box className="w-full h-full flex items-center justify-center bg-white/5">
                    <IoLogoYoutube size={40} className="text-white/20" />
                  </Box>
                )
              ) : (
                item.thumbnail_url ? (
                  <Image
                    src={item.thumbnail_url}
                    alt={item.name}
                    className="transition-transform duration-500 group-hover:scale-105"
                    fit="cover"
                    h="100%"
                  />
                ) : item.file_url ? (
                  <video
                    key={item.file_url}
                    src={`${item.file_url}#t=0.5`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    preload="metadata"
                    muted
                    playsInline
                  />
                ) : (
                  <Box className="w-full h-full flex items-center justify-center bg-white/5">
                    <IoVideocamOutline size={40} className="text-white/20" />
                  </Box>
                )
              )}
              
              {/* Overlay / Play Button Decoration */}
              <Box className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                 <Box className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white scale-0 group-hover:scale-100 transition-transform duration-300">
                    <IoPlayOutline size={24} />
                 </Box>
              </Box>

              <Badge 
                variant="filled" 
                color={is_youtube ? 'red' : theme.primaryColor} 
                size="xs" 
                className="absolute bottom-2 right-2 backdrop-blur-md opacity-90 shadow-sm"
                leftSection={is_youtube ? <IoLogoYoutube size={10} /> : <IoVideocamOutline size={10} />}
              >
                {is_youtube ? 'YouTube' : 'FILE'}
              </Badge>
              
              <div 
                className={cn(
                  "absolute top-2 left-2 transition-opacity duration-200",
                  is_selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}
                onClick={(e) => e.stopPropagation()}
              >
                <Checkbox
                  checked={is_selected}
                  onChange={() => toggle_one(item.id)}
                />
              </div>

              <div 
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                <Menu shadow="md" width={160} position="bottom-end" withArrow>
                  <Menu.Target>
                    <ActionIcon variant="filled" color="dark" size="md" className="backdrop-blur-md bg-black/40 hover:bg-black/60 border border-white/10">
                      <IoEllipsisVertical size={16} />
                    </ActionIcon>
                  </Menu.Target>

                  <Menu.Dropdown className="bg-[var(--space-card-bg)] border-white/10 backdrop-blur-md">
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
              </div>
            </Card.Section>

            <Box pt="xs" px="xs">
              <Text fw={600} size="sm" className="truncate" title={item.name}>
                {item.name}
              </Text>
              <Text size="xs" c="dimmed" mt={2}>
                {dayjs(item.created_at).format('DD.MM.YYYY')}
              </Text>
              {item.categories && item.categories.length > 0 && (
                  <Group gap={4} mt={6} className="flex-wrap">
                    {item.categories.slice(0, 3).map((cat) => (
                      <Badge key={cat.id} color={cat.color || 'blue'} variant="light" size="xs" radius="sm" className="max-w-[100px] truncate">
                        {cat.name}
                      </Badge>
                    ))}
                    {item.categories.length > 3 && (
                      <Text size="xs" c="dimmed" lh={1}>+{item.categories.length - 3}</Text>
                    )}
                  </Group>
              )}
            </Box>
          </Card>
        );
      })}
    </SimpleGrid>
  );
}
