'use client';

import { useState, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { useLessonEditor } from '../hooks/use-lesson-editor';
import { useCategories } from '@/components/layout/categories/hooks/use-categories';
import { useCourses } from '@/components/layout/materials/courses/hooks/use-courses';
import { useTests } from '@/components/layout/materials/tests/hooks/use-tests';
import { useHomework } from '@/components/layout/materials/homework/hooks/use-homework';
import { homeworkActions } from '@/components/layout/materials/homework/actions/homework-actions';
import { useCourse } from '@/components/layout/materials/courses/hooks/use-course';
import { useLessons } from '@/components/layout/materials/lessons/hooks/use-lessons';
import { BlockNoteEditorRef } from '../components/editor/block-note';
import { CreateCategoryForm } from '@/components/layout/categories/schemas/category-schema';
import { useBlockDragging } from './use-block-dragging';
import { useUsersQuery } from '@/components/layout/users/hooks/use-users-query';


export interface LessonBlock {
  id: string;
  content: string;
  is_locked?: boolean;
}

interface UseLessonEditorStateProps {
    id?: string;
    student_id?: string;
    course_id?: string;
    is_read_only: boolean;
    is_access_mode: boolean;
}

export function useLessonEditorState({ id, student_id, course_id, is_read_only, is_access_mode }: UseLessonEditorStateProps) {
  const t = useTranslations('Materials.lessons');
  const common_t = useTranslations('Common');
  const tHw = useTranslations('Materials.homework');
  const router = useRouter();
  const { user } = useAuth();
  const is_student = user?.role === 'student';
  const queryClient = useQueryClient();

  const { lesson, is_loading_lesson, is_saving, create_lesson, update_lesson } = useLessonEditor({ id, student_id });
  
  const { is_dragging_block, set_is_dragging_block } = useBlockDragging();
  
  const [readOnly, setReadOnly] = useState(is_read_only || is_access_mode);
  const [title, setTitle] = useState('');
  const [accessible_block_ids, set_accessible_block_ids] = useState<string[]>([]);
  const [full_access, set_full_access] = useState(true);
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
  const [addFilesToMaterials, setAddFilesToMaterials] = useState(true);
  
  const { categories: all_categories, create_category, create_categories } = useCategories();
  const { courses: all_courses } = useCourses({ limit: 100 });
  const { tests: all_tests } = useTests({ limit: 1000 });
  const { homeworks: all_homeworks } = useHomework({ limit: 1000 });
  
  const [homeworkId, setHomeworkId] = useState<string | null>(null);
  const [is_creating_hw, setIsCreatingHw] = useState(false);
  const [is_editing_hw, setIsEditingHw] = useState(false);
  const [hw_content, setHwContent] = useState('[]');
  const [is_saving_hw, setIsSavingHw] = useState(false);
  const [category_drawer_opened, setCategoryDrawerOpened] = useState(false);
  const [deleteHwModalOpened, setDeleteHwModalOpened] = useState(false);

  const [studentIds, setStudentIds] = useState<string[]>([]);
  const { users: all_users } = useUsersQuery({ role: 'student', limit: 1000 });

  const { course: context_course, is_loading: is_loading_context_course } = useCourse(course_id || '');
  const { lessons: all_lessons_context } = useLessons({ page: 1, limit: 1000, search: '' });

  const [sidebar_opened, setSidebarOpened] = useState(true);

  const [blocks, setBlocks] = useState<LessonBlock[]>([
    { id: crypto.randomUUID(), content: '' }
  ]);
  
  const [bankOpened, setBankOpened] = useState(false);
  const [bankType, setBankType] = useState<'image' | 'video' | 'audio' | 'file'>('image');
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  
  const dragStartY = useRef(0);
  const dragStartPos = useRef(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRefs = useRef<Record<string, BlockNoteEditorRef | null>>({});

  useEffect(() => {
    if (lesson) {
        setTitle(lesson.name);
        setCover(lesson.cover_url || null);
        setCoverPosition(lesson.cover_position || 50);
        setCategoryIds(lesson.categories?.map(c => c.id) || []);
        setCourseIds(lesson.course_ids || lesson.courses?.map((c: any) => c.id) || []);
        setDuration(lesson.duration || null);
        setIsCopyingDisabled(lesson.is_copying_disabled || false);
        setAddFilesToMaterials(lesson.add_files_to_materials ?? true);
        if (lesson.homework_id || lesson.homework?.id) {
            setHomeworkId(lesson.homework_id || lesson.homework?.id || null);
            if (lesson.homework) {
                setHwContent(typeof lesson.homework.content === 'string' 
                    ? lesson.homework.content 
                    : JSON.stringify(lesson.homework.content || []));
            }
        }
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
        if (lesson.accessible_blocks) {
            set_accessible_block_ids(lesson.accessible_blocks);
        }
        if (lesson.full_access !== undefined) {
            set_full_access(lesson.full_access);
        }
        if (lesson.accessible_student_ids) {
            setStudentIds(lesson.accessible_student_ids);
        }
    }
  }, [lesson]);

  useEffect(() => {
    if (full_access && blocks.length > 0) {
        set_accessible_block_ids(blocks.map(b => b.id));
    }
  }, [full_access, blocks.length]);

  const isDirty = title.trim() !== '' || cover !== null || blocks.some(b => b.content !== '' && b.content !== '[]' && b.content !== ' ');

  const handleBack = () => {
    if (isDirty && !id && !readOnly) {
        setDiscardModalOpened(true);
    } else {
        router.back();
    }
  };



  const handle_delete_homework = async () => {
    if (!homeworkId) return;
    setIsSavingHw(true);
    try {
        await homeworkActions.delete_homework(homeworkId);
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['lesson', id] }),
            queryClient.invalidateQueries({ queryKey: ['homeworks'] }),
            queryClient.refetchQueries({ queryKey: ['lesson', id] }),
            queryClient.refetchQueries({ queryKey: ['homeworks'] })
        ]);
        setHomeworkId(null);
        notifications.show({
            title: common_t('success'), message: tHw('notifications.delete_success'), color: 'green'
        });
    } catch (e) {
        notifications.show({
            title: common_t('error'), message: tHw('notifications.delete_error'), color: 'red'
        });
    } finally {
        setIsSavingHw(false);
    }
  };

  const handleSave = async () => {
    let currentHomeworkId = homeworkId;

    if (!readOnly && (is_creating_hw || homeworkId)) {
        setIsSavingHw(true);
        try {
            if (homeworkId) {
                await homeworkActions.update_homework(homeworkId, {
                    name: title,
                    content: Array.isArray(JSON.parse(hw_content)) ? JSON.parse(hw_content) : [],
                });
            } else if (is_creating_hw) {
                const result = await homeworkActions.create_homework({
                    name: title,
                    content: Array.isArray(JSON.parse(hw_content)) ? JSON.parse(hw_content) : [],
                    lesson_id: id || null,
                    category_ids: [],
                    can_retake: false
                });
                currentHomeworkId = result.id;
                setHomeworkId(currentHomeworkId);
            }
        } catch (error) {
            console.error('Failed to save homework:', error);
            notifications.show({
                title: common_t('error'),
                message: homeworkId ? tHw('notifications.update_error') : tHw('notifications.create_error'),
                color: 'red'
            });
            setIsSavingHw(false);
            return; 
        }
        setIsSavingHw(false);
    }

    const payload = {
        name: title,
        cover_url: cover,
        cover_position: coverPosition,
        category_ids: categoryIds,
        course_ids: courseIds,
        duration: duration ? Number(duration) : null,
        is_copying_disabled: isCopyingDisabled,
        add_files_to_materials: addFilesToMaterials,
        homework_id: currentHomeworkId,
        student_ids: studentIds,
        content: JSON.stringify(blocks.map((b, i) => ({
            id: b.id,
            content: b.content,
            order: i
        })))
    };

    try {
        if (id) {
            await update_lesson(payload);
            
            // Invalidate queries to ensure homework updates propagate
            queryClient.invalidateQueries({ queryKey: ['lesson', id] });
            queryClient.invalidateQueries({ queryKey: ['homeworks'] });

            setReadOnly(true);
            setIsCreatingHw(false);
            setAdditionalOpened(false);
        } else {
            await create_lesson(payload);
            setReadOnly(true);
            setIsCreatingHw(false);
        }
    } catch (error) {
        console.error('Failed to save lesson:', error);
    }
  };

  const [is_saving_access, set_is_saving_access] = useState(false);
  const handleSaveAccess = async () => {
    if (!student_id || !id) return;
    set_is_saving_access(true);
    try {
        await api.post('/materials/access/grant', {
            student_ids: [student_id],
            material_ids: [id],
            material_type: 'lesson',
            full_access: full_access,
            accessible_blocks: accessible_block_ids
        });
        notifications.show({
            title: common_t('success'), message: t('notifications.update_success'), color: 'green'
        });
        queryClient.invalidateQueries({ queryKey: ['lesson', id, student_id] });
    } catch (error: any) {
        notifications.show({
            title: common_t('error'), message: error?.response?.data?.message || error?.message, color: 'red'
        });
    } finally {
        set_is_saving_access(false);
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
    const movement = (deltaY / containerHeight) * 100;
    const newPos = Math.max(0, Math.min(100, dragStartPos.current - movement));
    setCoverPosition(newPos);
  };

  const handleMouseUp = () => setIsDragging(false);

  const addBlock = () => setBlocks(prev => [...prev, { id: crypto.randomUUID(), content: '' }]);

  const removeBlock = (id: string) => {
    if (blocks.length > 1) {
      setBlocks(prev => prev.filter(b => b.id !== id));
      delete editorRefs.current[id];
    }
  };

  const updateBlockContent = (id: string, content: string) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, content } : b));
  };

  const handleToggleBlockAccess = (blockId: string, checked: boolean) => {
    set_accessible_block_ids(prev => {
        if (checked) {
            return [...new Set([...prev, blockId])];
        } else {
            set_full_access(false);
            return prev.filter(id => id !== blockId);
        }
    });
  };

  const handleToggleFullAccess = (checked: boolean) => {
    set_full_access(checked);
    if (checked) set_accessible_block_ids(blocks.map(b => b.id));
  };

  const openBank = (blockId: string, type: 'image' | 'video' | 'audio' | 'file') => {
    setActiveBlockId(blockId);
    setBankType(type);
    setBankOpened(true);
  };

  const handleMediaSelect = (item: { id: string; url: string; type: 'image' | 'video' | 'audio' | 'file' }) => {
    if (activeBlockId === 'cover') {
        setCover(item.url);
        setCoverPosition(50);
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

  return {
    t, common_t, tHw, user, is_student, lesson, is_loading_lesson, is_saving,
    readOnly, setReadOnly, title, setTitle, accessible_block_ids, set_accessible_block_ids,
    full_access, set_full_access, cover, setCover, coverPosition, setCoverPosition,
    isRepositioning, setIsRepositioning, isDragging, setIsDragging, discardModalOpened, 
    setDiscardModalOpened, additionalOpened, setAdditionalOpened, duration, setDuration,
    categoryIds, setCategoryIds, courseIds, setCourseIds, isCopyingDisabled, setIsCopyingDisabled,
    addFilesToMaterials, setAddFilesToMaterials, all_categories, all_courses, all_tests, all_homeworks,
    homeworkId, setHomeworkId, is_creating_hw, setIsCreatingHw, is_editing_hw, setIsEditingHw,
    hw_content, setHwContent, is_saving_hw, setIsSavingHw, category_drawer_opened, setCategoryDrawerOpened,
    context_course, is_loading_context_course, all_lessons_context, sidebar_opened, setSidebarOpened,
    blocks, setBlocks, bankOpened, setBankOpened, bankType, setBankType, activeBlockId, setActiveBlockId,
    dragStartY, dragStartPos, containerRef, editorRefs, handleBack,
    handle_delete_homework, handleSave, is_saving_access, handleSaveAccess, startRepositioning,
    handleMouseDown, handleMouseMove, handleMouseUp, addBlock, removeBlock, updateBlockContent,
    handleToggleBlockAccess, handleToggleFullAccess, openBank, handleMediaSelect, moveBlock,
    handle_category_create_submit, router, deleteHwModalOpened, setDeleteHwModalOpened,
    is_dragging_block, set_is_dragging_block, studentIds, setStudentIds, all_users
  };
}
