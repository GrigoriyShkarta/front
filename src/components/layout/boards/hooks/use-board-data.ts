'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { userActions } from '../../users/actions/user-actions';
import { notifications } from '@mantine/notifications';
import { useTranslations } from 'next-intl';

export function useBoardData(userId: string) {
  const t = useTranslations('Boards');
  const [loading, setLoading] = useState(true);
  const [student_name, setStudentName] = useState('');
  const [board_data, setBoardData] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const fetchBoard = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [boardRes, userData] = await Promise.all([
        api.get(`/boards/${userId}`).catch(() => ({ data: { elements: [], appState: {} } })),
        userActions.get_user(userId).catch(() => null)
      ]);
      
      setBoardData(boardRes.data);
      if (userData) {
        setStudentName(userData.name);
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchBoard();
  }, [fetchBoard]);

  const saveBoard = async (elements: any[], appState: any) => {
    if (!userId) return;
    setSaving(true);
    try {
      await api.patch(`/boards/${userId}`, { elements, appState });
      notifications.show({
        title: t('save_success'),
        message: '',
        color: 'green'
      });
    } catch (error) {
      notifications.show({
        title: t('save_error'),
        message: '',
        color: 'red'
      });
    } finally {
      setSaving(false);
    }
  };

  return {
    loading,
    student_name,
    board_data,
    saving,
    saveBoard,
    refresh: fetchBoard
  };
}
