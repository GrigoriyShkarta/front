import { PageContainer } from "@/components/common/page-container";
import { Stack } from "@mantine/core";
import LessonEditor from "@/components/layout/materials/lessons/components/lesson-editor";

type Props = {
  params: Promise<{ id: string; locale: string }>;
};

/**
 * Page for editing an existing lesson.
 */
export default async function LessonEditPage({ params }: Props) {
  const { id } = await params;

  return (
    <PageContainer>
      <Stack gap="xl">
        <LessonEditor id={id} />
      </Stack>
    </PageContainer>
  );
}
