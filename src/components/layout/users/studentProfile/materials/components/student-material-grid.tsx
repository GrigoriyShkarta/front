'use client';

import { SimpleGrid, Card, Image, Text, Group, Checkbox, Box, Badge, ActionIcon, useMantineTheme } from '@mantine/core';
import { IoPlayOutline, IoLogoYoutube, IoVideocamOutline, IoImageOutline, IoDocumentTextOutline, IoMusicalNotesOutline } from 'react-icons/io5';
import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';
import { cn } from '@/lib/utils';

interface Props {
  items: any[];
  type: 'audio' | 'photo' | 'video' | 'file' | 'note';
  on_toggle_access: (id: string, has_access: boolean) => void;
  on_item_click: (item: any) => void;
  is_mutating: boolean;
}

export function StudentMaterialGrid({ items, type, on_toggle_access, on_item_click, is_mutating }: Props) {
  const t = useTranslations('Materials');
  const common_t = useTranslations('Common');
  const theme = useMantineTheme();

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

  if (items.length === 0) {
    return (
      <Box py={60}>
        <Text ta="center" c="dimmed">
          {t(`${type}.empty_title`) || common_t?.('no_data') || 'No materials found'}
        </Text>
      </Box>
    );
  }

  return (
    <SimpleGrid cols={{ base: 1, xs: 2, sm: 3, md: 4, lg: 5 }} spacing="lg">
      {items.map((item) => {
        const is_youtube = type === 'video' && (!!item.youtube_url || (!item.file_key && !!item.file_url));
        const thumbnail = get_thumbnail(item);

        return (
          <Card
            key={item.id}
            padding="xs"
            radius="md"
            withBorder
            className={cn(
              'group transition-all duration-300 hover:shadow-md h-full cursor-pointer',
              item.has_access ? 'border-primary ring-1 ring-primary/30 bg-primary/5 dark:bg-primary/10' : 'bg-white/5 border-white/10'
            )}
            onClick={() => on_item_click(item)}
          >
            <Card.Section className={cn(
                "relative overflow-hidden flex items-center justify-center bg-black",
                type === 'video' ? "aspect-video" : "aspect-square"
            )}>
              {type === 'video' ? (
                is_youtube ? (
                  thumbnail ? (
                    <Image src={thumbnail} alt={item.title || item.name} fit="cover" h="100%" className="transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <Box className="w-full h-full flex items-center justify-center bg-white/5">
                      <IoLogoYoutube size={40} className="text-white/20" />
                    </Box>
                  )
                ) : (
                  item.thumbnail_url ? (
                    <Image src={item.thumbnail_url} alt={item.title || item.name} fit="cover" h="100%" className="transition-transform duration-500 group-hover:scale-105" />
                  ) : item.file_url ? (
                    <video src={`${item.file_url}#t=0.5`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" preload="metadata" muted playsInline />
                  ) : (
                    <Box className="w-full h-full flex items-center justify-center bg-white/5">
                      <IoVideocamOutline size={40} className="text-white/20" />
                    </Box>
                  )
                )
              ) : type === 'photo' ? (
                <Image src={item.file_url} alt={item.title || item.name} fit="cover" h="100%" className="transition-transform duration-500 group-hover:scale-105" fallbackSrc="https://placehold.co/400x400?text=No+Image" />
              ) : (
                  <Box className="w-full h-full flex items-center justify-center bg-white/5">
                    {type === 'audio' ? (
                      <IoMusicalNotesOutline size={40} className="text-white/20" />
                    ) : type === 'note' ? (
                      <IoDocumentTextOutline size={40} className="text-white/20" />
                    ) : (
                      <IoVideocamOutline size={40} className="text-white/20" />
                    )}
                  </Box>
              )}

              <Box className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                 {type === 'video' && (
                    <Box className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white scale-0 group-hover:scale-100 transition-transform duration-300">
                        <IoPlayOutline size={24} />
                    </Box>
                 )}
              </Box>

              {type === 'video' && (
                <Badge variant="filled" color={is_youtube ? 'red' : theme.primaryColor} size="xs" className="absolute bottom-2 right-2 backdrop-blur-md opacity-90 shadow-sm" leftSection={is_youtube ? <IoLogoYoutube size={10} /> : <IoVideocamOutline size={10} />}>
                    {is_youtube ? 'YouTube' : 'FILE'}
                </Badge>
              )}

              <div className={cn("absolute top-2 left-2 transition-opacity duration-200", item.has_access ? "opacity-100" : "opacity-0 group-hover:opacity-100")} onClick={(e) => e.stopPropagation()}>
                <Checkbox checked={item.has_access} onChange={(e) => on_toggle_access(item.id, e.currentTarget.checked)} disabled={is_mutating} />
              </div>
            </Card.Section>

            <Box pt="xs" px="xs">
              <Text fw={600} size="sm" className="truncate" title={item.title || item.name}>{item.title || item.name}</Text>
              <Text size="xs" c="dimmed" mt={2}>{dayjs(item.created_at).format('DD.MM.YYYY')}</Text>
              {item.categories && item.categories.length > 0 && (
                  <Group gap={4} mt={6} className="flex-wrap">
                    {item.categories.slice(0, 3).map((cat: any) => (
                      <Badge key={cat.id} color={cat.color || 'primary'} variant="light" size="xs" radius="sm" className="max-w-[100px] truncate">
                        {cat.name}
                      </Badge>
                    ))}
                  </Group>
              )}
            </Box>
          </Card>
        );
      })}
    </SimpleGrid>
  );
}
