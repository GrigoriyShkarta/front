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
    ActionIcon,
    Transition
} from '@mantine/core';
import { 
    IoSearchOutline, 
    IoAddOutline, 
    IoFilterOutline, 
    IoTrashOutline,
    IoCheckmarkDoneOutline
} from 'react-icons/io5';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useTests } from '@/components/layout/materials/tests/hooks/use-tests';
import { TestTable } from '@/components/layout/materials/tests/components/test-table';
import { CategoryFilterDrawer } from '@/components/common/category-filter-drawer';
import { cn } from '@/lib/utils';

export default function TestsLayout() {
    const t = useTranslations('Materials.tests');
    const common_t = useTranslations('Common');
    
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState('15');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [categoryFilters, setCategoryFilters] = useState<string[]>([]);
    const [categoryDrawerOpened, setCategoryDrawerOpened] = useState(false);

    const { tests, meta, total_pages, is_loading, delete_test, bulk_delete_tests } = useTests({
        page,
        limit: parseInt(limit),
        search,
        category_ids: categoryFilters
    });

    const handle_bulk_delete = () => {
        if (selectedIds.length === 0) return;
        if (window.confirm(common_t('delete_selected') + '?')) {
            bulk_delete_tests(selectedIds);
            setSelectedIds([]);
        }
    };

    return (
        <Stack gap="xl" className="animate-in fade-in duration-500">
            <Group justify="space-between" align="flex-start">
                <Stack gap={4}>
                    <Group gap="md">
                        <Box 
                            className="p-3 rounded-2xl bg-blue-600/10 text-blue-600 dark:bg-blue-600/20"
                        >
                            <IoCheckmarkDoneOutline size={28} />
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

                <Button 
                    component={Link}
                    href="/main/materials/tests/create"
                    size="md" 
                    radius="md"
                    leftSection={<IoAddOutline size={20} />}
                    className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5"
                >
                    {t('add_test')}
                </Button>
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
                            <Button 
                                variant={categoryFilters.length > 0 ? "light" : "default"}
                                color={categoryFilters.length > 0 ? "primary" : "gray"}
                                leftSection={<IoFilterOutline size={18} />}
                                onClick={() => setCategoryDrawerOpened(true)}
                                className={cn(categoryFilters.length > 0 && "border-primary-500/50")}
                            >
                                {common_t('filters')}
                                {categoryFilters.length > 0 && (
                                    <Box
                                        ml={8}
                                        className="w-5 h-5 rounded-full text-white flex items-center justify-center text-[10px] font-bold"
                                        style={{ backgroundColor: 'var(--mantine-primary-color-filled)', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                                    >
                                        {categoryFilters.length}
                                    </Box>
                                )}
                            </Button>
                        </Group>

                        <Transition mounted={selectedIds.length > 0} transition="fade" duration={200}>
                            {(styles) => (
                                <Group style={styles}>
                                    <Text size="sm" fw={500} c="blue">
                                        {selectedIds.length} вибрано
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
                    </Group>
                </Box>

                <TestTable 
                    data={tests}
                    selected_ids={selectedIds}
                    on_selection_change={setSelectedIds}
                    on_delete={(id) => {
                        if (window.confirm(common_t('delete') + '?')) {
                            delete_test(id);
                        }
                    }}
                    is_loading={is_loading}
                />

                {!is_loading && tests.length === 0 && (
                    <Box py={80} className="text-center">
                        <Stack align="center" gap="sm">
                            <Box className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-2">
                                <IoCheckmarkDoneOutline size={32} className="text-zinc-500" />
                            </Box>
                            <Title order={4} fw={600}>{t('empty_title')}</Title>
                            <Text c="dimmed" size="sm" maw={300} mx="auto">
                                {t('empty_description')}
                            </Text>
                        </Stack>
                    </Box>
                )}

                {!is_loading && tests.length > 0 && (
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

            <CategoryFilterDrawer 
                opened={categoryDrawerOpened}
                onClose={() => setCategoryDrawerOpened(false)}
                categoryIds={categoryFilters}
                onCategoryIdsChange={setCategoryFilters}
            />
        </Stack>
    );
}
