import TestEditorContainer from '@/components/layout/materials/tests/components/editor/test-editor-container';
import { PageContainer } from '@/components/common/page-container';

export const metadata = {
  title: 'Create Test | Lirnexa',
};

export default function CreateTestPage() {
  return (
    <PageContainer>
      <TestEditorContainer />
    </PageContainer>
  );
}
