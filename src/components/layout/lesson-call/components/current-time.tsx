'use client';

import { useEffect, useState } from 'react';
import { Box, Text } from '@mantine/core';

export function CurrentTime({ visible }: { visible: boolean }) {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    if (!visible) return;
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000 * 30); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [visible]);

  if (!visible) return null;

  return (
    <Box 
      style={{
        position: 'absolute',
        top: 24,
        right: 24,
        zIndex: 99999,
        pointerEvents: 'none',
      }}
    >
      <Box 
        className="bg-black/60 backdrop-blur-xl border border-white/20 rounded-2xl px-5 py-2.5 shadow-2xl"
      >
        <Text fw={700} c="white" size="xl" className="font-mono tracking-widest leading-none">
          {time}
        </Text>
      </Box>
    </Box>
  );
}
