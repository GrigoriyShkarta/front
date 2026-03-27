'use client';

import { Modal, Stack, Text, ColorPicker, SegmentedControl, Grid, Group, ColorSwatch, useMantineColorScheme } from '@mantine/core';
import { useTranslations } from 'next-intl';
import { IoSettingsOutline, IoGridOutline, IoEllipsisHorizontalOutline, IoStopOutline } from 'react-icons/io5';
import { GridType } from '../types';

interface BoardSettingsModalProps {
  opened: boolean;
  onClose: () => void;
  bgColor: string;
  onBgColorChange: (color: string) => void;
  gridType: GridType;
  onGridTypeChange: (type: GridType) => void;
  boardTheme: 'light' | 'dark' | 'auto';
  onBoardThemeChange: (theme: 'light' | 'dark' | 'auto') => void;
}

const LIGHT_COLORS = ['#f8f9fa', '#ffffff', '#e9ecef', '#f1f3f5', '#fff4e6', '#f3f0ff', '#e7f5ff', '#e6fcf5'];
const DARK_COLORS  = ['#12121e', '#1a1b26', '#1e1e2d', '#25262b', '#2a1a2e', '#1a2e2a', '#1a252e', '#2e251a'];

export function BoardSettingsModal({ 
  opened, onClose, bgColor, onBgColorChange, gridType, onGridTypeChange,
  boardTheme, onBoardThemeChange
}: BoardSettingsModalProps) {
  const t = useTranslations('Boards');
  const common_t = useTranslations('Common');
  const { colorScheme } = useMantineColorScheme();

  const is_effective_dark = boardTheme === 'auto' ? (colorScheme === 'dark') : (boardTheme === 'dark');
  const swatches = is_effective_dark ? DARK_COLORS : LIGHT_COLORS;

  return (
    <Modal 
      opened={opened} onClose={onClose} 
      title={
        <Group gap="xs">
          <IoSettingsOutline color="var(--space-primary)" />
          <Text fw={600}>{common_t('settings')}</Text>
        </Group>
      }
      centered radius="lg" size="sm"
      overlayProps={{ blur: 5, opacity: 0.4 }}
    >
      <Stack gap="xl">
        <section>
          <Text size="sm" fw={600} mb="xs">{t('board_theme') || 'Board Theme'}</Text>
          <SegmentedControl
            fullWidth
            value={boardTheme}
            onChange={(val) => onBoardThemeChange(val as any)}
            color="primary"
            data={[
              { label: t('auto') || 'Auto', value: 'auto' },
              { label: t('light') || 'Light', value: 'light' },
              { label: t('dark') || 'Dark', value: 'dark' },
            ]}
          />
        </section>

        <section>
          <Text size="sm" fw={600} mb="xs">{t('background_color') || 'Background Color'}</Text>
          <Stack gap="xs">
            <Group gap="xs">
              <div 
                onClick={() => onBgColorChange('auto')}
                style={{ 
                  width: 24, height: 24, borderRadius: '50%', cursor: 'pointer',
                  background: is_effective_dark ? '#12121e' : '#f8f9fa',
                  border: bgColor === 'auto' ? '2px solid var(--space-primary)' : `1px solid ${is_effective_dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700,
                  color: is_effective_dark ? '#fff' : '#000',
                  boxShadow: bgColor === 'auto' ? '0 0 8px rgba(var(--space-primary-rgb), 0.5)' : 'none'
                }}
              >
                A
              </div>
              <Text size="xs" fw={500} style={{ opacity: 0.6 }}>{t('auto') || 'Auto'}</Text>
            </Group>
            <ColorPicker 
              value={bgColor === 'auto' ? (is_effective_dark ? '#12121e' : '#f8f9fa') : bgColor} 
              onChange={onBgColorChange} 
              format="hex" 
              fullWidth
              withPicker={false}
              swatches={swatches}
              swatchesPerRow={4}
            />
            <ColorPicker 
              value={bgColor === 'auto' ? (is_effective_dark ? '#12121e' : '#f8f9fa') : bgColor} 
              onChange={onBgColorChange} 
              format="hex" 
              fullWidth
            />
          </Stack>
        </section>

        <section>
          <Text size="sm" fw={600} mb="xs">{t('grid_type') || 'Grid Type'}</Text>
          <SegmentedControl
            fullWidth
            value={gridType}
            onChange={(val) => onGridTypeChange(val as GridType)}
            data={[
              { label: (
                <Stack gap={2} align="center">
                  <IoGridOutline size={16} />
                  <Text size="xs">{t('cells') || 'Cells'}</Text>
                </Stack>
              ), value: 'cells' },
              { label: (
                <Stack gap={2} align="center">
                  <IoEllipsisHorizontalOutline size={16} />
                  <Text size="xs">{t('dots') || 'Dots'}</Text>
                </Stack>
              ), value: 'dots' },
              { label: (
                <Stack gap={2} align="center">
                  <IoStopOutline size={16} />
                  <Text size="xs">{t('none') || 'None'}</Text>
                </Stack>
              ), value: 'none' },
            ]}
          />
        </section>
      </Stack>
    </Modal>
  );
}
