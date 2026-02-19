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
  Center,
  Breadcrumbs,
  Anchor,
  SegmentedControl
} from "@mantine/core";
import { IoVideocamOutline, IoAddOutline, IoTrashOutline, IoSearchOutline, IoGridOutline, IoListOutline, IoFilterOutline } from "react-icons/io5";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { notifications } from "@mantine/notifications";
import { useVideos } from "./hooks/use-videos";
import { VideoTable } from "./components/video-table";
import { VideoGrid } from "./components/video-grid";
import { VideoDrawer } from "./components/video-drawer";
import { VideoDeleteModal } from "./components/video-delete-modal";
import { VideoPlayerModal } from "./components/video-player-modal";
import { VideoMaterial } from "./schemas/video-schema";
import { Dropzone } from "@mantine/dropzone";
import { CategoryFilterDrawer } from '@/components/common/category-filter-drawer';

export default function VideosLayout() {
    const t = useTranslations('Materials.video');
    const tNav = useTranslations('Navigation');
    const common_t = useTranslations('Common');
    const { user } = useAuth();
    const is_super_admin = user?.role === 'super_admin';

    const breadcrumb_items = [
        { title: tNav('dashboard'), href: '/main' },
        { title: t('title'), href: '/main/materials/video' },
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
    const [view_mode, setViewMode] = useState<'grid' | 'table'>('grid');
    
    // Components state
    const [drawer_opened, setDrawerOpened] = useState(false);
    const [filter_drawer_opened, setFilterDrawerOpened] = useState(false);
    const [editing_video, setEditingVideo] = useState<VideoMaterial | null>(null);
    const [delete_modal_opened, setDeleteModalOpened] = useState(false);
    const [player_opened, setPlayerOpened] = useState(false);
    const [playing_video, setPlayingVideo] = useState<VideoMaterial | null>(null);
    const [id_to_delete, setIdToDelete] = useState<string | null>(null);
    const [dropped_files, setDroppedFiles] = useState<any[]>([]);

    useEffect(() => {
        const saved_view = localStorage.getItem('video_view_mode') as 'grid' | 'table';
        if (saved_view) setViewMode(saved_view);
    }, []);

    const handle_view_change = (val: string) => {
        const mode = val as 'grid' | 'table';
        setViewMode(mode);
        localStorage.setItem('video_view_mode', mode);
    };

    // Data fetching
    const { 
        videos, 
        is_loading, 
        is_uploading, 
        is_updating,
        is_deleting,
        is_bulk_deleting,
        total_pages,
        create_video, 
        update_video, 
        delete_video,
        bulk_delete,
    } = useVideos({
        page,
        limit: parseInt(limit),
        search,
        category_ids: category_filters
    });

    // Handlers
    const handle_add = () => {
        setEditingVideo(null);
        setDroppedFiles([]);
        setDrawerOpened(true);
    };

    const handle_edit = (video: VideoMaterial) => {
        setEditingVideo(video);
        setDroppedFiles([]);
        setDrawerOpened(true);
    };

    const handle_play_click = (video: VideoMaterial) => {
        setPlayingVideo(video);
        setPlayerOpened(true);
    };

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
            await delete_video(id_to_delete);
        } else {
            await bulk_delete(selected_ids);
            setSelectedIds([]);
        }
        setDeleteModalOpened(false);
    };

    const handle_drawer_submit = async (
        items_to_save: any[], 
        update_item: (id: string, update: any) => void
    ) => {
        try {
            if (editing_video) {
                const head = items_to_save[0];
                update_item(head.id, { status: 'uploading', progress: 0 });
                
                await update_video({
                    id: editing_video.id,
                    name: head.name,
                    file: head.file,
                    youtube_url: head.youtube_url,
                    categories: head.categories,
                    onProgress: (progressEvent) => {
                        const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 100));
                        update_item(head.id, { progress: percent });
                    }
                });

                notifications.show({
                    title: common_t('success'),
                    message: t('notifications.update_success'),
                    color: 'green',
                });
            } else {
                for (const item of items_to_save) {
                     update_item(item.id, { status: 'uploading', progress: 0 });
                     
                     await create_video({
                        name: item.name,
                        file: item.file,
                        youtube_url: item.youtube_url,
                        categories: item.categories,
                        onProgress: (progressEvent) => {
                            if (item.file) {
                                const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 100));
                                update_item(item.id, { progress: percent });
                            }
                        }
                    });

                    update_item(item.id, { status: 'success', progress: 100 });
                }

                notifications.show({
                    title: common_t('success'),
                    message: t('notifications.upload_success'),
                    color: 'green',
                });
            }
            setDrawerOpened(false);
            setDroppedFiles([]);
        } catch (error: any) {
            console.error("Video save error:", error);
        }
    };

    const has_data = videos.length > 0;

    return (
    <>
        <Dropzone.FullScreen 
            active={!drawer_opened && !filter_drawer_opened && !player_opened}
            onDrop={(files) => {
                const new_items = files.map(f => ({
                    file: f,
                    id: Math.random().toString(36).substring(7),
                    name: f.name.replace(/\.[^/.]+$/, ""),
                    progress: 0,
                    status: 'idle' as const,
                    type: 'file' as const,
                    categories: []
                }));
                setEditingVideo(null);
                setDroppedFiles(new_items);
                setDrawerOpened(true);
            }} 
            accept={['video/mp4', 'video/webm', 'video/ogg']}
            styles={{
                fullScreen: { 
                    backgroundColor: 'rgba(0, 0, 0, 0.4)', 
                    backdropFilter: 'blur(10px)',
                    zIndex: 10000
                }
            }}
        >
            <Center mih="100vh">
                <Box 
                    p={60} 
                    className="border-2 border-dashed border-blue-500/50 rounded-[40px] bg-blue-500/5 backdrop-blur-md flex flex-col items-center gap-8 transition-all scale-100 hover:scale-[1.02]"
                    style={{ pointerEvents: 'none' }}
                >
                    <Box className="w-28 h-28 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                         <IoVideocamOutline size={60} />
                    </Box>
                    <Stack align="center" gap={10}>
                        <Text size="32px" fw={800} c="white" ta="center" style={{ letterSpacing: '-0.5px' }}>
                            {t('form.file')}
                        </Text>
                        <Text size="lg" c="dimmed" ta="center" fw={500}>
                             {t('form.drop_hint')}
                        </Text>
                    </Stack>
                </Box>
            </Center>
        </Dropzone.FullScreen>

        <VideoDrawer 
            opened={drawer_opened}
            onClose={() => {
                setDrawerOpened(false);
                setDroppedFiles([]);
            }}
            video={editing_video}
            initial_files={dropped_files}
            on_submit={handle_drawer_submit}
            is_loading={is_uploading || is_updating}
        />

        <CategoryFilterDrawer
            opened={filter_drawer_opened}
            onClose={() => setFilterDrawerOpened(false)}
            categoryIds={category_filters}
            onCategoryIdsChange={setCategoryFilters}
        />

        <VideoDeleteModal 
            opened={delete_modal_opened}
            onClose={() => setDeleteModalOpened(false)}
            onConfirm={confirm_delete}
            is_loading={is_deleting || is_bulk_deleting}
            count={id_to_delete ? 1 : selected_ids.length}
        />

        <VideoPlayerModal 
            opened={player_opened}
            onClose={() => {
                setPlayerOpened(false);
                setPlayingVideo(null);
            }}
            video={playing_video}
        />

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
                            onClick={handle_add}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {t('add_video')}
                        </Button>
                    </Group>
                </Group>

                <Paper withBorder radius="md" className="bg-white/5 border-white/10 overflow-hidden relative">
                    <LoadingOverlay visible={is_loading} overlayProps={{ blur: 2 }} zIndex={50} />

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

                            <Group gap="xs">
                                <Text size="sm" c="dimmed" className="hidden sm:block">{t('view_mode')}:</Text>
                                <SegmentedControl
                                    size="xs"
                                    value={view_mode}
                                    onChange={handle_view_change}
                                    data={[
                                        { 
                                            label: (
                                                <Group gap={6} wrap="nowrap">
                                                    <IoGridOutline size={14} />
                                                    <Box ml={4}>{t('gallery')}</Box>
                                                </Group>
                                            ), 
                                            value: 'grid' 
                                        },
                                        { 
                                            label: (
                                                <Group gap={6} wrap="nowrap">
                                                    <IoListOutline size={14} />
                                                    <Box ml={4}>{t('table_view')}</Box>
                                                </Group>
                                            ), 
                                            value: 'table' 
                                        },
                                    ]}
                                    styles={{
                                        root: { backgroundColor: 'transparent', border: '1px solid var(--white-10)' },
                                        label: { color: 'var(--foreground)' }
                                    }}
                                />
                            </Group>
                        </Group>
                    </Box>

                    {!is_loading && (
                        has_data ? (
                            <Box p={view_mode === 'grid' ? "md" : 0}>
                                {view_mode === 'grid' ? (
                                    <VideoGrid 
                                        data={videos}
                                        selected_ids={selected_ids}
                                        on_selection_change={setSelectedIds}
                                        on_edit={handle_edit}
                                        on_delete={handle_delete_click}
                                        on_play={handle_play_click}
                                        is_loading={is_loading}
                                    />
                                ) : (
                                    <VideoTable 
                                        data={videos}
                                        selected_ids={selected_ids}
                                        on_selection_change={setSelectedIds}
                                        on_edit={handle_edit}
                                        on_delete={handle_delete_click}
                                        on_play={handle_play_click}
                                        is_loading={is_loading}
                                    />
                                )}
                                
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
                            </Box>
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
                                    <IoVideocamOutline size={40} />
                                </Box>
                                <Text fw={500} size="lg">{t('empty_title')}</Text>
                                <Text c="dimmed" size="sm" ta="center" maw={400}>
                                    {is_super_admin ? t('empty_description_admin') : t('empty_description')}
                                </Text>
                                <Group mt="sm">
                                    <Button variant="light" onClick={handle_add}>
                                        {t('add_video')}
                                    </Button>
                                </Group>
                            </Stack>
                        )
                    )}
                </Paper>
        </Stack>
    </>
    );
}
