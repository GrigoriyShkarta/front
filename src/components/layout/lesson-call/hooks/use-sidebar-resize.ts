import { useCallback, useRef, useState } from 'react';

const MIN_RATIO = 15;
const MAX_RATIO = 50;
const DEFAULT_RATIO = 25;

/**
 * Hook for drag-to-resize split ratio in speaker layout.
 * @returns sidebar_ratio (percentage 15–50%) and drag handle mousedown handler
 */
export function useSidebarResize() {
  const [sidebar_ratio, set_sidebar_ratio] = useState(DEFAULT_RATIO);
  const container_ref = useRef<HTMLDivElement | null>(null);

  const on_drag_start = useCallback(
    (e: React.MouseEvent, bar_position: 'left' | 'right') => {
      const container = container_ref.current;
      if (!container) return;

      const container_rect = container.getBoundingClientRect();
      e.preventDefault();

      const on_move = (move_e: MouseEvent) => {
        const relative_x = move_e.clientX - container_rect.left;
        const pct = (relative_x / container_rect.width) * 100;

        // bar on the left → sidebar is left portion
        // bar on the right → sidebar is right portion (100 - pct)
        const new_ratio =
          bar_position === 'left'
            ? Math.min(MAX_RATIO, Math.max(MIN_RATIO, pct))
            : Math.min(MAX_RATIO, Math.max(MIN_RATIO, 100 - pct));

        set_sidebar_ratio(new_ratio);
      };

      const on_up = () => {
        document.removeEventListener('mousemove', on_move);
        document.removeEventListener('mouseup', on_up);
      };

      document.addEventListener('mousemove', on_move);
      document.addEventListener('mouseup', on_up);
    },
    [],
  );

  return { sidebar_ratio, container_ref, on_drag_start };
}
