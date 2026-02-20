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
import { IoAddOutline, IoTrashOutline, IoSearchOutline, IoCardOutline } from "react-icons/io5";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useSubscriptions } from "./hooks/use-subscriptions";
import { SubscriptionTable } from "./components/subscription-table";
import { SubscriptionDrawer } from "./components/subscription-drawer";
import { SubscriptionDeleteModal } from "./components/subscription-delete-modal";
import { SubscriptionMaterial, SubscriptionFormData } from "./schemas/subscription-schema";

export default function SubscriptionsLayout() {
    const t = useTranslations('Finance.subscriptions');
    const tNav = useTranslations('Navigation');
    const common_t = useTranslations('Common');

    const breadcrumb_items = [
        { title: tNav('dashboard'), href: '/main' },
        { title: tNav('subscriptions'), href: '/main/finance/subscriptions' },
    ].map((item, index) => (
        <Anchor component={Link} href={item.href} key={index} size="sm">
            {item.title}
        </Anchor>
    ));

    // State for filtering and pagination
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState('15');
    const [search, setSearch] = useState('');
    const [selected_ids, setSelectedIds] = useState<string[]>([]);
    
    // Components state
    const [drawer_opened, setDrawerOpened] = useState(false);
    const [editing_subscription, setEditingSubscription] = useState<SubscriptionMaterial | null>(null);
    const [delete_modal_opened, setDeleteModalOpened] = useState(false);
    const [id_to_delete, setIdToDelete] = useState<string | null>(null);

    // Data fetching
    const { 
        subscriptions, 
        is_loading, 
        is_creating, 
        is_updating,
        is_deleting,
        is_bulk_deleting,
        total_pages,
        create_subscription, 
        update_subscription, 
        delete_subscription,
        bulk_delete,
    } = useSubscriptions({
        page,
        limit: parseInt(limit),
        search,
    });

    // Handlers
    const handle_add = () => {
        setEditingSubscription(null);
        setDrawerOpened(true);
    };

    const handle_edit = (subscription: SubscriptionMaterial) => {
        setEditingSubscription(subscription);
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
            await delete_subscription(id_to_delete);
        } else {
            await bulk_delete(selected_ids);
            setSelectedIds([]);
        }
        setDeleteModalOpened(false);
    };

    const handle_drawer_submit = async (data: SubscriptionFormData) => {
        if (editing_subscription) {
            await update_subscription({
                id: editing_subscription.id,
                data
            });
        } else {
            await create_subscription(data);
        }
        setDrawerOpened(false);
    };

    const has_data = subscriptions.length > 0;

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
                    leftSection={<IoAddOutline size={18} />} 
                    onClick={handle_add}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    {t('add_subscription')}
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
                        <SubscriptionTable 
                            data={subscriptions}
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
                            <IoCardOutline size={40} />
                        </Box>
                        <Text fw={500} size="lg">{t('empty_title')}</Text>
                        <Text c="dimmed" size="sm" ta="center" maw={400}>
                            {t('empty_description')}
                        </Text>
                        <Button variant="light" mt="sm" onClick={handle_add}>
                            {t('add_subscription')}
                        </Button>
                    </Stack>
                )
            )}
        </Paper>

        <SubscriptionDrawer 
            opened={drawer_opened}
            onClose={() => setDrawerOpened(false)}
            subscription={editing_subscription}
            on_submit={handle_drawer_submit}
            is_loading={is_creating || is_updating}
        />

        <SubscriptionDeleteModal 
            opened={delete_modal_opened}
            onClose={() => setDeleteModalOpened(false)}
            onConfirm={confirm_delete}
            is_loading={is_deleting || is_bulk_deleting}
            count={id_to_delete ? 1 : selected_ids.length}
        />
    </Stack>
    );
}
