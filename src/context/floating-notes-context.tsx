'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';

interface FloatingNote {
  student_id: string;
  student_name: string;
  pinned_note_id?: string | null;
  session_note_id?: string | null; // ID created during this session
}

interface FloatingNotesContextType {
  openNotes: FloatingNote[];
  openNote: (note: FloatingNote) => void;
  closeNote: (student_id: string) => void;
  updateNoteId: (student_id: string, note_id: string) => void;
  clearNotes: (call_id: string) => void;
  closeAllNotes: () => void;
  sessionNotes: Record<string, string>; // student_id -> note_id
}

const FloatingNotesContext = createContext<FloatingNotesContextType | undefined>(undefined);

export function FloatingNotesProvider({ children }: { children: ReactNode }) {
  const [openNotes, setOpenNotes] = useState<FloatingNote[]>([]);
  const [sessionNotes, setSessionNotes] = useState<Record<string, string>>({});
  const [lastCallId, setLastCallId] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const savedSession = localStorage.getItem('floating_notes_session');
    const savedCallId = localStorage.getItem('floating_notes_last_call_id');
    if (savedSession) {
      try { setSessionNotes(JSON.parse(savedSession)); } catch (e) {}
    }
    if (savedCallId) {
      setLastCallId(savedCallId);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('floating_notes_session', JSON.stringify(sessionNotes));
  }, [sessionNotes]);

  useEffect(() => {
    if (lastCallId) {
      localStorage.setItem('floating_notes_last_call_id', lastCallId);
    }
  }, [lastCallId]);

  const openNote = useCallback((note: FloatingNote) => {
    setOpenNotes((prev) => {
      if (prev.some((n) => n.student_id === note.student_id)) return prev;
      
      const session_id = sessionNotes[note.student_id];
      const noteToOpen = { 
        ...note, 
        session_note_id: session_id || note.session_note_id 
      };
      
      return [...prev, noteToOpen];
    });
  }, [sessionNotes]);

  const closeNote = useCallback((student_id: string) => {
    setOpenNotes((prev) => prev.filter((n) => n.student_id !== student_id));
  }, []);

  const updateNoteId = useCallback((student_id: string, note_id: string) => {
    setSessionNotes((prev) => ({ ...prev, [student_id]: note_id }));
    setOpenNotes((prev) => prev.map(n => 
        n.student_id === student_id ? { ...n, session_note_id: note_id } : n
    ));
  }, []);

  const clearNotes = useCallback((call_id: string) => {
    if (lastCallId !== call_id) {
        setOpenNotes([]);
        setSessionNotes({});
        setLastCallId(call_id);
        localStorage.removeItem('floating_notes_session');
    }
  }, [lastCallId]);

  const closeAllNotes = useCallback(() => {
    setOpenNotes([]);
  }, []);

  return (
    <FloatingNotesContext.Provider value={{ openNotes, openNote, closeNote, updateNoteId, clearNotes, closeAllNotes, sessionNotes }}>
      {children}
    </FloatingNotesContext.Provider>
  );
}

export function useFloatingNotes() {
  const context = useContext(FloatingNotesContext);
  if (context === undefined) {
    throw new Error('useFloatingNotes must be used within a FloatingNotesProvider');
  }
  return context;
}
