'use client';

import { Stack, Group, Button } from '@mantine/core';
import { IoAddOutline } from 'react-icons/io5';
import BlockItem from '../block-item';
import { LessonBlock } from '../../../hooks/use-lesson-editor-state';

interface LessonBlocksListProps {
    blocks: LessonBlock[];
    readOnly: boolean;
    is_access_mode: boolean;
    accessible_block_ids: string[];
    onBlockChange: (id: string, content: string) => void;
    onBlockRemove: (id: string) => void;
    onOpenBank: (id: string, type: 'image' | 'video' | 'audio' | 'file') => void;
    onMove: (from: number, to: number) => void;
    onCheckedChange: (id: string, checked: boolean) => void;
    onAddBlock: () => void;
    editorRefs: React.MutableRefObject<Record<string, any>>;
    set_is_dragging_block: (dragging: boolean) => void;
    t: (key: string) => string;
}

export function LessonBlocksList({
    blocks, readOnly, is_access_mode, accessible_block_ids, onBlockChange, 
    onBlockRemove, onOpenBank, onMove, onCheckedChange, onAddBlock, editorRefs, set_is_dragging_block, t
}: LessonBlocksListProps) {
    return (
        <Stack gap="md">
            <Stack gap="md">
                {blocks.map((block, index) => (
                    <BlockItem 
                        key={block.id}
                        id={block.id}
                        index={index}
                        content={block.content}
                        on_change={(content) => onBlockChange(block.id, content)}
                        on_remove={() => onBlockRemove(block.id)}
                        on_open_bank={(type) => onOpenBank(block.id, type)}
                        on_move={onMove}
                        show_remove={blocks.length > 1}
                        read_only={readOnly || is_access_mode}
                        is_access_mode={is_access_mode}
                        is_checked={accessible_block_ids.includes(block.id)}
                        on_checked_change={(checked) => onCheckedChange(block.id, checked)}
                        set_is_dragging_block={set_is_dragging_block}
                        ref={(el) => { editorRefs.current[block.id] = el; }}
                    />
                ))}
            </Stack>

            {!readOnly && (
                <Group justify="center" mt="xl">
                    <Button 
                        variant="light" 
                        leftSection={<IoAddOutline size={20} />} 
                        onClick={onAddBlock}
                        radius="xl" size="md"
                        styles={{
                            root: {
                                border: '1px dashed var(--mantine-primary-color-light)',
                                backgroundColor: 'transparent',
                                '&:hover': {
                                    backgroundColor: 'var(--mantine-primary-color-light-hover)'
                                }
                            }
                        }}
                    >
                        {t('editor.add_block')}
                    </Button>
                </Group>
            )}
        </Stack>
    );
}
