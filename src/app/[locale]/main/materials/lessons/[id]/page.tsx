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

  return (
    <PageContainer>
      <Stack gap="xl">
        <LessonEditor id={id} is_read_only={true} course_id={course_id} />
      </Stack>
    </PageContainer>
  );
}
