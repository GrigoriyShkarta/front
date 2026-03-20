'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Call } from '@stream-io/video-react-sdk';

interface ActiveCallContextType {
  activeCall: Call | null;
  setActiveCall: (call: Call | null) => void;
}

const ActiveCallContext = createContext<ActiveCallContextType | undefined>(undefined);

export function ActiveCallProvider({ children }: { children: ReactNode }) {
  const [activeCall, setActiveCall] = useState<Call | null>(null);

  return (
    <ActiveCallContext.Provider value={{ activeCall, setActiveCall }}>
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
