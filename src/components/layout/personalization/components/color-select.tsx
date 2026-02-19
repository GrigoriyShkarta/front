'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { 
  Box, 
  Text, 
  UnstyledButton, 
  Tooltip, 
  Divider, 
  Group, 
  ColorPicker, 
  Popover, 
  Button, 
  ColorInput, 
  Stack, 
  ActionIcon,
  Slider,
  Select,
  TextInput
} from '@mantine/core';
import { cn } from '@/lib/utils';
import type { ColorOption, SolidColorOption, GradientOption } from '@/lib/constants';
import { IoColorPaletteOutline, IoSparklesOutline, IoAddOutline, IoTrashOutline, IoLockClosedOutline, IoDiamondOutline } from 'react-icons/io5';

interface Props {
  label: string;
  options: ColorOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  show_gradients?: boolean;
  solid_label?: string;
  gradients_label?: string;
  is_premium?: boolean;
  type?: 'primary' | 'secondary' | 'background';
}

function ColorCircle({ option, selected, onClick, is_premium_user }: { 
  option: SolidColorOption; 
  selected: boolean; 
  onClick: () => void;
  is_premium_user?: boolean;
}) {
  return (
    <Tooltip label={option.category || option.id} position="top" withArrow>
      <UnstyledButton
        onClick={onClick}
        className={cn(
          "w-9 h-9 rounded-full border-2 transition-all duration-200 hover:scale-110 hover:shadow-lg relative",
          selected 
            ? "border-white scale-110 shadow-md ring-2 ring-offset-2 ring-blue-500" 
            : "border-transparent hover:border-gray-300 dark:hover:border-gray-600"
        )}
        style={{ backgroundColor: option.hex }}
      >
        {option.is_premium && !is_premium_user && (
          <Box 
            className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-md z-10 border border-gray-100 dark:border-zinc-800"
            style={{ backgroundColor: 'white' }}
          >
             <IoDiamondOutline size={10} style={{ color: 'var(--space-primary)' }} />
          </Box>
        )}
      </UnstyledButton>
    </Tooltip>
  );
}

