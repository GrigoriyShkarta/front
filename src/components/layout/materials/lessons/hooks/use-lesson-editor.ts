import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { lessonActions } from '../actions/lesson-actions';
import { notifications } from '@mantine/notifications';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { CreateLessonForm } from '../schemas/lesson-schema';

interface EditorProps {
    id?: string;
}

export function useLessonEditor({ id }: EditorProps = {}) {
    const queryClient = useQueryClient();
    const router = useRouter();
    const t = useTranslations('Materials.lessons');
    const common_t = useTranslations('Common');

    const { data: lesson, isLoading: is_loading_lesson } = useQuery({
        queryKey: ['lesson', id],
        queryFn: () => lessonActions.get_lesson(id!),
        enabled: !!id,
    });

    const createMutation = useMutation({
        mutationFn: (data: CreateLessonForm) => lessonActions.create_lesson(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lessons'] });
            notifications.show({
                title: common_t('success'),
                message: t('notifications.create_success'),
                color: 'green',
            });
            router.push('/main/materials/lessons');
        },
        onError: () => {
            notifications.show({
                title: common_t('error'),
                message: t('notifications.create_error'),
                color: 'red',
            });
        }
    });

    const updateMutation = useMutation({
        mutationFn: (data: Partial<CreateLessonForm>) => lessonActions.update_lesson(id!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lessons'] });
            queryClient.invalidateQueries({ queryKey: ['lesson', id] });
            notifications.show({
                title: common_t('success'),
                message: t('notifications.update_success'),
                color: 'green',
            });
        },
        onError: () => {
            notifications.show({
                title: common_t('error'),
                message: t('notifications.update_error'),
                color: 'red',
            });
        }
    });

    return {
        lesson,
        is_loading_lesson,
        is_saving: createMutation.isPending || updateMutation.isPending,
        create_lesson: createMutation.mutateAsync,
        update_lesson: updateMutation.mutateAsync,
    };
}
