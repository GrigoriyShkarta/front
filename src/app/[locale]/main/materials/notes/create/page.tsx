'use client';

import { PageContainer } from "@/components/common/page-container";
import { Stack } from "@mantine/core";
import NoteEditor from "@/components/layout/materials/notes/components/note-editor";

export default function NoteCreatePage() {
  return (
    <PageContainer>
      <Stack gap="xl">
        <NoteEditor />
      </Stack>
    </PageContainer>
  );
}
