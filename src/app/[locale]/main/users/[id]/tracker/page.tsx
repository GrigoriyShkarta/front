import { TrackerBoardLayout } from "@/components/layout/tracker/tracker-board-layout";

export default async function StudentTrackerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  return (
    <TrackerBoardLayout student_id={id} hide_header={true} />
  );
}
