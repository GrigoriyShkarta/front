'use client';

import { useActiveCall } from '@/context/active-call-context';
import { LessonTimer } from './lesson-timer';
import { useEffect, useState } from 'react';
import { usePathname } from '@/i18n/routing';

/**
 * Global wrapper for the LessonTimer that tracks the active call 
 * across the entire application.
 */
export function GlobalLessonTimer() {
  const { activeCall } = useActiveCall();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hide global timer if we are on the lesson page or if no call
  if (!activeCall || !mounted || pathname?.includes('/lesson/')) return null;


  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100%',
      height: 0,
      zIndex: 2147483647, 
      pointerEvents: 'none'
    }}>
      <LessonTimer lesson_id={activeCall.id} />
    </div>
  );
}
