'use client';

import { TrackerBoardLayout } from "@/components/layout/tracker/tracker-board-layout";
import { useAuth } from "@/hooks/use-auth";
import { LoadingOverlay, Box } from "@mantine/core";

export default function MyTrackerPage() {
  const { user, is_loading } = useAuth();

  if (is_loading) {
    return (
      <Box mih={400} className="relative">
        <LoadingOverlay visible />
      </Box>
    );
  }

  if (!user) return null;

  return (
    <TrackerBoardLayout student_id={user.id} hide_header={true} />
  );
}
