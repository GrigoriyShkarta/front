import { PageContainer } from "@/components/common/page-container";
import { Stack } from "@mantine/core";
import NoteEditor from "@/components/layout/materials/notes/components/note-editor";

type Props = {
  params: Promise<{ id: string; locale: string }>;
};

export default async function NoteEditPage({ params }: Props) {
  const { id } = await params;

  return (
    <PageContainer>
      <Stack gap="xl">
        <NoteEditor id={id} is_read_only={false} />
      </Stack>
    </PageContainer>
  );
}
