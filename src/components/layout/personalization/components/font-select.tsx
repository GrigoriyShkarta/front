'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Stack,
  Text,
  UnstyledButton,
  Group,
  Box,
} from '@mantine/core';
import { IoCheckmarkCircle, IoLockClosedOutline } from 'react-icons/io5';
import { FontOption, SPACE_FONTS } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

/**
 * Loads a Google Font dynamically by injecting a link tag.
 * @param font_name - Google Font name (e.g. 'Inter', 'Open+Sans')
 */
function loadGoogleFont(font_name: string) {
  if (typeof window === 'undefined') return;

  const link_id = `google-font-${font_name.replace(/\+/g, '-').toLowerCase()}`;
  if (document.getElementById(link_id)) return;

  const link = document.createElement('link');
  link.id = link_id;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${font_name}:wght@400;500;600;700&display=swap`;
  document.head.appendChild(link);
}

/**
 * FontSelect - A premium font picker component.
 * Displays available fonts with live preview and premium badges.
 * @param {Props} props - Component props
 * @returns {JSX.Element} The rendered font selector
 */
export function FontSelect({ value, onChange, is_premium_user }: Props & { is_premium_user?: boolean }) {
  const t = useTranslations('Personalization');
  const [loaded_fonts, set_loaded_fonts] = useState<Set<string>>(new Set());

  // Preload all font previews
  useEffect(() => {
    SPACE_FONTS.forEach((font) => {
      loadGoogleFont(font.google_font);
      set_loaded_fonts((prev) => new Set(prev).add(font.id));
    });
  }, []);

  const handleSelect = (font: FontOption) => {
    onChange(font.id);
  };

  return (
    <Stack gap="xs">
      <Text fw={500} size="sm">
        {t('font_family_label')}
      </Text>

      <Box
        className="grid gap-2"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}
      >
        {SPACE_FONTS.map((font) => {
          const is_selected = value === font.id;

          return (
            <UnstyledButton
              key={font.id}
              onClick={() => handleSelect(font)}
              className={`
                relative rounded-lg border-2 px-4! py-3!
                transition-all duration-200
                ${is_selected
                  ? 'border-[var(--space-primary)] shadow-md'
                  : 'border-[var(--space-secondary)] hover:border-[var(--space-primary)]'
                }
                ${'cursor-pointer hover:scale-[1.02]'}
              `}
              style={{ backgroundColor: 'var(--space-card-bg)' }}
            >
              <Group justify="space-between" wrap="nowrap">
                <Box>
                  <Text
                    size="lg"
                    fw={500}
                    style={{ fontFamily: `'${font.label}', sans-serif` }}
                    className="truncate"
                  >
                    {font.label}
                  </Text>
                  <Text
                    size="xs"
                    c="dimmed"
                    style={{ fontFamily: `'${font.label}', sans-serif` }}
                  >
                    Aa Bb Cc 123
                  </Text>
                </Box>

                <Box className="flex items-center gap-2">
                   {font.is_premium && !is_premium_user && (
                     <IoLockClosedOutline
                       size={16}
                       className="text-gray-400"
                     />
                   )}
                   {is_selected && (
                     <IoCheckmarkCircle
                       size={20}
                       style={{ color: 'var(--space-primary)', flexShrink: 0 }}
                     />
                   )}
                </Box>
              </Group>
            </UnstyledButton>
          );
        })}
      </Box>
    </Stack>
  );
}
