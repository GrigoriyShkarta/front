import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { noteActions } from '../actions/note-actions';
import { notifications } from '@mantine/notifications';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { CreateNoteForm } from '../schemas/note-schema';

interface EditorProps {
    id?: string;
    pinned_student_id?: string;
    prevent_redirect?: boolean;
}

export function useNoteEditor({ id, pinned_student_id, prevent_redirect = false }: EditorProps = {}) {
    const queryClient = useQueryClient();
    const router = useRouter();
    const t = useTranslations('Materials.notes');
    const common_t = useTranslations('Common');

    const { data: note, isLoading: is_loading_note } = useQuery({
        queryKey: id ? ['note', id] : ['note', 'pinned', pinned_student_id],
        queryFn: () => id 
            ? noteActions.get_note(id) 
            : pinned_student_id 
                ? noteActions.get_pinned_note(pinned_student_id)
                : null,
        enabled: !!id || !!pinned_student_id,
    });

    const createMutation = useMutation({
        mutationFn: (data: CreateNoteForm) => noteActions.create_note(data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['notes'] });
            notifications.show({
                title: common_t('success'),
                message: t('notifications.create_success'),
                color: 'green',
            });
            
            if (!prevent_redirect) {
                router.push('/main/materials/notes');
            }
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
        mutationFn: (data: Partial<CreateNoteForm>) => noteActions.update_note(id!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notes'] });
            queryClient.invalidateQueries({ queryKey: ['note', id] });
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
        note,
        is_loading_note,
        is_saving: createMutation.isPending || updateMutation.isPending,
        create_note: createMutation.mutateAsync,
        update_note: updateMutation.mutateAsync,
    };
}
