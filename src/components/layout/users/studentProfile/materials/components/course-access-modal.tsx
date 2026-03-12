'use client';

import { 
  Modal, 
  Stack, 
  Group, 
  Text, 
  Checkbox, 
  Button, 
  Divider,
  ScrollArea,
  Collapse,
  ActionIcon,
  Box,
  Badge,
  Tooltip,
  UnstyledButton
} from '@mantine/core';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { 
  IoChevronDownOutline, 
  IoChevronForwardOutline, 
  IoBookOutline, 
  IoFolderOutline,
  IoShieldHalfOutline,
  IoArrowBackOutline
} from 'react-icons/io5';
import { Link, useRouter } from '@/i18n/routing';
import { StudentCourseItem } from '../schemas/materials-schema';

interface Props {
  opened: boolean;
  on_close: () => void;
  course: StudentCourseItem | null;
  student_id: string;
  on_submit: (lesson_ids: string[]) => Promise<void>;
  is_loading?: boolean;
}

export function CourseAccessModal({ opened, on_close, course, student_id, on_submit, is_loading }: Props) {
  const t = useTranslations('Materials.access');
  const common_t = useTranslations('Common');
  
  const [selected_ids, set_selected_ids] = useState<string[]>([]);
  const [initial_ids, set_initial_ids] = useState<string[]>([]);
  const [expanded_groups, set_expanded_groups] = useState<string[]>([]);
  const [confirm_opened, set_confirm_opened] = useState(false);
  const [pending_url, set_pending_url] = useState<string | null>(null);
  
  const router = useRouter();

  const has_changes = JSON.stringify([...initial_ids].sort()) !== JSON.stringify([...selected_ids].sort());

  // Initialize selected IDs from course content
  useEffect(() => {
    if (opened && course) {
      const initial_ids: string[] = [];
      course.content.forEach(item => {
        if (item.type === 'lesson') {
          if (item.has_access) initial_ids.push(item.lesson_id);
        } else if (item.type === 'group') {
          item.lessons.forEach(lesson => {
            if (lesson.has_access) initial_ids.push(lesson.lesson_id);
          });
        }
      });
      set_selected_ids(initial_ids);
      set_initial_ids(initial_ids);
      // Auto-expand all groups
      set_expanded_groups(course.content.filter(i => i.type === 'group').map(i => i.id));
    }
  }, [course?.id, opened]);

  if (!course) return null;

  // Flattened list of all lesson IDs in the course
  const all_lesson_ids = course.content.reduce((acc: string[], item) => {
    if (item.type === 'lesson') acc.push(item.lesson_id);
    if (item.type === 'group') acc.push(...item.id ? item.lesson_ids : []); // Wait, group lesson_ids
    return acc;
  }, []);

  // Correctly get all lesson IDs
  const get_all_lesson_ids = () => {
    const ids: string[] = [];
    course.content.forEach(item => {
      if (item.type === 'lesson') ids.push(item.lesson_id);
      if (item.type === 'group') ids.push(...item.lesson_ids);
    });
    return ids;
  };

  const current_all_ids = get_all_lesson_ids();

  const toggle_all_course = () => {
    if (selected_ids.length === current_all_ids.length) {
      set_selected_ids([]);
    } else {
      set_selected_ids(current_all_ids);
    }
  };

  const toggle_group = (group_lesson_ids: string[]) => {
    const all_selected = group_lesson_ids.every(id => selected_ids.includes(id));
    if (all_selected) {
      set_selected_ids(prev => prev.filter(id => !group_lesson_ids.includes(id)));
    } else {
      set_selected_ids(prev => [...new Set([...prev, ...group_lesson_ids])]);
    }
  };

  const toggle_lesson = (lesson_id: string) => {
    set_selected_ids(prev => 
      prev.includes(lesson_id) 
        ? prev.filter(id => id !== lesson_id) 
        : [...prev, lesson_id]
    );
  };

  const toggle_expand = (group_id: string) => {
    set_expanded_groups(prev => 
      prev.includes(group_id) 
        ? prev.filter(id => id !== group_id) 
        : [...prev, group_id]
    );
  };

  const handle_navigate = (lesson_id: string, is_partial: boolean = false) => {
    const url = `/main/materials/lessons/${lesson_id}${is_partial ? `?partial_access=true&student_id=${student_id}` : ''}`;
    if (has_changes) {
      set_pending_url(url);
      set_confirm_opened(true);
    } else {
      router.push(url);
    }
  };

  const handle_confirm_save = async () => {
    await on_submit(selected_ids);
    if (pending_url) {
      router.push(pending_url);
    }
    set_confirm_opened(false);
  };

  const handle_confirm_skip = () => {
    if (pending_url) {
      router.push(pending_url);
    }
    set_confirm_opened(false);
  };

  return (
    <Modal
      opened={opened}
      onClose={on_close}
      title={
        <Stack gap={0}>
          <Text fw={600}>{course.name}</Text>
          <Text size="xs" c="dimmed">{t('manage_access') || 'Manage lessons access'}</Text>
        </Stack>
      }
      size="lg"
      scrollAreaComponent={ScrollArea.Autosize}
    >
      <Stack gap="md">
        <Group justify="space-between" align="center" px="xs" py="sm" className="bg-white/5 rounded-md">
          <Text size="sm" fw={500}>{t('all_lessons') || 'All lessons'}</Text>
          <Checkbox 
            checked={selected_ids.length === current_all_ids.length && current_all_ids.length > 0}
            indeterminate={selected_ids.length > 0 && selected_ids.length < current_all_ids.length}
            onChange={toggle_all_course}
          />
        </Group>

        <Divider />

        <Stack gap="xs">
          {course.content.map((item) => {
            if (item.type === 'lesson') {
              return (
                <Group key={item.id} justify="space-between" px="md">
                  <Group gap="xs">
                    <IoBookOutline size={16} />
                    <UnstyledButton onClick={() => handle_navigate(item.lesson_id)}>
                      <Text size="sm" color="primary" className="hover:underline">{item.title || item.name || item.lesson_id}</Text>
                    </UnstyledButton>
                    {item.access_type && item.access_type !== 'none' && (
                      <Badge size="xs" variant="outline" color={item.access_type === 'full' ? 'green' : 'orange'}>
                        {t(item.access_type) || item.access_type}
                      </Badge>
                    )}
                  </Group>
                  <Group gap="xs">
                    <Tooltip label={t('partial_config') || 'Manage partial access'}>
                      <ActionIcon 
                        variant="subtle" 
                        size="sm" 
                        color="gray"
                        onClick={() => handle_navigate(item.lesson_id, true)}
                      >
                        <IoShieldHalfOutline size={16} />
                      </ActionIcon>
                    </Tooltip>
                    <Checkbox 
                      checked={selected_ids.includes(item.lesson_id)}
                      onChange={() => toggle_lesson(item.lesson_id)}
                    />
                  </Group>
                </Group>
              );
            }

            if (item.type === 'group') {
              const group_lesson_ids = item.lesson_ids;
              const all_group_selected = group_lesson_ids.every(id => selected_ids.includes(id));
              const some_group_selected = group_lesson_ids.some(id => selected_ids.includes(id));
              const is_expanded = expanded_groups.includes(item.id);

              return (
                <Stack key={item.id} gap={0}>
                  <Group justify="space-between" className="bg-white/2 hover:bg-white/5 transition-colors p-sm rounded-sm">
                    <Group gap="xs" style={{ cursor: 'pointer' }} onClick={() => toggle_expand(item.id)}>
                      <ActionIcon variant="subtle" size="sm" color="gray">
                        {is_expanded ? <IoChevronDownOutline size={14} /> : <IoChevronForwardOutline size={14} />}
                      </ActionIcon>
                      <IoFolderOutline size={16} className="text-yellow-500" />
                      <Text size="sm" fw={600}>{item.title}</Text>
                    </Group>
                    <Checkbox 
                      checked={all_group_selected && group_lesson_ids.length > 0}
                      indeterminate={some_group_selected && !all_group_selected}
                      onChange={() => toggle_group(group_lesson_ids)}
                    />
                  </Group>
                  <Collapse in={is_expanded}>
                    <Stack gap="xs" pl="xl" py="xs">
                      {item.lessons.map((lesson) => (
                        <Group key={lesson.lesson_id} justify="space-between" py={4} pr="md">
                          <Group gap="xs">
                            <IoBookOutline size={14} />
                            <UnstyledButton onClick={() => handle_navigate(lesson.lesson_id)}>
                              <Text size="sm" color="primary" className="hover:underline">{lesson.title || lesson.name || lesson.lesson_id}</Text>
                            </UnstyledButton>
                            {lesson.access_type && lesson.access_type !== 'none' && (
                              <Badge size="xs" variant="outline" color={lesson.access_type === 'full' ? 'green' : 'orange'}>
                                {t(lesson.access_type) || lesson.access_type}
                              </Badge>
                            )}
                          </Group>
                          <Group gap="xs">
                            <Tooltip label={t('partial_config') || 'Manage partial access'}>
                              <ActionIcon 
                                variant="subtle" 
                                size="sm" 
                                color="gray"
                                onClick={() => handle_navigate(lesson.lesson_id, true)}
                              >
                                <IoShieldHalfOutline size={14} />
                              </ActionIcon>
                            </Tooltip>
                            <Checkbox 
                              checked={selected_ids.includes(lesson.lesson_id)}
                              onChange={() => toggle_lesson(lesson.lesson_id)}
                            />
                          </Group>
                        </Group>
                      ))}
                    </Stack>
                  </Collapse>
                </Stack>
              );
            }
            return null;
          })}
        </Stack>

        <Divider mt="md" />

        <Group justify="flex-end" gap="sm">
          <Button variant="subtle" onClick={on_close}>
            {common_t('cancel') || 'Cancel'}
          </Button>
          <Button 
            onClick={() => on_submit(selected_ids)} 
            loading={is_loading}
            color="primary"
            className="bg-primary hover:opacity-90 transition-all shadow-md shadow-primary/20"
          >
            {common_t('save') || 'Save'}
          </Button>
        </Group>
      </Stack>

      {/* Unsaved changes confirmation */}
      <Modal 
        opened={confirm_opened} 
        onClose={() => set_confirm_opened(false)} 
        title={t('unsaved_changes.title') || 'Unsaved changes'}
        centered
        size="md"
        zIndex={1000}
      >
        <Stack gap="md">
          <Text size="sm">
            {t('unsaved_changes.message') || 'You have unsaved changes. Would you like to save them before leaving?'}
          </Text>
          <Group justify="flex-end" gap="sm">
            <Button 
              variant="outline" 
              leftSection={<IoArrowBackOutline size={16} />} 
              onClick={() => set_confirm_opened(false)}
            >
              {t('unsaved_changes.back') || 'Back'}
            </Button>
            <Button 
              variant="subtle" 
              color="gray"
              onClick={handle_confirm_skip}
            >
              {t('unsaved_changes.go_without_saving') || 'Don\'t save'}
            </Button>
            <Button 
              onClick={handle_confirm_save}
              loading={is_loading}
              color="primary"
              className="bg-primary hover:opacity-90 transition-all shadow-md shadow-primary/20"
            >
              {t('unsaved_changes.save_and_go') || 'Save and leave'}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Modal>
  );
}
