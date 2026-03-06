'use client';

import { useEffect, useRef } from 'react';
import { useAuthContext } from '@/context/auth-context';

/**
 * Dynamically updates document title and favicon based on space personalization settings.
 * Uses a flag to prevent MutationObserver from causing infinite loops during Next.js navigation.
 */
export function SpaceMetadataInitializer() {
  const { user } = useAuthContext();
  const personalization = user?.space?.personalization;
  const is_updating_ref = useRef(false);

  useEffect(() => {
    if (!personalization) return;

    const space_name = personalization.title_space || 'Lirnexa';
    const space_icon = personalization.icon;

    const updateFavicon = () => {
      if (!space_icon) return;
      const links = document.querySelectorAll("link[rel*='icon']");
      if (links.length > 0) {
        links.forEach(link => (link as HTMLLinkElement).href = space_icon);
      } else {
        const link = document.createElement('link');
        link.rel = 'icon';
        link.href = space_icon;
        document.head.appendChild(link);
      }
    };

    const updateTitle = () => {
      const current_title = document.title;
      if (current_title.includes('Lirnexa')) {
        document.title = current_title.replace(/Lirnexa/g, space_name);
      } else if (!current_title.includes(space_name)) {
        document.title = `${current_title} | ${space_name}`;
      }
    };

    // Initial updates
    updateFavicon();
    updateTitle();

    // Guard flag: prevent observer from firing when WE make changes
    const observer = new MutationObserver(() => {
      if (is_updating_ref.current) return;
      is_updating_ref.current = true;
      updateTitle();
      updateFavicon();
      // Release guard on next microtask (after all batched mutations are processed)
      Promise.resolve().then(() => {
        is_updating_ref.current = false;
      });
    });

    const title_node = document.querySelector('title');
    if (title_node) {
      observer.observe(title_node, { characterData: true, childList: true, subtree: true });
    }
    observer.observe(document.head, { childList: true, subtree: false });

    return () => observer.disconnect();
  }, [personalization]);

  return null;
}
