import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { homeworkActions } from '../actions/homework-actions';
import { notifications } from '@mantine/notifications';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { CreateHomeworkForm } from '../schemas/homework-schema';

interface EditorProps {
    id?: string;
}

export function useHomeworkEditor({ id }: EditorProps = {}) {
    const queryClient = useQueryClient();
    const router = useRouter();
    const t = useTranslations('Materials.homework');
    const common_t = useTranslations('Common');

    const { data: homework, isLoading: is_loading_homework } = useQuery({
        queryKey: ['homework', id],
        queryFn: () => homeworkActions.get_homework(id!),
        enabled: !!id,
    });


    const createMutation = useMutation({
        mutationFn: (data: CreateHomeworkForm) => homeworkActions.create_homework(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['homeworks'] });
            notifications.show({
                title: common_t('success'),
                message: t('notifications.create_success'),
                color: 'green',
            });
            router.push('/main/materials/homework');
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
        mutationFn: (data: Partial<CreateHomeworkForm>) => homeworkActions.update_homework(id!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['homeworks'] });
            queryClient.invalidateQueries({ queryKey: ['homework', id] });
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
        homework,
        is_loading_homework,
        is_saving: createMutation.isPending || updateMutation.isPending,
        create_homework: createMutation.mutateAsync,
        update_homework: updateMutation.mutateAsync,
    };
}
