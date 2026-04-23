import { PageContainer } from "@/components/common/page-container";
import { Stack } from "@mantine/core";
import NoteEditor from "@/components/layout/materials/notes/components/note-editor";

type Props = {
  params: Promise<{ id: string; locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function NoteViewPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sParams = await searchParams;
  const is_partial_access = sParams.partial_access === 'true';

  return (
    <PageContainer>
      <Stack gap="xl">
        <NoteEditor 
            id={id} 
            is_read_only={!is_partial_access} 
            is_access_mode={is_partial_access} 
        />
      </Stack>
    </PageContainer>
  );
}
