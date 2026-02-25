'use client';

import { useState } from 'react';
import { Drawer, Title, ScrollArea, Box, Text, UnstyledButton } from '@mantine/core';
import { IoPersonOutline, IoSettingsOutline } from 'react-icons/io5';
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
  const [activeTab, setActiveTab] = useState<'personal' | 'settings'>('personal');

  const tabs = [
    { 
      id: 'personal' as const, 
      label: t('tabs_drawer.personal'), 
      icon: <IoPersonOutline size={20} />,
      color: '#228be6' // mantine blue
    },
    { 
      id: 'settings' as const, 
      label: t('tabs_drawer.settings'), 
      icon: <IoSettingsOutline size={20} />,
      color: '#4c6ef5' // mantine indigo
    }
  ];

  return (
    <Drawer
      opened={opened}
      onClose={on_close}
      position="right"
      title={
        <Title order={3} p={32} component="span">
          {initial_data 
            ? (initial_data.role === 'student' ? t('drawer.edit_student_title') : t('drawer.edit_title'))
            : (current_user?.role === 'teacher' ? t('drawer.add_student_title') : t('drawer.add_title'))
          }
        </Title>
      }
      padding={0} // We will use padding inside the scroll area
      size="md"
      withCloseButton
      styles={{
        root: {
          overflow: 'hidden',
        },
        content: { 
          overflow: 'visible',
          background: 'var(--mantine-color-body)',
        },
        body: { 
          height: 'calc(100vh - 60px)',
          overflow: 'visible',
          position: 'relative'
        },
        inner: {
          overflow: 'visible',
        }
      }}
    >
      {/* Bookmark Tabs sticking out to the left */}
      {current_user?.role !== 'student' && (
        <Box 
          style={{ 
            position: 'absolute', 
            left: '-52px', // Minimum width (collapsed state)
            top: '-38px', 
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            alignItems: 'flex-end',
            width: '200px', // Full width for the active state
            transform: 'translateX(-74%)', // Move the whole container to the left of the drawer edge
            pointerEvents: 'none'
          }}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <UnstyledButton
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '0 16px',
                  height: '48px',
                  borderRadius: '12px 0 0 12px',
                  cursor: 'pointer',
                  pointerEvents: 'auto',
                  transition: 'all 0.3s ease',
                  boxShadow: 'rgba(0, 0, 0, 0.2) 0px 10px 15px -3px',
                  color: 'white',
                  background: tab.color,
                  width: isActive ? '180px' : '52px',
                  opacity: isActive ? 1 : 0.8,
                  overflow: 'hidden'
                }}
              >
                <div style={{ flexShrink: 0, width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {tab.icon}
                </div>
                <Text 
                  size="sm" 
                  fw={600} 
                  className="tabs-drawer-label"
                  style={{ 
                    whiteSpace: 'nowrap',
                    opacity: isActive ? 1 : 0,
                    transition: 'opacity 0.2s ease',
                    display: isActive ? 'block' : 'none'
                  }}
                >
                  {tab.label}
                </Text>
              </UnstyledButton>
            );
          })}
        </Box>
      )}

      <ScrollArea h="100%" p="xl">
        <UserForm 
          activeTab={activeTab}
          initial_data={initial_data}
          teachers={teachers}
          current_user={current_user}
          on_submit={on_submit}
          is_loading={is_loading}
        />
      </ScrollArea>
    </Drawer>
  );
}
