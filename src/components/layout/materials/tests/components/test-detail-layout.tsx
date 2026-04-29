'use client';

import { useState } from 'react';

import {
  Stack,
  Tabs,
  Group,
  Button,
  Title,
  Text,
  Box,
  LoadingOverlay,
  Grid,
  Paper,
  ActionIcon,
} from '@mantine/core';
import {
  IoPlayOutline,
  IoChevronBackOutline,
  IoListOutline,
  IoArrowForwardOutline,
  IoExtensionPuzzleOutline,
  IoStatsChartOutline,
  IoDocumentTextOutline,
} from 'react-icons/io5';
import { Tooltip } from '@mantine/core';
import { useTranslations } from 'next-intl';

import { Link, useRouter } from '@/i18n/routing';
import { useAuth } from '@/hooks/use-auth';
import { useTestEditor } from '../hooks/use-test-editor';
import TestEditorContainer from './editor/test-editor-container';
import { TestResultsLayout } from './results/test-results-layout';
import { TestResultScreen } from './take-test/test-result-screen';
import { TestCourseSidebar } from './test-course-sidebar';
import { useCourse } from '@/components/layout/materials/courses/hooks/use-course';
import { useLessons } from '@/components/layout/materials/lessons/hooks/use-lessons';
import { useTests } from '@/components/layout/materials/tests/hooks/use-tests';
import { CourseCurriculum } from '@/components/layout/materials/courses/course/course-curriculum';
import { cn } from '@/lib/utils';

interface Props {
  test_id: string;
  course_id?: string;
}

/**
 * Main test detail page — shows tabs for Content and Results.
 * For students: shows a "Start test" button instead of editing.
 * For admin: shows editable content and results tab.
 */
export function TestDetailLayout({ test_id, course_id }: Props) {
  const t = useTranslations('Materials.tests');
  const t_lessons = useTranslations('Materials.lessons');
  const common_t = useTranslations('Common');
  const router = useRouter();
  const { user } = useAuth();

  const is_student = user?.role === 'student';
  const is_admin = user?.role === 'super_admin' || user?.role === 'admin' || user?.role === 'teacher';

  const { test, is_loading_test } = useTestEditor({ id: test_id });
  const [active_tab, set_active_tab] = useState<string | null>('content');
  const [sidebar_opened, set_sidebar_opened] = useState(true);

  // Fetch contextual course data if in course mode
  const { course: context_course, is_loading: is_loading_context_course } = useCourse(course_id || '');
  const { lessons: all_lessons_context } = useLessons({ page: 1, limit: 1000, search: '' });
  const { tests: all_tests_context } = useTests({ page: 1, limit: 1000, search: '' });

  const is_loading = is_loading_test || (!!course_id && is_loading_context_course);

  if (is_loading) {
    return <Box mih="60vh" pos="relative"><LoadingOverlay visible /></Box>;
  }

  // Student goes directly to test-taking
  if (is_student) {
    return (
        <Grid gutter={0} className={cn("relative min-h-[calc(100vh-80px)] transition-[padding] duration-500", sidebar_opened && course_id && context_course && "lg:pr-[400px]")}>
            <Grid.Col span={12}>
                <Stack gap="xl" maw={800} mx="auto" py="xl" px="md">
                    <Button
                    variant="subtle"
                    color="gray"
                    leftSection={<IoChevronBackOutline size={18} />}
                    onClick={() => router.push(course_id ? `/main/materials/courses/${course_id}` : '/main/materials/tests')}
                    className="w-fit"
                    >
                    {t('editor.back')}
                    </Button>

                    <Stack align="center" gap="lg" py="xl">
                    <Box className="p-4 rounded-2xl bg-primary/10 text-primary">
                        <IoExtensionPuzzleOutline size={40} />
                    </Box>
                    <Title order={1} fw={800} className="text-center">
                        {test?.name}
                    </Title>
                    {test?.description && (
                        <Text c="dimmed" className="text-center max-w-md">
                        {test.description}
                        </Text>
                    )}

                    {test?.last_attempt && test.last_attempt.status !== 'in_progress' ? (
                        <Box w="100%" mt="md">
                            <TestResultScreen 
                                attempt={test.last_attempt} 
                                questions={typeof test.content === 'string' ? JSON.parse(test.content) : test.content} 
                                on_back={() => router.push(course_id ? `/main/materials/courses/${course_id}` : '/main/materials/tests')}
                                test_id={test_id}
                                can_retake={test.can_retake}
                                course_id={course_id}
                            />
                        </Box>
                    ) : (
                        <Button
                            component={Link}
                            href={`/main/materials/tests/${test_id}/take${course_id ? `?courseId=${course_id}` : ''}`}
                            size="lg"
                            radius="xl"
                            leftSection={<IoPlayOutline size={22} />}
                            className="bg-primary hover:opacity-90 shadow-xl shadow-primary/20 mt-4 transition-all hover:-translate-y-0.5"
                        >
                            {t('take.start_button')}
                        </Button>
                    )}
                    </Stack>
                    
                    {/* Mobile Curriculum view for detail */}
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
                </Stack>
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

  // Admin view with tabs
  return (
    <Grid gutter={0} className={cn("relative min-h-[calc(100vh-80px)] transition-[padding] duration-500", sidebar_opened && course_id && context_course && "lg:pr-[400px]")}>
      <Grid.Col span={12}>
        <Stack gap="lg" px="md">
          <Group justify="space-between" align="center">
            <Button
              variant="subtle"
              color="gray"
              leftSection={<IoChevronBackOutline size={18} />}
              onClick={() => router.push(course_id ? `/main/materials/courses/${course_id}` : '/main/materials/tests')}
            >
              {t('editor.back')}
            </Button>
            <Title order={3} fw={700} className="flex-1 text-center truncate">
              {test?.name}
            </Title>
            <Box w={100} />
          </Group>

          <Tabs value={active_tab} onChange={set_active_tab}>
            <Tabs.List className="border-b border-white/10">
              <Tabs.Tab
                value="content"
                leftSection={<IoDocumentTextOutline size={16} />}
              >
                {t('detail.tab_content')}
              </Tabs.Tab>
              <Tabs.Tab
                value="results"
                leftSection={<IoStatsChartOutline size={16} />}
              >
                <Group gap={6}>
                  {t('detail.tab_results')}
                </Group>
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="content" pt="lg">
              <TestEditorContainer id={test_id} is_read_only />
            </Tabs.Panel>

            <Tabs.Panel value="results" pt="lg">
              <TestResultsLayout test_id={test_id} />
            </Tabs.Panel>
          </Tabs>
          
          {/* Mobile Curriculum view for admin detail */}
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
        </Stack>
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
