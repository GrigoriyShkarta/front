'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Stack, 
  TextInput, 
  Button, 
  Group, 
  FileButton, 
  Avatar, 
  Box,
  Text,
  SimpleGrid
} from '@mantine/core';
import { IoCloudUploadOutline } from 'react-icons/io5';
import { profile_update_schema, ProfileUpdateData } from '../schemas/profile-schema';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { AvatarCropper } from '../../users/components/avatar-cropper';
import { User } from '@/types/auth.types';

interface Props {
  user: User;
  on_submit: (data: ProfileUpdateData) => Promise<void>;
  is_loading: boolean;
}

/**
 * Form for updating user's personal information.
 * Features avatar uploading with cropping and basic info fields.
 */
export function ProfileInfoForm({ user, on_submit, is_loading }: Props) {
  const t = useTranslations('Profile');
  const common_t = useTranslations('Common');
  const [avatar_preview, set_avatar_preview] = useState<string | null>(user.avatar || null);
  const [cropper_opened, set_cropper_opened] = useState(false);
  const [raw_image, set_raw_image] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isDirty, isValid },
  } = useForm<ProfileUpdateData>({
    resolver: zodResolver(profile_update_schema),
    defaultValues: {
      name: user.name || '',
      email: user.email || '',
      birthday: user.birthday ? user.birthday.split('T')[0] : '',
      city: user.city || '',
      telegram: user.telegram || '',
      instagram: user.instagram || '',
    },
    mode: 'onChange',
  });

  const handle_form_submit = async (data: ProfileUpdateData) => {
    await on_submit(data);
  };

  const handle_crop_complete = (file: File) => {
    set_avatar_preview(URL.createObjectURL(file));
    setValue('avatar', file, { shouldDirty: true });
  };

  return (
    <form onSubmit={handleSubmit(handle_form_submit)}>
      <AvatarCropper
        image={raw_image || ''}
        opened={cropper_opened}
        onClose={() => set_cropper_opened(false)}
        onCropComplete={handle_crop_complete}
      />
      
      <Stack gap="xl">
        <Box>
          <Text size="sm" fw={500} mb={8}>{t('fields.avatar')}</Text>
          <Group gap="xl">
            <Avatar src={avatar_preview} size={100} radius="md" fw={700}>
              {user.name.charAt(0)}
            </Avatar>
            <Stack gap="xs">
              <FileButton 
                onChange={(file) => {
                  if (file) {
                    set_raw_image(URL.createObjectURL(file));
                    set_cropper_opened(true);
                  }
                }} 
                accept="image/png,image/jpeg"
              >
                {(props) => (
                  <Button {...props} variant="light" leftSection={<IoCloudUploadOutline size={18} />}>
                    {t('actions.upload_avatar')}
                  </Button>
                )}
              </FileButton>
              <Text size="xs" c="dimmed">{t('avatar_hint')}</Text>
            </Stack>
          </Group>
        </Box>

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
          <TextInput
            label={t('fields.name')}
            placeholder={t('placeholders.name')}
            required
            withAsterisk
            {...register('name')}
            error={errors.name?.message && common_t(errors.name.message)}
          />

          <TextInput
            label={t('fields.email')}
            placeholder={t('placeholders.email')}
            required
            withAsterisk
            {...register('email')}
            error={errors.email?.message && common_t(errors.email.message)}
          />

          <TextInput
            label={t('fields.birthday')}
            type="date"
            placeholder={t('placeholders.birthday')}
            {...register('birthday')}
          />

          <TextInput
            label={t('fields.city')}
            placeholder={t('placeholders.city')}
            {...register('city')}
          />

          <TextInput
            label={t('fields.telegram')}
            placeholder={t('placeholders.telegram')}
            {...register('telegram')}
          />

          <TextInput
            label={t('fields.instagram')}
            placeholder={t('placeholders.instagram')}
            {...register('instagram')}
          />
        </SimpleGrid>

        <Group justify="flex-end">
          <Button 
            type="submit" 
            loading={is_loading} 
            disabled={!isDirty || !isValid || is_loading}
            className="px-8 shadow-sm"
          >
            {common_t('save')}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
