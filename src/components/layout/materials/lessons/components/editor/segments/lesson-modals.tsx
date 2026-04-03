'use client';

import { Modal, Stack, Text, Group, Button } from '@mantine/core';
import { MediaPickerModal } from '../../media-picker-modal';
import { CategoryDrawer as CreateCategoryDrawer } from '@/components/layout/categories/components/category-drawer';

interface LessonModalsProps {
    discardOpened: boolean;
    bankOpened: boolean;
    bankType: 'image' | 'video' | 'audio' | 'file';
    categoryDrawerOpened: boolean;
    onDiscardClose: () => void;
    onDiscardConfirm: () => void;
    onBankClose: () => void;
    onMediaSelect: (item: any) => void;
    onCategoryDrawerClose: () => void;
    onCategorySubmit: (data: any) => Promise<void>;
    deleteHwOpened: boolean;
    onDeleteHwClose: () => void;
    onDeleteHwConfirm: () => void;
    t: (key: string) => string;
    tHw: (key: string) => string;
}

export function LessonModals({
    discardOpened, bankOpened, bankType, categoryDrawerOpened,
    onDiscardClose, onDiscardConfirm, onBankClose, onMediaSelect,
    onCategoryDrawerClose, onCategorySubmit,
    deleteHwOpened, onDeleteHwClose, onDeleteHwConfirm, t, tHw
}: LessonModalsProps) {
    return (
        <>
            <Modal opened={discardOpened} onClose={onDiscardClose} title={t('editor.discard_modal.title')} centered>
                <Stack>
                    <Text size="sm">{t('editor.discard_modal.message')}</Text>
                    <Group justify="flex-end" gap="sm">
                        <Button variant="subtle" color="gray" onClick={onDiscardClose}>{t('editor.discard_modal.cancel')}</Button>
                        <Button color="red" onClick={onDiscardConfirm}>{t('editor.discard_modal.confirm')}</Button>
                    </Group>
                </Stack>
            </Modal>

            <MediaPickerModal 
                opened={bankOpened} 
                onClose={onBankClose} 
                onSelect={onMediaSelect}
                type={bankType}
            />

            <Modal opened={deleteHwOpened} onClose={onDeleteHwClose} title={tHw('delete_homework')} centered>
                <Stack>
                    <Text size="sm">{tHw('delete_confirm.description')}</Text>
                    <Group justify="flex-end" gap="sm">
                        <Button variant="subtle" color="gray" onClick={onDeleteHwClose}>{t('editor.discard_modal.cancel')}</Button>
                        <Button color="red" onClick={onDeleteHwConfirm}>{tHw('delete_homework')}</Button>
                    </Group>
                </Stack>
            </Modal>

            <CreateCategoryDrawer 
                opened={categoryDrawerOpened}
                onClose={onCategoryDrawerClose}
                onSubmit={onCategorySubmit}
            />
        </>
    );
}
