'use client';

import { Drawer, Title, ScrollArea } from '@mantine/core';
import { UserForm } from './user-form';
import { UserListItem, UserFormData } from '@/schemas/users';
import { useTranslations } from 'next-intl';

interface Props {
  opened: boolean;
  on_close: () => void;
  initial_data: UserListItem | null;
  teachers: { id: string; name: string; role: string }[];
  current_user: any;
  on_submit: (data: UserFormData) => void;
  is_loading: boolean;
}

export function UserDrawer({ 
  opened, 
  on_close, 
  initial_data, 
  teachers, 
  current_user,
  on_submit, 
  is_loading 
}: Props) {
  const t = useTranslations('Users');

  return (
    <Drawer
      opened={opened}
      onClose={on_close}
      position="right"
      title={
        <Title order={3} component="span">
          {initial_data ? t('drawer.edit_title') : t('drawer.add_title')}
        </Title>
      }
      padding="xl"
      size="md"
      scrollAreaComponent={ScrollArea.Autosize}
    >
      <UserForm 
        initial_data={initial_data}
        teachers={teachers}
        current_user={current_user}
        on_submit={on_submit}
        is_loading={is_loading}
      />
    </Drawer>
  );
}
