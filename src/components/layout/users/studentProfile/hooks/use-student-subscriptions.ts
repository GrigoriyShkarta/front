'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentSubscriptionActions } from '../actions/student-subscription-actions';
import { notifications } from '@mantine/notifications';
import { useTranslations } from 'next-intl';

export const useStudentSubscriptions = (studentId: string) => {
  const queryClient = useQueryClient();
  const common_t = useTranslations('Common');
  const finance_t = useTranslations('Finance.subscriptions.notifications');
  const materials_t = useTranslations('Materials.lessons.notifications');

  const query = useQuery({
    queryKey: ['student-subscriptions', studentId],
    queryFn: () => studentSubscriptionActions.get_student_subscriptions(studentId),
    enabled: !!studentId,
  });

  const create_mutation = useMutation({
    mutationFn: (data: any) => studentSubscriptionActions.create_student_subscription(studentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-subscriptions', studentId] });
      queryClient.invalidateQueries({ queryKey: ['finance'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      notifications.show({
        title: common_t('success'),
        message: finance_t('create_success'),
        color: 'green',
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: common_t('error'),
        message: error?.response?.data?.message || finance_t('create_error'),
        color: 'red',
      });
    },
  });

  const update_mutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => studentSubscriptionActions.update_student_subscription(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-subscriptions', studentId] });
      queryClient.invalidateQueries({ queryKey: ['finance'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      notifications.show({
        title: common_t('success'),
        message: finance_t('update_success'),
        color: 'green',
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: common_t('error'),
        message: error?.response?.data?.message || finance_t('update_error'),
        color: 'red',
      });
    },
  });

  const update_lesson_mutation = useMutation({
    mutationFn: ({ lessonId, data }: { lessonId: string; data: any }) => studentSubscriptionActions.update_lesson(lessonId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-subscriptions', studentId] });
      queryClient.invalidateQueries({ queryKey: ['finance'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      notifications.show({
        title: common_t('success'),
        message: materials_t('update_success'),
        color: 'green',
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: common_t('error'),
        message: error?.response?.data?.message || materials_t('update_error'),
        color: 'red',
      });
    },
  });

  const update_lesson_recording_mutation = useMutation({
    mutationFn: ({ lessonId, data }: { lessonId: string; data: { recording_url: string } }) => studentSubscriptionActions.update_lesson_recording(lessonId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-subscriptions', studentId] });
      queryClient.invalidateQueries({ queryKey: ['finance'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      notifications.show({
        title: common_t('success'),
        message: materials_t('update_success'),
        color: 'green',
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: common_t('error'),
        message: error?.response?.data?.message || materials_t('update_error'),
        color: 'red',
      });
    },
  });

  const delete_lesson_recording_mutation = useMutation({
    mutationFn: (lessonId: string) => studentSubscriptionActions.delete_lesson_recording(lessonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-subscriptions', studentId] });
      queryClient.invalidateQueries({ queryKey: ['finance'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      notifications.show({
        title: common_t('success'),
        message: materials_t('update_success'),
        color: 'green',
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: common_t('error'),
        message: error?.response?.data?.message || materials_t('update_error'),
        color: 'red',
      });
    },
  });

  const delete_mutation = useMutation({
    mutationFn: (id: string) => studentSubscriptionActions.delete_student_subscription(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-subscriptions', studentId] });
      queryClient.invalidateQueries({ queryKey: ['finance'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      notifications.show({
        title: common_t('success'),
        message: finance_t('delete_success'),
        color: 'green',
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: common_t('error'),
        message: error?.response?.data?.message || finance_t('delete_error'),
        color: 'red',
      });
    },
  });

  return {
    subscriptions: query.data || [],
    is_loading: query.isLoading,
    is_error: query.isError,
    is_creating: create_mutation.isPending,
    is_updating: update_mutation.isPending,
    is_updating_lesson: update_lesson_mutation.isPending,
    is_updating_lesson_recording: update_lesson_recording_mutation.isPending,
    is_deleting_lesson_recording: delete_lesson_recording_mutation.isPending,
    is_deleting: delete_mutation.isPending,
    create_subscription: create_mutation.mutateAsync,
    update_subscription: update_mutation.mutateAsync,
    update_lesson: update_lesson_mutation.mutateAsync,
    update_lesson_recording: update_lesson_recording_mutation.mutateAsync,
    delete_lesson_recording: delete_lesson_recording_mutation.mutateAsync,
    delete_subscription: delete_mutation.mutateAsync,
    refresh: query.refetch,
  };
};
