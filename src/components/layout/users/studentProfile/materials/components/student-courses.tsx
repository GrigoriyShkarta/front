'use client';

import { Stack, Group, Box, LoadingOverlay, TextInput, Button, Drawer, Pagination, Text, MultiSelect, Select } from '@mantine/core';
import { IoSearchOutline, IoOptionsOutline, IoFilterOutline } from 'react-icons/io5';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useCategories } from '@/components/layout/categories/hooks/use-categories';
import { useStudentMaterials } from '../hooks/use-student-materials';
import { StudentCourseTable } from './student-course-table';
import { CourseAccessModal } from './course-access-modal';
import { StudentCourseItem } from '../schemas/materials-schema';

interface Props {
  student_id: string;
}

export function StudentCourses({ student_id }: Props) {
  const t = useTranslations('Materials');
  const common_t = useTranslations('Common');
  
  const { 
    courses, 
    is_loading, 
    grant_access, 
    is_granting, 
    revoke_access, 
    is_revoking, 
    total_pages,
    page,
    setPage,
    search,
    setSearch,
    category_ids,
    setCategoryIds,
    limit,
    setLimit
  } = useStudentMaterials(student_id);
  
  const { categories } = useCategories();
  const tCat = useTranslations('Categories');
  
  const [selected_course, set_selected_course] = useState<StudentCourseItem | null>(null);
  const [modal_opened, set_modal_opened] = useState(false);
  const [filter_drawer_opened, set_filter_drawer_opened] = useState(false);

  const handle_course_click = (course: StudentCourseItem) => {
    set_selected_course(course);
    set_modal_opened(true);
  };

  const handle_submit_access = async (lesson_ids: string[]) => {
    if (!selected_course) return;

    // Get initial lesson IDs that had access
    const initial_ids: string[] = [];
    selected_course.content.forEach(item => {
      if (item.type === 'lesson') {
        if (item.has_access) initial_ids.push(item.lesson_id);
      } else if (item.type === 'group') {
        item.lessons.forEach(lesson => {
          if (lesson.has_access) initial_ids.push(lesson.lesson_id);
        });
      }
    });

    // Calculate diff
    const ids_to_grant = lesson_ids.filter(id => !initial_ids.includes(id));
    const ids_to_revoke = initial_ids.filter(id => !lesson_ids.includes(id));

    const promises = [];

    if (ids_to_grant.length > 0) {
      promises.push(grant_access({
        student_ids: [student_id],
        material_ids: ids_to_grant,
        material_type: 'lesson',
        full_access: true,
      }));
    }

    if (ids_to_revoke.length > 0) {
      promises.push(revoke_access({
        student_ids: [student_id],
        material_ids: ids_to_revoke,
        material_type: 'lesson',
      }));
    }

    if (promises.length > 0) {
      await Promise.all(promises);
    }

    set_modal_opened(false);
  };

  return (
    <Stack gap="md" pos="relative">
      <LoadingOverlay visible={is_loading} zIndex={10} overlayProps={{ blur: 1 }} />
      
      <Group justify="space-between" align="flex-end">
        <TextInput 
          placeholder={t('courses.search_lessons') || 'Search by lesson name...'}
          leftSection={<IoSearchOutline size={16} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          className="flex-1"
          maw={400}
        />
        <Button 
          variant={category_ids.length > 0 ? "light" : "default"} 
          color={category_ids.length > 0 ? "primary" : "gray"}
          leftSection={<IoOptionsOutline size={18} />}
          onClick={() => set_filter_drawer_opened(true)}
        >
          {common_t('filters') || 'Filters'}
          {category_ids.length > 0 && (
              <Box 
                  ml={8} 
                  className="w-5 h-5 rounded-full text-white flex items-center justify-center text-[10px] font-bold shadow-sm"
                  style={{ backgroundColor: 'var(--mantine-primary-color-filled)' }}
              >
                  {category_ids.length}
              </Box>
          )}
        </Button>
      </Group>

      <StudentCourseTable 
        data={courses} 
        is_loading={is_loading} 
        on_course_click={handle_course_click}
      />

      <Group justify="center" mt="md">
        <Group gap="xs">
          <Text size="sm" c="dimmed">{common_t('show')}</Text>
          <Select
            data={['10', '20', '30', '50']}
            value={limit.toString()}
            onChange={(val) => setLimit(Number(val || '10'))}
            size="xs"
            w={70}
          />
          <Text size="sm" c="dimmed">{common_t('per_page')}</Text>
        </Group>

        <Pagination 
          total={total_pages} 
          value={page} 
          onChange={setPage} 
          radius="md"
        />
      </Group>

      <CourseAccessModal 
        opened={modal_opened}
        on_close={() => set_modal_opened(false)}
        course={selected_course}
        student_id={student_id}
        on_submit={handle_submit_access}
        is_loading={is_granting || is_revoking}
      />

      <Drawer
        opened={filter_drawer_opened}
        onClose={() => set_filter_drawer_opened(false)}
        title={common_t('filters') || 'Filters'}
        position="right"
      >
        <Stack gap="lg">
            <MultiSelect
              label={tCat('title')}
              placeholder={tCat('select_categories')}
              data={categories.map(c => ({ value: c.id, label: c.name }))}
              value={category_ids}
              onChange={setCategoryIds}
              searchable
              clearable
              leftSection={<IoFilterOutline />}
            />

            <Group justify="flex-end">
              <Button 
                variant="subtle" 
                color="gray" 
                onClick={() => {
                  setCategoryIds([]);
                  set_filter_drawer_opened(false);
                }}
              >
                {common_t('clear')}
              </Button>
              <Button onClick={() => set_filter_drawer_opened(false)}>
                {common_t('apply')}
              </Button>
            </Group>
        </Stack>
      </Drawer>
    </Stack>
  );
}
