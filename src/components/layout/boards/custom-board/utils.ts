import { BoardElement, BBox, TextElement, LineElement, ArrowElement } from './types';

/**
 * Calculate bounding box of any board element in world coordinates.
 * Text supports multiline (split by \n).
 */
export function get_element_bbox(el: BoardElement): BBox | null {
  switch (el.type) {
    case 'rect':
    case 'diamond':
    case 'triangle':
      return { x: el.x, y: el.y, w: el.width, h: el.height };
    case 'ellipse':
      return { x: el.cx - el.rx, y: el.cy - el.ry, w: el.rx * 2, h: el.ry * 2 };
    case 'image':
    case 'video':
    case 'audio':
    case 'link':
      return { x: el.x, y: el.y, w: el.width, h: el.height };
    case 'youtube':
    case 'embed':
    case 'file':
      return { x: el.x, y: el.y, w: el.width, h: el.height };
    case 'text': {
      const t = el as TextElement;
      
      // Better HTML to text conversion for measurement
      const plain_text = (t.content || ' ')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n')
        .replace(/<\/div>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&');
        
      // Filter out trailing empty lines caused by div/p tags
      const raw_lines = plain_text.split('\n');
      while (raw_lines.length > 1 && !raw_lines[raw_lines.length - 1].trim()) {
        raw_lines.pop();
      }
      
      const lines = raw_lines.map(l => l.trimEnd());
      const line_h = t.font_size * 1.5; // More generous line-height
      
      let total_lines = 0;
      let box_w = 0;

      if (t.width) {
        box_w = t.width;
        // Conservative estimation for non-monospaced fonts
        const avg_char_w = t.font_size * 0.58; 
        const chars_per_line = Math.max(1, Math.floor(t.width / avg_char_w));
        
        lines.forEach(line => {
          if (!line.length) total_lines += 1;
          else {
            // Rough wrap estimation
            const wraps = Math.max(1, Math.ceil(line.length / chars_per_line));
            total_lines += wraps;
          }
        });
      } else {
        box_w = measure_text_width(lines, t.font_size, t.font_family, t.font_weight);
        total_lines = lines.length;
      }

      return {
        x: t.x,
        y: t.y,
        w: Math.max(box_w, 20),
        h: total_lines * line_h,
      };
    }
    case 'line':
    case 'arrow':
      return {
        x: Math.min(el.x1, el.x2) - 8,
        y: Math.min(el.y1, el.y2) - 8,
        w: Math.abs(el.x2 - el.x1) + 16,
        h: Math.abs(el.y2 - el.y1) + 16,
      };
    case 'path': {
      // Parse all x,y coordinates from the SVG path 'd' string
      const nums = el.d.match(/[-+]?[0-9]*\.?[0-9]+/g);
      if (!nums || nums.length < 2) return null;
      let min_x = Infinity, min_y = Infinity, max_x = -Infinity, max_y = -Infinity;
      for (let i = 0; i < nums.length - 1; i += 2) {
        const x = parseFloat(nums[i]);
        const y = parseFloat(nums[i + 1]);
        if (x < min_x) min_x = x;
        if (x > max_x) max_x = x;
        if (y < min_y) min_y = y;
        if (y > max_y) max_y = y;
      }
      const pad = el.stroke_width / 2 + 4;
      return {
        x: min_x - pad,
        y: min_y - pad,
        w: Math.max(max_x - min_x + pad * 2, 16),
        h: Math.max(max_y - min_y + pad * 2, 16),
      };
    }
    default:
      return null;
  }
}

/**
 * Check if a point is inside a bounding box.
 */
export function is_point_in_bbox(px: number, py: number, bbox: BBox): boolean {
  return px >= bbox.x && px <= bbox.x + bbox.w &&
         py >= bbox.y && py <= bbox.y + bbox.h;
}

/** Use offscreen canvas for accurate text width measurement */
function measure_text_width(
  lines: string[],
  font_size: number,
  font_family: string,
  font_weight: 'normal' | 'bold',
): number {
  if (typeof document === 'undefined') {
    const max_len = Math.max(...lines.map(l => l.length), 1);
    return max_len * font_size * (font_weight === 'bold' ? 0.65 : 0.58);
  }
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('no ctx');
    ctx.font = `${font_weight} ${font_size}px ${font_family}`;
    return Math.max(...lines.map(l => ctx.measureText(l || ' ').width), 20);
  } catch {
    const max_len = Math.max(...lines.map(l => l.length), 1);
    return max_len * font_size * 0.58;
  }
}

/**
 * Resize an element from a given corner anchor (nw | ne | sw | se | n | s | w | e).
 */
