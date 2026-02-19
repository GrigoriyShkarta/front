'use client';

import { 
    Table, 
    Checkbox, 
    ActionIcon, 
    Group, 
    Stack,
    Text, 
    Badge, 
    Avatar,
    Menu,
    rem
} from '@mantine/core';
import { 
    IoPencilOutline, 
    IoTrashOutline, 
    IoEllipsisVertical,
    IoImageOutline,
    IoEyeOutline
} from 'react-icons/io5';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { CourseMaterial } from '../schemas/course-schema';
import dayjs from 'dayjs';

interface Props {
    data: CourseMaterial[];
    selected_ids: string[];
    on_selection_change: (ids: string[]) => void;
    on_edit: (course: CourseMaterial) => void;
    on_delete: (id: string) => void;
    is_loading?: boolean;
}

export function CourseTable({ data, selected_ids, on_selection_change, on_edit, on_delete, is_loading }: Props) {
    const t = useTranslations('Materials.courses');
    const common_t = useTranslations('Common');

    const toggle_all = () => {
        on_selection_change(
            selected_ids.length === data.length ? [] : data.map((item) => item.id)
        );
    };

    const toggle_one = (id: string) => {
        on_selection_change(
            selected_ids.includes(id)
                ? selected_ids.filter((item) => item !== id)
                : [...selected_ids, id]
        );
    };

    const rows = data.map((item) => (
        <Table.Tr key={item.id} className="hover:bg-white/5 transition-colors">
            <Table.Td w={40}>
                <Checkbox
                    checked={selected_ids.includes(item.id)}
                    onChange={() => toggle_one(item.id)}
                    radius="sm"
                />
            </Table.Td>
            <Table.Td w={80}>
                <Group gap="sm">
                    <Menu shadow="md" width={160} position="left-start" withArrow>
                        <Menu.Target>
                            <ActionIcon variant="subtle" color="gray">
                                <IoEllipsisVertical size={16} />
                            </ActionIcon>
                        </Menu.Target>

                        <Menu.Dropdown>
                            <Menu.Item 
                                leftSection={<IoEyeOutline size={16} />}
                                component={Link}
                                href={`/main/materials/courses/${item.id}`}
                            >
                                {common_t('view')}
                            </Menu.Item>
                            <Menu.Item 
                                leftSection={<IoPencilOutline size={16} />}
                                onClick={() => on_edit(item)}
                            >
                                {common_t('edit')}
                            </Menu.Item>
                            <Menu.Divider />
                            <Menu.Item 
                                color="red"
                                leftSection={<IoTrashOutline size={16} />}
                                onClick={() => on_delete(item.id)}
                            >
                                {common_t('delete')}
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                </Group>
            </Table.Td>
            <Table.Td>
                <Link href={`/main/materials/courses/${item.id}`} className="no-underline text-inherit hover:opacity-80 transition-opacity">
                    <Group gap="sm" wrap="nowrap">
                        <Avatar 
                            src={item.image_url} 
                            radius="md" 
                            size="md"
                            className="bg-white/10"
                        >
                            <IoImageOutline size={20} />
                        </Avatar>
                        <Stack gap={0}>
                            <Text size="sm" fw={600} className="line-clamp-1">{item.name}</Text>
                        </Stack>
                    </Group>
                </Link>
            </Table.Td>
            <Table.Td>
                <Group gap={4}>
                    {item.categories && item.categories.length > 0 ? (
                        item.categories.slice(0, 2).map((cat) => (
                            <Badge 
                                key={cat.id} 
                                size="xs" 
                                variant="outline"
                                style={{ color: cat.color, borderColor: cat.color }}
                            >
                                {cat.name}
                            </Badge>
                        ))
                    ) : (
                        <Text size="xs" c="dimmed">-</Text>
                    )}
                    {item.categories && item.categories.length > 2 && (
                        <Badge size="xs" variant="outline" color="gray">+{item.categories.length - 2}</Badge>
                    )}
                </Group>
            </Table.Td>
            <Table.Td className="hidden md:table-cell">
                <Text size="xs" c="dimmed">
                    {dayjs(item.created_at).format('DD.MM.YYYY')}
                </Text>
            </Table.Td>
            
        </Table.Tr>
    ));

    return (
        <Table.ScrollContainer minWidth={800}>
            <Table verticalSpacing="sm">
                <Table.Thead className="bg-white/2">
                    <Table.Tr>
                        <Table.Th w={40}>
                            <Checkbox
                                checked={data.length > 0 && selected_ids.length === data.length}
                                onChange={toggle_all}
                                radius="sm"
                            />
                        </Table.Th>
                        <Table.Th w={80}>{t('table.actions')}</Table.Th>
                        <Table.Th>{t('table.name')}</Table.Th>
                        <Table.Th>{t('table.categories')}</Table.Th>
                        <Table.Th className="hidden md:table-cell">{t('table.date')}</Table.Th>
                        
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {rows}
                </Table.Tbody>
            </Table>
        </Table.ScrollContainer>
    );
}

