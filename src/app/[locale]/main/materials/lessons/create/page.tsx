'use client';

import { PageContainer } from "@/components/common/page-container";
import { Stack } from "@mantine/core";
import LessonEditor from "@/components/layout/materials/lessons/components/lesson-editor";

/**
 * Page for creating a new lesson.
 * Uses the block-based BlockNote editor.
 */
export default function LessonCreatePage() {
  return (
    <PageContainer>
      <Stack gap="xl">
        <LessonEditor />
      </Stack>
    </PageContainer>
  );
}
