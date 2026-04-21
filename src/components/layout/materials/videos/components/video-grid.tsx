'use client';

import { SimpleGrid, Card, Image, Text, Group, Checkbox, ActionIcon, Menu, rem, Box, Tooltip, Badge, useMantineTheme } from '@mantine/core';
import { IoEllipsisVertical, IoTrashOutline, IoPencilOutline, IoPlayOutline, IoLogoYoutube, IoVideocamOutline, IoPeopleOutline } from 'react-icons/io5';
import { VideoMaterial } from '../schemas/video-schema';
import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

interface Props {
  data: VideoMaterial[];
  selected_ids: string[];
  on_selection_change: (ids: string[]) => void;
  on_edit: (video: VideoMaterial) => void;
  on_delete: (id: string) => void;
  on_play: (video: VideoMaterial) => void;
  on_grant_access: (id: string) => void;
  is_loading?: boolean;
  is_readonly?: boolean;
}


export function VideoGrid({ data, selected_ids, on_selection_change, on_edit, on_delete, on_play, on_grant_access, is_loading, is_readonly }: Props) {

  const common_t = useTranslations('Common');
  const tAccess = useTranslations('Materials.access');
  const tAuth = useTranslations('Auth.validation');
  const tVideo = useTranslations('Materials.video.table');
  const theme = useMantineTheme();
  const { user } = useAuth();
  const is_student = user?.role === 'student';

  const get_youtube_id = (url: string) => {
    if (!url || (!url.includes('youtube.com') && !url.includes('youtu.be'))) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };


  const toggle_one = (id: string) => {
    on_selection_change(
      selected_ids.includes(id)
        ? selected_ids.filter((i) => i !== id)
        : [...selected_ids, id]
    );
  };

  return (
    <SimpleGrid cols={{ base: 1, xs: 2, sm: 3, md: 4, lg: 5 }} spacing="lg">
      {data.map((item) => {
        const is_selected = selected_ids.includes(item.id);
        const youtube_id = item.youtube_url ? get_youtube_id(item.youtube_url) : (item.file_url ? get_youtube_id(item.file_url) : null);
        const is_youtube = !!youtube_id;


        return (
          <Card
            key={item.id}
            padding="xs"
            radius="md"
            withBorder
            className={cn(
              'group transition-all duration-300 hover:shadow-md h-full cursor-pointer overflow-hidden',
              is_selected ? 'border-primary ring-1 ring-primary bg-primary/5' : 'bg-white/5 border-white/10 shadow-sm'
            )}
            onClick={() => on_play(item)}
          >
            <Card.Section className="relative aspect-video flex items-center justify-center bg-black overflow-hidden border-b border-white/5">
              {is_youtube && youtube_id ? (
                <Image 
                  src={`https://img.youtube.com/vi/${youtube_id}/mqdefault.jpg`} 
                  alt={item.name} 
                  fit="cover"
                  className="transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                item.thumbnail_url ? (
                   <Image 
                    src={item.thumbnail_url} 
                    alt={item.name} 
                    fit="cover" 
                    className="transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  item.file_url ? (
                    <Box className="w-full h-full relative">
                       <video 
                         src={item.file_url + '#t=0.5'} 
                         className="w-full h-full object-cover"
                         preload="metadata"
                         muted
                         playsInline
                       />
                       <Box className="absolute inset-0 bg-black/10" />
                    </Box>
                  ) : (
                    <Box 
                      className="w-full h-full flex items-center justify-center"
                      style={{ backgroundColor: is_selected ? 'var(--space-primary-10)' : 'rgba(255,255,255,0.02)' }}
                    >
                      <IoVideocamOutline size={40} className="text-white/10" />
                    </Box>
                  )
                )

              )}

              {/* Badges for video type */}
              <Box className="absolute bottom-2 left-2 z-10 flex gap-1">
                 {is_youtube ? (
                    <Badge color="red" size="xs" variant="filled" leftSection={<IoLogoYoutube size={10} />}>
                       YouTube
                    </Badge>
                 ) : (
                    <Badge color="primary" size="xs" variant="filled" leftSection={<IoVideocamOutline size={10} />}>
                       FILE
                    </Badge>
                 )}
              </Box>

              <Box className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Box className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 transform scale-90 group-hover:scale-100 transition-transform">
                   <IoPlayOutline size={24} color="white" />
                </Box>
              </Box>
              
              {!is_student && (
                <div 
                  className={cn(
                    "absolute top-2 left-2 transition-opacity duration-200 z-10",
                    is_selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  )}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Checkbox
                    checked={is_selected}
                    onChange={() => toggle_one(item.id)}
                    radius="sm"
                    styles={{
                      input: { cursor: 'pointer', shadow: '0 2px 4px rgba(0,0,0,0.2)' }
                    }}
                  />
                </div>
              )}

              {!is_student && (
                <div 
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Menu shadow="md" width={160} position="bottom-end" withArrow>
                    <Menu.Target>
                      <ActionIcon variant="filled" color="dark" size="md" className="backdrop-blur-md bg-black/40 hover:bg-black/60 border border-white/10">
                        <IoEllipsisVertical size={16} />
                      </ActionIcon>
                    </Menu.Target>

                    <Menu.Dropdown className="bg-[var(--space-card-bg)] border-white/10 backdrop-blur-md">
                      {!is_readonly && (
                        <>
                          <Menu.Item 
                            leftSection={<IoPencilOutline style={{ width: rem(14), height: rem(14) }} />}
                            onClick={() => on_edit(item)}
                          >
                            {common_t('edit')}
                          </Menu.Item>
                          <Menu.Item 
                            leftSection={<IoPeopleOutline style={{ width: rem(14), height: rem(14) }} />}
                            onClick={() => on_grant_access(item.id)}
                          >
                            {tAccess('grant_access')}
                          </Menu.Item>
                        </>
                      )}
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
              )}
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
                      <Badge key={cat.id} color={cat.color || 'gray'} variant="light" size="xs" radius="sm" className={cn("max-w-[100px] truncate", !cat.color && "!text-primary !bg-primary/10")}>
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
