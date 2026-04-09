'use client';

import { 
  Stack, 
  Title, 
  Group, 
  ActionIcon,
  Tooltip,
  Box, 
  LoadingOverlay,
  useMantineColorScheme
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IoLibraryOutline } from 'react-icons/io5';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useBoardData } from './hooks/use-board-data';
import { MaterialsPickerModal } from './components/materials-picker-modal';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import "@excalidraw/excalidraw/index.css";

// Excalidraw is client-side only
// const Excalidraw = dynamic(
//   () => import('@excalidraw/excalidraw').then((mod) => mod.Excalidraw),
//   { ssr: false }
// );

export function BoardsLayout() {
  const t = useTranslations('Boards');
  const params = useParams();
  const { colorScheme } = useMantineColorScheme();
  
  const studentId = params?.userId as string;
  const boardId = params?.boardId as string;
  const locale = (params?.locale as string) || 'uk';
  const { user: current_user } = useAuth();
  
  const { loading, current_board } = useBoardData(studentId, boardId);

  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
  const [pickerOpened, { open: openPicker, close: closePicker }] = useDisclosure(false);

  const langCode = locale === 'uk' ? 'uk-UA' : 'en';

  const handleSelectMaterial = async (type: string, material: any) => {
    if (!excalidrawAPI) return;

    const elements = excalidrawAPI.getSceneElements();
    const appState = excalidrawAPI.getAppState();
    
    const zoom = appState.zoom.value;
    // Correct formula: scrollX/scrollY in Excalidraw are negative offsets
    // To get the scene coordinates of the viewport center:
    const centerX = (-appState.scrollX + window.innerWidth / 2) / zoom;
    const centerY = (-appState.scrollY + window.innerHeight / 2) / zoom;

    if (type === 'photo') {
      try {
        const proxyUrl = `/api/proxy?url=${encodeURIComponent(material.file_url)}`;
        const resp = await fetch(proxyUrl);
        if (!resp.ok) throw new Error(`Proxy failed: ${resp.status}`);

        const blob = await resp.blob();
        const dataURL: string = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });

        const fileId = material.id as string;

        excalidrawAPI.updateScene({
          elements: [
            ...elements,
            {
              type: 'image',
              fileId,
              status: 'pending',
              x: centerX - 150,
              y: centerY - 150,
              width: 300,
              height: 300,
              version: elements.length + 1,
              versionNonce: Math.floor(Math.random() * 1e9),
              isDeleted: false,
              angle: 0,
              opacity: 100,
              seed: Math.floor(Math.random() * 1e9),
            }
          ],
          files: {
            [fileId]: {
              id: fileId,
              dataURL,
              mimeType: blob.type || 'image/png',
              created: Date.now(),
            }
          }
        });
      } catch (e) {
        console.error('Image load via proxy failed:', e);
        addTextLink(elements, material, centerX, centerY, '🖼️');
      }
    } else {
      const icon = type === 'video' ? '🎬' : type === 'audio' ? '🎵' : '📄';
      addTextLink(elements, material, centerX, centerY, icon);
    }
  };

  const addTextLink = (elements: any[], material: any, x: number, y: number, icon: string) => {
    excalidrawAPI.updateScene({
      elements: [
        ...elements,
        {
          type: 'text',
          text: `${icon} ${material.name}`,
          x: x - 80,
          y: y - 15,
          fontSize: 20,
          link: material.file_url,
          strokeColor: '#3b82f6',
          version: elements.length + 1,
          versionNonce: Math.floor(Math.random() * 1e9),
          isDeleted: false,
          angle: 0,
          opacity: 100,
          seed: Math.floor(Math.random() * 1e9),
        }
      ]
    });
  };


  return (
    <Stack gap="lg" h="100%" className="boards-container">
      <Group justify="space-between" align="center">
        <Title order={2} className="font-bold">
          {current_board?.title || t('title')}
        </Title>
        
        <Tooltip label={t('picker_title')}>
          <ActionIcon 
            onClick={openPicker} 
            variant="light" 
            size="lg" 
            radius="md" 
            color="blue"
          >
            <IoLibraryOutline size={22} />
          </ActionIcon>
        </Tooltip>
      </Group>

      <Box className="flex-1 relative border border-white/10 rounded-xl overflow-hidden bg-[#121212]">
        <LoadingOverlay visible={loading} overlayProps={{ blur: 2 }} />
        
        {/* {!loading && colorScheme && (
          <Excalidraw 
            excalidrawAPI={(api) => setExcalidrawAPI(api)}
            initialData={{
              elements: current_board?.elements || [],
              appState: { 
                ...current_board?.appState,
                collaborators: new Map(),
                theme: colorScheme === 'dark' ? 'dark' : 'light',
              },
              scrollToContent: true,
            }}
            theme={colorScheme === 'dark' ? 'dark' : 'light'}
            langCode={langCode}
          />
        )} */}
      </Box>

      <MaterialsPickerModal 
        opened={pickerOpened}
        onClose={closePicker}
        onSelect={handleSelectMaterial}
        initialType="photo"
      />
    </Stack>
  );
}
