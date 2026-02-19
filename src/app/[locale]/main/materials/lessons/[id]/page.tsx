import { PageContainer } from "@/components/common/page-container";
import { Stack } from "@mantine/core";
import LessonEditor from "@/components/layout/materials/lessons/components/lesson-editor";

type Props = {
  params: Promise<{ id: string; locale: string }>;
};

/**
 * Page for viewing an existing lesson.
 * Defaults to read-only mode.
 */
export default async function LessonViewPage({ params }: Props) {
  const { id } = await params;

  return (
    <PageContainer>
      <Stack gap="xl">
        <LessonEditor id={id} is_read_only={true} />
      </Stack>
    </PageContainer>
  );
}
