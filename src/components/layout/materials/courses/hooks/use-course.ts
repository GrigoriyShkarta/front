import { useQuery } from '@tanstack/react-query';
import { courseActions } from '../actions/course-actions';

export function useCourse(id: string) {
    const { data, isLoading, error } = useQuery({
        queryKey: ['course', id],
        queryFn: () => courseActions.get_course(id),
        enabled: !!id,
    });

    return {
        course: (data as any)?.data || data,
        is_loading: isLoading,
        error
    };
}
