import { Stack, TextInput, Textarea, Group, Box, Tooltip, ActionIcon, MultiSelect, Text, Button } from '@mantine/core';
import { Controller, UseFormRegister, Control, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { IoImageOutline, IoTrashOutline, IoAddOutline } from 'react-icons/io5';
import { useTranslations } from 'next-intl';
import { CreateCourseForm } from '../../schemas/course-schema';
import { cn } from '@/lib/utils';

interface Props {
    register: UseFormRegister<CreateCourseForm>;
    control: Control<CreateCourseForm>;
    watch: UseFormWatch<CreateCourseForm>;
    setValue: UseFormSetValue<CreateCourseForm>;
    errors: any;
    categories: any[];
    user: any;
    on_add_category: () => void;
    on_media_picker_open: () => void;
}

/**
 * Basic course info component (Image, Name, Description, Categories)
 */
export function CourseBasicInfo({ 
    register, 
    control, 
    watch, 
    setValue, 
    errors, 
    categories, 
    user, 
    on_add_category, 
    on_media_picker_open 
}: Props) {
    const t = useTranslations('Materials.courses');
    const t_cat = useTranslations('Categories');
    const common_t = useTranslations('Common');

    const image_url = watch('image_url');
    const space_icon = user?.space?.personalization?.icon;

    return (
        <Stack gap="md">
            <Group justify="center" className="w-full">
                <Box className="w-full flex flex-col gap-2">
                    <Box 
                        className="w-full h-44 rounded-xl bg-black/5 border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer overflow-hidden relative hover:border-[var(--mantine-primary-color-filled)]"
                        onClick={on_media_picker_open}
                    >
                        {image_url || space_icon ? (
                            <>
                                <img 
                                    src={(image_url || space_icon) || undefined} 
                                    className={cn(
                                        "w-full h-full object-cover",
                                        !image_url && "opacity-40 grayscale blur-[2px]"
                                    )} 
                                />
                                <Box className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                                    <IoImageOutline size={20} color="white" />
                                    <Text c="white" size="xs" fw={500}>{t('form.upload_image')}</Text>
                                </Box>
                            </>
                        ) : (
                            <>
                                <IoImageOutline size={32} color="gray" />
                                <Stack gap={2} align="center">
                                    <Text size="xs" c="dimmed" fw={500}>{t('form.upload_image')}</Text>
                                    <Text size="xs" c="dimmed" fs="italic">
                                        {t('form.library_upload_hint')}
                                    </Text>
                                </Stack>
                            </>
                        )}
                    </Box>
                    {image_url && (
                        <Button 
                            variant="subtle" 
                            color="red" 
                            size="compact-xs" 
                            leftSection={<IoTrashOutline size={14} />}
                            onClick={(e) => {
                                e.stopPropagation();
                                setValue('image_url', '');
                            }}
                        >
                            {common_t('clear')}
                        </Button>
                    )}
                </Box>
            </Group>

            <TextInput
                label={t('form.name')}
                required
                placeholder={t('form.placeholder_name')}
                {...register('name')}
                error={errors.name?.message}
                variant="filled"
            />

            <Textarea
                label={t('form.description')}
                placeholder={t('form.placeholder_description')}
                {...register('description')}
                variant="filled"
                autosize
                minRows={3}
            />

            <Stack gap={4}>
                <Text size="sm" fw={500}>{t_cat('title')}</Text>
                <Group gap="xs" align="flex-end" wrap="nowrap">
                    <Controller
                        name="category_ids"
                        control={control}
                        render={({ field }) => (
                            <MultiSelect
                                data={categories.map(c => ({ value: c.id, label: c.name }))}
                                placeholder={t_cat('select_categories')}
                                searchable
                                variant="filled"
                                className="flex-1"
                                {...field}
                            />
                        )}
                    />
                    <Tooltip label={t_cat('add_category')}>
                        <ActionIcon 
                            size={42}
                            variant="light"
                            color="primary"
                            onClick={on_add_category}
                        >
                            <IoAddOutline size={20} />
                        </ActionIcon>
                    </Tooltip>
                </Group>
            </Stack>
        </Stack>
    );
}
