'use client';

import { 
    Stack, 
    Title, 
    Text, 
    Group, 
    Button, 
    TextInput, 
    Paper, 
    Box, 
    LoadingOverlay, 
    Pagination, 
    Select,
    Transition,
    Breadcrumbs,
    Anchor
} from '@mantine/core';
import { 
    IoSearchOutline, 
    IoAddOutline, 
    IoTrashOutline,
    IoDocumentTextOutline
} from 'react-icons/io5';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useAuth } from '@/hooks/use-auth';
import { useHomework } from '@/components/layout/materials/homework/hooks/use-homework';
import { HomeworkTable } from '@/components/layout/materials/homework/components/homework-table';
import { HomeworkDeleteModal } from '@/components/layout/materials/homework/components/homework-delete-modal';
import { useRouter } from '@/i18n/routing';

export default function HomeworkLayout() {
    const t = useTranslations('Materials.homework');
    const tNav = useTranslations('Navigation');
    const common_t = useTranslations('Common');
    const { user } = useAuth();
    const is_student = user?.role === 'student';

    const breadcrumb_items = [
        { title: tNav('dashboard'), href: '/main' },
        { title: t('title'), href: '/main/materials/homework' },
    ].map((item, index) => (
        <Anchor component={Link} href={item.href} key={index} size="sm">
            {item.title}
        </Anchor>
    ));
    
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState('15');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const router = useRouter();

    const [delete_modal_opened, setDeleteModalOpened] = useState(false);
    const [id_to_delete, setIdToDelete] = useState<string | null>(null);

    const { homeworks, meta, total_pages, is_loading, delete_homework, bulk_delete_homeworks, is_deleting, is_bulk_deleting } = useHomework({
        page,
        limit: parseInt(limit),
        search
    });

    const handle_bulk_delete = () => {
        if (selectedIds.length === 0) return;
        setIdToDelete(null);
        setDeleteModalOpened(true);
    };

    const confirm_delete = async () => {
        if (id_to_delete) {
            await delete_homework(id_to_delete);
        } else {
            await bulk_delete_homeworks(selectedIds);
            setSelectedIds([]);
        }
        setDeleteModalOpened(false);
        setIdToDelete(null);
    };

    return (
        <Stack gap="xl" className="animate-in fade-in duration-500">
            <Breadcrumbs separator="→">
                {breadcrumb_items}
            </Breadcrumbs>

            <Group justify="space-between" align="flex-start">
                <Stack gap={4}>
                    <Group gap="md">
                        <Box 
                            className="p-3 rounded-2xl bg-primary/10 text-primary dark:bg-primary/20"
                        >
                            <IoDocumentTextOutline size={28} />
                        </Box>
                        <div>
                            <Title order={2} fw={700} className="tracking-tight">
                                {t('title')}
                            </Title>
                            <Text c="dimmed" size="sm">
                                {t('subtitle')}
                            </Text>
                        </div>
                    </Group>
                </Stack>

                {!is_student && (
                    <Button 
                        component={Link}
                        href="/main/materials/homework/create"
                        size="md" 
                        radius="md"
                        leftSection={<IoAddOutline size={20} />}
                        className="bg-primary hover:opacity-90 shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
                    >
                        {t('add_homework')}
                    </Button>
                )}
            </Group>

            <Paper withBorder radius="md" className="bg-white/5 border-white/10 overflow-hidden relative">
                <LoadingOverlay visible={is_loading} overlayProps={{ blur: 2 }} zIndex={40} />

                {is_loading && <Box mih="calc(100vh - 400px)" />}
                
                {/* Filters Toolbar */}
                <Box className="p-4 border-b border-white/10 bg-white/2">
                    <Group justify="space-between">
                        <Group className="flex-1 max-w-md">
                            <TextInput
                                placeholder={common_t('search')}
                                leftSection={<IoSearchOutline size={18} />}
                                className="flex-1"
                                value={search}
                                onChange={(e) => setSearch(e.currentTarget.value)}
                                variant="filled"
                                styles={{
                                    input: {
                                        backgroundColor: 'var(--mantine-color-white-5)',
                                        border: '1px solid var(--white-10)'
                                    }
                                }}
                            />
                        </Group>

                        {!is_student && (
                            <Transition mounted={selectedIds.length > 0} transition="fade" duration={200}>
                                {(styles) => (
                                    <Group style={styles}>
                                        <Text size="sm" fw={500} className="text-primary">
                                            {selectedIds.length} {common_t('selected')}
                                        </Text>
                                        <Button 
                                            variant="light" 
                                            color="red" 
                                            size="sm"
                                            leftSection={<IoTrashOutline size={16} />}
                                            onClick={handle_bulk_delete}
                                        >
                                            {common_t('delete')}
                                        </Button>
                                    </Group>
                                )}
                            </Transition>
                        )}
                    </Group>
                </Box>

                <HomeworkTable 
                    data={homeworks}
                    selected_ids={selectedIds}
                    on_selection_change={setSelectedIds}
                    on_edit={(hw) => {
                        router.push(`/main/materials/homework/${hw.id}/edit`);
                    }}
                    on_delete={(id) => {
                        setIdToDelete(id);
                        setDeleteModalOpened(true);
                    }}
                    is_loading={is_loading}
                />

                {!is_loading && homeworks.length === 0 && (
                    <Box py={80} className="text-center">
                        <Stack align="center" gap="sm">
                            <Box className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-2">
                                <IoDocumentTextOutline size={32} className="text-zinc-500" />
                            </Box>
                            <Title order={4} fw={600}>{t('empty_title')}</Title>
                            <Text c="dimmed" size="sm" maw={300} mx="auto">
                                {t('empty_description')}
                            </Text>
                        </Stack>
                    </Box>
                )}

                {!is_loading && homeworks.length > 0 && (
                    <Box className="p-4 border-t border-white/10 bg-white/2">
                        <Group justify="center">
                            <Group gap="xs">
                                <Text size="sm" c="dimmed">{common_t('show')}</Text>
                                <Select
                                    data={['15', '30', '50']}
                                    value={limit}
                                    onChange={(val: string | null) => setLimit(val || '15')}
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
                )}
            </Paper>

            <HomeworkDeleteModal 
                opened={delete_modal_opened} 
                onClose={() => setDeleteModalOpened(false)} 
                onConfirm={confirm_delete} 
                is_loading={is_deleting || is_bulk_deleting}
                count={id_to_delete ? 1 : selectedIds.length}
            />
        </Stack>
    );
}
