'use client';

import { useState } from 'react';
import { Title, Paper, Stack, Box, LoadingOverlay, Breadcrumbs, Anchor, Group, SimpleGrid, TextInput, Text, Avatar, UnstyledButton } from '@mantine/core';
import { useUsersQuery } from '@/components/layout/users/hooks/use-users-query';
import { useTranslations } from 'next-intl';
import { useDebouncedValue } from '@mantine/hooks';
import { Link } from '@/i18n/routing';
import { IoSearchOutline, IoArrowForwardOutline } from 'react-icons/io5';
import { cn } from '@/lib/utils';

/**
 * Modern Grid-based layout for selecting a student for the tracker.
 * Replaces the dry table view with visually rich cards.
 */
export function TrackerUsersLayout() {
  const t = useTranslations('Tracker');
  const tNav = useTranslations('Navigation');
  const common_t = useTranslations('Common');
  
  const [search_query, set_search_query] = useState('');
  const [debounced_search] = useDebouncedValue(search_query, 300);

  const { 
    users, 
    is_loading,
  } = useUsersQuery({
    search: debounced_search || undefined,
    limit: 100, // Show many students at once for easy picking
    include_subscriptions: true
  });

  const breadcrumb_items = [
    { title: tNav('dashboard'), href: '/main' },
    { title: tNav('tracker'), href: '/main/tracker' },
  ].map((item, index) => (
    <Anchor component={Link} href={item.href} key={index} size="sm">
      {item.title}
    </Anchor>
  ));

  // Only teachers/admins see this, and they only pick students
  const filtered_users = users.filter(u => u.role === 'student');

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
            {filtered_users.map((student) => (
              <StudentTrackerCard key={student.id} student={student} />
            ))}
          </SimpleGrid>
        )}
      </Box>
    </Stack>
  );
}

/**
 * Visually appealing card for each student in the tracker picker.
 * Uses dynamic space primary color for all accents and glows.
 */
function StudentTrackerCard({ student }: { student: any }) {
  const t = useTranslations('Tracker');

  return (
    <UnstyledButton
      component={Link}
      href={`/main/tracker/${student.id}`}
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
      {/* Dynamic Background Glow Effect */}
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
            style={{ 
              border: '2px solid transparent',
              transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {student.name.charAt(0)}
          </Avatar>
          
          {/* Group-hover ring effect using primary color - fixed shape to match Avatar */}
          <div 
            className="absolute inset-[-6px] rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 ring-2"
            style={{ borderColor: 'var(--space-primary)' }}
          />

          <div className={cn(
            "absolute bottom-1 right-1 w-5 h-5 rounded-full border-4 border-zinc-900 shadow-md",
            student.status === 'active' ? "bg-emerald-500" : "bg-zinc-500"
          )} title={student.status} />
        </div>

        <Stack gap={8} className="w-full">
          <Text 
            fw={700} 
            size="xl" 
            className="text-white transition-colors line-clamp-1 h-8 text-center"
            style={{ 
              transition: 'color 0.3s ease',
            }}
          >
            <span className="group-hover:text-[var(--space-primary)] transition-colors duration-300">
              {student.name}
            </span>
          </Text>
          
          <Group gap={6} justify="center" wrap="nowrap">
             <Text size="sm" c="dimmed" className="opacity-40 flex items-center gap-1 group-hover:opacity-100 transition-opacity">
                {t('open_board')} 
                <IoArrowForwardOutline 
                  className="group-hover:translate-x-1.5 transition-transform duration-300" 
                  style={{ color: 'var(--space-primary)' }}
                />
             </Text>
          </Group>
        </Stack>

        {/* Categories / Tags */}
        {student.categories && student.categories.length > 0 && (
          <Group gap={6} justify="center" wrap="wrap" className="mt-1 min-h-[26px] w-full">
              <>
                {student.categories.slice(0, 2).map((cat: any) => (
                  <Box 
                    key={cat.id} 
                    className="px-3 py-1 rounded-lg text-xs font-bold tracking-tight truncate max-w-[45%]"
                    style={{ 
                      backgroundColor: cat.color ? `${cat.color}15` : 'rgba(255,255,255,0.05)', 
                      color: cat.color || 'white',
                      border: `1px solid ${cat.color ? `${cat.color}30` : 'rgba(255,255,255,0.1)'}`
                    }}
                  >
                    {cat.name}
                  </Box>
                ))}
                {student.categories.length > 2 && (
                  <Text size="xs" c="dimmed" fw={700}>+{student.categories.length - 2}</Text>
                )}
              </>
          </Group>
        )}
      </Stack>

      {/* Subtle hover overlay gradient using primary color */}
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