export function resize_element(el: BoardElement, dx: number, dy: number, anchor: string): BoardElement {
  const west  = anchor.includes('w');
  const north = anchor.includes('n');
  const only_h = anchor === 'n' || anchor === 's';
  const only_v = anchor === 'w' || anchor === 'e';

  switch (el.type) {
    case 'rect':
    case 'diamond':
    case 'triangle': {
      const eff_dx = only_h ? 0 : (west ? -dx : dx);
      const eff_dy = only_v ? 0 : (north ? -dy : dy);
      const new_x = west  ? el.x + dx : el.x;
      const new_y = north ? el.y + dy : el.y;
      return { ...el, x: new_x, y: new_y, width: Math.max(8, el.width + eff_dx), height: Math.max(8, el.height + eff_dy) } as any;
    }
    case 'ellipse': {
      const new_rx = Math.max(4, el.rx + (west ? -dx : dx) / 2);
      const new_ry = Math.max(4, el.ry + (north ? -dy : dy) / 2);
      return { ...el, rx: new_rx, ry: new_ry };
    }
    case 'image':
    case 'video':
    case 'audio':
    case 'youtube':
    case 'link':
    case 'embed':
    case 'file': {
      const eff_dx = only_h ? 0 : (west ? -dx : dx);
      const eff_dy = only_v ? 0 : (north ? -dy : dy);
      const new_x = west  ? el.x + dx : el.x;
      const new_y = north ? el.y + dy : el.y;
      return { ...el, x: new_x, y: new_y, width: Math.max(20, el.width + eff_dx), height: Math.max(20, el.height + eff_dy) };
    }
    case 'line':
    case 'arrow': {
      const e = el as LineElement | ArrowElement;
      let { x1, y1, x2, y2 } = e;
      if (anchor.includes('w')) { if (x1 < x2) x1 += dx; else x2 += dx; }
      if (anchor.includes('e')) { if (x1 > x2) x1 += dx; else x2 += dx; }
      if (anchor.includes('n')) { if (y1 < y2) y1 += dy; else y2 += dy; }
      if (anchor.includes('s')) { if (y1 > y2) y1 += dy; else y2 += dy; }
      return { ...el, x1, y1, x2, y2 } as any;
    }
    case 'text': {
      const is_corner = anchor.length === 2; // nw, ne, sw, se
      const is_horizontal = anchor === 'w' || anchor === 'e';
      const is_vertical = anchor === 'n' || anchor === 's';

      if (is_corner) {
        // Corner drag: proportional scale of both font-size and width (if fixed width)
        const scale = 1 + (dy + dx) * 0.005; 
        const new_font = Math.max(8, el.font_size * scale);
        const new_width = el.width ? el.width * scale : undefined;
        return { ...el, font_size: new_font, width: new_width };
      }

      if (is_horizontal) {
        // Horizontal drag: change text wrap width ONLY
        const current_w = el.width ?? 300; 
        const dw = west ? -dx : dx; 
        const final_w = Math.max(20, current_w + dw);
        const new_x = west ? el.x + dx : el.x;
        return { ...el, x: new_x, width: final_w };
      }

      if (is_vertical) {
        // Vertical drag: scale font size ONLY (like pulling text height)
        const dv = north ? -dy : dy;
        return { ...el, font_size: Math.max(8, el.font_size + dv * 0.5) };
      }
      return el;
    }
    default:
      return el;
  }
}

/**
 * Move any element by dx/dy in world coordinates.
 */
export function move_element(el: BoardElement, dx: number, dy: number): BoardElement {
  switch (el.type) {
    case 'rect':    
    case 'diamond':
    case 'triangle':
      return { ...el, x: (el as any).x + dx, y: (el as any).y + dy } as any;
    case 'ellipse': return { ...el, cx: el.cx + dx, cy: el.cy + dy };
    case 'line':    return { ...el, x1: el.x1 + dx, y1: el.y1 + dy, x2: el.x2 + dx, y2: el.y2 + dy };
    case 'arrow':   return { ...el, x1: el.x1 + dx, y1: el.y1 + dy, x2: el.x2 + dx, y2: el.y2 + dy };
    case 'text':    return { ...el, x: el.x + dx, y: el.y + dy };
    case 'image':   return { ...el, x: el.x + dx, y: el.y + dy };
    case 'video':   return { ...el, x: el.x + dx, y: el.y + dy };
    case 'audio':   return { ...el, x: el.x + dx, y: el.y + dy };
    case 'link':    return { ...el, x: el.x + dx, y: el.y + dy };
    case 'youtube': return { ...el, x: el.x + dx, y: el.y + dy };
    case 'embed':   return { ...el, x: el.x + dx, y: el.y + dy };
    case 'file':    return { ...el, x: el.x + dx, y: el.y + dy };
    case 'path': {
      const d = el.d.replace(/([ML])\s*([-\d.]+)\s+([-\d.]+)/g, (_, cmd, x, y) =>
        `${cmd} ${parseFloat(x) + dx} ${parseFloat(y) + dy}`
      );
      return { ...el, d };
    }
    default: return el;
  }
}
