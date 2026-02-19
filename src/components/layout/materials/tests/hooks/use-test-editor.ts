import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { testActions } from '@/components/layout/materials/tests/actions/test-actions';
import { notifications } from '@mantine/notifications';
import { useRouter } from '@/i18n/routing';
import { CreateTestForm } from '@/components/layout/materials/tests/schemas/test-schema';
import { useTranslations } from 'next-intl';

interface EditorProps {
    id?: string;
}

export function useTestEditor({ id }: EditorProps = {}) {
    const queryClient = useQueryClient();
    const router = useRouter();
    const t = useTranslations('Materials.tests.notifications');

    const { data: test, isLoading: is_loading_test } = useQuery({
        queryKey: ['test', id],
        queryFn: () => testActions.get_test(id!),
        enabled: !!id,
    });

    const createMutation = useMutation({
        mutationFn: (data: CreateTestForm) => testActions.create_test(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tests'] });
            notifications.show({
                title: 'Success',
                message: 'Тест успішно створено', // TODO: use translation if available
                color: 'green',
            });
            router.push('/main/materials/tests');
        },
        onError: () => {
            notifications.show({
                title: 'Error',
                message: 'Не вдалося створити тест',
                color: 'red',
            });
        }
    });

    const updateMutation = useMutation({
        mutationFn: (data: Partial<CreateTestForm>) => testActions.update_test(id!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tests'] });
            queryClient.invalidateQueries({ queryKey: ['test', id] });
            notifications.show({
                title: 'Success',
                message: 'Тест успішно оновлено',
                color: 'green',
            });
        },
        onError: () => {
            notifications.show({
                title: 'Error',
                message: 'Не вдалося оновити тест',
                color: 'red',
            });
        }
    });

    return {
        test,
        is_loading_test,
        is_saving: createMutation.isPending || updateMutation.isPending,
        create_test: createMutation.mutateAsync,
        update_test: updateMutation.mutateAsync,
    };
}
