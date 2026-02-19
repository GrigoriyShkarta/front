'use client';

import { Modal, ActionIcon, Group, Box, Image, Tooltip, Stack, Text } from '@mantine/core';
import { IoCloseOutline, IoAddOutline, IoRemoveOutline, IoRefreshOutline, IoChevronBackOutline, IoChevronForwardOutline } from 'react-icons/io5';
import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { PhotoMaterial } from '../schemas/photo-schema';

interface Props {
  opened: boolean;
  onClose: () => void;
  photo: PhotoMaterial | null;
  photos: PhotoMaterial[];
  onPhotoChange: (photo: PhotoMaterial) => void;
}

export function PhotoPreviewModal({ opened, onClose, photo, photos, onPhotoChange }: Props) {
  const t = useTranslations('Materials.photo.preview');
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (opened) {
      setZoom(1);
      setRotation(0);
    }
  }, [opened]);

  const handle_zoom_in = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handle_zoom_out = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
  const handle_rotate = () => setRotation(prev => prev + 90);
  const handle_reset = () => {
    setZoom(1);
    setRotation(0);
  };

  const handle_next = useCallback(() => {
    if (!photo || photos.length <= 1) return;
    const currentIndex = photos.findIndex(p => p.id === photo.id);
    const nextIndex = (currentIndex + 1) % photos.length;
    onPhotoChange(photos[nextIndex]);
    handle_reset();
  }, [photo, photos, onPhotoChange]);

  const handle_prev = useCallback(() => {
    if (!photo || photos.length <= 1) return;
    const currentIndex = photos.findIndex(p => p.id === photo.id);
    const prevIndex = (currentIndex - 1 + photos.length) % photos.length;
    onPhotoChange(photos[prevIndex]);
    handle_reset();
  }, [photo, photos, onPhotoChange]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!opened) return;
      if (e.key === 'ArrowRight') handle_next();
      if (e.key === 'ArrowLeft') handle_prev();
      if (e.key === 'Escape') onClose();
      if (e.key === 'r' || e.key === 'к') handle_rotate();
    };

    const handleWheel = (e: WheelEvent) => {
      if (!opened) return;
      if (e.deltaY < 0) handle_zoom_in();
      else handle_zoom_out();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [opened, handle_next, handle_prev, onClose]);

  if (!photo) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      fullScreen
      withCloseButton={false}
      styles={{
        content: { backgroundColor: 'transparent' },
        body: { 
          padding: 0, 
          height: '100vh', 
          overflow: 'hidden', 
          position: 'relative',
          backgroundColor: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(30px) saturate(180%) contrast(90%)',
          WebkitBackdropFilter: 'blur(30px) saturate(180%) contrast(90%)',
        }
      }}
    >
      {/* Top Header */}
      <Box className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-[1001]">
        <Stack gap={4}>
          <Text fw={600} size="lg" c="white" className="drop-shadow-md">
            {photo.name}
          </Text>
          <Text size="xs" c="dimmed">
            {t('zoom_level')}: {Math.round(zoom * 100)}% | {t('rotation')}: {rotation}° | {photos.findIndex(p => p.id === photo.id) + 1} / {photos.length}
          </Text>
        </Stack>

        <Tooltip label={t('close')} openDelay={500}>
          <ActionIcon 
            variant="filled" 
            color="dark" 
            size="xl" 
            radius="xl" 
            onClick={onClose}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10"
          >
            <IoCloseOutline size={28} />
          </ActionIcon>
        </Tooltip>
      </Box>

      {/* Main Viewport */}
      <Box 
        className="w-full h-full flex items-center justify-center cursor-zoom-out"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <Box
          style={{
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
            transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            maxWidth: '85%',
            maxHeight: '85%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Image
            src={photo.file_url}
            alt={photo.name}
            fit="contain"
            className="shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-md border border-white/10"
          />
        </Box>
      </Box>

      {/* Floating Elegant Controls */}
      <Box className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[1001]">
        <Group 
          p={6} 
          gap="xs"
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] shadow-2xl px-4"
        >
          <Tooltip label={t('zoom_out')} openDelay={500}>
            <ActionIcon variant="subtle" color="gray" size="lg" radius="xl" onClick={handle_zoom_out} disabled={zoom <= 0.5}>
              <IoRemoveOutline size={20} />
            </ActionIcon>
          </Tooltip>
          
          <Box className="w-px h-6 bg-white/10 mx-1" />

          <Tooltip label={t('prev')} openDelay={500}>
            <ActionIcon variant="subtle" color="gray" size="lg" radius="xl" onClick={handle_prev}>
              <IoChevronBackOutline size={20} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label={t('rotate')} openDelay={500}>
            <ActionIcon variant="light" color="blue" size="xl" radius="xl" onClick={handle_rotate} className="mx-2">
              <IoRefreshOutline size={22} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label={t('next')} openDelay={500}>
            <ActionIcon variant="subtle" color="gray" size="lg" radius="xl" onClick={handle_next}>
              <IoChevronForwardOutline size={20} />
            </ActionIcon>
          </Tooltip>

          <Box className="w-px h-6 bg-white/10 mx-1" />

          <Tooltip label={t('zoom_in')} openDelay={500}>
            <ActionIcon variant="subtle" color="gray" size="lg" radius="xl" onClick={handle_zoom_in} disabled={zoom >= 3}>
              <IoAddOutline size={20} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Box>
    </Modal>
  );
}
