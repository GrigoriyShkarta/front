'use client';

import { useState, useRef, useCallback, useMemo } from 'react';
import { BoardElement } from '../types';

const MAX_HISTORY = 50;

export function useBoardHistory(
    current_elements: BoardElement[],
    set_elements: (els: BoardElement[]) => void
) {
    const history_ref = useRef<BoardElement[][]>([current_elements]);
    const [index, set_index] = useState(0);

    const push_state = useCallback((els: BoardElement[]) => {
        const last = history_ref.current[index];
        if (last && JSON.stringify(last) === JSON.stringify(els)) return;

        const next_history = history_ref.current.slice(0, index + 1);
        next_history.push(els);
        
        if (next_history.length > MAX_HISTORY) {
            next_history.shift();
        }

        history_ref.current = next_history;
        set_index(next_history.length - 1);
    }, [index]);

    const undo = useCallback(() => {
        if (index > 0) {
            const next_idx = index - 1;
            set_index(next_idx);
            set_elements(history_ref.current[next_idx]);
        }
    }, [index, set_elements]);

    const redo = useCallback(() => {
        if (index < history_ref.current.length - 1) {
            const next_idx = index + 1;
            set_index(next_idx);
            set_elements(history_ref.current[next_idx]);
        }
    }, [index, set_elements]);

    const can_undo = index > 0;
    const can_redo = index < history_ref.current.length - 1;

    return { push_state, undo, redo, can_undo, can_redo };
}
