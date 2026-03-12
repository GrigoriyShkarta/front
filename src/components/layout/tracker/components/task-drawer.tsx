'use client';

import { 
  Group, 
  Stack, 
  ActionIcon, 
  Paper, 
  Text, 
  Title,
  Box,
  Drawer,
  TextInput,
  Textarea,
  Select,
  Checkbox,
  Button,
  ScrollArea,
  rem,
  useMantineTheme
} from '@mantine/core';
import { 
  IoAddOutline, 
  IoTrashOutline 
} from 'react-icons/io5';
import { Controller, UseFormReturn } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { TrackerTask, TrackerColumn } from '../schemas/tracker-schema';
import { useTrackerTranslator } from '../hooks/use-tracker-translator';
import { cn } from '@/lib/utils';

interface Props {
  opened: boolean;
  editingTask: TrackerTask | null;
  form: UseFormReturn<TrackerTask>;
  columns: TrackerColumn[];
  onClose: () => void;
  subtaskFields: {
    fields: any[];
    append: (val: any) => void;
    remove: (index: number) => void;
  };
  onSubmit: (data: TrackerTask) => void;
}

export function TaskDrawer({ 
  opened, 
  editingTask, 
  form, 
  columns, 
  subtaskFields: { fields, append, remove },
  onClose, 
  onSubmit 
}: Props) {
  const { t, getColumnLabel } = useTrackerTranslator();
  const common_t = useTranslations('Common');
  const theme = useMantineTheme();

  return (
    <Drawer 
      opened={opened} 
      onClose={onClose}
      title={
        <Title order={3} px={{ base: 'xl', sm: 32 }} component="p" className='text-[20px]! leading-tight'>
          {editingTask ? t('card.edit_card') : t('card.add_card')}
        </Title>
      }
      position="right"
      size="md"
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
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Stack gap="md">
            <TextInput
              label={t('card.title')}
              placeholder={t('card.title_placeholder')}
              required
              withAsterisk
              {...form.register('title')}
              error={form.formState.errors.title?.message ? t(form.formState.errors.title.message as any) : null}
            />
            <Textarea
              label={t('card.description')}
              placeholder={t('card.description_placeholder')}
              {...form.register('description')}
              minRows={4}
            />
            
            <Controller
              name="column_id"
              control={form.control}
              render={({ field }) => (
                <Select
                  label={t('card.column')}
                  data={columns.map(c => ({ 
                    value: c.id, 
                    label: getColumnLabel(c) 
                  }))}
                  {...field}
                />
              )}
            />

              <Stack gap="xs" mt="md">
                <Text size="sm" fw={800} tt="uppercase" className="tracking-wider text-[var(--space-primary)]">{t('card.subtasks')}</Text>
                {fields.map((field, index) => (
                  <Paper key={field.id} p="xs" withBorder className="bg-white/5 border-zinc-200 dark:border-white/10 rounded-xl group transition-all hover:bg-white/10">
                    <Group gap="xs" wrap="nowrap" align="start">
                      <Box pt={8}>
                        <Controller
                          name={`subtasks.${index}.completed` as any}
                          control={form.control}
                          render={({ field }) => (
                            <Checkbox 
                              checked={field.value} 
                              onChange={(e) => field.onChange(e.currentTarget.checked)} 
                              radius="xl"
                              color="var(--space-primary)"
                            />
                          )}
                        />
                      </Box>
                      <TextInput
                        className="flex-1"
                        placeholder={t('card.subtask_placeholder')}
                        {...form.register(`subtasks.${index}.title` as any)}
                        required
                        withAsterisk
                        error={form.formState.errors.subtasks?.[index]?.title?.message ? t(form.formState.errors.subtasks[index].title.message as any) : null}
                        styles={{ 
                          input: { 
                            fontWeight: 500, 
                            fontSize: rem(14),
                            border: 'none',
                            backgroundColor: 'transparent'
                          } 
                        }}
                      />
                      <ActionIcon mt={4} color="red" variant="subtle" onClick={() => remove(index)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <IoTrashOutline size={18} />
                      </ActionIcon>
                    </Group>
                  </Paper>
                ))}
                <Button 
                  variant="light" 
                  color="primary"
                  size="sm" 
                  leftSection={<IoAddOutline />} 
                  onClick={() => append({ id: crypto.randomUUID(), title: '', completed: false })}
                  maw={160}
                  radius="md"
                  className="!bg-primary/10 !text-primary hover:!bg-primary/20 transition-colors"
                >
                  {t('card.add_subtask')}
                </Button>
              </Stack>

              <Button 
                type="submit" 
                fullWidth
                disabled={!form.formState.isValid}
                mt="md"
                className="bg-primary text-primary-foreground hover:bg-primary-hover transition-colors"
                radius="md"
              >
                {common_t('save')}
              </Button>
          </Stack>
        </form>
      </ScrollArea>
    </Drawer>
  );
}
