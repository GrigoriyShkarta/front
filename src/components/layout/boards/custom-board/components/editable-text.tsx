'use client';

import React, { useEffect, useRef, useState } from 'react';
import DOMPurify from 'isomorphic-dompurify';
import { TextElement } from '../types';

interface Props {
  element: TextElement;
  zoom: number;
  pan_x: number;
  pan_y: number;
  on_save: (content: string, width: number, height: number) => void;
  on_cancel: () => void;
  innerRef: React.RefObject<HTMLDivElement | null>;
  /** Ref-based flag: when `.current` is true, blur events are ignored (e.g. when a link modal is opening) */
  suppress_blur?: React.RefObject<boolean>;
  is_dark: boolean;
}

export function EditableText({ element, zoom, pan_x, pan_y, on_save, on_cancel, innerRef, suppress_blur, is_dark }: Props) {
  const localRef = useRef<HTMLDivElement | null>(null);
  const ref = innerRef || localRef;
  const [initialContent] = useState(element.content);
  const has_saved = useRef(false);

  const get_theme_color = (c?: string) => {
      if (!c) return c;
      const lower = c.toLowerCase();
      const is_adaptive = ['#000000', 'black', '#000', '#ffffff', 'white', '#fff'].includes(lower);
      if (is_adaptive) return is_dark ? '#ffffff' : '#000000';
      return c;
  };

  useEffect(() => {
    const el = ref.current;
    if (el) {
        el.focus();
        const range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
    }

    return () => {
        if (!has_saved.current && ref.current) {
            has_saved.current = true;
            on_save(ref.current.innerHTML || '', (ref.current.offsetWidth || 100) / zoom + 2, (ref.current.offsetHeight || 40) / zoom);
        }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const performSave = () => {
      if (has_saved.current || !ref.current) return;
      
      const content = ref.current.innerHTML || '';
      // If content is empty or just whitespace/br, cancel instead of saving
      if (!content.trim() || content === '<br>') {
          has_saved.current = true;
          on_cancel();
          return;
      }

      has_saved.current = true;
      on_save(content, (ref.current.offsetWidth || 100) / zoom + 2, (ref.current.offsetHeight || 40) / zoom);
  };

  const handleBlur = (e: React.FocusEvent) => {
      // Don't save if blur is suppressed (link modal opening) — read ref synchronously
      if (suppress_blur?.current) return;

      const related = e.relatedTarget as HTMLElement | null;
      // If focus went into the inline toolbar, don't save yet
      if (related && related.closest('[data-inline-toolbar]')) return;

      performSave();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
          has_saved.current = true;
          on_cancel();
      }
      if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          performSave();
      }
      e.stopPropagation();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
      e.preventDefault();
      const text = e.clipboardData.getData('text/plain');
      document.execCommand('insertText', false, text);
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: element.x * zoom + pan_x,
        top: element.y * zoom + pan_y,
        minWidth: (element.width || 100) * zoom,
        transform: `rotate(${element.angle || 0}deg)`,
        transformOrigin: 'top left',
        zIndex: 200,
        pointerEvents: 'all',
      }}
    >
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(initialContent) }}
        style={{
          width: 'fit-content',
          minWidth: '50px',
          cursor: 'text',
          outline: 'none',
          color: get_theme_color(element.color),
          fontSize: element.font_size * zoom,
          fontFamily: element.font_family,
          fontWeight: element.font_weight,
          fontStyle: element.font_style,
          textDecoration: element.text_decoration,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          lineHeight: 1.35,
          background: 'transparent',
          userSelect: 'text',
          WebkitUserSelect: 'text',
        }}
      />
    </div>
  );
}
