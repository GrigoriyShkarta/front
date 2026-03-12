import { CalendarEvent, is_google_event, is_lesson_event } from '../schemas/event-schema';

export function get_event_layout(day_events: CalendarEvent[]) {
  const sorted_events = [...day_events].sort(
    (a, b) => a.start_date.getTime() - b.start_date.getTime()
  );

  const groups: CalendarEvent[][] = [];
  let current_group: CalendarEvent[] = [];
  let current_group_end = new Date(0);

  for (const event of sorted_events) {
    if (event.start_date < current_group_end) {
      current_group.push(event);
      if (event.end_date > current_group_end) {
        current_group_end = event.end_date;
      }
    } else {
      if (current_group.length > 0) groups.push(current_group);
      current_group = [event];
      current_group_end = event.end_date;
    }
  }
  if (current_group.length > 0) groups.push(current_group);

  const layout = new Map<CalendarEvent, { left: number; width: number }>();

  for (const group of groups) {
    const columns: CalendarEvent[][] = [];
    for (const event of group) {
      let placed = false;
      for (const col of columns) {
        if (col[col.length - 1].end_date <= event.start_date) {
          col.push(event);
          placed = true;
          break;
        }
      }
      if (!placed) columns.push([event]);
    }
    const num_columns = columns.length;
    columns.forEach((col, col_idx) => {
      col.forEach((event) => {
        layout.set(event, {
          left: (col_idx / num_columns) * 100,
          width: (1 / num_columns) * 100,
        });
      });
    });
  }

  return layout;
}

/**
 * Returns Tailwind class string for event colour based on:
 * - lesson status: scheduled=blue, attended=green, burned=red, rescheduled=yellow
 * - google source: gray
 * - manual events use the passed color prop or fall back to primary
 */
export function get_event_style(color?: string): string {
  switch (color) {
    case 'blue':
      return 'bg-blue-500/20 text-blue-400 border-blue-500 hover:bg-blue-500/30';
    case 'green':
      return 'bg-green-500/20 text-green-400 border-green-500 hover:bg-green-500/30';
    case 'red':
      return 'bg-red-500/20 text-red-400 border-red-500 hover:bg-red-500/30';
    case 'yellow':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500 hover:bg-yellow-500/30';
    case 'gray':
      return 'bg-gray-500/20 text-gray-400 border-gray-500 hover:bg-gray-500/30';
    case 'teal':
      return 'bg-teal-500/20 text-teal-400 border-teal-500 hover:bg-teal-500/30';
    case 'orange':
      return 'bg-orange-500/20 text-orange-400 border-orange-500 hover:bg-orange-500/30';
    case 'cyan':
      return 'bg-cyan-500/20 text-cyan-400 border-cyan-500 hover:bg-cyan-500/30';
    case 'indigo':
      return 'bg-indigo-500/20 text-indigo-400 border-indigo-500 hover:bg-indigo-500/30';
    case 'violet':
      return 'bg-violet-500/20 text-violet-400 border-violet-500 hover:bg-violet-500/30';
    case 'pink':
      return 'bg-pink-500/20 text-pink-400 border-pink-500 hover:bg-pink-500/30';
    default:
      return 'bg-primary/20 text-primary border-primary hover:bg-primary/30';
  }
}

/**
 * Returns the colour code for a given event depending on its source / status.
 */
export function resolve_event_color(event: CalendarEvent): string {
  if (is_lesson_event(event)) {
    return 'primary';
  }
  if (is_google_event(event)) {
    return 'primary';
  }
  return event.color ?? 'primary';
}
