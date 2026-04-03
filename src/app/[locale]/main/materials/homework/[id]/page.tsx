import HomeworkEditor from '@/components/layout/materials/homework/components/homework-editor';

export default async function ViewHomeworkPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <HomeworkEditor id={resolvedParams.id} is_read_only={true} />;
}
