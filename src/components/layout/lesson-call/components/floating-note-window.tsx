'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Box, ActionIcon, Group, Text, Paper, Collapse } from '@mantine/core';
import { IoCloseOutline, IoRemoveOutline, IoAddOutline, IoContractOutline, IoExpandOutline } from 'react-icons/io5';
import NoteEditorContainer from '@/components/layout/materials/notes/components/editor/note-editor-container';
import { useFloatingNotes } from '@/context/floating-notes-context';

interface Props {
  student_id: string;
  student_name: string;
  pinned_note_id?: string | null;
  session_note_id?: string | null;
  onClose: () => void;
}

export function FloatingNoteWindow({ student_id, student_name, pinned_note_id, session_note_id, onClose }: Props) {
  const { updateNoteId } = useFloatingNotes();
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef({ x: 0, y: 0 });

  const window_width = isCollapsed ? 200 : 350;
  const window_height = isCollapsed ? 'auto' : 450;

  useEffect(() => {
    // Initial position - middle right
    setPosition({
        x: window.innerWidth - window_width - 40,
        y: 100
    });
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest('button, .ActionIcon, .bn-editor')) return;

    setIsDragging(true);
    const rect = dragRef.current?.getBoundingClientRect();
    if (rect) {
      offsetRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const onMouseMove = (e: MouseEvent) => {
      let newX = e.clientX - offsetRef.current.x;
      let newY = e.clientY - offsetRef.current.y;

      // Basic bounds check
      newX = Math.max(0, Math.min(newX, window.innerWidth - window_width));
      newY = Math.max(0, Math.min(newY, window.innerHeight - 100));

      setPosition({ x: newX, y: newY });
    };

    const onMouseUp = () => setIsDragging(false);

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging, window_width]);

  return (
    <Paper
      ref={dragRef}
      onMouseDown={onMouseDown}
      shadow="xl"
      radius="lg"
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: window_width,
        maxHeight: isCollapsed ? 'auto' : 600,
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        zIndex: 10000,
        cursor: isDragging ? 'grabbing' : 'auto',
        overflow: 'hidden',
        backdropFilter: 'blur(16px)',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        transition: isDragging ? 'none' : 'transform 0.1s ease, width 0.3s ease'
      }}
    >
      {/* Header */}
      <Group justify="space-between" px="md" py="xs" className="bg-secondary/10 border-b border-secondary/10 cursor-grab active:cursor-grabbing">
        <Group gap="xs">
            <Text size="xs" fw={700} className="text-secondary uppercase tracking-wider truncate max-w-[120px]">
                {student_name}
            </Text>
        </Group>
        <Group gap={4}>
            <ActionIcon 
                variant="subtle" 
                color="gray" 
                size="sm" 
                onClick={() => setIsCollapsed(!isCollapsed)}
            >
                {isCollapsed ? <IoExpandOutline size={14} /> : <IoContractOutline size={14} />}
            </ActionIcon>
            <ActionIcon 
                variant="subtle" 
                color="red" 
                size="sm" 
                onClick={onClose}
            >
                <IoCloseOutline size={16} />
            </ActionIcon>
        </Group>
      </Group>

      {/* Content */}
      {!isCollapsed && (
        <Box p="xs" className="overflow-y-auto scrollbar-none flex-1" style={{ height: window_height }}>
            <NoteEditorContainer 
                key={session_note_id || 'new'}
                id={session_note_id || undefined}
                is_read_only={false}
                pinned_student_id={student_id}
                student_name={student_name}
                hide_additional={true}
                hide_edit={true}
                hide_back={true}
                hide_title={true}
                compact={true}
                prevent_redirect={true}
                force_new={!session_note_id}
                hide_loader={true}
                onIdChange={(newId) => updateNoteId(student_id, newId)}
            />
        </Box>
      )}
    </Paper>
  );
}
