'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useNoteEditor } from '../hooks/use-note-editor';
import { useCategories } from '@/components/layout/categories/hooks/use-categories';
import { useUsersQuery } from '@/components/layout/users/hooks/use-users-query';
import { BlockNoteEditorRef } from '@/components/layout/materials/lessons/components/editor/block-note';
import { CreateCategoryForm } from '@/components/layout/categories/schemas/category-schema';
import { useBlockDragging } from '@/components/layout/materials/lessons/hooks/use-block-dragging';

interface UseNoteEditorStateProps {
    id?: string;
    is_read_only: boolean;
    is_access_mode: boolean;
    pinned_student_id?: string;
    student_name?: string;
    prevent_redirect?: boolean;
    force_new?: boolean;
    disable_auto_save?: boolean;
    onIdChange?: (id: string) => void;
}

export function useNoteEditorState({ 
    id, is_read_only, is_access_mode, pinned_student_id, student_name, 
    prevent_redirect, force_new, disable_auto_save, onIdChange 
}: UseNoteEditorStateProps) {
  const t = useTranslations('Materials.note');
  const common_t = useTranslations('Common');
  const router = useRouter();
  const { user } = useAuth();
  const is_student = user?.role === 'student';

  const [currentId, setCurrentId] = useState<string | undefined>(id);

  const { note, is_loading_note, is_saving, create_note, update_note } = useNoteEditor({ id: currentId, pinned_student_id, prevent_redirect, force_new });
  
  const { is_dragging_block, set_is_dragging_block } = useBlockDragging();
  
  const [readOnly, setReadOnly] = useState(is_read_only || is_access_mode);
  const [title, setTitle] = useState('');
  
  const [discardModalOpened, setDiscardModalOpened] = useState(false);
  const [additionalOpened, setAdditionalOpened] = useState(false);
  
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [studentIds, setStudentIds] = useState<string[]>([]);
  const [hasStudentAccess, setHasStudentAccess] = useState(false);
  
  const { categories: all_categories, create_category, create_categories } = useCategories();
  const { users: all_students } = useUsersQuery({ role: 'student' });
  
  const [category_drawer_opened, setCategoryDrawerOpened] = useState(false);

  const [content, setContent] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const editorRef = useRef<BlockNoteEditorRef | null>(null);

  useEffect(() => {
    if (force_new && content === null) {
        setContent('');
        if (student_name && !title) {
            const date = new Date().toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' });
            setTitle(`${student_name} - ${date}`);
        }
        setIsInitialized(true);
        return;
    }

    if (note && !isInitialized) {
        setTitle(note.title);
        setCategoryIds(note.categories?.map(c => c.id) || []);
        
        const accessList = note.access || note.accesses || [];
        const existingStudentIds = accessList.map((a: any) => a.student?.id || a.student_id).filter(Boolean) as string[];
        setStudentIds(existingStudentIds);

        if (pinned_student_id && existingStudentIds.includes(pinned_student_id)) {
            setHasStudentAccess(true);
        }

        if (content === null) {
            setContent(typeof note.content === 'string' 
                ? note.content 
                : JSON.stringify(note.content || []));
        }
        setIsInitialized(true);
    } else if (!id && !pinned_student_id && content === null) {
        // Only auto-initialize empty if we aren't waiting for a pinned note
        setContent('');
        setIsInitialized(true);
    } else if (!id && pinned_student_id && !is_loading_note && (note === undefined || note === null) && content === null) {
        // If we were looking for a pinned note, but it doesn't exist (note is null/undefined after loading)
        setContent('');
        if (student_name) {
            const date = new Date().toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' });
            setTitle(`${student_name} - ${date}`);
        }
        setIsInitialized(true);
    }
  }, [note, id, content, student_name, pinned_student_id, is_loading_note, force_new, isInitialized]);

  // Auto-save logic for pinned notes
  useEffect(() => {
    if (!pinned_student_id || !content || is_loading_note || readOnly || disable_auto_save) return;
    
    const timer = setTimeout(() => {
        handleSave(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [content, hasStudentAccess]);

  const isDirty = title.trim() !== '' || (content !== null && content !== '' && content !== '[]');

  const handleBack = () => {
    if (isDirty && !currentId && !readOnly) {
        setDiscardModalOpened(true);
    } else {
        router.back();
    }
  };

  const handleSave = async (is_auto_save: boolean | any = false) => {
    const is_auto = typeof is_auto_save === 'boolean' ? is_auto_save : false;

    const finalTitle = (student_name && pinned_student_id) 
        ? `${student_name} - ${new Date().toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' })}` 
        : (title || t('editor.untitled'));

    // Ensure current student is added/removed based on hasStudentAccess
    const finalStudentIds = studentIds.filter(id => id !== pinned_student_id);
    if (hasStudentAccess && pinned_student_id) {
        finalStudentIds.push(pinned_student_id);
    }

    const payload: any = {
        title: finalTitle,
        category_ids: categoryIds,
        student_ids: finalStudentIds,
        access: finalStudentIds,
        content: content || '[]',
        pinned_student_id: null
    };

    try {
        if (currentId) {
            await update_note(payload, { hide_notification: is_auto });
            if (!is_auto) {
                setReadOnly(true);
                setAdditionalOpened(false);
            }
        } else {
            const new_note = await create_note(payload, { hide_notification: is_auto });
            if (new_note?.id) {
                setCurrentId(new_note.id);
                onIdChange?.(new_note.id);
            }
            if (!is_auto) {
                setReadOnly(true);
            }
        }
    } catch (error) {
        console.error('Failed to save note:', error);
    }
  };

  const openBank = (type: 'image' | 'video' | 'audio' | 'file') => {
    // We can directly open bank but BlockNote Editor handles media insertion internally usually 
    // unless we specifically need an external button. 
    // However, we removed bankOpened state since the user just wants the simple BlockNote Editor.
  };

  const handleMediaSelect = (item: { id: string; url: string; type: 'image' | 'video' | 'audio' | 'file' }) => {
    if (editorRef.current) {
      editorRef.current.insert_media(item.id, item.url, item.type);
    }
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
    t, common_t, user, is_student, note, is_loading_note, is_saving,
    readOnly, setReadOnly, title, setTitle,
    discardModalOpened, setDiscardModalOpened, additionalOpened, setAdditionalOpened,
    categoryIds, setCategoryIds, studentIds, setStudentIds,
    all_categories, all_students,
    category_drawer_opened, setCategoryDrawerOpened,
    hasStudentAccess, setHasStudentAccess,
    content, setContent: (val: string) => setContent(val),
    editorRef, handleBack,
    handleSave, openBank, handleMediaSelect,
    handle_category_create_submit, router,
    is_dragging_block, set_is_dragging_block
  };
}
