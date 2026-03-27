'use client';

import { useState, useEffect, useCallback } from 'react';
import { userActions } from '../../users/actions/user-actions';
import { notifications } from '@mantine/notifications';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { get_boards, create_board, delete_board as api_delete_board, update_board } from '../custom-board/actions/board-api';

export interface Board {
  id: string;
  title: string;
  elements: any[];
  settings?: any;
  updated_at: string;
  created_at: string;
  preview_url?: string | null;
}

/**
 * Hook for managing whiteboards using Backend API.
 */
export function useBoardData(userId: string, boardId?: string) {
  const t = useTranslations('Boards');
  const common_t = useTranslations('Common');
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [student_name, setStudentName] = useState('');
  const [boards, setBoards] = useState<Board[]>([]);
  const [current_board, setCurrentBoard] = useState<Board | null>(null);
  const [saving, setSaving] = useState(false);

  // Fetch student info from API
  const fetchStudentInfo = useCallback(async () => {
    if (!userId) return;
    try {
      const userData = await userActions.get_user(userId).catch(() => null);
      if (userData) {
        setStudentName(userData.name);
      }
    } catch (e) {}
  }, [userId]);

  const loadData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      // In your case, userId usually corresponds to space_id for personal boards or you can pass space_id explicitly
      // Assuming userId here is used as the space context
      const allBoards = await get_boards(userId);
      setBoards(allBoards as any);

      if (boardId) {
        const found = (allBoards as any).find((b: any) => b.id === boardId);
        setCurrentBoard(found || null);
      }
    } catch (err) {
      console.error('Failed to load boards from API:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, boardId]);

  useEffect(() => {
    loadData();
    fetchStudentInfo();
  }, [loadData, fetchStudentInfo]);

  const createBoard = async (title: string) => {
    if (!userId) return;
    setSaving(true);
    try {
      // Use userId as space_id context
      const newBoard = await create_board(userId, title);
      
      setBoards(prev => [newBoard as any, ...prev]);

      notifications.show({
        title: t('board_created'),
        message: '',
        color: 'green'
      });

      router.push(`/main/boards/${userId}/${newBoard.id}`);
      return newBoard;
    } catch (err) {
      notifications.show({
        title: common_t('error'),
        message: 'Could not create board on server',
        color: 'red'
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteBoard = async (id: string) => {
    try {
      await api_delete_board(id);
      setBoards(prev => prev.filter(b => b.id !== id));
      
      notifications.show({
        title: common_t('success'),
        message: '',
        color: 'green'
      });
    } catch (err) {
      notifications.show({
        title: common_t('error'),
        message: 'Failed to delete board',
        color: 'red'
      });
    }
  };

  const updateBoard = async (id: string, title: string) => {
    try {
      const updated = await update_board(id, { title });
      setBoards(prev => prev.map(b => b.id === id ? { ...b, title: updated.title } : b));
      notifications.show({
        title: common_t('success'),
        message: '',
        color: 'green'
      });
      return updated;
    } catch (err) {
      notifications.show({
        title: common_t('error'),
        message: 'Failed to update board',
        color: 'red'
      });
    }
  };

  return {
    loading,
    student_name,
    boards,
    current_board,
    saving,
    createBoard,
    deleteBoard,
    updateBoard,
    refreshList: loadData,
    refreshBoard: loadData
  };
}
