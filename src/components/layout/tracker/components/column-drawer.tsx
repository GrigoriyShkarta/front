'use client';

import { useState, useEffect } from 'react';
import { 
  Stack, 
  Drawer,
  TextInput,
  Button,
  Title,
  ScrollArea,
  Popover,
  ColorSwatch,
  ColorPicker,
  Tooltip,
} from '@mantine/core';
import { useTranslations } from 'next-intl';

interface Props {
  opened: boolean;
  initialName?: string;
  initialColor?: string;
  onClose: () => void;
  onSubmit: (data: { name: string; color?: string }) => void;
  loading?: boolean;
}

export function ColumnDrawer({ opened, onClose, onSubmit, initialName, initialColor, loading }: Props) {
  const t = useTranslations('Tracker');
  const common_t = useTranslations('Common');
  const [name, setName] = useState(initialName || '');
  const [color, setColor] = useState(initialColor || '#2563eb');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (opened) {
      setName(initialName || '');
      setColor(initialColor || '#2563eb');
    }
  }, [opened, initialName, initialColor]);

  const handleClose = () => {
    onClose();
    setTimeout(() => {
        setName('');
        setColor('#2563eb');
        setTouched(false);
    }, 200);
  };

  const handleSubmit = () => {
    if (name.trim()) {
      onSubmit({ name: name.trim(), color: color || undefined });
      handleClose();
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
            rightSection={
              <Popover position="bottom-end" shadow="md" withArrow>
                <Popover.Target>
                  <Tooltip label={t('column_color')}>
                    <ColorSwatch 
                      color={color || '#2563eb'} 
                      size={20} 
                      className="cursor-pointer hover:scale-110 transition-transform" 
                    />
                  </Tooltip>
                </Popover.Target>
                <Popover.Dropdown p="xs">
                  <Stack gap="xs">
                    <ColorPicker
                      value={color || '#2563eb'}
                      onChange={setColor}
                      format="hex"
                    />
                    <TextInput 
                      size="xs"
                      value={color}
                      onChange={(e) => setColor(e.currentTarget.value)}
                    />
                  </Stack>
                </Popover.Dropdown>
              </Popover>
            }
          />
          <Button 
            fullWidth
            onClick={handleSubmit}
            disabled={!name.trim()}
            loading={loading}
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
