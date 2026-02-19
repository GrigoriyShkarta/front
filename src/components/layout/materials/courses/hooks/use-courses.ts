import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { useTranslations } from 'next-intl';
import { courseActions } from '../actions/course-actions';
import { CreateCourseForm } from '../schemas/course-schema';

interface UseCoursesProps {
    page?: number;
    limit?: number;
    search?: string;
    category_ids?: string[];
}

export function useCourses({ page = 1, limit = 15, search = '', category_ids = [] }: UseCoursesProps = {}) {
    const queryClient = useQueryClient();
    const t = useTranslations('Materials.courses');
    const common_t = useTranslations('Common');

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['courses', { page, limit, search, category_ids }],
        queryFn: () => courseActions.get_courses({ page, limit, search, category_ids }),
        placeholderData: (previousData) => previousData,
    });

    const createMutation = useMutation({
        mutationFn: (data: CreateCourseForm) => courseActions.create_course(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courses'] });
            notifications.show({
                title: t('notifications.save_success'),
                message: '',
                color: 'green'
            });
        },
        onError: () => {
            notifications.show({
                title: t('notifications.save_error'),
                message: '',
                color: 'red'
            });
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: CreateCourseForm }) => 
            courseActions.update_course(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courses'] });
            notifications.show({
                title: t('notifications.save_success'),
                message: '',
                color: 'green'
            });
        },
        onError: () => {
            notifications.show({
                title: t('notifications.save_error'),
                message: '',
                color: 'red'
            });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => courseActions.delete_course(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courses'] });
            notifications.show({
                title: t('notifications.delete_success'),
                message: '',
                color: 'green'
            });
        },
        onError: () => {
            notifications.show({
                title: t('notifications.delete_error'),
                message: '',
                color: 'red'
            });
        }
    });

    const bulkDeleteMutation = useMutation({
        mutationFn: (ids: string[]) => courseActions.bulk_delete_courses(ids),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courses'] });
            notifications.show({
                title: t('notifications.delete_success'),
                message: '',
                color: 'green'
            });
        },
        onError: () => {
            notifications.show({
                title: t('notifications.delete_error'),
                message: '',
                color: 'red'
            });
        }
    });

    const handle_create = async (data: CreateCourseForm) => {
        try {
            const res = await createMutation.mutateAsync(data);
            return !!res.success;
        } catch (error) {
            return false;
        }
    };

    const handle_update = async (id: string, data: CreateCourseForm) => {
        try {
            const res = await updateMutation.mutateAsync({ id, data });
            return !!res.success;
        } catch (error) {
            return false;
        }
    };

    return {
        courses: data?.data || [],
        is_loading: isLoading,
        is_saving: createMutation.isPending || updateMutation.isPending,
        is_deleting: deleteMutation.isPending,
        is_bulk_deleting: bulkDeleteMutation.isPending,
        total_pages: data?.meta.total_pages || 1,
        total_items: data?.meta.total_items || 0,
        create_course: handle_create,
        update_course: handle_update,
        delete_course: deleteMutation.mutateAsync,
        bulk_delete: bulkDeleteMutation.mutateAsync,
        refresh: refetch
    };
}
