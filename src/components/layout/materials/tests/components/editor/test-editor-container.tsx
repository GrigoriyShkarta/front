'use client';

import { 
    Stack, 
    Button, 
    Group, 
    Text, 
    Paper, 
    Box, 
    TextInput, 
    Modal, 
    LoadingOverlay, 
    Title, 
    Drawer, 
    MultiSelect,
    NumberInput,
    Switch,
    Divider,
    rem
} from '@mantine/core';
import { 
    IoAddOutline, 
    IoChevronBackOutline, 
    IoPencilOutline, 
    IoOptionsOutline, 
    IoEyeOutline,
    IoEyeOffOutline
} from 'react-icons/io5';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useTestEditor } from '@/components/layout/materials/tests/hooks/use-test-editor';
import { QuestionBlock } from './question-block';
import { TestQuestion, QUESTION_TYPES } from '@/components/layout/materials/tests/schemas/test-schema';
import { useCategories } from '@/components/layout/categories/hooks/use-categories';
import { CategoryDrawer as CreateCategoryDrawer } from '@/components/layout/categories/components/category-drawer';
import { CreateCategoryForm } from '@/components/layout/categories/schemas/category-schema';
import { MediaPickerModal } from '@/components/layout/materials/lessons/components/media-picker-modal';

interface Props {
    id?: string;
    is_read_only?: boolean;
}

