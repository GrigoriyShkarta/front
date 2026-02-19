'use client';

import { Link } from '@/i18n/routing';
import { 
  Stack, 
  Title, 
  Paper, 
  Box, 
  Text, 
  Button, 
  Group, 
  TextInput, 
  Pagination, 
  Select, 
  LoadingOverlay,
  Breadcrumbs,
  Anchor
} from "@mantine/core";
import { IoLibraryOutline, IoAddOutline, IoTrashOutline, IoSearchOutline, IoFilterOutline } from "react-icons/io5";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { useCourses } from "./hooks/use-courses";
import { CourseTable } from "./components/course-table";
import { CourseEditorDrawer } from "./components/course-editor-drawer";
import { CourseDeleteModal } from "./components/course-delete-modal";
import { CategoryFilterDrawer } from '@/components/common/category-filter-drawer';
import { CourseMaterial, CreateCourseForm } from './schemas/course-schema';
import { cn } from "@/lib/utils";

export default function CoursesLayout() {
    const t = useTranslations('Materials.courses');
    const tNav = useTranslations('Navigation');
    const common_t = useTranslations('Common');

    const breadcrumb_items = [
        { title: tNav('dashboard'), href: '/main' },
        { title: t('title'), href: '/main/materials/courses' },
    ].map((item, index) => (
        <Anchor component={Link} href={item.href} key={index} size="sm">
            {item.title}
        </Anchor>
    ));

    // State for filtering and pagination
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState('15');
    const [search, setSearch] = useState('');
    const [category_filters, setCategoryFilters] = useState<string[]>([]);
    const [selected_ids, setSelectedIds] = useState<string[]>([]);
    const [filter_drawer_opened, setFilterDrawerOpened] = useState(false);
    const [delete_modal_opened, setDeleteModalOpened] = useState(false);
    const [id_to_delete, setIdToDelete] = useState<string | null>(null);
    
    // Editor state
    const [editor_opened, setEditorOpened] = useState(false);
    const [editing_course, setEditingCourse] = useState<CourseMaterial | null>(null);

    // Data fetching
    const { 
        courses, 
        is_loading, 
        is_saving,
        is_deleting,
        is_bulk_deleting,
        total_pages,
        create_course,
        update_course,
        delete_course,
        bulk_delete,
    } = useCourses({
        page,
        limit: parseInt(limit),
        search,
        category_ids: category_filters
    });

    // Reset page on filter change
    useEffect(() => {
        setPage(1);
    }, [search, category_filters, limit]);

    const handle_delete_click = (id: string) => {
        setIdToDelete(id);
        setDeleteModalOpened(true);
    };

    const handle_bulk_delete_click = () => {
        setIdToDelete(null);
        setDeleteModalOpened(true);
    };

    const confirm_delete = async () => {
        if (id_to_delete) {
            await delete_course(id_to_delete);
        } else {
            await bulk_delete(selected_ids);
            setSelectedIds([]);
        }
        setDeleteModalOpened(false);
    };

    const handle_edit = (course: CourseMaterial) => {
        setEditingCourse(course);
        setEditorOpened(true);
    };

    const handle_create = () => {
        setEditingCourse(null);
        setEditorOpened(true);
    };

    const handle_save = async (data: CreateCourseForm) => {
        if (editing_course) {
            return await update_course(editing_course.id, data);
        } else {
            return await create_course(data);
        }
    };

    const has_data = courses.length > 0;

    return (
        <Stack gap="lg">
                <Breadcrumbs mb="xs" separator="→">
                    {breadcrumb_items}
                </Breadcrumbs>

                <Group justify="space-between" align="flex-end">
                    <Stack gap={0}>
                        <Title order={2}>{t('title')}</Title>
                        <Text color="dimmed" size="sm">
                            {t('subtitle')}
                        </Text>
                    </Stack>
                    
                    <Group>
                         {selected_ids.length > 0 && (
                              <Button 
                                 color="red" 
                                 variant="light" 
                                 leftSection={<IoTrashOutline size={16} />}
                                 onClick={handle_bulk_delete_click}
                              >
                                 {t('bulk_delete', { count: selected_ids.length })}
                              </Button>
                         )}

                        <Button 
                            variant={category_filters.length > 0 ? "light" : "default"}
                            color={category_filters.length > 0 ? "primary" : "gray"}
                            leftSection={<IoFilterOutline size={18} />} 
                            onClick={() => setFilterDrawerOpened(true)}
                        >
                            <Box className="hidden sm:inline">{common_t('filters')}</Box>
                            {category_filters.length > 0 && (
                                <Box 
                                    ml={8} 
                                    className="w-5 h-5 rounded-full text-white flex items-center justify-center text-[10px] font-bold shadow-sm"
                                    style={{ backgroundColor: 'var(--mantine-primary-color-filled)' }}
                                >
                                    {category_filters.length}
                                </Box>
                            )}
                        </Button>

                        <Button 
                            leftSection={<IoAddOutline size={18} />} 
                            onClick={handle_create}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {t('add_course')}
                        </Button>
                    </Group>
                </Group>

                <Paper withBorder radius="md" className="bg-white/5 border-white/10 overflow-hidden relative">
                    <LoadingOverlay visible={is_loading} overlayProps={{ blur: 2 }} zIndex={40} />

                    {is_loading && <Box mih="calc(100vh - 400px)" />}
                    
                    {/* Filters Toolbar */}
                    <Box className="p-4 border-b border-white/10 bg-white/2">
                        <Group justify="space-between">
                            <TextInput
                                placeholder={common_t('search')}
                                leftSection={<IoSearchOutline size={16} />}
                                value={search}
                                onChange={(e) => setSearch(e.currentTarget.value)}
                                size="sm"
                                maw={300}
                                className="flex-1"
                                variant="filled"
                            />
                        </Group>
                    </Box>

                    {!is_loading && (
                        has_data ? (
                            <>
                                <CourseTable 
                                    data={courses}
                                    selected_ids={selected_ids}
                                    on_selection_change={setSelectedIds}
                                    on_edit={handle_edit}
                                    on_delete={handle_delete_click}
                                    is_loading={is_loading}
                                />
                                
                                {/* Pagination */}
                                <Box className="p-4 border-t border-white/10 bg-white/2">
                                    <Group justify="center">
                                        <Group gap="xs">
                                            <Text size="sm" c="dimmed">{common_t('show')}</Text>
                                            <Select
                                                data={['15', '30', '50']}
                                                value={limit}
                                                onChange={(val) => setLimit(val || '15')}
                                                size="xs"
                                                w={70}
                                            />
                                            <Text size="sm" c="dimmed">{common_t('per_page')}</Text>
                                        </Group>
    
                                        <Pagination 
                                            total={total_pages} 
                                            value={page} 
                                            onChange={setPage} 
                                            size="sm"
                                            withEdges
                                            boundaries={1}
                                            siblings={1}
                                        />
                                    </Group>
                                </Box>
                            </>
                        ) : (
                            <Stack align="center" gap="md" py={60}>
                                <Box 
                                    className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg"
                                    style={{ 
                                        backgroundColor: 'var(--mantine-primary-color-light)',
                                        color: 'var(--mantine-primary-color-filled)',
                                        border: '1px solid var(--mantine-primary-color-light-hover)',
                                        boxShadow: '0 0 20px rgba(var(--mantine-primary-color-filled-rgb), 0.15)'
                                    }}
                                >
                                    <IoLibraryOutline size={40} />
                                </Box>
                                <Text fw={500} size="lg">{t('empty_title')}</Text>
                                <Text c="dimmed" size="sm" ta="center" maw={400}>
                                    {t('empty_description')}
                                </Text>
                                <Group mt="sm">
                                    <Button variant="light" onClick={handle_create}>
                                        {t('add_course')}
                                    </Button>
                                </Group>
                            </Stack>
                        )
                    )}
                </Paper>

                <CourseEditorDrawer 
                    opened={editor_opened}
                    onClose={() => setEditorOpened(false)}
                    course={editing_course}
                    onSave={handle_save}
                    is_saving={is_saving}
                />

                <CategoryFilterDrawer
                    opened={filter_drawer_opened}
                    onClose={() => setFilterDrawerOpened(false)}
                    categoryIds={category_filters}
                    onCategoryIdsChange={setCategoryFilters}
                />

                <CourseDeleteModal 
                    opened={delete_modal_opened}
                    onClose={() => setDeleteModalOpened(false)}
                    onConfirm={confirm_delete}
                    is_loading={is_deleting || is_bulk_deleting}
                    count={id_to_delete ? 1 : selected_ids.length}
                />
        </Stack>
    );
}
