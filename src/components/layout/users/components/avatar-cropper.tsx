'use client';

import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Modal, Button, Slider, Stack, Group, Text, Box } from '@mantine/core';
import { useTranslations } from 'next-intl';
import getCroppedImg from '../utils/crop-image';

interface Props {
  image: string;
  opened: boolean;
  onClose: () => void;
  onCropComplete: (file: File) => void;
}

export function AvatarCropper({ image, opened, onClose, onCropComplete }: Props) {
  const t = useTranslations('Users.cropper');
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
      const croppedImage = await getCroppedImg(image, croppedAreaPixels);
      if (croppedImage) {
        onCropComplete(croppedImage);
        onClose();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Modal 
      opened={opened} 
      onClose={onClose} 
      title={t('title')} 
      size="lg"
      centered
    >
      <Stack gap="md">
        <Box pos="relative" h={400} bg="black" style={{ borderRadius: '8px', overflow: 'hidden' }}>
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={onCropChange}
            onCropComplete={onComplete}
            onZoomChange={onZoomChange}
            cropShape="round"
            showGrid={false}
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
