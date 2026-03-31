'use client';

import { useState, useMemo } from 'react';

import { Box, Grid, LoadingOverlay, Modal, Stack, Text, Button, Group, Title, Paper, ThemeIcon, ActionIcon } from '@mantine/core';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { IoListOutline, IoCloseOutline, IoChevronForwardOutline, IoArrowForwardOutline, IoExtensionPuzzleOutline } from 'react-icons/io5';
import { Tooltip } from '@mantine/core';

import { useTestEditor } from '../../hooks/use-test-editor';
import { useTakeTest } from '../../hooks/use-take-test';
import { useCourse } from '@/components/layout/materials/courses/hooks/use-course';
import { useLessons } from '@/components/layout/materials/lessons/hooks/use-lessons';
import { useTests } from '@/components/layout/materials/tests/hooks/use-tests';
import { CourseCurriculum } from '@/components/layout/materials/courses/course/course-curriculum';
import { TestQuestion, QUESTION_TYPES } from '../../schemas/test-schema';
import { TestStartModal } from './test-start-modal';
import { TestTakeHeader } from './test-take-header';
import { TestQuestionCard } from './test-question-card';
import { TestQuestionNav } from './test-question-nav';
import { TestResultScreen } from './test-result-screen';
import { TestCourseSidebar } from '../test-course-sidebar';
import { cn } from '@/lib/utils';

interface Props {
  test_id: string;
  course_id?: string;
}

/**
 * Main orchestrator component for the test-taking flow.
 * Manages start → take → result transitions.
 */
