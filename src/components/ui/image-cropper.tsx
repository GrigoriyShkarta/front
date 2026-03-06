'use client';

import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Modal, Button, Slider, Stack, Group, Text, Box } from '@mantine/core';
import { useTranslations } from 'next-intl';
import getCroppedImg from '@/lib/image-utils';

interface Props {
  image: string;
  opened: boolean;
  onClose: () => void;
  onCropComplete: (file: File) => void;
  aspect?: number;
  cropShape?: 'rect' | 'round';
  title?: string;
}

/**
 * Generic image cropper component
 */
export function ImageCropper({ 
  image, 
  opened, 
  onClose, 
  onCropComplete, 
  aspect = 1, 
  cropShape = 'rect',
  title
}: Props) {
  const t = useTranslations('Users.cropper'); // Fallback to existing translations or we can add specific ones
  const common_t = useTranslations('Common');
  
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const onCropChange = (crop: { x: number; y: number }) => {
    setCrop(crop);
  };

  const onZoomChange = (zoom: number) => {
    setZoom(zoom);
  };

  const onComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    try {
      const croppedImage = await getCroppedImg(image, croppedAreaPixels, 'logo.jpg');
      if (croppedImage) {
        onCropComplete(croppedImage);
        onClose();
      }
    } catch (e) {
      console.error('Error cropping image:', e);
    }
  };

  return (
    <Modal 
      opened={opened} 
      onClose={onClose} 
      title={title || t('title')} 
      size="lg"
      centered
      zIndex={3000} // High z-index for modals
    >
      <Stack gap="md">
        <Box pos="relative" h={400} bg="black" style={{ borderRadius: '8px', overflow: 'hidden' }}>
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={onCropChange}
            onCropComplete={onComplete}
            onZoomChange={onZoomChange}
            cropShape={cropShape}
            showGrid={true}
          />
        </Box>

        <Box>
          <Text size="sm" mb={4}>{t('zoom')}</Text>
          <Slider
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            onChange={setZoom}
            label={(value) => `${Math.round(value * 100)}%`}
          />
        </Box>

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" color="gray" onClick={onClose}>
            {common_t('cancel')}
          </Button>
          <Button onClick={handleSave}>
            {common_t('save')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
