'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useForm, Controller } from 'react-hook-form';
import dayjs from 'dayjs';
import { Modal, TextInput, Textarea, Button, Group, Stack, Tabs, Select, Text, MultiSelect, LoadingOverlay } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarEvent, ManualEvent, manual_event_schema } from '../schemas/event-schema';
import { useUsersQuery } from '@/components/layout/users/hooks/use-users-query';
import { IoTimeOutline, IoPersonOutline, IoAddOutline } from 'react-icons/io5';
import { UserDrawer } from '@/components/layout/users/components/user-drawer';
import { UserFormData } from '@/schemas/users';
import { useDisclosure } from '@mantine/hooks';

interface Props {
  opened: boolean;
  event?: CalendarEvent | null;
  is_loading?: boolean;
  onClose: () => void;
  onSubmit: (event: CalendarEvent) => void;
  onDelete?: (id: string) => void;
  onCreateSubscription?: (studentId: string) => void;
}

/**
 * Modal for creating or editing calendar events.
 * Uses react-hook-form for validation.
 */
export function EventModal({ opened, event, onClose, onSubmit, onDelete, onCreateSubscription, is_loading }: Props) {
  const t = useTranslations('Calendar.event_modal');
  const common_t = useTranslations('Common');
  const locale = useLocale();
  
  const [active_tab, set_active_tab] = useState<string | null>('lesson');
  const [selected_student, set_selected_student] = useState<string | null>(null);
  const [user_drawer_opened, { open: open_user_drawer, close: close_user_drawer }] = useDisclosure(false);

  const { 
    users, 
    is_loading: is_users_loading,
    teachers,
    current_user,
    is_mutating: is_user_mutating,
    create_user
  } = useUsersQuery({ role: 'student' });
  const students = users
    ?.filter((u) => u.role === 'student')
    ?.map((u) => ({ value: u.id, label: u.name })) || [];
  
  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ManualEvent>({
    resolver: zodResolver(manual_event_schema) as any,
    defaultValues: {
      title: '',
      description: '',
      start_date: new Date(),
      end_date: dayjs().add(1, 'hour').toDate(),
      all_day: false,
      source: 'manual',
      attendees: [],
    },
  });

  const start_date = watch('start_date');
  const end_date = watch('end_date');

  // Auto-adjust end_date when start_date changes
  useEffect(() => {
    if (start_date && end_date && dayjs(start_date).isAfter(dayjs(end_date))) {
      setValue('end_date', dayjs(start_date).add(1, 'hour').toDate());
    }
  }, [start_date, end_date, setValue]);

  useEffect(() => {
    if (opened) {
      if (event) {
        // Only Google and Manual events have description. We cast safely.
        const desc = 'description' in event ? (event as any).description : '';
        reset({
          title: event.title || '',
          description: desc || '',
          start_date: event.start_date ? new Date(event.start_date) : new Date(),
          end_date: event.end_date ? new Date(event.end_date) : dayjs().add(1, 'hour').toDate(),
          all_day: 'all_day' in event ? !!event.all_day : false,
          id: event.id,
          color: event.color === 'blue' ? 'primary' : (event.color || 'primary'),
          source: (event as any).source === 'personal' ? 'personal' : 'manual',
          attendees: 'attendees' in event ? (event as any).attendees?.map((a: any) => typeof a === 'object' ? a.email : a) : [],
        });
        
        // If it's an existing event, check if it's a personal event
        if (!event.id) {
          set_active_tab('lesson');
        } else {
          set_active_tab(event.source === 'lesson' ? 'lesson' : 'personal');
        }
      } else {
        reset({
          title: '',
          description: '',
          start_date: new Date(),
          end_date: dayjs().add(1, 'hour').toDate(),
          all_day: false,
          color: 'primary',
          attendees: [],
        });
        set_active_tab('lesson');
      }
      set_selected_student(null);
    }
  }, [opened, event, reset]);

  const handle_form_submit = (values: ManualEvent) => {
    onSubmit(values as unknown as CalendarEvent);
  };

  const is_editing = !!event?.id;

  const on_user_submit = async (data: UserFormData) => {
    try {
      const new_user = await create_user(data);
      if (new_user?.id) {
        set_selected_student(new_user.id);
      }
      close_user_drawer();
    } catch (error) {
      console.error('Failed to create student:', error);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={is_editing ? t('edit_title') : t('title')}
      radius="md"
      centered
      classNames={{
        content: 'bg-[#1A1B1E] border border-white/10 shadow-2xl',
        header: 'bg-[#1A1B1E] border-b border-white/10',
      }}
    >
      {!is_editing && (
        <Tabs value={active_tab} onChange={set_active_tab} mb="md" mt="md" variant="pills">
          <Tabs.List grow>
            <Tabs.Tab value="lesson" leftSection={<IoPersonOutline size={14} />}>
              {t('tabs_servant_title')}
            </Tabs.Tab>
            <Tabs.Tab value="personal" leftSection={<IoTimeOutline size={14} />}>
              {t('tabs_personal_title')}
            </Tabs.Tab>
          </Tabs.List>
        </Tabs>
      )}

      {active_tab === 'lesson' && !is_editing ? (
         <Stack gap="md">
           <Text size="sm" c="dimmed">
             {t('select_student_desc')}
           </Text>
           <Select
             label={t('student_label')}
             placeholder={t('student_placeholder')}
             data={students}
             value={selected_student}
             onChange={set_selected_student}
             searchable
             required
             disabled={is_users_loading}
             withAsterisk
           />

           <Button
             variant="light"
             leftSection={<IoAddOutline size={16} />}
             size="xs"
             onClick={open_user_drawer}
             className="w-fit"
           >
             {t('add_student')}
           </Button>
           <Group justify="flex-end" mt="xl">
             <Button variant="subtle" color="gray" onClick={onClose}>
               {common_t('cancel')}
             </Button>
             <Button 
               disabled={!selected_student}
               onClick={() => selected_student && onCreateSubscription?.(selected_student)}
               className="bg-primary hover:opacity-90 shadow-md shadow-primary/20"
             >
               {t('next_button')}
             </Button>
           </Group>
        </Stack>
      ) : (
        <form onSubmit={handleSubmit(handle_form_submit as any)}>
          <Stack gap="md">
            <TextInput
              label={t('name')}
              placeholder={t('name')}
              required
              withAsterisk
              {...register('title')}
              error={errors.title?.message}
            />
            
            <Stack gap="xs">
              <Controller
                control={control}
                name="start_date"
                render={({ field }) => (
                  <DateTimePicker
                    {...field}
                    label={t('start_date')}
                    placeholder={t('start_date')}
                    required
                    withAsterisk
                    locale={locale}
                    error={errors.start_date?.message ? t(errors.start_date.message) : undefined}
                    value={field.value ? new Date(field.value) : null}
                  />
                )}
              />

              <Controller
                control={control}
                name="end_date"
                render={({ field }) => (
                  <DateTimePicker
                    {...field}
                    label={t('end_date')}
                    placeholder={t('end_date')}
                    required
                    withAsterisk
                    locale={locale}
                    error={errors.end_date?.message ? t(errors.end_date.message) : undefined}
                    value={field.value ? new Date(field.value) : null}
                  />
                )}
              />
            </Stack>
            
            <Controller
              control={control}
              name="attendees"
              render={({ field }) => (
                <MultiSelect
                  {...field}
                  label={t('attendees')}
                  placeholder={t('student_placeholder')}
                  data={students}
                  searchable
                  clearable
                  error={errors.attendees?.message}
                />
              )}
            />

            <Textarea
              label={t('description')}
              placeholder={t('description')}
              rows={3}
              {...register('description')}
            />

            <Group justify="flex-end" mt="xl">
              {is_editing && (
                <Button 
                  variant="subtle" 
                  color="red" 
                  onClick={() => event.id && onDelete?.(event.id)}
                  loading={is_loading}
                  disabled={is_loading}
                >
                  {t('delete')}
                </Button>
              )}
              <Button variant="subtle" color="gray" onClick={onClose} disabled={is_loading}>
                {common_t('cancel')}
              </Button>
              <Button type="submit" loading={is_loading} disabled={is_loading} className="bg-primary hover:opacity-90 shadow-md shadow-primary/20">
                {t('save')}
              </Button>
            </Group>
          </Stack>
        </form>
      )}
      
      <UserDrawer
        opened={user_drawer_opened}
        initial_data={null}
        teachers={teachers}
        current_user={current_user}
        is_loading={is_user_mutating}
        on_submit={on_user_submit}
        on_close={close_user_drawer}
      />
    </Modal>
  );
}
