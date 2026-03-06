'use client';

import { 
  Modal, 
  Stack, 
  Group, 
  TextInput, 
  Button, 
  Table, 
  Checkbox, 
  Avatar, 
  Text, 
  Box, 
  LoadingOverlay, 
  Pagination,
  MultiSelect,
  Select,
  Badge,
  rem
} from '@mantine/core';
import { useDisclosure, useDebouncedValue } from '@mantine/hooks';
import { IoSearchOutline, IoFilterOutline, IoPeopleOutline } from 'react-icons/io5';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { useUsersQuery } from '@/components/layout/users/hooks/use-users-query';
import { useCategories } from '@/components/layout/categories/hooks/use-categories';
import { materialsActions } from '@/components/layout/users/studentProfile/materials/actions/materials-actions';
import { notifications } from '@mantine/notifications';

interface Props {
  opened: boolean;
  onClose: () => void;
  materialIds: string[];
  materialType: 'lesson' | 'audio' | 'photo' | 'video' | 'file';
  initialSelectedIds?: string[];
  onSuccess?: () => void;
}

export function GrantAccessModal({ opened, onClose, materialIds, materialType, initialSelectedIds, onSuccess }: Props) {
  const t = useTranslations('Materials.access');
  const common_t = useTranslations('Common');
  
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebouncedValue(search, 300);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState('10');

  const { users, meta, is_loading, is_mutating } = useUsersQuery({
    search: debouncedSearch || undefined,
    category_ids: categoryIds.length > 0 ? categoryIds : undefined,
    page,
    limit: parseInt(limit),
    role: 'student',
    // Pass the material info to get access status for each student
    material_id: materialIds.length === 1 ? materialIds[0] : undefined,
    material_ids: materialIds.length > 1 ? materialIds : undefined,
    material_type: materialType,
  });

  const { categories } = useCategories();
  const tCat = useTranslations('Categories');

  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>(initialSelectedIds || []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync with initialSelectedIds when they change (e.g. modal reopens with different materials)
  useEffect(() => {
    if (opened) {
      setSelectedStudentIds(initialSelectedIds || []);
      setPage(1);
      setSearch('');
      setCategoryIds([]);
    }
  }, [opened, initialSelectedIds]);

  // Initialize selectedStudentIds based on who already has access from the users query
  useEffect(() => {
    if (opened && users.length > 0) {
      const users_with_access = users
        .filter((u: any) => u.has_access)
        .map(u => u.id);
      
      setSelectedStudentIds(prev => {
        const new_ids = new Set([...prev, ...users_with_access]);
        return Array.from(new_ids);
      });
    }
  }, [users, opened]);

  const handleToggleStudent = (id: string) => {
    setSelectedStudentIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const all_ids = [...selectedStudentIds];
      users.forEach(u => {
        if (!all_ids.includes(u.id)) all_ids.push(u.id);
      });
      setSelectedStudentIds(all_ids);
    } else {
      const current_ids = users.map(u => u.id);
      setSelectedStudentIds(prev => prev.filter(id => !current_ids.includes(id)));
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Determine what changed
      // We need to know who to grant and who to revoke if we want to be precise,
      // but usually "Grant Access" modal just adds.
      // However, the user said "if already has access, checkbox is checked",
      // implying we can also revoke by unchecking.
      
      // For now, let's just implement GRANT as requested.
      // If we need to REVOKE, we'd need the initial access state.
      
      await materialsActions.grant_access({
        student_ids: selectedStudentIds,
        material_ids: materialIds,
        material_type: materialType,
        full_access: true,
      });

      notifications.show({
        title: common_t('success'),
        message: t('notifications.access_granted'),
        color: 'green',
      });

      onSuccess?.();
      onClose();
    } catch (error: any) {
      notifications.show({
        title: common_t('error'),
        message: t('notifications.access_error'),
        color: 'red',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const allSelectedInView = users.length > 0 && users.every(u => selectedStudentIds.includes(u.id));
  const someSelectedInView = users.some(u => selectedStudentIds.includes(u.id)) && !allSelectedInView;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <IoPeopleOutline size={20} />
          <Text fw={600}>{t('grant_title')}</Text>
        </Group>
      }
      size="lg"
      radius="md"
    >
      <Stack gap="md" pos="relative">
        <LoadingOverlay visible={is_loading} overlayProps={{ blur: 1 }} />
        
        <Group grow align="flex-end">
          <TextInput
            label={t('select_students')}
            placeholder={t('search_students')}
            leftSection={<IoSearchOutline size={16} />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
          />
          <MultiSelect
            label={tCat('title')}
            placeholder={tCat('select_categories')}
            data={categories.map(c => ({ value: c.id, label: c.name }))}
            value={categoryIds}
            onChange={setCategoryIds}
            searchable
            clearable
            leftSection={<IoFilterOutline size={16} />}
          />
        </Group>

        <Box className="border border-white/10 rounded-md overflow-hidden">
          <Table verticalSpacing="xs" highlightOnHover>
            <Table.Thead className="bg-white/5">
              <Table.Tr>
                <Table.Th style={{ width: rem(40) }}>
                  <Checkbox
                    checked={allSelectedInView}
                    indeterminate={someSelectedInView}
                    onChange={(e) => handleSelectAll(e.currentTarget.checked)}
                  />
                </Table.Th>
                <Table.Th>{common_t('roles.student')}</Table.Th>
                <Table.Th>{tCat('title')}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {users.map((student) => (
                <Table.Tr key={student.id}>
                  <Table.Td>
                    <Checkbox
                      checked={selectedStudentIds.includes(student.id)}
                      onChange={() => handleToggleStudent(student.id)}
                    />
                  </Table.Td>
                  <Table.Td>
                    <Group gap="sm">
                      <Avatar src={student.avatar} size="sm" radius="xl">
                        {student.name.charAt(0)}
                      </Avatar>
                      <Stack gap={0}>
                        <Text size="sm" fw={500}>{student.name}</Text>
                      </Stack>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Group gap={4}>
                      {student.categories?.map((cat) => (
                        <Badge 
                          key={cat.id} 
                          variant="light" 
                          size="xs" 
                          color={cat.color || 'gray'}
                        >
                          {cat.name}
                        </Badge>
                      ))}
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
              {users.length === 0 && !is_loading && (
                <Table.Tr>
                  <Table.Td colSpan={3}>
                    <Text ta="center" py="md" c="dimmed">
                      {common_t('no_data')}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </Box>

        {(users.length > 0) && (
          <Group justify="center" px="md" py="xs" className="border-t border-white/10">
            <Group gap="xs">
              <Text size="sm" c="dimmed">{common_t('show')}</Text>
              <Select
                data={['10', '20', '50']}
                value={limit}
                onChange={(val: string | null) => {
                  setLimit(val || '10');
                  setPage(1);
                }}
                size="xs"
                w={70}
              />
              <Text size="sm" c="dimmed">{common_t('per_page')}</Text>
            </Group>

            {meta && (
              <Pagination 
                total={meta.total_pages} 
                value={page} 
                onChange={setPage} 
                size="sm" 
                withEdges
              />
            )}
          </Group>
        )}

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" color="gray" onClick={onClose}>
            {common_t('cancel')}
          </Button>
          <Button 
            onClick={handleSubmit} 
            loading={isSubmitting}
            disabled={selectedStudentIds.length === 0}
          >
            {t('grant_button')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

