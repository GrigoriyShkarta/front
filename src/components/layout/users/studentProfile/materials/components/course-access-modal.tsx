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
  Badge,
  Tooltip,
  UnstyledButton
} from '@mantine/core';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { 
  IoChevronDownOutline, 
  IoChevronForwardOutline, 
  IoFolderOutline,
  IoShieldHalfOutline,
  IoArrowBackOutline,
  IoPlayCircleOutline,
  IoCheckmarkDoneCircleOutline
} from 'react-icons/io5';
import { useRouter } from '@/i18n/routing';
import { StudentCourseItem } from '../schemas/materials-schema';

interface Props {
  opened: boolean;
  course: StudentCourseItem | null;
  student_id: string;
  is_loading?: boolean;
  on_close: () => void;
  on_submit: (data: { lesson_ids: string[], test_ids: string[] }) => Promise<void>;
}

export function CourseAccessModal({ opened, on_close, course, student_id, on_submit, is_loading }: Props) {
  const t = useTranslations('Materials.access');
  const common_t = useTranslations('Common');
  
  const [selected_lesson_ids, set_selected_lesson_ids] = useState<string[]>([]);
  const [selected_test_ids, set_selected_test_ids] = useState<string[]>([]);
  const [initial_lesson_ids, set_initial_lesson_ids] = useState<string[]>([]);
  const [initial_test_ids, set_initial_test_ids] = useState<string[]>([]);

  const [expanded_groups, set_expanded_groups] = useState<string[]>([]);
  const [confirm_opened, set_confirm_opened] = useState(false);
  const [pending_url, set_pending_url] = useState<string | null>(null);
  
  const router = useRouter();

  const has_changes = 
    JSON.stringify([...initial_lesson_ids].sort()) !== JSON.stringify([...selected_lesson_ids].sort()) ||
    JSON.stringify([...initial_test_ids].sort()) !== JSON.stringify([...selected_test_ids].sort());

  // Initialize selected IDs from course content
  useEffect(() => {
    if (opened && course) {
      const lessons: string[] = [];
      const tests: string[] = [];

      course.content.forEach(item => {
        if (item.type === 'lesson') {
          if (item.has_access) lessons.push(item.lesson_id);
        } else if (item.type === 'test') {
          if (item.has_access) tests.push(item.test_id);
        } else if (item.type === 'group') {
          (item.content || []).forEach(c => {
             if (c.type === 'lesson' && c.has_access) lessons.push(c.lesson_id);
             if (c.type === 'test' && c.has_access) tests.push(c.test_id);
          });
        }
      });

      set_selected_lesson_ids(lessons);
      set_selected_test_ids(tests);
      set_initial_lesson_ids(lessons);
      set_initial_test_ids(tests);
      
      // Auto-expand all groups
      set_expanded_groups(course.content.filter(i => i.type === 'group').map(i => i.id));
    }
  }, [course?.id, opened]);

  if (!course) return null;

  // Flattened list of all material IDs in the course
  const get_all_material_ids = () => {
    const lessons: string[] = [];
    const tests: string[] = [];

    course.content.forEach(item => {
      if (item.type === 'lesson') lessons.push(item.lesson_id);
      if (item.type === 'test') tests.push(item.test_id);
      if (item.type === 'group') {
        (item.content || []).forEach(c => {
          if (c.type === 'lesson') lessons.push((c as any).lesson_id);
          if (c.type === 'test') tests.push((c as any).test_id);
        });
      }
    });
    return { lessons, tests };
  };

  const { lessons: all_l_ids, tests: all_t_ids } = get_all_material_ids();

  const toggle_all_course = () => {
    const is_all_selected = selected_lesson_ids.length === all_l_ids.length && selected_test_ids.length === all_t_ids.length;
    if (is_all_selected) {
      set_selected_lesson_ids([]);
      set_selected_test_ids([]);
    } else {
      set_selected_lesson_ids(all_l_ids);
      set_selected_test_ids(all_t_ids);
    }
  };

  const toggle_group = (group_l_ids: string[], group_t_ids: string[]) => {
    const all_selected = group_l_ids.every(id => selected_lesson_ids.includes(id)) && 
                         group_t_ids.every(id => selected_test_ids.includes(id));
    
    if (all_selected) {
      set_selected_lesson_ids(prev => prev.filter(id => !group_l_ids.includes(id)));
      set_selected_test_ids(prev => prev.filter(id => !group_t_ids.includes(id)));
    } else {
      set_selected_lesson_ids(prev => [...new Set([...prev, ...group_l_ids])]);
      set_selected_test_ids(prev => [...new Set([...prev, ...group_t_ids])]);
    }
  };

  const toggle_lesson = (lesson_id: string) => {
    set_selected_lesson_ids(prev => 
      prev.includes(lesson_id) ? prev.filter(id => id !== lesson_id) : [...prev, lesson_id]
    );
  };

  const toggle_test = (test_id: string) => {
    set_selected_test_ids(prev => 
      prev.includes(test_id) ? prev.filter(id => id !== test_id) : [...prev, test_id]
    );
  };

  const toggle_expand = (group_id: string) => {
    set_expanded_groups(prev => 
      prev.includes(group_id) ? prev.filter(id => id !== group_id) : [...prev, group_id]
    );
  };

  const handle_navigate = (id: string, type: 'lesson' | 'test', is_partial: boolean = false) => {
    let url = '';
    if (type === 'test') {
      url = `/main/materials/tests/${id}`;
    } else {
      url = `/main/materials/lessons/${id}${is_partial ? `?partial_access=true&student_id=${student_id}` : ''}`;
    }

    if (has_changes) {
      set_pending_url(url);
      set_confirm_opened(true);
    } else {
      router.push(url);
    }
  };

  const handle_confirm_save = async () => {
    await on_submit({ lesson_ids: selected_lesson_ids, test_ids: selected_test_ids });
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
          <Text size="xs" c="dimmed">{t('manage_access') || 'Manage materials access'}</Text>
        </Stack>
      }
      size="lg"
      scrollAreaComponent={ScrollArea.Autosize}
    >
      <Stack gap="md">
        <Group justify="space-between" align="center" px="xs" py="sm" className="bg-white/5 rounded-md">
          <Text size="sm" fw={500}>{t('all_materials') || 'All materials'}</Text>
          <Checkbox 
            checked={selected_lesson_ids.length === all_l_ids.length && selected_test_ids.length === all_t_ids.length && (all_l_ids.length > 0 || all_t_ids.length > 0)}
            indeterminate={(selected_lesson_ids.length > 0 || selected_test_ids.length > 0) && (selected_lesson_ids.length < all_l_ids.length || selected_test_ids.length < all_t_ids.length)}
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
                    <IoPlayCircleOutline size={16} />
                    <UnstyledButton onClick={() => handle_navigate(item.lesson_id, 'lesson')}>
                      <Text size="sm" fw={500} className="hover:underline">{item.title || item.name || item.lesson_id}</Text>
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
                        onClick={() => handle_navigate(item.lesson_id, 'lesson', true)}
                      >
                        <IoShieldHalfOutline size={16} />
                      </ActionIcon>
                    </Tooltip>
                    <Checkbox 
                      checked={selected_lesson_ids.includes(item.lesson_id)}
                      onChange={() => toggle_lesson(item.lesson_id)}
                    />
                  </Group>
                </Group>
              );
            }

            if (item.type === 'test') {
              return (
                <Group key={item.id} justify="space-between" px="md">
                  <Group gap="xs">
                    <IoCheckmarkDoneCircleOutline size={16} />
                    <UnstyledButton onClick={() => handle_navigate(item.test_id, 'test')}>
                        <Text size="sm" fw={500} className="hover:underline">{item.title || item.name || item.test_id}</Text>
                    </UnstyledButton>

                  </Group>
                  <Checkbox 
                    checked={selected_test_ids.includes(item.test_id)}
                    onChange={() => toggle_test(item.test_id)}
                  />
                </Group>
              );
            }

            if (item.type === 'group') {
              const group_content = item.content || [];
              const group_l_ids = group_content.filter(c => c.type === 'lesson').map(c => (c as any).lesson_id);
              const group_t_ids = group_content.filter(c => c.type === 'test').map(c => (c as any).test_id);
              
              const all_group_selected = group_l_ids.every(id => selected_lesson_ids.includes(id)) && 
                                       group_t_ids.every(id => selected_test_ids.includes(id));
              const some_group_selected = group_l_ids.some(id => selected_lesson_ids.includes(id)) || 
                                        group_t_ids.some(id => selected_test_ids.includes(id));
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
                      checked={all_group_selected && (group_l_ids.length > 0 || group_t_ids.length > 0)}
                      indeterminate={some_group_selected && !all_group_selected}
                      onChange={() => toggle_group(group_l_ids, group_t_ids)}
                    />
                  </Group>
                  <Collapse in={is_expanded}>
                    <Stack gap="xs" pl="xl" py="xs">
                      {group_content.map((c: any) => {
                        if (c.type === 'lesson') {
                          return (
                            <Group key={c.lesson_id} justify="space-between" py={4} pr="md">
                              <Group gap="xs">
                                <IoPlayCircleOutline size={14} />
                                <UnstyledButton onClick={() => handle_navigate(c.lesson_id, 'lesson')}>
                                  <Text size="sm" fw={500} className="hover:underline">{c.title || c.name || c.lesson_id}</Text>
                                </UnstyledButton>
                                {c.access_type && c.access_type !== 'none' && (
                                  <Badge size="xs" variant="outline" color={c.access_type === 'full' ? 'green' : 'orange'}>
                                    {t(c.access_type) || c.access_type}
                                  </Badge>
                                )}
                              </Group>
                              <Group gap="xs">
                                <Tooltip label={t('partial_config') || 'Manage partial access'}>
                                  <ActionIcon 
                                    variant="subtle" 
                                    size="sm" 
                                    color="gray"
                                    onClick={() => handle_navigate(c.lesson_id, 'lesson', true)}
                                  >
                                    <IoShieldHalfOutline size={14} />
                                  </ActionIcon>
                                </Tooltip>
                                <Checkbox 
                                  checked={selected_lesson_ids.includes(c.lesson_id)}
                                  onChange={() => toggle_lesson(c.lesson_id)}
                                />
                              </Group>
                            </Group>
                          );
                        }
                        if (c.type === 'test') {
                          return (
                            <Group key={c.test_id} justify="space-between" py={4} pr="md">
                              <Group gap="xs">
                                <IoCheckmarkDoneCircleOutline size={14} color="var(--mantine-primary-color-filled)" />
                                <UnstyledButton onClick={() => handle_navigate(c.test_id, 'test')}>
                                    <Text size="sm" fw={500} className="hover:underline">{c.title || c.name || c.test_id}</Text>
                                </UnstyledButton>
                              </Group>
                              <Checkbox 
                                checked={selected_test_ids.includes(c.test_id)}
                                onChange={() => toggle_test(c.test_id)}
                              />
                            </Group>
                          );
                        }
                        return null;
                      })}
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
            onClick={() => on_submit({ lesson_ids: selected_lesson_ids, test_ids: selected_test_ids })} 
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
              variant="subtle" 
              color="gray" 
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
