'use client';

import "@excalidraw/excalidraw/index.css";

import { 
  Stack, 
  Title, 
  Group, 
  Button, 
  Breadcrumbs, 
  Anchor, 
  Box, 
  LoadingOverlay,
  useMantineColorScheme
} from '@mantine/core';
import { IoSaveOutline } from 'react-icons/io5';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { useAuth } from '@/hooks/use-auth';
import { useBoardData } from './hooks/use-board-data';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

// Excalidraw is client-side only
const Excalidraw = dynamic(
  () => import('@excalidraw/excalidraw').then((mod) => mod.Excalidraw),
  { ssr: false }
);

export function BoardsLayout() {
  const t = useTranslations('Boards');
  const tNav = useTranslations('Navigation');
  const params = useParams();
  const { colorScheme } = useMantineColorScheme();

  console.log(colorScheme);
  
  const studentId = (params?.userId as string) || (params?.id as string);
  const locale = (params?.locale as string) || 'uk';
  const { user: current_user } = useAuth();
  const { loading, student_name, board_data, saving, saveBoard } = useBoardData(studentId);

  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);

  const is_admin = current_user?.role === 'super_admin' || current_user?.role === 'admin' || current_user?.role === 'teacher';

  // Map app locale to Excalidraw langCode
  const langCode = locale === 'uk' ? 'uk-UA' : 'en';

  const breadcrumb_items = [
    { title: tNav('dashboard'), href: '/main' },
    { title: tNav('boards'), href: '/main/boards' },
    ...(is_admin && student_name ? [{ title: student_name, href: '#' }] : []),
  ].map((item, index) => (
    <Anchor component={Link} href={item.href} key={index} size="sm">
      {item.title}
    </Anchor>
  ));

  console.log('check', colorScheme === 'dark');
  

  const handleSave = () => {
    if (!excalidrawAPI) return;
    const elements = excalidrawAPI.getSceneElements();
    const appState = excalidrawAPI.getAppState();
    saveBoard(elements, appState);
  };

  // Sync background and theme whenever colorScheme changes and API is ready
  useEffect(() => {
    if (excalidrawAPI && !loading) {
      excalidrawAPI.updateScene({
        appState: {
          viewBackgroundColor: '#121212',
          theme: 'dark',
        }
      });
    }
  }, [excalidrawAPI, colorScheme, loading]);

  return (
    <Stack gap="lg" h="calc(100vh - 120px)" className="boards-container">
      <Stack gap="xs">
        <Group justify="space-between" align="center" wrap="nowrap">
          <Breadcrumbs separator="→">{breadcrumb_items}</Breadcrumbs>
          <Button 
            leftSection={<IoSaveOutline size={20} />}
            loading={saving}
            onClick={handleSave}
            radius="md"
            color="primary"
          >
            {useTranslations('Common')('save')}
          </Button>
        </Group>
        <Title order={2} className="font-bold">
          {student_name ? t('board_title', { name: student_name }) : t('title')}
        </Title>
      </Stack>

      <Box className="flex-1 relative border border-white/10 rounded-xl overflow-hidden bg-[#121212]">
        <LoadingOverlay visible={loading} overlayProps={{ blur: 2 }} />
        
        {!loading && colorScheme && (
          <Excalidraw 
            excalidrawAPI={(api) => setExcalidrawAPI(api)}
            initialData={{
              elements: board_data?.elements || [],
              appState: { 
                ...board_data?.appState,
                theme: colorScheme === 'dark' ? 'dark' : 'light',
                viewBackgroundColor: colorScheme === 'dark' ? '#121212' : '#ffffff',
              },
              scrollToContent: true,
            }}
            theme={colorScheme === 'dark' ? 'dark' : 'light'}
            langCode={langCode}
          />
        )}
      </Box>
    </Stack>
  );
}
