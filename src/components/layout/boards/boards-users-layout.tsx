'use client';

import { useState } from 'react';
import { Title, Paper, Stack, Box, LoadingOverlay, Breadcrumbs, Anchor, Group, SimpleGrid, TextInput, Text, Avatar, UnstyledButton } from '@mantine/core';
import { useUsersQuery } from '@/components/layout/users/hooks/use-users-query';
import { useTranslations } from 'next-intl';
import { useDebouncedValue } from '@mantine/hooks';
import { Link } from '@/i18n/routing';
import { IoSearchOutline, IoArrowForwardOutline } from 'react-icons/io5';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

/**
 * Modern Grid-based layout for selecting a student for the boards.
 * Mirroring the Tracker selection UI for consistency.
 */
export function BoardsUsersLayout() {
  const t = useTranslations('Boards');
  const tNav = useTranslations('Navigation');
  const common_t = useTranslations('Common');
  
  const [search_query, set_search_query] = useState('');
  const [debounced_search] = useDebouncedValue(search_query, 300);

  const { 
    users, 
    is_loading,
  } = useUsersQuery({
    search: debounced_search || undefined,
    limit: 100,
    include_subscriptions: true
  });

  const breadcrumb_items = [
    { title: tNav('dashboard'), href: '/main' },
    { title: tNav('boards'), href: '/main/boards' },
  ].map((item, index) => (
    <Anchor component={Link} href={item.href} key={index} size="sm">
      {item.title}
    </Anchor>
  ));

  const filtered_users = users.filter((u: any) => u.role === 'student');

  return (
    <Stack gap="xl" className="py-4">
      <Stack gap="xs">
        <Breadcrumbs separator="→" className="text-xs sm:text-sm">{breadcrumb_items}</Breadcrumbs>
        <Group justify="space-between" align="flex-end" className="flex-col sm:flex-row items-start sm:items-end gap-4">
          <Stack gap={4}>
            <Title order={1} className="text-2xl sm:text-3xl font-bold tracking-tight">
              {t('users_title')}
            </Title>
            <Text c="dimmed" size="sm">
              {t('users_subtitle')}
            </Text>
          </Stack>

          <TextInput
            placeholder={common_t('search')}
            leftSection={<IoSearchOutline size={18} />}
            value={search_query}
            onChange={(e) => set_search_query(e.currentTarget.value)}
            className="w-full sm:w-72"
            size="md"
            radius="md"
            styles={{
               input: {
                 backgroundColor: 'rgba(255, 255, 255, 0.05)',
                 border: '1px solid rgba(255, 255, 255, 0.1)',
                 backdropFilter: 'blur(10px)',
                 color: 'white'
               }
            }}
          />
        </Group>
      </Stack>

      <Box className="relative min-h-[400px]">
        <LoadingOverlay 
          visible={is_loading} 
          overlayProps={{ blur: 1, radius: 'lg', backgroundOpacity: 0.1 }} 
          loaderProps={{ size: 'lg', color: 'blue' }}
          zIndex={10} 
        />
        
        {!is_loading && filtered_users.length === 0 ? (
           <Paper withBorder p="xl" radius="lg" className="flex flex-col items-center justify-center bg-zinc-50/5 border-dashed border-zinc-700 min-h-[300px]">
             <Text c="dimmed" size="lg">{common_t('no_data')}</Text>
           </Paper>
        ) : (
          <SimpleGrid cols={{ base: 1, xs: 2, md: 3, lg: 4 }} spacing="lg">
            {filtered_users.map((student: any) => (
              <StudentBoardCard key={student.id} student={student} />
            ))}
          </SimpleGrid>
        )}
      </Box>
    </Stack>
  );
}

/**
 * Card for each student in the board picker.
 */
function StudentBoardCard({ student }: { student: any }) {
  const t = useTranslations('Boards');
  const { user } = useAuth();
  const is_white_sidebar_color = user?.space?.personalization?.is_white_sidebar_color ?? false;
  const text_color = is_white_sidebar_color ? 'text-zinc-900' : 'text-white';

  return (
    <UnstyledButton
      component={Link}
      href={`/main/boards/${student.id}`}
      className={cn(
        "group relative overflow-hidden rounded-[2.5rem] p-8 sm:p-10 transition-all duration-500",
        "bg-white/5 border border-white/10 hover:bg-white/[0.08]",
        "flex flex-col items-center text-center",
        "transform hover:-translate-y-2 hover:shadow-2xl"
      )}
      style={{
        boxShadow: '0 25px 50px -12px rgba(var(--space-primary), 0.12)',
      }}
    >
      <div 
        className="absolute -top-16 -right-16 w-48 h-48 blur-[100px] group-hover:blur-[80px] opacity-20 group-hover:opacity-30 transition-all duration-700" 
        style={{ backgroundColor: 'var(--space-primary)' }}
      />
      
      <Stack align="center" gap="xl" className="relative z-10 w-full px-4 sm:p-6">
        <div className="relative">
          <Avatar 
            src={student.avatar} 
            size={96} 
            radius="100%" 
            className="shadow-2xl ring-4 ring-white/5 transition-all duration-500 group-hover:ring-offset-4 group-hover:ring-offset-[#141414]"
          >
            {student.name.charAt(0)}
          </Avatar>
          
          <div 
            className="absolute inset-[-6px] rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 ring-2"
            style={{ borderColor: 'var(--space-primary)' }}
          />
        </div>

        <Stack gap={8} className="w-full">
          <Text fw={700} size="xl" className={cn("transition-colors line-clamp-1 h-8 text-center", text_color)}>
            <span className="group-hover:text-[var(--space-primary)] transition-colors duration-300">
              {student.name}
            </span>
          </Text>
          
          <Group gap={6} justify="center" wrap="nowrap">
             <Text 
               size="sm" 
               className={cn(
                 "opacity-40 flex items-center gap-1 group-hover:opacity-100 transition-opacity",
                 text_color
               )}
             >
                {t('open_board')} 
                <IoArrowForwardOutline 
                  className="group-hover:translate-x-1.5 transition-transform duration-300" 
                  style={{ color: 'var(--space-secondary)' }}
                />
             </Text>
          </Group>
        </Stack>
      </Stack>

      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        style={{ 
          background: 'radial-gradient(circle at center, var(--space-primary) 0%, transparent 80%)',
          filter: 'blur(60px)',
          opacity: 0.04
        }}
      />
    </UnstyledButton>
  );
}
