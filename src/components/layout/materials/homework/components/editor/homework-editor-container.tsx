'use client';

import { Stack, Button, Group, Box, TextInput, Modal, LoadingOverlay, Title, Drawer, MultiSelect, Select, ActionIcon, Loader, Text, Switch } from '@mantine/core';
import { IoAddOutline, IoChevronBackOutline, IoPencilOutline, IoOptionsOutline } from 'react-icons/io5';
import { useState, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useHomeworkEditor } from '../../hooks/use-homework-editor';
import { useCategories } from '@/components/layout/categories/hooks/use-categories';
import { CategoryDrawer as CreateCategoryDrawer } from '@/components/layout/categories/components/category-drawer';
import { CreateCategoryForm } from '@/components/layout/categories/schemas/category-schema';
import { useLessons } from '@/components/layout/materials/lessons/hooks/use-lessons';
import { MediaPickerModal } from '@/components/layout/materials/lessons/components/media-picker-modal';
import BlockNoteEditor, { BlockNoteEditorRef } from '@/components/layout/materials/lessons/components/editor/block-note';
import { notifications } from '@mantine/notifications';

interface Props {
  id?: string;
  is_read_only?: boolean;
}

export default function HomeworkEditorContainer({ id, is_read_only = false }: Props) {
  const t = useTranslations('Materials.homework');
  const common_t = useTranslations('Common');
  const tCat = useTranslations('Categories');
  const router = useRouter();
  const { user } = useAuth();
  const is_student = user?.role === 'student';

  const { homework, is_loading_homework, is_saving, create_homework, update_homework } = useHomeworkEditor({ id });
  const queryClient = useQueryClient();

  
  const [readOnly, setReadOnly] = useState(is_read_only);
  const [title, setTitle] = useState('');
  
  const [discardModalOpened, setDiscardModalOpened] = useState(false);
  const [additionalOpened, setAdditionalOpened] = useState(false);
  
  const [contentStr, setContentStr] = useState('');
  const [content_loaded, setContentLoaded] = useState(!id);

  const [bankOpened, setBankOpened] = useState(false);
  const [bankType, setBankType] = useState<'image' | 'video' | 'audio' | 'file'>('image');
  const editorRef = useRef<BlockNoteEditorRef | null>(null);

  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [lessonId, setLessonId] = useState<string | null>(null);
  const [canRetake, setCanRetake] = useState(false);

  const { categories: all_categories, create_category, create_categories, is_pending: is_cat_pending } = useCategories();
  const { lessons: all_lessons, is_loading: lessonsLoading } = useLessons({ page: 1, limit: 1000, search: '' });

  const [category_drawer_opened, setCategoryDrawerOpened] = useState(false);

  useEffect(() => {
    if (homework) {
        setTitle(homework.name);
        setCategoryIds(homework.category_ids || []);
        setLessonId(homework.lesson_id || null);
        setCanRetake(homework.can_retake || false);

        if (homework.content && Array.isArray(homework.content) && homework.content.length > 0) {
            const firstBlockContent = homework.content[0]?.content;
            if (firstBlockContent) {
                setContentStr(typeof firstBlockContent === 'string' ? firstBlockContent : JSON.stringify(firstBlockContent));
            } else {
                setContentStr(JSON.stringify(homework.content));
            }
        }
        // Signal that content is ready so BlockNoteEditor re-mounts with correct initialContent
        setContentLoaded(true);
    }
  }, [homework]);

  const isDirty = title.trim() !== '' || contentStr.trim() !== '';

  const handleBack = () => {
    if (isDirty && !id && !readOnly) {
        setDiscardModalOpened(true);
    } else {
        router.back();
    }
  };

  const handleSave = async () => {
    // lesson_id is now optional


    const payload = {
        name: title,
        lesson_id: lessonId,
        category_ids: categoryIds,
        can_retake: canRetake,
        content: contentStr ? [{ id: 'main', content: contentStr }] : []
    };

    try {
        if (id) {
            await update_homework(payload);
            setReadOnly(true);
            setAdditionalOpened(false);
        } else {
            await create_homework(payload);
        }
    } catch (error) {
        console.error('Failed to save homework:', error);
    }
  };



  const openBank = (type: 'image' | 'video' | 'audio' | 'file') => {
    setBankType(type);
    setBankOpened(true);
  };

  const handleMediaSelect = (item: { id: string; url: string; type: 'image' | 'video' | 'audio' | 'file' }) => {
    if (editorRef.current) {
        editorRef.current.insert_media(item.id, item.url, item.type);
    }
    setBankOpened(false);
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

  const lessonOptions = all_lessons.map(l => ({ value: l.id, label: l.name }));

  if (id && is_loading_homework) {
    return (
      <Box className="flex flex-col items-center justify-center min-h-[60vh] w-full">
        <Loader size="lg" color="primary" />
        <Text mt="md" c="dimmed" size="sm">{common_t('loading')}</Text>
      </Box>
    );
  }

  return (
    <Box 
        maw={1000} 
        mx="auto" 
        py="xl" 
        px="md"
        pos="relative"
        className="transition-all duration-500 ease-in-out"
    >
      <LoadingOverlay visible={is_loading_homework || is_saving} overlayProps={{ blur: 2 }} zIndex={100} />
      
      <Stack gap="xl" className="transition-all duration-500">
        <Group justify="space-between" align="center" px="md" mb="md">
            <Button 
                variant="subtle" 
                color="gray" 
                leftSection={<IoChevronBackOutline size={18} />}
                onClick={handleBack}
            >
                {t('form.back') || common_t('back')}
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
                        {common_t('edit')}
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
                        {common_t('save')}
                    </Button>
                </Group>
            )}
        </Group>

        <Box py="xl">
            {readOnly ? (
                <Title order={1} size="h1" fw={700} style={{ fontSize: '3.5rem', textAlign: 'center' }}>{title}</Title>
            ) : (
                <TextInput
                    placeholder={t('form.name_placeholder')}
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
        </Box>

        <Box px="md">
            {content_loaded && (
                <BlockNoteEditor
                  key={`hw-editor-${id ?? 'new'}`}
                  ref={editorRef}
                  initial_content={contentStr}
                  on_change={setContentStr}
                  on_open_bank={openBank}
                  read_only={readOnly}
                />
            )}
        </Box>
      </Stack>

      <MediaPickerModal 
        opened={bankOpened}
        onClose={() => setBankOpened(false)}
        onSelect={handleMediaSelect}
        type={bankType}
      />

      <Modal 
        opened={discardModalOpened} 
        onClose={() => setDiscardModalOpened(false)}
        title={common_t('close')}
        centered
        radius="md"
      >
        <Stack gap="md">
            <Title order={5}>{common_t('warning')}</Title>
            <Group justify="flex-end" gap="sm">
                <Button variant="light" color="gray" onClick={() => setDiscardModalOpened(false)}>
                    {common_t('cancel')}
                </Button>
                <Button color="red" onClick={() => {
                    setDiscardModalOpened(false);
                    router.back();
                }}>
                    {common_t('confirm')}
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
            <Select
                label={t('form.lesson')}
                placeholder={t('form.search_lesson')}
                data={lessonOptions}
                searchable
                clearable
                disabled={lessonsLoading}
                value={lessonId}
                onChange={setLessonId}
                variant="filled"
            />

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

            <Switch
                label={t('form.can_retake')}
                checked={canRetake}
                onChange={(event) => setCanRetake(event.currentTarget.checked)}
                size="md"
                color="primary"
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
                {common_t('save')}
            </Button>
        </Stack>
      </Drawer>

      <CreateCategoryDrawer 
        opened={category_drawer_opened} 
        onClose={() => setCategoryDrawerOpened(false)}
        onSubmit={handle_category_create_submit}
        loading={is_cat_pending}
      />
    </Box>
  );
}
