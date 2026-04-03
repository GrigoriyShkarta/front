import { useTranslations } from 'next-intl';

import { notifications } from '@mantine/notifications';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { homeworkSubmissionActions } from '../actions/homework-submission-actions';

export function useHomeworkSubmission(homework_id?: string) {
    const queryClient = useQueryClient();
    const common_t = useTranslations('Common');
    const t = useTranslations('Materials.homework.submission');

    const { data: my_submission, isLoading: is_loading_submission } = useQuery({
        queryKey: ['homework_submission', homework_id],
        queryFn: () => homeworkSubmissionActions.get_my_submission(homework_id!),
        enabled: !!homework_id,
    });

    const submit_mutation = useMutation({
        mutationFn: ({ text, file_urls, files }: { text: string, file_urls: string[], files?: File[] }) => 
            homeworkSubmissionActions.submit(homework_id!, text, file_urls, files),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['homework_submission', homework_id] });
            notifications.show({
                title: common_t('success'),
                message: t('submit_success'),
                color: 'green',
            });
        },
        onError: () => {
            notifications.show({
                title: common_t('error'),
                message: t('submit_error'),
                color: 'red',
            });
        }
    });

    return {
        my_submission,
        is_loading_submission,
        submit: submit_mutation.mutateAsync,
        is_submitting: submit_mutation.isPending,
    };
}