export default function TestEditorContainer({ id, is_read_only = false }: Props) {
  const t = useTranslations('Materials.tests');
  const common_t = useTranslations('Common');
  const tCat = useTranslations('Categories');
  const router = useRouter();
  const { user } = useAuth();
  const is_student = user?.role === 'student';

  const { test, is_loading_test, is_saving, create_test, update_test } = useTestEditor({ id });
  
  const [readOnly, setReadOnly] = useState(is_read_only);
  const [isPreview, setIsPreview] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isTimeOutModalOpened, setIsTimeOutModalOpened] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [discardModalOpened, setDiscardModalOpened] = useState(false);
  const [additionalOpened, setAdditionalOpened] = useState(false);
  
  // Settings
  const [passingScore, setPassingScore] = useState(0);
  const [timeLimit, setTimeLimit] = useState<number | null>(null);

  // Categories
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const { categories: all_categories, create_category, create_categories, is_pending: is_cat_pending } = useCategories();
  const [category_drawer_opened, setCategoryDrawerOpened] = useState(false);

  // Questions
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  
  // Bank modal state
  const [bankOpened, setBankOpened] = useState(false);
  const [bankType, setBankType] = useState<'image' | 'video' | 'audio' | 'file'>('image');
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);

  useEffect(() => {
    if (test) {
        setTitle(test.name);
        setDescription(test.description || '');
        setCategoryIds(test.categories?.map(c => c.id) || []);
        setPassingScore(test.settings.passing_score);
        setTimeLimit(test.settings.time_limit || null);
        
        if (test.content) {
            try {
                const parsed = typeof test.content === 'string' 
                    ? JSON.parse(test.content) 
                    : test.content;
                setQuestions(parsed);
            } catch (e) {
                console.error('Failed to parse test content', e);
            }
        }
    } else if (!id) {
        // Initial question for new test
        setQuestions([{
            id: crypto.randomUUID(),
            type: QUESTION_TYPES.SINGLE_CHOICE,
            question: '',
            points: 1,
            options: [{ id: crypto.randomUUID(), text: '', is_correct: false }]
        }]);
    }
  }, [test, id]);

  // Timer logic for preview
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPreview && timeLimit && timeLeft !== null && timeLeft > 0) {
        interval = setInterval(() => {
            setTimeLeft(prev => (prev !== null && prev > 0) ? prev - 1 : 0);
        }, 1000);
    } else if (isPreview && timeLimit && timeLeft === 0) {
        setIsTimeOutModalOpened(true);
    }
    return () => clearInterval(interval);
  }, [isPreview, timeLimit, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startPreview = () => {
    if (timeLimit) {
        setTimeLeft(timeLimit * 60);
    }
    setIsPreview(true);
  };

  const isDirty = title.trim() !== '' || questions.some(q => q.question.trim() !== '');

  const handleBack = () => {
    if (isDirty && !id && !readOnly) {
        setDiscardModalOpened(true);
    } else {
        router.back();
    }
  };

  const handleSave = async () => {
    const payload = {
        name: title,
        description,
        category_ids: categoryIds,
        settings: {
            passing_score: passingScore,
            time_limit: timeLimit
        },
        content: JSON.stringify(questions)
    };

    try {
        if (id) {
            await update_test(payload);
            setReadOnly(true);
            setAdditionalOpened(false);
        } else {
            await create_test(payload);
        }
    } catch (error) {
        console.error('Failed to save test:', error);
    }
  };

  const addQuestion = () => {
    setQuestions(prev => [...prev, {
        id: crypto.randomUUID(),
        type: QUESTION_TYPES.SINGLE_CHOICE,
        question: '',
        points: 1,
        options: [{ id: crypto.randomUUID(), text: '', is_correct: false }]
    }]);
  };

  const updateQuestion = (q_id: string, data: TestQuestion) => {
    setQuestions(prev => prev.map(q => q.id === q_id ? data : q));
  };

  const removeQuestion = (q_id: string) => {
    if (questions.length > 1) {
        setQuestions(prev => prev.filter(q => q.id !== q_id));
    }
  };

  const duplicateQuestion = (index: number) => {
    const original = questions[index];
    const duplicated = { 
        ...original, 
        id: crypto.randomUUID(),
        options: original.options?.map(o => ({ ...o, id: crypto.randomUUID() }))
    };
    const new_questions = [...questions];
    new_questions.splice(index + 1, 0, duplicated);
    setQuestions(new_questions);
  };

  const handleMediaSelect = (item: { url: string; type: 'image' | 'video' | 'audio' | 'file' }) => {
    if (activeQuestionId) {
        setQuestions(prev => prev.map(q => q.id === activeQuestionId ? { 
            ...q, 
            media: { 
                type: item.type, 
                url: item.url,
                alignment: 'center',
                size: 100
            } 
        } : q));
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

  return (
    <Stack gap="xl" maw={1000} mx="auto" py="xl" pos="relative">
      <LoadingOverlay visible={is_loading_test || is_saving} overlayProps={{ blur: 2 }} zIndex={100} />
      
      {/* Header */}
      <Group justify="space-between" align="center" px="md" mb="md">
        <Button 
            variant="subtle" 
            color="gray" 
            leftSection={<IoChevronBackOutline size={18} />}
            onClick={handleBack}
            disabled={isPreview}
        >
            {t('editor.back')}
        </Button>
        
        {isPreview ? (
            <Group gap="md">
                {timeLimit && timeLeft !== null && (
                    <Paper withBorder px="md" py={4} radius="md" bg={timeLeft < 60 ? 'red.9' : 'gray.9'}>
                        <Group gap="xs">
                            <Text size="sm" fw={700} c="white" style={{ fontVariantNumeric: 'tabular-nums' }}>
                                {formatTime(timeLeft)}
                            </Text>
                        </Group>
                    </Paper>
                )}
                <Button 
                    variant="filled" 
                    color="orange" 
                    leftSection={<IoEyeOffOutline size={18} />}
                    onClick={() => { setIsPreview(false); setTimeLeft(null); }}
                    radius="md"
                >
                    {t('editor.back')}
                </Button>
            </Group>
        ) : readOnly ? (
            !is_student && (
                <Button 
                    variant="filled" 
                    color="primary" 
                    leftSection={<IoPencilOutline size={18} />}
                    onClick={() => setReadOnly(false)}
                    radius="md"
                >
                    {t('edit_test')}
                </Button>
            )
        ) : (
            <Group gap="sm">
                <Button 
                    variant="light" 
                    color="gray" 
                    leftSection={<IoEyeOutline size={18} />}
                    onClick={startPreview}
                    radius="md"
                >
                    {t('editor.preview')}
                </Button>
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

      <Paper p={readOnly || isPreview ? 0 : "xl"} radius="md" withBorder={!readOnly && !isPreview} bg="transparent">
        {readOnly || isPreview ? (
            <Title order={1} size="h1" fw={700} style={{ fontSize: rem(48), textAlign: 'center' }}>{title}</Title>
        ) : (
            <TextInput
                placeholder={t('table.name')}
                variant="unstyled"
                size="42px"
                value={title}
                onChange={(e) => setTitle(e.currentTarget.value)}
                styles={{
                    input: {
                        fontSize: '3rem',
                        fontWeight: 700,
                        height: 'auto',
                        padding: 0,
                        textAlign: 'center',
                    }
                }}
            />
        )}
      </Paper>

      <Stack gap="xl">
        {questions.map((q, index) => (
          <QuestionBlock 
            key={q.id}
            id={q.id}
            index={index}
            data={q}
            on_change={(data) => updateQuestion(q.id, data)}
            on_remove={() => removeQuestion(q.id)}
            on_duplicate={() => duplicateQuestion(index)}
            on_open_bank={(type) => { setActiveQuestionId(q.id); setBankType(type); setBankOpened(true); }}
            read_only={readOnly || isPreview}
            is_preview={isPreview}
          />
        ))}
      </Stack>

      {!readOnly && !isPreview && (
        <Group justify="center" mt="xl">
            <Button 
                variant="light" 
                color="primary"
                leftSection={<IoAddOutline size={20} />} 
                onClick={addQuestion}
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
                {t('editor.add_question')}
            </Button>
        </Group>
      )}

      {/* ADDITIONAL DRAWER */}
      <Drawer
        opened={additionalOpened}
        onClose={() => setAdditionalOpened(false)}
        title={common_t('additional')}
        position="right"
        size="md"
        padding="xl"
      >
        <Stack gap="xl">
            <Stack gap="xs">
                <Text size="sm" fw={600}>{t('editor.settings.title')}</Text>
                <Divider />
                <NumberInput 
                    label={t('editor.settings.passing_score')}
                    value={passingScore}
                    onChange={(val) => setPassingScore(Number(val))}
                    min={0} max={100}
                    variant="filled"
                />
                <NumberInput 
                    label={t('editor.settings.time_limit') + ` (${common_t('minutes')})`}
                    value={timeLimit || undefined}
                    onChange={(val) => setTimeLimit(val ? Number(val) : null)}
                    min={1}
                    variant="filled"
                    placeholder="∞"
                />
            </Stack>

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
                <Button 
                    variant="light" 
                    color="primary" 
                    size="36px"
                    p={0}
                    onClick={() => setCategoryDrawerOpened(true)}
                >
                    <IoAddOutline size={22} />
                </Button>
            </Group>

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
            <Text size="sm">{t('editor.discard_modal.message')}</Text>
            <Group justify="flex-end" gap="sm">
                <Button variant="light" color="gray" onClick={() => setDiscardModalOpened(false)}>
                    {t('editor.discard_modal.cancel')}
                </Button>
                <Button color="red" onClick={() => { setDiscardModalOpened(false); router.back(); }}>
                    {t('editor.discard_modal.confirm')}
                </Button>
            </Group>
        </Stack>
      </Modal>

      <Modal
        opened={isTimeOutModalOpened}
        onClose={() => { setIsTimeOutModalOpened(false); setIsPreview(false); setTimeLeft(null); }}
        title={t('editor.time_out_modal.title')}
        centered
        radius="md"
        withCloseButton={false}
        closeOnClickOutside={false}
      >
        <Stack gap="md">
            <Text size="sm">{t('editor.time_out_modal.message')}</Text>
            <Button 
                fullWidth 
                color="primary" 
                onClick={() => { setIsTimeOutModalOpened(false); setIsPreview(false); setTimeLeft(null); }}
            >
                {common_t('ok')}
            </Button>
        </Stack>
      </Modal>

      <CreateCategoryDrawer 
        opened={category_drawer_opened} 
        onClose={() => setCategoryDrawerOpened(false)}
        onSubmit={handle_category_create_submit}
        loading={is_cat_pending}
      />
    </Stack>
  );
}
