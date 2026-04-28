'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Call } from '@stream-io/video-react-sdk';

interface ActiveCallContextType {
  activeCall: Call | null;
  setActiveCall: (call: Call | null) => void;
  call_layout: 'grid' | 'speaker-left' | 'speaker-right' | 'pip' | 'speaker-top';
  set_call_layout: (layout: 'grid' | 'speaker-left' | 'speaker-right' | 'pip' | 'speaker-top') => void;
}

const ActiveCallContext = createContext<ActiveCallContextType | undefined>(undefined);

export function ActiveCallProvider({ children }: { children: ReactNode }) {
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const [call_layout, set_call_layout] = useState<'grid' | 'speaker-left' | 'speaker-right' | 'pip' | 'speaker-top'>('grid');

  return (
    <ActiveCallContext.Provider value={{ activeCall, setActiveCall, call_layout, set_call_layout }}>
      {children}
    </ActiveCallContext.Provider>
  );
}

export function useActiveCall() {
  const context = useContext(ActiveCallContext);
  if (context === undefined) {
    throw new Error('useActiveCall must be used within an ActiveCallProvider');
  }
  return context;
}
