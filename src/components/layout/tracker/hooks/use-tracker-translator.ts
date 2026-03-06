'use client';

import { useTranslations } from 'next-intl';
import { TrackerColumn } from '../schemas/tracker-schema';

/**
 * Hook to provide translation utilities for the tracker board
 */
export function useTrackerTranslator() {
  const t = useTranslations('Tracker');

  const getColumnLabel = (col: TrackerColumn) => {
    const defaultKeys = ['planned', 'in_progress', 'completed'];
    
    // Check both id and title in case they are swapped or slightly different
    if (defaultKeys.includes(col.id.toLowerCase())) {
      return t(`columns.${col.id.toLowerCase()}`);
    }
    
    // Some legacy or backend columns might send the key in the title
    if (defaultKeys.includes(col.title.toLowerCase())) {
        return t(`columns.${col.title.toLowerCase()}`);
    }

    return col.title;
  };

  return { t, getColumnLabel };
}
