'use client';

import { useRef, useState, useCallback } from 'react';
import {
  ActionIcon,
  Box,
  Button,
  Group,
  Loader,
  Modal,
  Slider,
  Stack,
  Text,
  Tooltip,
} from '@mantine/core';
import { useTranslations } from 'next-intl';
import { IoCameraOutline, IoCloseOutline, IoCheckmarkOutline, IoTrashOutline } from 'react-icons/io5';
import { MdOutlineZoomIn, MdOutlineZoomOut, MdOutlineCropRotate } from 'react-icons/md';
import { notifications } from '@mantine/notifications';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { ROLES } from '@/types/auth.types';
import { cn } from '@/lib/utils';

interface Props {
  /** Hero image URL from personalization */
  image_url?: string | null;
  /** primary color for gradient fallback */
  primary_color?: string;
  /** Title displayed on the banner */
  title?: string | null;
  /** Description displayed on the banner */
  description?: string | null;
  /** Called after successful save so parent can refetch */
  on_saved?: (new_url: string | null) => void;
  /** Admin/student display key for the endpoint */
  mode: 'admin' | 'student';
}

interface CropState {
  zoom: number;
  offset_x: number;
  offset_y: number;
}

const DEFAULT_CROP: CropState = { zoom: 1, offset_x: 0, offset_y: 0 };

/**
 * Dashboard hero banner.
 * Admins can upload/crop an image or remove it to show a gradient.
 * Students see read-only banner.
 */
/**
 * Helper to crop image on client side using canvas
 */
async function get_cropped_img(
  image_url: string,
  crop: CropState,
  container_width: number,
  container_height: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.src = image_url;

    image.onload = () => {
      // Set high resolution for the output
      const target_width = 1920;
      const aspect = container_width / container_height;
      const target_height = target_width / aspect;

      canvas.width = target_width;
      canvas.height = target_height;

      // Fill background with white (for JPEG output and empty spaces)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, target_width, target_height);

      const scale_factor = target_width / container_width;

      // Replicate object-fit: contain logic
      const img_aspect = image.width / image.height;
      let render_w, render_h;

      if (img_aspect > aspect) {
        // Image is wider than container aspect
        render_w = target_width;
        render_h = target_width / img_aspect;
      } else {
        // Image is taller than container aspect
        render_h = target_height;
        render_w = target_height * img_aspect;
      }

      const render_x = (target_width - render_w) / 2;
      const render_y = (target_height - render_h) / 2;

      ctx.save();
      // Apply the same transform as CSS: scale then translate
      // Move to center to match transformOrigin: center
      ctx.translate(target_width / 2, target_height / 2);
      ctx.scale(crop.zoom, crop.zoom);
      ctx.translate(crop.offset_x * scale_factor, crop.offset_y * scale_factor);
      ctx.translate(-target_width / 2, -target_height / 2);

      ctx.drawImage(image, render_x, render_y, render_w, render_h);
      ctx.restore();

      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas toBlob failed'));
      }, 'image/jpeg', 0.9);
    };
    image.onerror = () => reject(new Error('Failed to load image for cropping'));
  });
}

