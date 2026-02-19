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
  Anchor
} from "@mantine/core";
import { IoMusicalNotesOutline, IoAddOutline, IoTrashOutline, IoSearchOutline, IoFilterOutline } from "react-icons/io5";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { notifications } from "@mantine/notifications";
import { useAudios } from "./hooks/use-audios";
import { AudioTable } from "./components/audio-table";
import { AudioDrawer } from "./components/audio-drawer";
import { AudioDeleteModal } from "./components/audio-delete-modal";
import { AudioMaterial } from "./schemas/audio-schema";
import { Dropzone } from "@mantine/dropzone";
import { CategoryFilterDrawer } from '@/components/common/category-filter-drawer';
import { cn } from "@/lib/utils";

const AUDIO_MIME_TYPES = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/flac'];

export default function AudiosLayout() {
    const t = useTranslations('Materials.audio');
    const tNav = useTranslations('Navigation');
    const common_t = useTranslations('Common');
    const { user } = useAuth();
    const is_super_admin = user?.role === 'super_admin';

    const breadcrumb_items = [
        { title: tNav('dashboard'), href: '/main' },
        { title: tNav('audio'), href: '/main/materials/audios' },
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
    
    // Components state
    const [drawer_opened, setDrawerOpened] = useState(false);
    const [filter_drawer_opened, setFilterDrawerOpened] = useState(false);
    const [editing_audio, setEditingAudio] = useState<AudioMaterial | null>(null);
    const [delete_modal_opened, setDeleteModalOpened] = useState(false);
    const [id_to_delete, setIdToDelete] = useState<string | null>(null);
    const [dropped_files, setDroppedFiles] = useState<any[]>([]);

    // Data fetching
    const { 
        audios, 
        is_loading, 
        is_uploading, 
        is_updating,
        is_deleting,
        is_bulk_deleting,
        total_pages,
        upload_audio, 
        update_audio, 
        delete_audio,
        bulk_delete,
    } = useAudios({
        page,
        limit: parseInt(limit),
        search,
        category_ids: category_filters
    });

    // Handlers
    const handle_add = () => {
        setEditingAudio(null);
        setDroppedFiles([]);
        setDrawerOpened(true);
    };

    const handle_edit = (audio: AudioMaterial) => {
        setEditingAudio(audio);
        setDroppedFiles([]);
        setDrawerOpened(true);
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
            await delete_audio(id_to_delete);
        } else {
            await bulk_delete(selected_ids);
            setSelectedIds([]);
        }
        setDeleteModalOpened(false);
    };

    const handle_drawer_submit = async (
        files_to_upload: any[], 
        update_file: (id: string, update: any) => void
    ) => {
        try {
            if (editing_audio) {
                const fileObj = files_to_upload[0];
                update_file(fileObj.id, { status: 'uploading', progress: 0 });
                
                await update_audio({
                    id: editing_audio.id,
                    name: fileObj.name,
                    file: fileObj.file,
                    categories: fileObj.categories,
                    onProgress: (progressEvent) => {
                        const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 100));
                        update_file(fileObj.id, { progress: percent });
                    }
                });

                notifications.show({
                    title: common_t('success'),
                    message: t('notifications.update_success'),
                    color: 'green',
                });
            } else {
                // Multi-upload
                for (const fileObj of files_to_upload) {
                     update_file(fileObj.id, { status: 'uploading', progress: 0 });
                     
                     await upload_audio({
                        name: fileObj.name,
                        file: fileObj.file,
                        categories: fileObj.categories,
                        onProgress: (progressEvent) => {
                            const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 100));
                            update_file(fileObj.id, { progress: percent });
                        }
                    });

                    update_file(fileObj.id, { status: 'success', progress: 100 });
                }

                notifications.show({
                    title: common_t('success'),
                    message: t('notifications.upload_success'),
                    color: 'green',
                });
            }
            setDrawerOpened(false);
            setDroppedFiles([]); // Clear dropped files after submission
        } catch (error: any) {
            // Errors are handled by the hook (notifications)
            // But we could also mark the file as error in the drawer if we wanted to stay open
            console.error("Upload error:", error);
        }
    };

    const has_data = audios.length > 0;

    return (
    <>
        {/* Portal components moved to the top level of the fragment */}
        <Dropzone.FullScreen 
            active={!drawer_opened && !filter_drawer_opened}
            onDrop={(files) => {
                const new_files = files.map(f => ({
                    file: f,
                    id: Math.random().toString(36).substring(7),
                    name: f.name.replace(/\.[^/.]+$/, ""),
                    progress: 0,
                    status: 'idle' as const,
                    categories: []
                }));
                setEditingAudio(null);
                setDroppedFiles(new_files);
                setDrawerOpened(true);
            }} 
            accept={AUDIO_MIME_TYPES}
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
                         <IoMusicalNotesOutline size={60} />
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

        <AudioDrawer 
            opened={drawer_opened}
            onClose={() => {
                setDrawerOpened(false);
                setDroppedFiles([]);
            }}
            audio={editing_audio}
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

        <AudioDeleteModal 
            opened={delete_modal_opened}
            onClose={() => setDeleteModalOpened(false)}
            onConfirm={confirm_delete}
            is_loading={is_deleting || is_bulk_deleting}
            count={id_to_delete ? 1 : selected_ids.length}
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
                            {t('add_audio')}
                        </Button>
                    </Group>
                </Group>

                <Paper withBorder radius="md" className="bg-white/5 border-white/10 overflow-hidden relative">
                    <LoadingOverlay visible={is_loading} overlayProps={{ blur: 2 }} zIndex={50} />
                    
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
                            />
                        </Group>
                    </Box>

                    {is_loading && <Box mih="calc(100vh - 400px)" />}

                    {!is_loading && (
                        has_data ? (
                            <>
                                <AudioTable 
                                    data={audios}
                                    selected_ids={selected_ids}
                                    on_selection_change={setSelectedIds}
                                    on_edit={handle_edit}
                                    on_delete={handle_delete_click}
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
                                    <IoMusicalNotesOutline size={40} />
                                </Box>
                                <Text fw={500} size="lg">{t('empty_title')}</Text>
                                <Text c="dimmed" size="sm" ta="center" maw={400}>
                                    {is_super_admin ? t('empty_description_admin') : t('empty_description')}
                                </Text>
                                <Button variant="light" mt="sm" onClick={handle_add}>
                                    {t('add_audio')}
                                </Button>
                            </Stack>
                        )
                    )}
                </Paper>
        </Stack>
    </>
    );
}