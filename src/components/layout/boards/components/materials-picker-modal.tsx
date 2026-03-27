'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

import { 
  Modal, 
  Tabs, 
} from '@mantine/core';
import { 
  IoImagesOutline, 
  IoVideocamOutline, 
  IoMusicalNotesOutline, 
  IoFileTrayFullOutline 
} from 'react-icons/io5';

import { categoryActions } from '../../categories/actions/category-actions';

import { PhotosTab } from './materials-picker/photos-tab';
import { VideosTab } from './materials-picker/videos-tab';
import { AudiosTab } from './materials-picker/audios-tab';
import { FilesTab } from './materials-picker/files-tab';

interface MaterialsPickerModalProps {
  opened: boolean;
  onClose: () => void;
  onSelect: (type: 'photo' | 'video' | 'audio' | 'file', material: any) => void;
  initialType?: 'photo' | 'video' | 'audio' | 'file';
}

/**
 * Enhanced Media Library Modal.
 * Supports searching, filtering, paginated viewing and direct uploading for all media types.
 */
export function MaterialsPickerModal({ opened, onClose, onSelect, initialType = 'photo' }: MaterialsPickerModalProps) {
  const t = useTranslations('Materials');
  
  const [activeTab, setActiveTab] = useState<string | null>(initialType);
  const [categories, setCategories] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    setActiveTab(initialType);
  }, [initialType]);

  useEffect(() => {
    if (opened) {
      categoryActions.get_categories({ limit: 100 })
        .then(res => {
          setCategories(res.data.map(c => ({ value: c.id, label: c.name })));
        })
        .catch(() => setCategories([]));
    }
  }, [opened]);

  const handleSelect = (type: 'photo' | 'video' | 'audio' | 'file', item: any) => {
    onSelect(type, item);
    onClose();
  };

  return (
    <Modal 
      opened={opened} 
      onClose={onClose} 
      title={t('picker_title') || 'Select Material'} 
      size="xl" 
      radius="lg"
      overlayProps={{ blur: 5 }}
      styles={{
        content: { minHeight: '600px', display: 'flex', flexDirection: 'column' },
        body: { flex: 1, display: 'flex', flexDirection: 'column' }
      }}
    >
      <Tabs 
        value={activeTab} 
        onChange={setActiveTab} 
        variant="pills" 
        radius="lg" 
        color="primary"
        style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
      >
        <Tabs.List grow mb="md">
          <Tabs.Tab value="photo" leftSection={<IoImagesOutline size={18} />}>{t('photos')}</Tabs.Tab>
          <Tabs.Tab value="video" leftSection={<IoVideocamOutline size={18} />}>{t('videos')}</Tabs.Tab>
          <Tabs.Tab value="audio" leftSection={<IoMusicalNotesOutline size={18} />}>{t('audios')}</Tabs.Tab>
          <Tabs.Tab value="file" leftSection={<IoFileTrayFullOutline size={18} />}>{t('files')}</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="photo" pt="xs">
          <PhotosTab categories={categories} onSelect={(item) => handleSelect('photo', item)} />
        </Tabs.Panel>
        
        <Tabs.Panel value="video" pt="xs">
          <VideosTab categories={categories} onSelect={(item) => handleSelect('video', item)} />
        </Tabs.Panel>
        
        <Tabs.Panel value="audio" pt="xs">
          <AudiosTab categories={categories} onSelect={(item) => handleSelect('audio', item)} />
        </Tabs.Panel>
        
        <Tabs.Panel value="file" pt="xs">
          <FilesTab categories={categories} onSelect={(item) => handleSelect('file', item)} />
        </Tabs.Panel>
      </Tabs>
    </Modal>
  );
}

