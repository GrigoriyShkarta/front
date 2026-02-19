'use client';

import { useMantineColorScheme, ActionIcon, Menu, UnstyledButton, Group, Stack, Text, Box } from '@mantine/core';
import { IoSunnyOutline, IoMoonOutline, IoLanguageOutline, IoCheckmarkOutline } from 'react-icons/io5';
import { useRouter, usePathname } from '@/i18n/routing';
import { SUPPORTED_LANGUAGES } from '@/lib/constants';
import { useParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { useTranslations } from 'next-intl';
import { UpgradePlanButton } from '../upgrade-plan-button';

interface Props {
  collapsed: boolean;
}

/**
 * Sidebar controls for theme switching and language selection.
 * Visibility depends on space personalization settings.
 */
export function SidebarControls({ collapsed }: Props) {
  const { user } = useAuth();
  const space = user?.space;
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const t = useTranslations('Navigation');
  
  const current_locale = params.locale as string;

  const show_theme_switcher = space?.personalization?.select_mode === true;
  const show_lang_switcher = (space?.personalization?.languages?.length || 0) > 1;

  const toggleColorScheme = () => {
    setColorScheme(colorScheme === 'dark' ? 'light' : 'dark');
  };

  const handleLanguageChange = (locale: string) => {
    router.replace(pathname, { locale });
  };

  if (!show_theme_switcher && !show_lang_switcher) return null;

  return (
    <Box className="px-2 pt-2">
      <Stack gap="xs">
        {show_theme_switcher && (
          <UnstyledButton
            onClick={toggleColorScheme}
            className={cn(
              "flex items-center w-full rounded-lg h-10 transition-all duration-200 hover:bg-white/10 active:scale-95",
              collapsed ? "justify-center px-0 hover:scale-110" : "px-3 hover:translate-x-1"
            )}
          >
            {colorScheme === 'dark' ? (
              <IoSunnyOutline size={20} className={cn(!collapsed && "mr-3")} />
            ) : (
              <IoMoonOutline size={20} className={cn(!collapsed && "mr-3")} />
            )}
            {!collapsed && <Text size="sm" fw={500} inherit>{t('theme')}</Text>}
          </UnstyledButton>
        )}

        {show_lang_switcher && (
          <Menu position="right-end" withArrow shadow="md" width={150}>
            <Menu.Target>
              <UnstyledButton
                className={cn(
                  "flex items-center w-full rounded-lg h-10 transition-all duration-200 hover:bg-white/10 active:scale-95",
                  collapsed ? "justify-center px-0 hover:scale-110" : "px-3 hover:translate-x-1"
                )}
              >
                <IoLanguageOutline size={20} className={cn(!collapsed && "mr-3")} />
                {!collapsed && (
                  <Text size="sm" fw={500} className="flex-1" inherit>
                    {t('languages')}
                  </Text>
                )}
                {!collapsed && (
                   <Text size="xs" opacity={0.5} tt="uppercase" inherit>
                     {current_locale}
                   </Text>
                )}
              </UnstyledButton>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>{t('select_language')}</Menu.Label>
              {SUPPORTED_LANGUAGES.filter(l => space?.personalization?.languages?.includes(l.id)).map((lang) => (
                <Menu.Item
                  key={lang.id}
                  onClick={() => handleLanguageChange(lang.id)}
                  rightSection={current_locale === lang.id && <IoCheckmarkOutline size={14} />}
                >
                  {lang.label}
                </Menu.Item>
              ))}
            </Menu.Dropdown>
          </Menu>
        )}

      </Stack>
    </Box>
  );
}
