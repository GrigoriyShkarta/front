'use client';

import { useState, useEffect } from 'react';
import { 
  Group, 
  Stack, 
  Drawer,
  TextInput,
  Button,
  rem,
  Title,
  ScrollArea,
  ColorInput,
  useMantineTheme
} from '@mantine/core';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface Props {
  opened: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; color?: string }) => void;
  initialName?: string;
  initialColor?: string;
}

export function ColumnDrawer({ opened, onClose, onSubmit, initialName, initialColor }: Props) {
  const t = useTranslations('Tracker');
  const common_t = useTranslations('Common');
  const theme = useMantineTheme();
  const [name, setName] = useState(initialName || '');
  const [color, setColor] = useState(initialColor || '');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (opened) {
      setName(initialName || '');
      setColor(initialColor || '');
    }
  }, [opened, initialName, initialColor]);

  const handleClose = () => {
    setName('');
    setColor('');
    setTouched(false);
    onClose();
  };

  const handleSubmit = () => {
    if (name.trim()) {
      onSubmit({ name: name.trim(), color: color || undefined });
      setName('');
      setColor('');
      setTouched(false);
    }
  };

  return (
    <Drawer
      opened={opened}
      onClose={handleClose}
      title={
        <Title order={3} px={{ base: 'xl', sm: 32 }} component="p" className='text-[20px]! leading-tight'>
          {initialName ? t('edit_column') : t('add_column')}
        </Title>
      }
      position="right"
      size="sm"
      padding={0}
      withCloseButton
      styles={{
        root: {
          overflowX: 'hidden',
        },
        content: { 
          overflow: 'visible',
          background: 'var(--mantine-color-body)',
        },
        body: { 
          height: 'calc(100vh - 60px)',
          overflow: 'visible',
          position: 'relative',
          padding: 0
        },
        inner: {
          overflow: 'visible',
        }
      }}
    >
      <ScrollArea h="100%" p="xl">
        <Stack gap="md">
          <TextInput 
            label={t('column_name')} 
            placeholder={t('column_placeholder')} 
            value={name}
            onChange={(e) => {
              setName(e.currentTarget.value);
              setTouched(true);
            }}
            error={touched && !name.trim() ? t('validation.required') : null}
            required
            withAsterisk
            autoFocus
          />
          <ColorInput 
             label={t('column_color')}
             placeholder="#FFFFFF"
             value={color}
             onChange={setColor}
             disallowInput={false}
          />
          <Button 
            fullWidth
            onClick={handleSubmit}
            disabled={!name.trim()}
            mt="md"
            radius="md"
            className="bg-primary text-white hover:bg-primary-hover transition-colors"
          >
            {initialName ? common_t('save') : common_t('add')}
          </Button>
        </Stack>
      </ScrollArea>
    </Drawer>
  );
}
