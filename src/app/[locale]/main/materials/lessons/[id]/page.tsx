import { PageContainer } from "@/components/common/page-container";
import { Stack } from "@mantine/core";
import LessonEditor from "@/components/layout/materials/lessons/components/lesson-editor";

type Props = {
  params: Promise<{ id: string; locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

/**
 * Page for viewing an existing lesson.
 * Defaults to read-only mode.
 */
export default async function LessonViewPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sParams = await searchParams;
  const course_id = typeof sParams.courseId === 'string' ? sParams.courseId : undefined;
  const student_id = typeof sParams.student_id === 'string' ? sParams.student_id : undefined;
  const is_partial_access = sParams.partial_access === 'true';

  return (
    <PageContainer>
      <Stack gap="xl">
        <LessonEditor 
            id={id} 
            is_read_only={!is_partial_access} 
            course_id={course_id} 
            student_id={student_id} 
            is_access_mode={is_partial_access} 
        />
      </Stack>
    </PageContainer>
  );
}
