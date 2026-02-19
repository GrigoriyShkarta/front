import TestEditorContainer from '@/components/layout/materials/tests/components/editor/test-editor-container';
import { PageContainer } from '@/components/common/page-container';

export const metadata = {
  title: 'Edit Test | Lirnexa',
};

interface Props {
    params: Promise<{ id: string }>;
}

export default async function EditTestPage({ params }: Props) {
  const { id } = await params;
    
  return (
    <PageContainer>
      <TestEditorContainer id={id} />
    </PageContainer>
  );
}
