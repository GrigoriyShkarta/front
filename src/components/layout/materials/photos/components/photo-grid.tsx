'use client';

import { SimpleGrid, Card, Image, Text, Group, Checkbox, ActionIcon, Menu, rem, Box, Transition, Badge } from '@mantine/core';
import { IoEllipsisVertical, IoTrashOutline, IoPencilOutline, IoPeopleOutline } from 'react-icons/io5';
import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';
import { useAuth } from '@/hooks/use-auth';
import { PhotoMaterial } from '../schemas/photo-schema';
import { cn, formatBytes } from '@/lib/utils';

interface Props {
  data: PhotoMaterial[];
  selected_ids: string[];
  on_selection_change: (ids: string[]) => void;
  on_edit: (photo: PhotoMaterial) => void;
  on_delete: (id: string) => void;
  on_grant_access: (id: string) => void;
  on_preview: (photo: PhotoMaterial) => void;
  is_loading?: boolean;
}

export function PhotoGrid({ data, selected_ids, on_selection_change, on_edit, on_delete, on_grant_access, on_preview, is_loading }: Props) {
  const tAuth = useTranslations('Auth.validation');
  const tAccess = useTranslations('Materials.access');
  const common_t = useTranslations('Common');
  const { user } = useAuth();
  const is_student = user?.role === 'student';

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
        return (
          <Card
            key={item.id}
            padding="xs"
            radius="md"
            withBorder
            className={cn(
              'group transition-all duration-300 hover:shadow-md h-full cursor-pointer',
              is_selected ? 'border-primary ring-1 ring-primary bg-primary/5' : 'bg-white/5 border-white/10'
            )}
            onClick={() => on_preview(item)}
          >
            <Card.Section className="relative overflow-hidden aspect-square flex items-center justify-center bg-black/20">
              <Image
                src={item.file_url}
                alt={item.name}
                className="transition-transform duration-500 group-hover:scale-105"
                fit="contain"
                h="100%"
                fallbackSrc="https://placehold.co/400x400?text=No+Image"
              />
              
              {/* Overlay for actions and selection */}
              {!is_student && <Box className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />}
              
              {!is_student && (
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
                    radius="sm"
                    styles={{
                      input: { cursor: 'pointer', shadow: '0 2px 4px rgba(0,0,0,0.2)' }
                    }}
                  />
                </div>
              )}

              {!is_student && (
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
                        leftSection={<IoPeopleOutline style={{ width: rem(14), height: rem(14) }} />}
                        onClick={() => on_grant_access(item.id)}
                      >
                        {tAccess('grant_access')}
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
              )}
            </Card.Section>

            <Box pt="xs" px="xs">
              <Text fw={600} size="sm" className="truncate" title={item.name}>
                {item.name}
              </Text>
              <Group justify="space-between" mt={2}>
                <Text size="xs" c="dimmed">
                  {dayjs(item.created_at).format('DD.MM.YYYY')}
                </Text>
                {item.size ? (
                  <Text size="xs" c="dimmed">
                    {formatBytes(item.size)}
                  </Text>
                ) : null}
              </Group>
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
