import { api } from "@/lib/api";

export interface HomeworkSubmission {
    id: string;
    homework_id: string;
    student_id: string;
    text: string;
    file_urls: string[];
    status: 'pending' | 'reviewed';
    feedback?: string;
    score?: number;
    created_at: string;
}

export const homeworkSubmissionActions = {
    /**
     * Submit homework
     * @param homework_id - The ID of the homework to submit for
     * @param text - The content of the submission
     * @param file_urls - Array of already uploaded file IDs/URLs
     * @param files - Array of files to upload directly
     * @returns The created homework submission
     */
    submit: async (
        homework_id: string,
        text?: string,
        file_urls?: string[],
        files?: File[]
    ): Promise<HomeworkSubmission> => {
        const form_data = new FormData();

        if (text) {
            form_data.append('text', text);
        }

        file_urls?.forEach((url) => {
            form_data.append('file_urls', url);
        });

        files?.forEach((file) => {
            form_data.append('files', file);
        });

        const response = await api.post(
            `/materials/homeworks/${homework_id}/submit`,
            form_data,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        return response.data;
    },

    /**
     * Get my submission for a homework
     * @param homework_id - The ID of the homework
     * @returns The user's submission or null if not found
     */
    get_my_submission: async (homework_id: string): Promise<HomeworkSubmission | null> => {
        try {
            const response = await api.get(`/materials/homeworks/submissions/my`, {
                params: { homework_id }
            });
            return response.data;
        } catch (e: any) {
            if (e.response?.status === 404) return null;
            throw e;
        }
    }
};
