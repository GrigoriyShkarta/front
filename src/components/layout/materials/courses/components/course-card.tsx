'use client';

import { 
    Paper, 
    Box, 
    Text, 
    Group, 
    Badge, 
    ActionIcon, 
    Menu, 
    Stack,
    Indicator,
    Checkbox
} from '@mantine/core';
import { 
    IoPencilOutline, 
    IoTrashOutline, 
    IoEllipsisVertical, 
    IoImageOutline,
    IoEyeOutline,
    IoCalendarOutline,
    IoLayersOutline
} from 'react-icons/io5';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { useAuth } from '@/hooks/use-auth';
import { CourseMaterial } from '../schemas/course-schema';
import dayjs from 'dayjs';
import { cn } from '@/lib/utils';

interface Props {
    course: CourseMaterial;
    selected?: boolean;
    on_select?: (id: string) => void;
    on_edit: (course: CourseMaterial) => void;
    on_delete: (id: string) => void;
}

export function CourseCard({ course, selected, on_select, on_edit, on_delete }: Props) {
    const t = useTranslations('Materials.courses');
    const common_t = useTranslations('Common');
    const { user } = useAuth();
    const router = useRouter();
    const is_student = user?.role === 'student';

    // Parse content to get counts if it's a string
    const structure = typeof course.content === 'string' ? JSON.parse(course.content) : course.content;
    const items_count = structure?.length || 0;

    return (
        <Paper 
            className={cn(
                "group relative overflow-hidden transition-all duration-300",
                "bg-white/5 border border-white/10 hover:border-primary/50",
                "hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1",
                selected && "border-primary bg-primary/[0.03]"
            )}
            radius="lg"
        >
            {/* Selection Checkbox (Admin only) */}
            {!is_student && on_select && (
                <Box 
                    className={cn(
                        "absolute top-3 left-3 z-20 transition-opacity",
                        selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    )}
                >
                    <Checkbox
                        checked={selected}
                        onChange={() => on_select(course.id)}
                        radius="sm"
                        size="xs"
                        className="shadow-sm"
                    />
                </Box>
            )}

            {/* Menu Actions (Admin only) */}
            {!is_student && (
                <Box className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Menu shadow="md" width={160} position="bottom-end" withArrow>
                        <Menu.Target>
                            <ActionIcon 
                                variant="white" 
                                color="dark" 
                                size="sm" 
                                radius="md"
                                className="shadow-lg backdrop-blur-md bg-white/80 hover:bg-white"
                            >
                                <IoEllipsisVertical size={14} />
                            </ActionIcon>
                        </Menu.Target>

                        <Menu.Dropdown>
                            <Menu.Item 
                                leftSection={<IoEyeOutline size={16} />}
                                onClick={() => router.push(`/main/materials/courses/${course.id}`)}
                            >
                                {common_t('view')}
                            </Menu.Item>
                            <Menu.Item 
                                leftSection={<IoPencilOutline size={16} />}
                                onClick={() => on_edit(course)}
                            >
                                {common_t('edit')}
                            </Menu.Item>
                            <Menu.Divider />
                            <Menu.Item 
                                color="red"
                                leftSection={<IoTrashOutline size={16} />}
                                onClick={() => on_delete(course.id)}
                            >
                                {common_t('delete')}
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                </Box>
            )}

            <Link href={`/main/materials/courses/${course.id}`} className="no-underline text-inherit block h-full">
                {/* Image Section */}
                <Box className="relative aspect-[16/10] overflow-hidden bg-white/5 border-b border-white/5">
                    {course.image_url ? (
                        <img 
                            src={course.image_url} 
                            alt={course.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                    ) : (
                        <Box className="w-full h-full flex items-center justify-center text-white/10 group-hover:text-primary/20 transition-colors">
                            <IoImageOutline size={48} />
                        </Box>
                    )}
                    
                    {/* Floating counts */}
                    <Box className="absolute bottom-3 left-3 flex gap-2">
                         <Badge 
                            variant="filled" 
                            color="dark" 
                            size="sm" 
                            className="bg-black/60 backdrop-blur-md border border-white/10"
                            leftSection={<IoLayersOutline size={12} />}
                         >
                            {items_count}
                         </Badge>
                    </Box>
                </Box>

                {/* Content Section */}
                <Box p="md">
                    <Stack gap="xs">
                        <Group justify="space-between" align="start" wrap="nowrap">
                            <Text fw={700} size="md" className="line-clamp-1 group-hover:text-primary transition-colors">
                                {course.name}
                            </Text>
                        </Group>

                        {/* Categories */}
                        <Group gap={4} className="min-h-[22px]">
                            {course.categories && course.categories.length > 0 ? (
                                course.categories.slice(0, 2).map((cat) => (
                                    <Badge 
                                        key={cat.id} 
                                        size="xs" 
                                        variant="filled"
                                        style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                                        className="border-none"
                                    >
                                        {cat.name}
                                    </Badge>
                                ))
                            ) : (
                                <Box h={20} />
                            )}
                            {course.categories && course.categories.length > 2 && (
                                <Badge size="xs" variant="filled" color="gray" className="bg-white/5">
                                    +{course.categories.length - 2}
                                </Badge>
                            )}
                        </Group>

                        {/* Footer info */}
                        <Group justify="space-between" mt="sm" pt="sm" className="border-t border-white/5">
                            <Group gap={4} c="dimmed">
                                <IoCalendarOutline size={12} />
                                <Text size="xs">
                                    {dayjs(course.created_at).format('DD.MM.YYYY')}
                                </Text>
                            </Group>
                            
                            {/* Visual Progress indicator (if we had it) or just a 'Go' arrow */}
                            <ActionIcon variant="subtle" color="gray" size="sm" className="group-hover:translate-x-1 transition-transform">
                                <IoEyeOutline size={14} />
                            </ActionIcon>
                        </Group>
                    </Stack>
                </Box>
            </Link>
        </Paper>
    );
}
