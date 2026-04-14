'use client';

import { 
  TextInput, 
  Button, 
  Stack, 
  Group, 
  Drawer, 
  ActionIcon, 
  Box, 
  Text,
  Popover,
  ColorSwatch,
  ColorPicker,
  Tooltip
} from '@mantine/core';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { bulk_create_category_schema, BulkCreateCategoryForm, CreateCategoryForm, CategoryMaterial } from '../schemas/category-schema';
import { IoAddOutline, IoTrashOutline } from 'react-icons/io5';

interface Props {
  opened: boolean;
  editing_category?: CategoryMaterial | null;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCategoryForm | CreateCategoryForm[]) => Promise<void>;
}

export function CategoryDrawer({ opened, onClose, onSubmit, editing_category, loading }: Props) {
  const t = useTranslations('Categories');
  const common_t = useTranslations('Common');

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<BulkCreateCategoryForm>({
    resolver: zodResolver(bulk_create_category_schema),
    mode: 'onChange',
    defaultValues: {
      categories: [{ name: '', color: '#2563eb' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "categories"
  });

  useEffect(() => {
    if (editing_category) {
      reset({
        categories: [{
          name: editing_category.name,
          color: editing_category.color,
        }],
      });
    } else {
      reset({
        categories: [{ name: '', color: '#2563eb' }],
      });
    }
  }, [editing_category, opened, reset]);

  const handle_submit = async (values: BulkCreateCategoryForm) => {
    if (editing_category) {
      // Single edit mode: return single object
      await onSubmit(values.categories[0]);
    } else {
      // Bulk create mode: return array
      await onSubmit(values.categories);
    }
    onClose();
  };

  const watchField = (index: number) => {
    return watch(`categories.${index}.color`);
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={editing_category ? t('modal.edit_title') : t('modal.create_title')}
      position="right"
      size="md"
      overlayProps={{ backgroundOpacity: 0.5, blur: 4 }}
    >
      <form onSubmit={handleSubmit(handle_submit)}>
        <Stack gap="lg">
          {fields.map((field, index) => {
             const currentColor = watchField(index);
             return (
               <Stack key={field.id} gap="xs" p={fields.length > 1 ? "sm" : 0} className={fields.length > 1 ? "border border-white/10 rounded-md relative" : ""}>
                 {fields.length > 1 && (
                    <Group justify="space-between" mb={-8}>
                      <Text size="xs" c="dimmed">#{index + 1}</Text>
                      {fields.length > 1 && (
                        <ActionIcon color="red" variant="subtle" size="sm" onClick={() => remove(index)}>
                          <IoTrashOutline />
                        </ActionIcon>
                      )}
                    </Group>
                 )}
                 
                 <TextInput
                   label={t('table.name')}
                   placeholder={t('modal.name_placeholder')}
                   required
                   error={errors.categories?.[index]?.name?.message ? common_t(`errors.${errors.categories[index]?.name?.message as any}`) : null}
                   {...register(`categories.${index}.name`)}
                   rightSection={
                     <Popover position="bottom-end" shadow="md" withArrow>
                       <Popover.Target>
                         <Tooltip label={t('table.color')}>
                           <ColorSwatch 
                             color={currentColor || '#2563eb'} 
                             size={20} 
                             className="cursor-pointer hover:scale-110 transition-transform" 
                           />
                         </Tooltip>
                       </Popover.Target>
                       <Popover.Dropdown p="xs">
                         <Stack gap="xs">
                           <ColorPicker
                             value={currentColor || '#2563eb'}
                             onChange={(val) => setValue(`categories.${index}.color`, val, { shouldValidate: true, shouldDirty: true })}
                             format="hex"
                           />
                           <TextInput 
                             size="xs"
                             value={currentColor}
                             onChange={(e) => setValue(`categories.${index}.color`, e.currentTarget.value, { shouldValidate: true, shouldDirty: true })}
                           />
                         </Stack>
                       </Popover.Dropdown>
                     </Popover>
                   }
                 />
               </Stack>
             );
          })}
          
          {!editing_category && (
            <Button 
              variant="light" 
              leftSection={<IoAddOutline />} 
              onClick={() => append({ name: '', color: '' })}
              color="primary"
              className="!bg-accent/10 !text-accent hover:!bg-accent/20 transition-colors"
            >
              {t('add_another')}
            </Button>
          )}

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" color="gray" onClick={onClose}>
              {common_t('cancel')}
            </Button>
            <Button 
              type="submit" 
              loading={loading} 
              radius="md" 
              disabled={!isValid}
              color="primary"
              className="bg-primary hover:opacity-90 transition-all shadow-md shadow-primary/20"
            >
              {editing_category ? common_t('save') : common_t('save')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Drawer>
  );
}