export function TestTakeLayout({ test_id, course_id }: Props) {
  const t = useTranslations('Materials.tests.take');
  const t_lessons = useTranslations('Materials.lessons');
  const router = useRouter();
  const { test, is_loading_test } = useTestEditor({ id: test_id });

  const [show_start_modal, set_show_start_modal] = useState(true);
  const [show_confirm_submit, set_show_confirm_submit] = useState(false);
  const [sidebar_opened, set_sidebar_opened] = useState(true);

  // Fetch contextual course data if in course mode
  const { course: context_course } = useCourse(course_id || '');
  const { lessons: all_lessons_context } = useLessons({ page: 1, limit: 1000, search: '' });
  const { tests: all_tests_context } = useTests({ page: 1, limit: 1000, search: '' });

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

  // Show result screen if finished now OR if already has a completed attempt
  if ((is_finished && result) || (test?.last_attempt && test.last_attempt.status !== 'in_progress')) {
    const display_attempt = (is_finished && result) ? result : test.last_attempt;
    
    return (
        <Grid gutter={0} className={cn("relative min-h-[calc(100vh-80px)] transition-[padding] duration-500", sidebar_opened && course_id && context_course && "lg:pr-[400px]")}>
            <Grid.Col span={12}>
                <Box p="md" className="max-w-[800px] mx-auto">
                    <TestResultScreen
                        attempt={display_attempt}
                        questions={questions}
                        on_back={() => router.push(course_id ? `/main/materials/courses/${course_id}` : '/main/materials/tests')}
                    />
                </Box>
                
                {/* Mobile Curriculum view for results */}
                {course_id && context_course && (
                    <Box className="lg:hidden px-md pb-xl mt-10">
                        <Paper p="xl" radius="24px" withBorder className="bg-zinc-50/50 dark:bg-zinc-900/50 backdrop-blur-xl">
                            <Stack gap="lg">
                                <Text size="xs" fw={700} c="primary" tt="uppercase" lts={1}>
                                    {t('editor.course_navigation')}
                                </Text>
                                <CourseCurriculum 
                                    content={context_course.content} 
                                    all_lessons={all_lessons_context} 
                                    all_tests={all_tests_context}
                                    course_id={course_id} 
                                    active_lesson_id={test_id}
                                />
                            </Stack>
                        </Paper>
                    </Box>
                )}
            </Grid.Col>
            
            {course_id && context_course && (
                <TestCourseSidebar 
                   opened={sidebar_opened}
                   onClose={() => set_sidebar_opened(false)}
                   course={context_course}
                   all_lessons={all_lessons_context}
                   all_tests={all_tests_context}
                   current_test_id={test_id}
                   course_id={course_id}
                />
            )}

            {course_id && context_course && (
                <Box 
                    className={cn(
                        "hidden lg:block fixed top-1/2 -translate-y-1/2 z-[102] transition-all duration-500 ease-in-out",
                        sidebar_opened ? "right-[378px]" : "right-6"
                    )}
                >
                    <Tooltip label={sidebar_opened ? t_lessons('editor.hide_sidebar') : t_lessons('editor.show_sidebar')} position="left">
                        <ActionIcon 
                            size="xl" 
                            radius="xl" 
                            variant="filled" 
                            color="primary"
                            onClick={() => set_sidebar_opened(!sidebar_opened)}
                            className="shadow-2xl hover:scale-110 active:scale-95 transition-all"
                        >
                            {sidebar_opened ? <IoArrowForwardOutline size={20} /> : <IoListOutline size={20} />}
                        </ActionIcon>
                    </Tooltip>
                </Box>
            )}
        </Grid>
    );
  }

  return (
    <Box>
      {/* Start modal */}
      <TestStartModal
        opened={show_start_modal && !is_started && !test.is_passed}
        on_start={handle_start}
        on_close={() => router.push('/main/materials/tests')}
        test_name={test.name}
        questions_count={questions.length}
        time_limit={test.settings?.time_limit || null}
        max_score={max_score}
      />

      {/* Test-taking UI */}
      {is_started && !is_finished && (
        <Box className={cn("transition-[padding] duration-500", sidebar_opened && course_id && context_course && "lg:pr-[400px]")}>
          <TestTakeHeader
            test_name={test.name}
            time_left={time_left}
            answered_count={answered_count}
            total_questions={total_questions}
            on_submit={handle_submit_click}
            is_submitting={is_submitting}
          />

          <Grid gutter={0} mt="lg" className="relative min-h-screen">
            {/* Question area */}
            <Grid.Col span={12}>
              <Box px="md" maw={800} mx="auto">
                <Grid gutter="xl">
                    <Grid.Col span={{ base: 12, md: 8 }}>
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
                    
                    <Grid.Col span={{ base: 12, md: 4 }} className="hidden md:block">
                        <TestQuestionNav
                            questions={questions}
                            current_index={current_index}
                            on_go_to={go_to_question}
                            get_status={get_question_status}
                        />
                    </Grid.Col>
                </Grid>

                {/* Mobile Curriculum view for test take */}
                {course_id && context_course && (
                    <Box className="lg:hidden mt-10 pb-xl">
                        <Paper p="xl" radius="24px" withBorder className="bg-zinc-50/50 dark:bg-zinc-900/50 backdrop-blur-xl">
                            <Stack gap="lg">
                                <Text size="xs" fw={700} c="primary" tt="uppercase" lts={1}>
                                    {t('editor.course_navigation')}
                                </Text>
                                <CourseCurriculum 
                                    content={context_course.content} 
                                    all_lessons={all_lessons_context} 
                                    all_tests={all_tests_context}
                                    course_id={course_id} 
                                    active_lesson_id={test_id}
                                />
                            </Stack>
                        </Paper>
                    </Box>
                )}
              </Box>
            </Grid.Col>

            {course_id && context_course && (
                <TestCourseSidebar 
                   opened={sidebar_opened}
                   onClose={() => set_sidebar_opened(false)}
                   course={context_course}
                   all_lessons={all_lessons_context}
                   all_tests={all_tests_context}
                   current_test_id={test_id}
                   course_id={course_id}
                />
            )}

            {course_id && context_course && (
                <Box 
                    className={cn(
                        "hidden lg:block fixed top-1/2 -translate-y-1/2 z-[102] transition-all duration-500 ease-in-out",
                        sidebar_opened ? "right-[378px]" : "right-6"
                    )}
                >
                    <Tooltip label={sidebar_opened ? t_lessons('editor.hide_sidebar') : t_lessons('editor.show_sidebar')} position="left">
                        <ActionIcon 
                            size="xl" 
                            radius="xl" 
                            variant="filled" 
                            color="primary"
                            onClick={() => set_sidebar_opened(!sidebar_opened)}
                            className="shadow-2xl hover:scale-110 active:scale-95 transition-all"
                        >
                            {sidebar_opened ? <IoArrowForwardOutline size={20} /> : <IoListOutline size={20} />}
                        </ActionIcon>
                    </Tooltip>
                </Box>
            )}
          </Grid>
        </Box>
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

