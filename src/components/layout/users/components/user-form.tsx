'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Stack, 
  TextInput, 
  PasswordInput, 
  Select, 
  Button, 
  Group, 
  FileButton, 
  Avatar, 
  Box,
  Text,
  ActionIcon,
  MultiSelect,
  Tooltip
} from '@mantine/core';
import { IoCloudUploadOutline, IoRefreshOutline, IoAddOutline } from 'react-icons/io5';
import { user_form_schema, UserFormData, UserListItem } from '@/schemas/users';
import { useTranslations } from 'next-intl';
import { useState, useEffect, useMemo } from 'react';
import { generate_password } from '../utils/password';
import { AvatarCropper } from './avatar-cropper';
import { UserRole } from '@/types/auth.types';
import { useCategories } from '../../categories/hooks/use-categories';
import { CategoryDrawer } from '../../categories/components/category-drawer';
import { CreateCategoryForm } from '../../categories/schemas/category-schema';

interface Props {
  initial_data?: UserListItem | null;
  teachers: { id: string; name: string; role: string }[];
  current_user: any;
  on_submit: (data: UserFormData) => void;
  is_loading: boolean;
}

export function UserForm({ initial_data, teachers, current_user, on_submit, is_loading }: Props) {
  const t = useTranslations('Users');
  const common_t = useTranslations('Common');
  const [avatar_preview, set_avatar_preview] = useState<string | null>(initial_data?.avatar || null);
  const [cropper_opened, set_cropper_opened] = useState(false);
  const [raw_image, set_raw_image] = useState<string | null>(null);

  const { categories: categoryList, create_category, create_categories } = useCategories();
  const [categoryDrawerOpened, setCategoryDrawerOpened] = useState(false);

  const current_user_role = current_user?.role;
  const is_teacher = current_user_role === 'teacher';
  const is_super_admin = current_user_role === 'super_admin';

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    watch,
    formState: { errors, isValid },
  } = useForm<UserFormData>({
    resolver: zodResolver(user_form_schema),
    defaultValues: {
      name: initial_data?.name || '',
      email: initial_data?.email || '',
      role: initial_data?.role || 'student',
      teacher_id: initial_data?.teacher_id || current_user?.id,
      password: '',
      categories: initial_data?.categories?.map(c => c.id) || [],
    },
    mode: 'onChange',
  });

  const role = watch('role');
  const watched_categories = watch('categories');

  const on_generate_password = () => {
    const pwd = generate_password();
    setValue('password', pwd, { shouldValidate: true });
  };

  const handleCategoryCreate = async (data: CreateCategoryForm | CreateCategoryForm[]) => {
    let newIds: string[] = [];
    
    if (Array.isArray(data)) {
      const newCategories = await create_categories(data);
      newIds = newCategories.map(c => c.id);
    } else {
      const newCategory = await create_category(data);
      newIds = [newCategory.id];
    }
    
    const currentCategories = watch('categories') || [];
    setValue('categories', [...currentCategories, ...newIds]);
    setCategoryDrawerOpened(false);
  };

  const handle_form_submit = async (data: UserFormData) => {
    try {
      // 1. If current user is a teacher, they can only create students attached to themselves
      if (is_teacher) {
        data.role = 'student';
        data.teacher_id = current_user?.id;
      }
      
      // 2. If creating a teacher, automatically attach to the super admin
      if (data.role === 'teacher') {
        // If the current user is a super admin, attach the new teacher to them.
        // Otherwise (e.g., an admin creating a teacher), attach to the current user's super admin.
        data.teacher_id = is_super_admin ? current_user?.id : current_user?.super_admin_id;
      }

      await on_submit(data);
    } catch (error: any) {
      const server_errors = error.response?.data?.message;
      if (Array.isArray(server_errors)) {
        server_errors.forEach((err_obj: any) => {
          Object.entries(err_obj).forEach(([field, message]) => {
            setError(field as any, { 
              type: 'server', 
              message: `errors.${message}`
            });
          });
        });
      }
    }
  };

  useEffect(() => {
    if (initial_data) {
      set_avatar_preview(initial_data.avatar || null);
    }
  }, [initial_data]);

  const available_roles = [
    ...(is_super_admin ? [{ value: 'admin', label: common_t('roles.admin') }] : []),
    { value: 'teacher', label: common_t('roles.teacher') },
    { value: 'student', label: common_t('roles.student') },
  ];

  const filtered_supervisors = useMemo(() => {
    if (role === 'admin' || role === 'teacher') {
      // Admins and Teachers can only be attached to Super Admins
      return teachers.filter(t => t.role === 'super_admin');
    }
    // Students can be attached to Teachers or Super Admins
    return teachers;
  }, [role, teachers]);

  const handle_crop_complete = (file: File) => {
    set_avatar_preview(URL.createObjectURL(file));
    setValue('avatar', file);
  };

  return (
    <form onSubmit={handleSubmit(handle_form_submit)}>
      <AvatarCropper
        image={raw_image || ''}
        opened={cropper_opened}
        onClose={() => set_cropper_opened(false)}
        onCropComplete={handle_crop_complete}
      />
      <Stack gap="md">
        <Box>
          <Text size="sm" fw={500} mb={4}>{t('form.avatar')}</Text>
          <Group>
            <Avatar src={avatar_preview} size="lg" radius="md" />
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
                <Button {...props} variant="light" leftSection={<IoCloudUploadOutline size={16} />}>
                  {t('form.upload')}
                </Button>
              )}
            </FileButton>
          </Group>
        </Box>

        <TextInput
          label={t('form.name')}
          placeholder={t('form.name_placeholder')}
          required
          withAsterisk
          {...register('name')}
          error={errors.name?.message && common_t(errors.name.message)}
        />

        <TextInput
          label={t('form.email')}
          placeholder={t('form.email_placeholder')}
          required
          withAsterisk
          {...register('email')}
          error={errors.email?.message && common_t(errors.email.message)}
        />

        <PasswordInput
          label={t('form.password')}
          placeholder={t('form.password_placeholder')}
          required={!initial_data}
          withAsterisk={!initial_data}
          {...register('password')}
          error={errors.password?.message && common_t(errors.password.message)}
          leftSection={
            <ActionIcon onClick={on_generate_password} variant="subtle" color="blue" type="button">
              <IoRefreshOutline size={16} />
            </ActionIcon>
          }
          leftSectionPointerEvents="all"
        />

        {/* {!is_teacher && (
          <Select
            label={t('form.role')}
            required
            withAsterisk
            data={available_roles}
            value={role}
            onChange={(val) => setValue('role', val as UserRole, { shouldValidate: true })}
            error={errors.role?.message && common_t(errors.role.message)}
          />
        )} */}

        {/* {(role === 'student' || role === 'admin') && !is_teacher && (
          <Select
            label={t('form.attached_to')}
            required
            withAsterisk
            data={filtered_supervisors.map(t => ({ value: t.id, label: t.name }))}
            value={watch('teacher_id')}
            onChange={(val) => setValue('teacher_id', val, { shouldValidate: true })}
            placeholder={t('form.select_teacher')}
            error={errors.teacher_id?.message && common_t(errors.teacher_id.message )}
          />
        )} */}

        <Box>
          <Group justify="space-between" mb={4}>
            <Text size="sm" fw={500}>{t('form.categories')}</Text>
            <Tooltip label={t('form.create_category')}>
              <ActionIcon variant="subtle" size="xs" onClick={() => setCategoryDrawerOpened(true)}>
                <IoAddOutline />
              </ActionIcon>
            </Tooltip>
          </Group>
          <MultiSelect
            placeholder={t('form.categories_placeholder')}
            data={categoryList.map(c => ({ value: c.id, label: c.name }))}
            value={watched_categories}
            onChange={(val) => setValue('categories', val)}
            searchable
            clearable
          />
        </Box>

        <Button 
          type="submit" 
          fullWidth 
          loading={is_loading} 
          disabled={!isValid || is_loading}
          mt="md"
        >
          {common_t('save')}
        </Button>
      </Stack>

      <CategoryDrawer
        opened={categoryDrawerOpened}
        onClose={() => setCategoryDrawerOpened(false)}
        onSubmit={handleCategoryCreate}
      />
    </form>
  );
}