export function DashboardBanner({ image_url, primary_color, title, description, on_saved, mode }: Props) {
  const t = useTranslations('Dashboard');
  const tc = useTranslations('Common');
  const { user } = useAuth();

  const is_admin = user?.role === ROLES.ADMIN || user?.role === ROLES.SUPER_ADMIN || user?.role === ROLES.TEACHER;

  const file_input_ref = useRef<HTMLInputElement>(null);
  const [pending_file, set_pending_file] = useState<File | null>(null);
  const [pending_preview, set_pending_preview] = useState<string | null>(null);
  const [crop, set_crop] = useState<CropState>(DEFAULT_CROP);
  const [is_modal_open, set_modal_open] = useState(false);
  const [is_saving, set_saving] = useState(false);
  const [is_dragging, set_is_dragging] = useState(false);
  const [last_pos, set_last_pos] = useState({ x: 0, y: 0 });
  const container_ref = useRef<HTMLDivElement>(null);

  const active_image = image_url ?? null;

  const gradient_bg = primary_color
    ? `linear-gradient(135deg, ${primary_color}dd 0%, ${primary_color}88 50%, ${primary_color}22 100%)`
    : 'linear-gradient(135deg, #3b82f6dd 0%, #8b5cf688 50%, #06b6d422 100%)';

  const handle_file_pick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    set_pending_file(file);
    set_pending_preview(URL.createObjectURL(file));
    set_crop(DEFAULT_CROP);
    set_modal_open(true);
    e.target.value = '';
  };

  const handle_wheel = useCallback((e: React.WheelEvent) => {
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    set_crop(prev => ({
      ...prev,
      zoom: Math.max(1, Math.min(10, prev.zoom + delta)),
    }));
  }, []);

  const handle_mouse_down = (e: React.MouseEvent) => {
    set_is_dragging(true);
    set_last_pos({ x: e.clientX, y: e.clientY });
  };

  const handle_mouse_move = useCallback((e: React.MouseEvent) => {
    if (!is_dragging) return;
    const dx = e.clientX - last_pos.x;
    const dy = e.clientY - last_pos.y;
    set_crop(prev => ({
      ...prev,
      offset_x: prev.offset_x + dx / prev.zoom,
      offset_y: prev.offset_y + dy / prev.zoom,
    }));
    set_last_pos({ x: e.clientX, y: e.clientY });
  }, [is_dragging, last_pos]);

  const handle_mouse_up = () => {
    set_is_dragging(false);
  };

  const handle_save = useCallback(async () => {
    if (!pending_file || !pending_preview || !container_ref.current) return;
    set_saving(true);
    try {
      // Actually crop the image before sending
      const cropped_blob = await get_cropped_img(
        pending_preview,
        crop,
        container_ref.current.clientWidth,
        container_ref.current.clientHeight
      );

      const form_data = new FormData();
      form_data.append('file', cropped_blob, 'banner.jpg');
      const response = await api.post('/space/dashboard-image', form_data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const new_url: string = response.data?.url ?? response.data?.dashboard_hero_image ?? response.data?.student_dashboard_hero_image ?? '';

      const field = mode === 'admin' ? 'dashboard_hero_image' : 'student_dashboard_hero_image';
      await api.patch('/space/dashboard', { [field]: new_url });

      notifications.show({ color: 'green', message: t('save_success') });
      on_saved?.(new_url);
      set_modal_open(false);
      set_pending_file(null);
      set_pending_preview(null);
      set_crop(DEFAULT_CROP);
    } catch (err) {
      console.error('Crop error:', err);
      notifications.show({ color: 'red', message: tc('error') });
    } finally {
      set_saving(false);
    }
  }, [pending_file, pending_preview, crop, mode, t, tc, on_saved]);

  const handle_remove = async () => {
    set_saving(true);
    try {
      const field = mode === 'admin' ? 'dashboard_hero_image' : 'student_dashboard_hero_image';
      await api.patch('/space/dashboard', { [field]: null });
      notifications.show({ color: 'green', message: t('save_success') });
      on_saved?.(null);
    } catch {
      notifications.show({ color: 'red', message: tc('error') });
    } finally {
      set_saving(false);
    }
  };

  const image_transform = `scale(${crop.zoom}) translate(${crop.offset_x}px, ${crop.offset_y}px)`;

  return (
    <>
      <Box
        className="relative w-full overflow-hidden rounded-2xl"
        style={{ height: 280, background: active_image ? undefined : gradient_bg }}
      >
        {/* Background image */}
        {active_image && (
          <img
            src={active_image}
            alt="banner"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Gradient overlay for readability */}
        <div
          className="absolute inset-0"
          style={{
            background: active_image
              ? 'linear-gradient(to right, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.05) 100%)'
              : undefined,
          }}
        />

        {/* Decorative blobs for gradient mode */}
        {!active_image && (
          <>
            <div
              className="absolute -top-12 -right-12 w-64 h-64 rounded-full opacity-20 blur-3xl"
              style={{ background: primary_color ?? '#3b82f6' }}
            />
            <div
              className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full opacity-15 blur-2xl"
              style={{ background: primary_color ?? '#8b5cf6' }}
            />
          </>
        )}

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-12">
          {title && (
            <Text
              fw={800}
              size="xl"
              className={cn(
                'text-2xl md:text-3xl leading-tight',
                active_image ? 'text-white' : 'text-white',
              )}
              style={{ textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
            >
              {title}
            </Text>
          )}
          {description && (
            <Text
              size="sm"
              mt={6}
              className="text-white/80 max-w-lg leading-relaxed"
              style={{ textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}
            >
              {description}
            </Text>
          )}
        </div>

        {/* Admin controls */}
        {is_admin && (
          <Group gap={6} className="absolute top-3 right-3">
            {is_saving && <Loader size="xs" color="white" />}
            {active_image && (
              <Tooltip label={tc('delete')} position="bottom">
                <ActionIcon
                  variant="filled"
                  color="red"
                  radius="xl"
                  size="md"
                  onClick={handle_remove}
                  disabled={is_saving}
                >
                  <IoTrashOutline size={14} />
                </ActionIcon>
              </Tooltip>
            )}
            <Tooltip label={t('banner_upload')} position="bottom">
              <ActionIcon
                variant="white"
                radius="xl"
                size="md"
                onClick={() => file_input_ref.current?.click()}
                disabled={is_saving}
                className="shadow-lg"
              >
                <IoCameraOutline size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
        )}

        <input
          ref={file_input_ref}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handle_file_pick}
        />
      </Box>

      {/* Crop / zoom modal */}
      <Modal
        opened={is_modal_open}
        onClose={() => { set_modal_open(false); set_pending_file(null); set_pending_preview(null); }}
        title={t('banner_crop_title')}
        size="lg"
        radius="lg"
        centered
      >
        <Stack gap="md">
          {/* Preview area with live crop */}
          <Box
            ref={container_ref}
            className={cn(
              "relative w-full overflow-hidden rounded-xl bg-black/5 dark:bg-white/5 select-none",
              is_dragging ? "cursor-grabbing" : "cursor-grab"
            )}
            style={{ height: 220 }}
            onWheel={handle_wheel}
            onMouseDown={handle_mouse_down}
            onMouseMove={handle_mouse_move}
            onMouseUp={handle_mouse_up}
            onMouseLeave={handle_mouse_up}
          >
            {pending_preview && (
              <img
                src={pending_preview}
                alt="preview"
                className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                style={{
                  transform: `scale(${crop.zoom}) translate(${crop.offset_x}px, ${crop.offset_y}px)`,
                  transformOrigin: 'center',
                }}
              />
            )}
          </Box>

          <Group gap="sm" justify="flex-end" mt="xs">
            <Button
              variant="subtle"
              leftSection={<IoCloseOutline size={16} />}
              onClick={() => { set_modal_open(false); set_pending_file(null); set_pending_preview(null); }}
              disabled={is_saving}
            >
              {tc('cancel')}
            </Button>
            <Button
              leftSection={<IoCheckmarkOutline size={16} />}
              onClick={handle_save}
              loading={is_saving}
            >
              {tc('save')}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
