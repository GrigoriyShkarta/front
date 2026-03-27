'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { CustomBoardCanvas } from '@/components/layout/boards/custom-board/custom-board-canvas';
import { get_board } from '@/components/layout/boards/custom-board/actions/board-api';
import { useAuth } from '@/hooks/use-auth';
import { Center, Loader } from '@mantine/core';

export default function SingleBoardPage() {
  const params = useParams();
  const board_id = params.boardId as string;
  const { user } = useAuth();
  
  const { data, isLoading } = useQuery({
    queryKey: ['board', board_id],
    queryFn: () => get_board(board_id),
    enabled: !!board_id,
  });

  if (isLoading || !user) {
    return (
      <Center h="100vh">
        <Loader size="xl" color="primary" />
      </Center>
    );
  }

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#12121e]">
      <CustomBoardCanvas 
        board_id={board_id} 
        user={user as any} 
        initial_data={data ? {
            elements: data.elements,
            student_id: data.student_id,
            pan_x: 0,
            pan_y: 0,
            zoom: 1,
            bg_color: data.settings?.bg_color,
            grid_type: data.settings?.grid_type as any,
            board_theme: data.settings?.board_theme as any
        } : undefined} 
      />
    </div>
  );
}