export function ColorSelect({ 
  label, 
  options, 
  value, 
  onChange, 
  error, 
  show_gradients = true, 
  solid_label = 'Solid Colors', 
  gradients_label = 'Gradients',
  is_premium = false,
  type = 'primary'
}: Props) {
  const t = useTranslations('Personalization');
  const solid_colors = options.filter((opt): opt is SolidColorOption => opt.type === 'solid');
  const gradients = options.filter((opt): opt is GradientOption => opt.type === 'gradient');

  const is_custom_solid = is_premium && !options.some(opt => opt.id === value) && !value.includes('gradient');
  const is_custom_gradient = is_premium && value.includes('gradient') && !gradients.some(opt => opt.id === value);

  // Gradient Builder State
  const [grad_colors, set_grad_colors] = useState<string[]>(['#2563eb', '#7c3aed']);
  const [grad_angle, set_grad_angle] = useState<number>(135);

  // Sync builder with current custom gradient if selected
  useEffect(() => {
    if (is_custom_gradient && value.includes('gradient')) {
      const colors = value.match(/#[a-fA-F0-9]{3,6}/g);
      const angle = value.match(/(\d+)deg/);
      if (colors && colors.length >= 2) set_grad_colors(colors);
      if (angle) set_grad_angle(parseInt(angle[1]));
    }
  }, [value, is_custom_gradient]);

  const add_color = () => {
    if (grad_colors.length < 5) {
      set_grad_colors([...grad_colors, '#ffffff']);
    }
  };

  const remove_color = (index: number) => {
    if (grad_colors.length > 2) {
      set_grad_colors(grad_colors.filter((_, i) => i !== index));
    }
  };

  const update_color = (index: number, color: string) => {
    const next = [...grad_colors];
    next[index] = color;
    set_grad_colors(next);
  };

  const generated_gradient = `linear-gradient(${grad_angle}deg, ${grad_colors.map((c, i) => `${c} ${(i / (grad_colors.length - 1)) * 100}%`).join(', ')})`;

  const handle_apply_gradient = () => {
    onChange(generated_gradient);
  };

  const primary_groups = type === 'primary' 
    ? solid_colors.reduce((acc, curr) => {
        const cat = curr.category || 'Other';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(curr);
        return acc;
      }, {} as Record<string, SolidColorOption[]>)
    : null;

  return (
    <Box>
      <Text size="sm" fw={500} mb={12}>
        {label}
      </Text>
      
      {/* Solid Colors */}
      <Box mb={show_gradients && (gradients.length > 0 || is_premium) ? 'md' : 0}>
        <Group justify="space-between" mb={8}>
          <Text size="xs" c="dimmed" className="uppercase tracking-wide">
            {solid_label}
          </Text>
          <Popover position="bottom" withArrow shadow="md">
            <Popover.Target>
              <Button 
                variant="subtle" 
                size="compact-xs" 
                leftSection={<IoColorPaletteOutline />}
                rightSection={!is_premium && <IoDiamondOutline size={10} style={{ color: 'var(--space-primary)' }} />}
              >
                {t('custom_color')}
              </Button>
            </Popover.Target>
              <Popover.Dropdown p="xs">
                <Stack gap="xs">
                  <ColorPicker 
                    value={is_custom_solid ? value : '#2563eb'} 
                    onChange={onChange} 
                    format="hex"
                    fullWidth
                  />
                  <ColorInput 
                    value={is_custom_solid ? value : '#2563eb'} 
                    onChange={onChange}
                    placeholder={t('enter_hex')}
                    size="xs"
                    popoverProps={{ withinPortal: false }}
                  />
                </Stack>
              </Popover.Dropdown>
            </Popover>
        </Group>

        {primary_groups ? (
          <Stack gap="md">
            {Object.entries(primary_groups).map(([category, colors]) => (
              <Box key={category}>
                <Text size="10px" fw={700} c="dimmed" mb={4} className="uppercase opacity-70">
                  {category}
                </Text>
                <div className="flex flex-wrap gap-2">
                  {colors.map((option) => (
                    <ColorCircle 
                      key={option.id} 
                      option={option} 
                      selected={value === option.id} 
                      onClick={() => onChange(option.id)} 
                      is_premium_user={is_premium}
                    />
                  ))}
                </div>
              </Box>
            ))}
          </Stack>
        ) : (
          <div className="flex flex-wrap gap-2">
            {solid_colors.map((option) => (
              <ColorCircle 
                key={option.id} 
                option={option} 
                selected={value === option.id} 
                onClick={() => onChange(option.id)} 
                is_premium_user={is_premium}
              />
            ))}
            {is_custom_solid && (
               <Tooltip label={t('custom_color')} position="top" withArrow>
                  <UnstyledButton
                    className="w-9 h-9 rounded-full border-2 border-white scale-110 shadow-md ring-2 ring-offset-2 ring-blue-500"
                    style={{ backgroundColor: value }}
                  />
               </Tooltip>
            )}
          </div>
        )}
      </Box>

      {/* Gradients */}
      {show_gradients && (gradients.length > 0 || is_premium) && (
        <Box>
          <Divider my="md" />
          <Group justify="space-between" mb={8}>
            <Text size="xs" c="dimmed" className="uppercase tracking-wide">
              {gradients_label}
            </Text>
            <Popover position="bottom" withArrow shadow="md" width={320}>
              <Popover.Target>
                <Button 
                    variant="subtle" 
                    size="compact-xs" 
                    leftSection={<IoSparklesOutline />}
                    rightSection={!is_premium && <IoDiamondOutline size={10} style={{ color: 'var(--space-primary)' }} />}
                >
                  {t('build_gradient')}
                </Button>
              </Popover.Target>
              <Popover.Dropdown p="md">
                 <Stack gap="sm">
                   <Text size="xs" fw={700}>{t('gradient_builder').toUpperCase()}</Text>
                   
                   <Box>
                     <Text size="xs" fw={500} mb={4}>{t('colors_count')} ({grad_colors.length}/5)</Text>
                     <Stack gap="xs">
                        {grad_colors.map((color, idx) => (
                          <Group key={idx} gap="xs" align="flex-end">
                            <ColorInput 
                              label={idx === 0 ? t('color_start') : idx === grad_colors.length - 1 ? t('color_end') : `${t('color_stop')} ${idx}`}
                              value={color} 
                              onChange={(val) => update_color(idx, val)} 
                              size="xs" 
                              className="flex-1"
                              popoverProps={{ withinPortal: false }}
                            />
                            {grad_colors.length > 2 && (
                               <ActionIcon color="red" variant="subtle" size="sm" onClick={() => remove_color(idx)} mb={4}>
                                 <IoTrashOutline size={14} />
                               </ActionIcon>
                            )}
                          </Group>
                        ))}
                        {grad_colors.length < 5 && (
                          <Button 
                            variant="light" 
                            size="compact-xs" 
                            leftSection={<IoAddOutline />} 
                            onClick={add_color}
                          >
                            {t('add_color_stop')}
                          </Button>
                        )}
                     </Stack>
                   </Box>

                   <Box>
                     <Text size="xs" fw={500} mb={4}>{t('angle')}: {grad_angle}°</Text>
                     <Slider 
                      min={0} 
                      max={360} 
                      step={1} 
                      value={grad_angle} 
                      onChange={set_grad_angle} 
                      label={(val) => `${val}°`}
                      size="sm"
                     />
                   </Box>

                   <Box 
                    h={60} 
                    className="rounded-lg shadow-inner border border-gray-200 dark:border-gray-800" 
                    style={{ background: generated_gradient }} 
                   />
                   
                   <Button size="xs" fullWidth onClick={() => {
                     handle_apply_gradient();
                   }}>
                     {t('apply_gradient')}
                   </Button>
                 </Stack>
               </Popover.Dropdown>
             </Popover>
          </Group>

          <div className="flex flex-wrap gap-2">
            {gradients.map((option) => (
              <Tooltip key={option.id} label={option.id} position="top" withArrow>
                <UnstyledButton
                  onClick={() => onChange(option.id)}
                  className={cn(
                    "w-12 h-9 rounded-lg border-2 transition-all duration-200 hover:scale-110 hover:shadow-lg relative",
                    value === option.id 
                      ? "border-white scale-110 shadow-md ring-2 ring-offset-2 ring-blue-500" 
                      : "border-transparent hover:border-gray-300 dark:hover:border-gray-600"
                  )}
                  style={{ background: option.gradient }}
                >
                  {option.is_premium && !is_premium && (
                    <Box 
                      className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-md z-10 border border-gray-100 dark:border-zinc-800"
                      style={{ backgroundColor: 'white' }}
                    >
                       <IoDiamondOutline size={10} style={{ color: 'var(--space-primary)' }} />
                    </Box>
                  )}
                </UnstyledButton>
              </Tooltip>
            ))}
            {is_custom_gradient && (
               <Tooltip label={t('custom_gradient')} position="top" withArrow>
                  <UnstyledButton
                    className="w-12 h-9 rounded-lg border-2 border-white scale-110 shadow-md ring-2 ring-offset-2 ring-blue-500"
                    style={{ background: value }}
                  />
               </Tooltip>
            )}
          </div>
        </Box>
      )}

      {error && (
        <Text c="red" size="xs" mt={8}>
          {error}
        </Text>
      )}
    </Box>
  );
}
