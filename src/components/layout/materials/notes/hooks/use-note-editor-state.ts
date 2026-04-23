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
}

export function useNoteEditorState({ id, is_read_only, is_access_mode, pinned_student_id, student_name, prevent_redirect }: UseNoteEditorStateProps) {
  const t = useTranslations('Materials.note');
  const common_t = useTranslations('Common');
  const router = useRouter();
  const { user } = useAuth();
  const is_student = user?.role === 'student';

  const { note, is_loading_note, is_saving, create_note, update_note } = useNoteEditor({ id, pinned_student_id, prevent_redirect });
  
  const { is_dragging_block, set_is_dragging_block } = useBlockDragging();
  
  const [readOnly, setReadOnly] = useState(is_read_only || is_access_mode);
  const [title, setTitle] = useState('');
  
  const [discardModalOpened, setDiscardModalOpened] = useState(false);
  const [additionalOpened, setAdditionalOpened] = useState(false);
  
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [studentIds, setStudentIds] = useState<string[]>([]);
  
  const { categories: all_categories, create_category, create_categories } = useCategories();
  const { users: all_students } = useUsersQuery({ role: 'student' });
  
  const [category_drawer_opened, setCategoryDrawerOpened] = useState(false);

  const [content, setContent] = useState<string | null>(null);
  const editorRef = useRef<BlockNoteEditorRef | null>(null);

  useEffect(() => {
    if (note) {
        setTitle(note.title);
        setCategoryIds(note.categories?.map(c => c.id) || []);
        
        const accessList = note.access || note.accesses || [];
        const existingStudentIds = accessList.map((a: any) => a.student?.id || a.student_id).filter(Boolean) as string[];
        setStudentIds(existingStudentIds);

        if (content === null) {
            setContent(typeof note.content === 'string' 
                ? note.content 
                : JSON.stringify(note.content || []));
        }
    } else if (!id && content === null) {
        setContent('');
        if (student_name && pinned_student_id) {
            setTitle(`${student_name} (${pinned_student_id})`);
        }
    }
  }, [note, id, content, student_name, pinned_student_id]);

  const isDirty = title.trim() !== '' || (content !== null && content !== '' && content !== '[]');

  const handleBack = () => {
    if (isDirty && !id && !readOnly) {
        setDiscardModalOpened(true);
    } else {
        router.back();
    }
  };

  const handleSave = async () => {
    const finalTitle = (student_name && pinned_student_id) 
        ? `${student_name} (${pinned_student_id})` 
        : (title || t('editor.untitled'));

    const payload = {
        title: finalTitle,
        category_ids: categoryIds,
        student_ids: studentIds,
        content: content || '[]',
        pinned_student_id: pinned_student_id || null
    };

    try {
        if (id) {
            await update_note(payload);
            setReadOnly(true);
            setAdditionalOpened(false);
        } else {
            await create_note(payload);
            setReadOnly(true);
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
    content, setContent: (val: string) => setContent(val),
    editorRef, handleBack,
    handleSave, openBank, handleMediaSelect,
    handle_category_create_submit, router,
    is_dragging_block, set_is_dragging_block
  };
}
