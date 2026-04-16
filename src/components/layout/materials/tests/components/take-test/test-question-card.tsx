'use client';

import { Paper, Stack, Text, Radio, Checkbox, TextInput, Textarea, Group, Box, Button, rem } from '@mantine/core';
import { IoChevronBackOutline, IoChevronForwardOutline, IoCheckmarkOutline } from 'react-icons/io5';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { AudioPlayer } from '@/components/ui/audio-player';
import { TestQuestion, QUESTION_TYPES } from '../../schemas/test-schema';

interface Props {
  question: TestQuestion;
  index: number;
  total: number;
  selected_option_ids: string[];
  text_answer: string;
  on_select_option: (option_ids: string[]) => void;
  on_text_change: (text: string) => void;
  on_next: () => void;
  on_prev: () => void;
  on_submit: () => void;
  can_next: boolean;
  can_prev: boolean;
}

/**
 * Renders a single question during test-taking.
 * Handles different question types with appropriate input components.
 */
export function TestQuestionCard({
  question,
  index,
  total,
  selected_option_ids,
  text_answer,
  on_select_option,
  on_text_change,
  on_next,
  on_prev,
  on_submit,
  can_next,
  can_prev,
}: Props) {
  const t = useTranslations('Materials.tests.take');

  const handle_single_select = (opt_id: string) => {
    on_select_option([opt_id]);
  };

  const handle_multi_select = (opt_id: string) => {
    if (selected_option_ids.includes(opt_id)) {
      on_select_option(selected_option_ids.filter(id => id !== opt_id));
    } else {
      on_select_option([...selected_option_ids, opt_id]);
    }
  };

  return (
    <Stack gap="lg" className="animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Question header */}
      <Group justify="space-between" align="center">
        <Text size="xs" fw={600} c="dimmed">
          {t('question_number', { current: index + 1, total })}
        </Text>
        <Text size="xs" c="dimmed">
          {question.points} {question.points === 1 ? t('point') : t('points')}
        </Text>
      </Group>

      {/* Question text */}
      <Text size="xl" fw={600} style={{ fontSize: rem(22) }}>
        {question.question}
      </Text>

      {(question.type === QUESTION_TYPES.SINGLE_CHOICE || question.type === QUESTION_TYPES.MULTIPLE_CHOICE) && (
        <Text size="sm" c="dimmed" fs="italic" mt={-10}>
          {question.type === QUESTION_TYPES.SINGLE_CHOICE ? t('hint_single') : t('hint_multiple')}
        </Text>
      )}

      {/* Question media */}
      {question.media && <QuestionMedia media={question.media} />}

      {/* Answer options */}
      <Box className="pl-2">
        {question.type === QUESTION_TYPES.SINGLE_CHOICE && question.options && (
          <Stack gap="sm">
            {question.options.map((opt) => (
              <OptionCard
                key={opt.id}
                label={opt.text}
                selected={selected_option_ids.includes(opt.id)}
                onClick={() => handle_single_select(opt.id)}
                type="radio"
              />
            ))}
          </Stack>
        )}

        {question.type === QUESTION_TYPES.MULTIPLE_CHOICE && question.options && (
          <Stack gap="sm">
            {question.options.map((opt) => (
              <OptionCard
                key={opt.id}
                label={opt.text}
                selected={selected_option_ids.includes(opt.id)}
                onClick={() => handle_multi_select(opt.id)}
                type="checkbox"
              />
            ))}
          </Stack>
        )}

        {question.type === QUESTION_TYPES.FILL_IN_BLANK && (
          <TextInput
            placeholder={t('fill_placeholder')}
            value={text_answer}
            onChange={(e) => on_text_change(e.currentTarget.value)}
            variant="filled"
            size="lg"
            radius="md"
            styles={{
              input: {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              },
            }}
          />
        )}

        {question.type === QUESTION_TYPES.DETAILED_ANSWER && (
          <Textarea
            placeholder={t('detailed_placeholder')}
            value={text_answer}
            onChange={(e) => on_text_change(e.currentTarget.value)}
            minRows={4}
            autosize
            variant="filled"
            size="md"
            radius="md"
            styles={{
              input: {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              },
            }}
          />
        )}
      </Box>

      {/* Navigation buttons */}
      <Group justify="space-between" mt="md">
        <Button
          variant="light"
          color="gray"
          leftSection={<IoChevronBackOutline size={16} />}
          onClick={on_prev}
          disabled={!can_prev}
          radius="md"
        >
          {t('prev')}
        </Button>
        <Button
          variant="light"
          color="primary"
          leftSection={!can_next ? <IoCheckmarkOutline size={16} /> : undefined}
          rightSection={can_next ? <IoChevronForwardOutline size={16} /> : undefined}
          onClick={can_next ? on_next : on_submit}
          radius="md"
        >
          {can_next ? t('next') : t('submit')}
        </Button>
      </Group>
    </Stack>
  );
}

/**
 * Styled option card for single/multi choice
 */
function OptionCard({
  label,
  selected,
  onClick,
  type,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  type: 'radio' | 'checkbox';
}) {
  return (
    <Paper
      onClick={onClick}
      className={cn(
        'p-4 rounded-xl cursor-pointer transition-all duration-200',
        'border hover:border-primary/40',
        selected
          ? 'bg-primary/10 border-primary/30 shadow-sm shadow-primary/10'
          : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06]'
      )}
    >
      <Group gap="sm" wrap="nowrap">
        {type === 'radio' ? (
          <Radio checked={selected} onChange={() => {}} readOnly />
        ) : (
          <Checkbox checked={selected} onChange={() => {}} readOnly />
        )}
        <Text size="sm" fw={selected ? 500 : 400}>
          {label}
        </Text>
      </Group>
    </Paper>
  );
}

/**
 * Renders question media (image, video, audio)
 */
function QuestionMedia({ media }: { media: NonNullable<TestQuestion['media']> }) {
  if (!media) return null;

  const alignment = media.alignment || 'center';
  const size = media.size || 100;

  return (
    <Stack
      align={alignment === 'left' ? 'flex-start' : alignment === 'right' ? 'flex-end' : 'center'}
    >
      <Box style={{ width: media.type === 'audio' ? `${size / 3}%` : `${size}%`, maxWidth: '100%' }}>
        <Box className="rounded-lg overflow-hidden">
          {media.type === 'image' && (
            <img src={media.url} className="w-full h-auto block object-contain" alt="" />
          )}
          {media.type === 'video' && (
            <video src={media.url} controls className="w-full aspect-video" />
          )}
          {media.type === 'audio' && (
            <AudioPlayer src={media.url} class_name="max-w-full" />
          )}
        </Box>
      </Box>
    </Stack>
  );
}
