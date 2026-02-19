'use client';

import { Stack, Button, Group, Text, Paper, ActionIcon, Box, TextInput, Modal, LoadingOverlay, Title, Drawer, MultiSelect, NumberInput, Switch } from '@mantine/core';
import { IoAddOutline, IoImageOutline, IoTrashOutline, IoChevronBackOutline, IoPencilOutline, IoOptionsOutline } from 'react-icons/io5';
import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { MediaPickerModal } from '../media-picker-modal';
import { useLessonEditor } from '../../hooks/use-lesson-editor';
import { BlockNoteEditorRef } from './block-note';
import BlockItem from './block-item';
import { useCategories } from '@/components/layout/categories/hooks/use-categories';
import { useCourses } from '@/components/layout/materials/courses/hooks/use-courses';
import { CategoryDrawer as CreateCategoryDrawer } from '@/components/layout/categories/components/category-drawer';
import { CreateCategoryForm } from '@/components/layout/categories/schemas/category-schema';

interface LessonBlock {
  id: string;
  content: string;
  is_locked?: boolean;
}

interface Props {
    id?: string;
    is_read_only?: boolean;
}

/**
 * Main Lesson Editor component
 * Manages multiple blocks of content, reordering, and media bank integration.
 */
export default function LessonEditorContainer({ id, is_read_only = false }: Props) {
  const t = useTranslations('Materials.lessons');
  const common_t = useTranslations('Common');
  const tCat = useTranslations('Categories');
  const router = useRouter();
  const { user } = useAuth();
  const is_student = user?.role === 'student';

  const { lesson, is_loading_lesson, is_saving, create_lesson, update_lesson } = useLessonEditor({ id });
  
  const [readOnly, setReadOnly] = useState(is_read_only);
  const [title, setTitle] = useState('');
  const [cover, setCover] = useState<string | null>(null);
  const [coverPosition, setCoverPosition] = useState(50);
  const [isRepositioning, setIsRepositioning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [discardModalOpened, setDiscardModalOpened] = useState(false);
  const [additionalOpened, setAdditionalOpened] = useState(false);
  const [duration, setDuration] = useState<number | string | null>(null);
  
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [courseIds, setCourseIds] = useState<string[]>([]);
  const [isCopyingDisabled, setIsCopyingDisabled] = useState(false);
  const { categories: all_categories, create_category, create_categories, is_pending: is_cat_pending } = useCategories();
  const { courses: all_courses } = useCourses({ limit: 100 });
  const [category_drawer_opened, setCategoryDrawerOpened] = useState(false);

  const [blocks, setBlocks] = useState<LessonBlock[]>([
    { id: crypto.randomUUID(), content: '' }
  ]);
  
  // Bank modal state
  const [bankOpened, setBankOpened] = useState(false);
  const [bankType, setBankType] = useState<'image' | 'video' | 'audio' | 'file'>('image');
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  
  // Refs for drag management
  const dragStartY = useRef(0);
  const dragStartPos = useRef(50);
  const containerRef = useRef<HTMLDivElement>(null);

  // Refs for each block editor to call insert_media
  const editorRefs = useRef<Record<string, BlockNoteEditorRef | null>>({});

  useEffect(() => {
    if (lesson) {
        setTitle(lesson.name);
        setCover(lesson.cover_url || null);
        setCoverPosition(lesson.cover_position || 50);
        setCategoryIds(lesson.categories?.map(c => c.id) || []);
        setCourseIds(lesson.course_ids || []);
        setDuration(lesson.duration || null);
        setIsCopyingDisabled(lesson.is_copying_disabled || false);
        if (lesson.content) {
            try {
                const parsed = typeof lesson.content === 'string' 
                    ? JSON.parse(lesson.content) 
                    : lesson.content;
                
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setBlocks(parsed);
                }
            } catch (e) {
                console.error('Failed to parse lesson content', e);
            }
        }
    }
  }, [lesson]);

  useEffect(() => {
    if (readOnly && isCopyingDisabled && is_student) {
        const handleCopy = (e: ClipboardEvent) => {
            e.preventDefault();
        };
        document.addEventListener('copy', handleCopy);
        return () => document.removeEventListener('copy', handleCopy);
    }
  }, [readOnly, isCopyingDisabled, is_student]);

  const isDirty = title.trim() !== '' || cover !== null || blocks.some(b => b.content !== '' && b.content !== '[]' && b.content !== ' ');

  const handleBack = () => {
    if (isDirty && !id && !readOnly) { // Only show discard modal for new lessons, or if dirty and we want to strict it
        setDiscardModalOpened(true);
    } else {
        router.back();
    }
  };

  const handleSave = async () => {
    const payload = {
        name: title,
        cover_url: cover,
        cover_position: coverPosition,
        category_ids: categoryIds,
        course_ids: courseIds,
        duration: duration ? Number(duration) : null,
        is_copying_disabled: isCopyingDisabled,
        content: JSON.stringify(blocks.map((b, i) => ({
            id: b.id,
            content: b.content,
            order: i
        })))
    };

    try {
        if (id) {
            await update_lesson(payload);
            setReadOnly(true);
            setAdditionalOpened(false);
        } else {
            await create_lesson(payload);
        }
    } catch (error) {
        console.error('Failed to save lesson:', error);
    }
  };

  const startRepositioning = () => {
    setIsRepositioning(true);
    dragStartPos.current = coverPosition;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isRepositioning || readOnly) return;
    setIsDragging(true);
    dragStartY.current = e.clientY;
    dragStartPos.current = coverPosition;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !isRepositioning || readOnly) return;
    const deltaY = e.clientY - dragStartY.current;
    const containerHeight = containerRef.current?.offsetHeight || 250;
    // Sensivity factor: how much pixel movement translates to percentage
    const movement = (deltaY / containerHeight) * 100;
    const newPos = Math.max(0, Math.min(100, dragStartPos.current - movement));
    setCoverPosition(newPos);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const addBlock = () => {
    setBlocks(prev => [...prev, { id: crypto.randomUUID(), content: '' }]);
  };

  const removeBlock = (id: string) => {
    if (blocks.length > 1) {
      setBlocks(prev => prev.filter(b => b.id !== id));
      delete editorRefs.current[id];
    }
  };

  const updateBlockContent = (id: string, content: string) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, content } : b));
  };

  const openBank = (blockId: string, type: 'image' | 'video' | 'audio' | 'file') => {
    setActiveBlockId(blockId);
    setBankType(type);
    setBankOpened(true);
  };

  const handleMediaSelect = (item: { id: string; url: string; type: 'image' | 'video' | 'audio' | 'file' }) => {
    if (activeBlockId === 'cover') {
        setCover(item.url);
        setCoverPosition(50); // Reset position for new cover
    } else if (activeBlockId && editorRefs.current[activeBlockId]) {
      editorRefs.current[activeBlockId]?.insert_media(item.id, item.url, item.type);
    }
    setBankOpened(false);
  };

  const moveBlock = (fromIndex: number, toIndex: number) => {
    const updatedBlocks = [...blocks];
    const [movedBlock] = updatedBlocks.splice(fromIndex, 1);
    updatedBlocks.splice(toIndex, 0, movedBlock);
    setBlocks(updatedBlocks);
  };

  const handle_category_create_submit = async (data: CreateCategoryForm | CreateCategoryForm[]) => {
    let new_ids: string[] = [];
    if (Array.isArray(data)) {
        const new_cats = await create_categories(data);
        new_ids = new_cats.map(c => c.id);
    } else {
        const new_cat = await create_category(data);
        new_ids = [new_cat.id];
    }
    
    setCategoryIds(prev => [...prev, ...new_ids]);
    setCategoryDrawerOpened(false);
  };

  return (
    <Stack 
        gap="xl" 
        maw={1000} 
        mx="auto" 
        py="xl" 
        onMouseUp={handleMouseUp} 
        onMouseLeave={handleMouseUp} 
        pos="relative"
        style={{ 
            userSelect: (readOnly && isCopyingDisabled && is_student) ? 'none' : undefined,
            WebkitUserSelect: (readOnly && isCopyingDisabled && is_student) ? 'none' : undefined,
        } as React.CSSProperties}
    >
      <LoadingOverlay visible={is_loading_lesson || is_saving} overlayProps={{ blur: 2 }} zIndex={100} />
      {/* Header with Back and Save/Edit buttons */}
      <Group justify="space-between" align="center" px="md" mb="md">
        <Button 
            variant="subtle" 
            color="gray" 
            leftSection={<IoChevronBackOutline size={18} />}
            onClick={handleBack}
        >
            {t('editor.back')}
        </Button>
        
        {readOnly ? (
            !is_student && (
                <Button 
                    variant="filled" 
                    color="primary" 
                    leftSection={<IoPencilOutline size={18} />}
                    onClick={() => setReadOnly(false)}
                    radius="md"
                >
                    {t('edit_lesson')}
                </Button>
            )
        ) : (
            <Group gap="sm">
                <Button 
                    variant="light" 
                    color="gray" 
                    leftSection={<IoOptionsOutline size={18} />}
                    onClick={() => setAdditionalOpened(true)}
                    radius="md"
                >
                    {common_t('additional')}
                </Button>
                <Button 
                    variant={!title.trim() ? "light" : "filled"}
                    color={!title.trim() ? "gray" : "primary"}
                    onClick={handleSave}
                    loading={is_saving}
                    disabled={!title.trim()}
                    radius="md"
                >
                    {t('editor.save')}
                </Button>
            </Group>
        )}
      </Group>

      <Paper p={readOnly ? 0 : "xl"} radius="md" withBorder={!readOnly} bg="transparent" pos="relative">
        <Stack gap="xs" mb="lg">
            {!cover ? (
                !readOnly && (
                    <Button 
                        variant="subtle" 
                        color="gray" 
                        size="compact-xs" 
                        onClick={() => { setActiveBlockId('cover'); setBankType('image'); setBankOpened(true); }}
                        className="w-fit"
                        leftSection={<IoImageOutline size={14} />}
                    >
                        {t('editor.add_cover')}
                    </Button>
                )
            ) : (
                <Box 
                    ref={containerRef}
                    className={`group relative w-full h-[250px] rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 select-none ${readOnly ? 'border-none' : ''}`}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    style={{ cursor: (!readOnly && isRepositioning) ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
                >
                    <img 
                        src={cover} 
                        alt="Lesson cover" 
                        draggable={false}
                        style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover',
                            objectPosition: `center ${coverPosition}%`
                        }} 
                    />
                    
                    {!readOnly && !isRepositioning && (
                        <Box className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 justify-center">
                            <Button 
                                variant="filled" 
                                color="white" 
                                size="xs" 
                                onClick={() => { setActiveBlockId('cover'); setBankType('image'); setBankOpened(true); }}
                                className="text-black"
                                leftSection={<IoImageOutline size={14} />}
                            >
                                {t('editor.change_cover')}
                            </Button>
                            <Button 
                                variant="filled" 
                                color="white" 
                                size="xs" 
                                onClick={startRepositioning}
                                className="text-black"
                                leftSection={<IoAddOutline size={14} />} 
                            >
                                {t('editor.reposition_cover')}
                            </Button>
                            <Button 
                                variant="filled" 
                                color="red" 
                                size="xs" 
                                onClick={() => setCover(null)}
                                leftSection={<IoTrashOutline size={14} />}
                            >
                                {t('editor.remove_cover')}
                            </Button>
                        </Box>
                    )}

                    {!readOnly && isRepositioning && (
                        <Box className="absolute bottom-4 right-4 flex gap-xs">
                             <Button 
                                variant="filled" 
                                color="white" 
                                size="xs" 
                                className="text-black shadow-lg"
                                onClick={() => setIsRepositioning(false)}
                            >
                                {t('editor.save_position')}
                            </Button>
                        </Box>
                    )}
                </Box>
            )}
        </Stack>

        {readOnly ? (
            <Title order={1} size="h1" fw={700} style={{ fontSize: '3.5rem', textAlign: 'center' }}>{title}</Title>
        ) : (
            <TextInput
            placeholder={t('table.name')}
            variant="unstyled"
            size="50px"
            value={title}
            onChange={(e) => setTitle(e.currentTarget.value)}
            styles={{
                input: {
                fontSize: '3.5rem',
                fontWeight: 700,
                height: 'auto',
                padding: 0,
                textAlign: 'center',
                }
            }}
            />
        )}
      </Paper>

      <Stack gap="md">
        {blocks.map((block, index) => (
          <BlockItem 
            key={block.id}
            id={block.id}
            index={index}
            content={block.content}
            on_change={(content) => updateBlockContent(block.id, content)}
            on_remove={() => removeBlock(block.id)}
            on_open_bank={(type) => openBank(block.id, type)}
            on_move={moveBlock}
            show_remove={blocks.length > 1}
            read_only={readOnly}
            ref={(el) => { editorRefs.current[block.id] = el; }}
          />
        ))}
      </Stack>

      {!readOnly && (
        <Group justify="center" mt="xl">
            <Button 
            variant="light" 
            leftSection={<IoAddOutline size={20} />} 
            onClick={addBlock}
            radius="xl"
            size="md"
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

      <MediaPickerModal 
        opened={bankOpened}
        onClose={() => setBankOpened(false)}
        onSelect={handleMediaSelect}
        type={bankType}
      />

      <Modal 
        opened={discardModalOpened} 
        onClose={() => setDiscardModalOpened(false)}
        title={t('editor.discard_modal.title')}
        centered
        radius="md"
      >
        <Stack gap="md">
            <Text size="sm">
                {t('editor.discard_modal.message')}
            </Text>
            <Group justify="flex-end" gap="sm">
                <Button variant="light" color="gray" onClick={() => setDiscardModalOpened(false)}>
                    {t('editor.discard_modal.cancel')}
                </Button>
                <Button color="red" onClick={() => {
                    setDiscardModalOpened(false);
                    router.back();
                }}>
                    {t('editor.discard_modal.confirm')}
                </Button>
            </Group>
        </Stack>
      </Modal>

      <Drawer
        opened={additionalOpened}
        onClose={() => setAdditionalOpened(false)}
        title={common_t('additional')}
        position="right"
        size="md"
        padding="xl"
      >
        <Stack gap="xl">
            <Group align="flex-end" gap={8} className="w-full">
                <MultiSelect
                    data={all_categories.map(c => ({ value: c.id, label: c.name }))}
                    value={categoryIds}
                    onChange={setCategoryIds}
                    label={tCat('title')}
                    placeholder={tCat('select_categories')}
                    searchable
                    clearable
                    className="flex-1"
                    variant="filled"
                />
                <ActionIcon 
                    variant="light" 
                    color="primary" 
                    size="36px"
                    onClick={() => setCategoryDrawerOpened(true)}
                >
                    <IoAddOutline size={22} />
                </ActionIcon>
            </Group>

            <NumberInput
                label={t('editor.duration')}
                placeholder={t('editor.duration_placeholder')}
                value={duration || ''}
                onChange={setDuration}
                min={0}
                variant="filled"
            />

            <MultiSelect
                data={all_courses.map(c => ({ value: c.id, label: c.name }))}
                value={courseIds}
                onChange={setCourseIds}
                label={t('editor.add_to_course')}
                placeholder={t('editor.add_to_course_placeholder')}
                searchable
                clearable
                variant="filled"
            />

            <Switch
                label={t('editor.disable_copying')}
                description={t('editor.disable_copying_description')}
                checked={isCopyingDisabled}
                onChange={(e) => setIsCopyingDisabled(e.currentTarget.checked)}
            />

            <Button 
                fullWidth 
                variant={!title.trim() ? "light" : "filled"}
                color={!title.trim() ? "gray" : "primary"}
                onClick={handleSave} 
                loading={is_saving}
                disabled={!title.trim()}
                size="md"
                radius="md"
            >
                {t('editor.save')}
            </Button>
        </Stack>
      </Drawer>

      <CreateCategoryDrawer 
        opened={category_drawer_opened} 
        onClose={() => setCategoryDrawerOpened(false)}
        onSubmit={handle_category_create_submit}
        loading={is_cat_pending}
      />
    </Stack>
  );
}
