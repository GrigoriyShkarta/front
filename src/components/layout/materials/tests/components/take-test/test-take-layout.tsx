'use client';

import { useState, useMemo } from 'react';

import { Box, Grid, LoadingOverlay, Modal, Stack, Text, Button, Group } from '@mantine/core';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';

import { useTestEditor } from '../../hooks/use-test-editor';
import { useTakeTest } from '../../hooks/use-take-test';
import { TestQuestion, QUESTION_TYPES } from '../../schemas/test-schema';
import { TestStartModal } from './test-start-modal';
import { TestTakeHeader } from './test-take-header';
import { TestQuestionCard } from './test-question-card';
import { TestQuestionNav } from './test-question-nav';
import { TestResultScreen } from './test-result-screen';

interface Props {
  test_id: string;
}

/**
 * Main orchestrator component for the test-taking flow.
 * Manages start → take → result transitions.
 */
export function TestTakeLayout({ test_id }: Props) {
  const t = useTranslations('Materials.tests.take');
  const router = useRouter();
  const { test, is_loading_test } = useTestEditor({ id: test_id });

  const [show_start_modal, set_show_start_modal] = useState(true);
  const [show_confirm_submit, set_show_confirm_submit] = useState(false);

  // Parse questions from test content
  const questions: TestQuestion[] = useMemo(() => {
    if (!test?.content) return [];
    try {
      return typeof test.content === 'string' ? JSON.parse(test.content) : test.content;
    } catch {
      return [];
    }
  }, [test?.content]);

  const max_score = useMemo(
    () => questions.reduce((sum, q) => sum + (q.points || 0), 0),
    [questions]
  );

  const {
    is_started,
    is_finished,
    is_submitting,
    current_index,
    current_question,
    answers,
    time_left,
    answered_count,
    total_questions,
    result,
    start_test,
    set_answer,
    go_to_question,
    go_next,
    go_prev,
    handle_submit,
    get_question_status,
  } = useTakeTest({
    test_id,
    questions,
    time_limit: test?.settings?.time_limit || null,
  });

  const handle_start = () => {
    set_show_start_modal(false);
    start_test();
  };

  const handle_submit_click = () => {
    const unanswered = questions.filter(q => get_question_status(q.id) !== 'answered').length;
    if (unanswered > 0) {
      set_show_confirm_submit(true);
    } else {
      handle_submit();
    }
  };

  const current_answer = current_question ? answers.get(current_question.id) : undefined;

  if (is_loading_test) {
    return <Box mih="60vh" pos="relative"><LoadingOverlay visible /></Box>;
  }

  if (!test) {
    return (
      <Stack align="center" justify="center" mih="60vh" gap="md">
        <Text size="xl" fw={700} c="dimmed">{t('not_found')}</Text>
        <Button variant="light" onClick={() => router.push('/main/materials/tests')}>
          {t('back_to_tests')}
        </Button>
      </Stack>
    );
  }

  // Show result screen
  if (is_finished && result) {
    return (
      <TestResultScreen
        attempt={result}
        questions={questions}
        on_back={() => router.push('/main/materials/tests')}
      />
    );
  }

  return (
    <Box>
      {/* Start modal */}
      <TestStartModal
        opened={show_start_modal && !is_started}
        on_start={handle_start}
        on_close={() => router.push('/main/materials/tests')}
        test_name={test.name}
        questions_count={questions.length}
        time_limit={test.settings?.time_limit || null}
        max_score={max_score}
      />

      {/* Test-taking UI */}
      {is_started && !is_finished && (
        <>
          <TestTakeHeader
            test_name={test.name}
            time_left={time_left}
            answered_count={answered_count}
            total_questions={total_questions}
            on_submit={handle_submit_click}
            is_submitting={is_submitting}
          />

          <Grid gutter="xl" mt="lg" px="md" maw={1100} mx="auto">
            {/* Question area */}
            <Grid.Col span={{ base: 12, md: 9 }}>
              {current_question && (
                <TestQuestionCard
                  question={current_question}
                  index={current_index}
                  total={total_questions}
                  selected_option_ids={current_answer?.selected_option_ids || []}
                  text_answer={current_answer?.text_answer || ''}
                  on_select_option={(ids) =>
                    set_answer(current_question.id, { selected_option_ids: ids })
                  }
                  on_text_change={(text) =>
                    set_answer(current_question.id, { text_answer: text })
                  }
                  on_next={go_next}
                  on_prev={go_prev}
                  can_next={current_index < total_questions - 1}
                  can_prev={current_index > 0}
                />
              )}
            </Grid.Col>

            {/* Navigation sidebar */}
            <Grid.Col span={{ base: 12, md: 3 }} className="hidden md:block">
              <TestQuestionNav
                questions={questions}
                current_index={current_index}
                on_go_to={go_to_question}
                get_status={get_question_status}
              />
            </Grid.Col>
          </Grid>
        </>
      )}

      {/* Confirm submit modal (when there are unanswered questions) */}
      <Modal
        opened={show_confirm_submit}
        onClose={() => set_show_confirm_submit(false)}
        title={t('confirm_submit.title')}
        centered
        radius="md"
      >
        <Stack gap="md">
          <Text size="sm">
            {t('confirm_submit.message', {
              count: total_questions - answered_count,
            })}
          </Text>
          <Group justify="flex-end" gap="sm">
            <Button variant="light" color="gray" onClick={() => set_show_confirm_submit(false)}>
              {t('confirm_submit.cancel')}
            </Button>
            <Button
              color="primary"
              onClick={() => { set_show_confirm_submit(false); handle_submit(); }}
              loading={is_submitting}
            >
              {t('confirm_submit.confirm')}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
}
