'use client';

import { useState } from 'react';
import { Stack, Button, Textarea, Title, Paper, Text, Group, ActionIcon, Loader, Badge, Divider, FileButton, ThemeIcon, Box } from '@mantine/core';
import { IoCloudUploadOutline, IoCheckmarkCircleOutline, IoSendOutline, IoDocumentAttachOutline, IoTrashOutline, IoInformationCircleOutline } from 'react-icons/io5';
import { useTranslations } from 'next-intl';
import { useHomeworkSubmission } from '../../homework/hooks/use-homework-submission';
import { fileActions } from '../../files/actions/file-actions';
import BlockNoteEditor from './editor/block-note';

interface Props {
  homework: {
    id: string;
    name: string;
    content?: any[];
    can_retake?: boolean;
  };
  homework_status?: 'not_submitted' | 'pending' | 'reviewed';
  my_submission?: any;
}

export function LessonHomeworkSubmission({ homework, homework_status, my_submission: initial_submission }: Props) {
  const t = useTranslations('Materials.homework.submission');
  const common_t = useTranslations('Common');
  
  const [is_expanded, set_is_expanded] = useState(false);
  const [is_retaking, set_is_retaking] = useState(false);
  const [text, set_text] = useState('');
  const [local_files, set_local_files] = useState<File[]>([]);
  const [uploading_files, set_uploading_files] = useState(false);
  
  const { my_submission, is_loading_submission, submit, is_submitting } = useHomeworkSubmission(homework.id, initial_submission);

  if (is_loading_submission && homework_status !== 'not_submitted') return (
    <Paper withBorder p="xl" radius="md" className="flex items-center justify-center min-h-[100px]">
        <Group gap="sm">
            <Loader size="sm" />
            <Text size="sm" c="dimmed">{t('loading_submission') || 'Loading your submission...'}</Text>
        </Group>
    </Paper>
  );

  const handle_submit = async () => {
    if (!text.trim() && local_files.length === 0) return;
    
    set_uploading_files(true);
    try {
      const file_urls: string[] = [];

      await submit({ text, file_urls, files: local_files });
      set_is_expanded(false);
      set_is_retaking(false);
      set_local_files([]);
      set_text('');
    } finally {
      set_uploading_files(false);
    }
  };

  const remove_file = (index: number) => {
    set_local_files(prev => prev.filter((_, i) => i !== index));
  };

  const get_filename = (url: string) => {
    try {
        const decoded = decodeURIComponent(url);
        const parts = decoded.split('/');
        const last_part = parts[parts.length - 1];
        // The backend seems to put a timestamp and a dash before the filename
        const filename_parts = last_part.split('-');
        return filename_parts.length > 1 ? filename_parts.slice(1).join('-') : last_part;
    } catch {
        return 'File';
    }
  };

  const render_homework_task = () => {
    if (!homework.content || homework.content.length === 0) return null;
    
    // Determine if content is an array of wrapped blocks or direct BlockNote blocks
    // Wrapper blocks look like: { id, content: string }
    // Direct blocks look like: { id, type, content: any[], props: {} }
    const firstBlock = homework.content[0];
    const isDirectBlocks = !!(firstBlock && firstBlock.type && (Array.isArray(firstBlock.content) || !firstBlock.content || typeof firstBlock.content === 'object'));
    
    return (
      <Box mb="xl">
        <Title order={4} mb="md">{t('task_description') || 'Homework Task'}</Title>
        <Paper p="md" radius="md" bg="primary.0" className="dark:bg-primary-9/20 border border-primary-200 dark:border-primary-800">
           <Stack gap="md">
              {isDirectBlocks ? (
                // If it's direct blocks, render them all in one editor
                <BlockNoteEditor 
                  initial_content={JSON.stringify(homework.content)}
                  on_change={() => {}}
                  on_open_bank={() => {}}
                  read_only={true}
                />
              ) : (
                // If it's wrapped blocks, render each separately
                homework.content.map((block: any, idx: number) => (
                  <BlockNoteEditor 
                    key={block.id || idx}
                    initial_content={typeof block.content === 'string' ? block.content : JSON.stringify(block.content)}
                    on_change={() => {}}
                    on_open_bank={() => {}}
                    read_only={true}
                  />
                ))
              )}
           </Stack>
        </Paper>
        <Divider my="xl" label={t('your_entry') || 'Submission'} labelPosition="center" />
      </Box>
    );
  };

  const handle_resubmit_click = () => {
    set_is_retaking(true);
    set_is_expanded(true);
  };

  if (my_submission && !is_retaking) {
    return (
      <Paper withBorder p="xl" radius="md" className="dark:bg-zinc-900/50">
        <Stack gap="md">
          {render_homework_task()}
          <Group justify="space-between">
            <Group gap="xs">
              <IoCheckmarkCircleOutline size={20} color="var(--mantine-color-green-6)" />
            </Group>
            <Badge color={my_submission.status === 'reviewed' ? 'green' : 'primary'} variant="filled" size="lg" radius="sm">
              {t(`status.${my_submission.status}`)}
            </Badge>
          </Group>
          {my_submission.status === 'pending' && (
            <Paper p="md" radius="md" withBorder bg="primary.0" className="dark:bg-primary-9/20 border-primary-200 dark:border-primary-800">
                <Group gap="sm" wrap="nowrap">
                    <ThemeIcon color="primary" variant="light" size="lg" radius="xl">
                        <IoInformationCircleOutline size={20} />
                    </ThemeIcon>
                    <Stack gap={2}>
                        <Text fw={700} size="sm" c="primary.9" className="dark:text-primary-1">
                            {t('pending_review_title') || 'Submission under review'}
                        </Text>
                        <Text size="xs" c="primary.8" className="dark:text-primary-2">
                            {t('pending_review_message') || 'Your teacher will review your work soon. You will receive a notification once it is graded.'}
                        </Text>
                    </Stack>
                </Group>
            </Paper>
          )}
          <Box className="mt-2">
            <Text size="sm" fw={500} mb={8} c="dimmed">{t('your_answer_content') || 'Your answer:'}</Text>
            <Paper p="md" radius="md" className="dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                <Text size="sm" className="whitespace-pre-wrap">{my_submission.text}</Text>
            </Paper>
          </Box>
          {my_submission.file_urls?.length > 0 && (
            <Group gap="xs">
                {my_submission.file_urls.map((url: string, idx: number) => (
                    <Badge 
                        key={idx} 
                        variant="light" 
                        color="gray" 
                        leftSection={<IoDocumentAttachOutline size={12}/>}
                        component="a"
                        href={url}
                        target="_blank"
                        className="cursor-pointer!"
                    >
                        {get_filename(url)}
                    </Badge>
                ))}
            </Group>
          )}
          {my_submission.feedback && (
            <>
              <Divider label={t('teacher_feedback')} labelPosition="center" />
              <Paper p="sm" bg="secondary.0" className="dark:bg-secondary-9/20 border border-secondary/10">
                <Stack gap={4}>
                  <Text size="sm" fs="italic" className="whitespace-pre-wrap">{my_submission.feedback}</Text>
                  {my_submission.score !== undefined && my_submission.score !== null && (
                    <Group gap="xs" mt="xs">
                        <Text size="xs" fw={700} tt="uppercase" c="dimmed">{t('score') || 'Grade'}:</Text>
                        <Badge variant="dot" color="blue" size="lg">{my_submission.score}</Badge>
                    </Group>
                  )}
                </Stack>
              </Paper>
            </>
          )}

          {(homework.can_retake || my_submission.can_retake) && (
            <Group justify="center" mt="md">
              <Button 
                variant="light" 
                color="primary"
                onClick={handle_resubmit_click}
              >
                {t('resubmit_button') || 'Перездати'}
              </Button>
            </Group>
          )}
        </Stack>
      </Paper>
    );
  }

  if (!is_expanded) {
    return (
      <Button 
        variant="light" 
        size="lg" 
        onClick={() => set_is_expanded(true)}
        leftSection={<IoSendOutline size={20} />}
        radius="md"
        className='block! mx-auto'
      >
        {t('submit_button')}
      </Button>
    );
  }

  return (
    <Paper withBorder p="xl" radius="md" className="shadow-sm">
      <Stack gap="lg">
        {render_homework_task()}
        <Title order={4}>{t('submit_title')}</Title>
        <Textarea 
          placeholder={t('placeholder')} 
          minRows={4} 
          autosize
          value={text}
          onChange={(e) => set_text(e.currentTarget.value)}
          variant="filled"
          radius="md"
        />
        
        <Stack gap="xs">
          <Text size="sm" fw={500}>{t('attachments')}</Text>
          <Group gap="sm">
            {local_files.map((file, index) => (
              <Badge 
                key={index} 
                variant="light" 
                color="primary"
                rightSection={<ActionIcon size="xs" color="primary" variant="transparent" onClick={() => remove_file(index)}><IoTrashOutline size={12} /></ActionIcon>}
              >
                {file.name}
              </Badge>
            ))}
            <FileButton onChange={(files) => set_local_files(prev => [...prev, ...files])} accept="image/*,video/*,audio/*,application/*" multiple>
                {(props) => (
                    <Button 
                        {...props}
                        variant="subtle" 
                        size="xs" 
                        leftSection={<IoCloudUploadOutline size={14} />}
                        disabled={uploading_files || is_submitting}
                    >
                        {common_t('upload')}
                    </Button>
                )}
            </FileButton>
          </Group>
        </Stack>

        <Group justify="flex-end">
          <Button variant="subtle" color="gray" onClick={() => {
              set_is_expanded(false);
              set_is_retaking(false);
          }} disabled={uploading_files || is_submitting}>{common_t('cancel')}</Button>
          <Button 
            loading={is_submitting || uploading_files} 
            onClick={handle_submit}
            disabled={!text.trim() && local_files.length === 0}
            radius="md"
            type="submit"
          >
            {t('send')}
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
}
