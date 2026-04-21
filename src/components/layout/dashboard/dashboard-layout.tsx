'use client';

import { useState } from 'react';
import { Container, Grid, Stack } from '@mantine/core';
import { useAuth } from '@/hooks/use-auth';
import { ROLES } from '@/types/auth.types';
import { DashboardBanner } from './components/dashboard-banner';
import { WelcomeSection } from './components/welcome-section';
import { AnnouncementCard } from './components/announcement-card';
import { TodayLessons } from './components/today-lessons';
import { NotificationsPanel } from './components/notifications-panel';
import { TodoList } from './components/todo-list';

import { StatsGrid } from './components/stats-grid';
import { QuickActions } from './components/quick-actions';

/**
 * Main dashboard layout.
 * - Admins/Teachers see: editable banner, editable welcome text, quick actions, stats, editable announcement,
 *   today's lessons, notifications, and personal todo list.
 * - Students see: read-only banner & welcome text, stats, read-only announcement,
 *   today's lessons, notifications, and todo list.
 */
export function DashboardLayout() {
  const { user } = useAuth();

  const is_admin =
    user?.role === ROLES.ADMIN ||
    user?.role === ROLES.SUPER_ADMIN ||
    user?.role === ROLES.TEACHER;

  const space = user?.space?.personalization;
  const dashboard_p = user?.space?.dashboard_personalization;
  const primary_color = space?.primary_color ?? undefined;
  const secondary_color = space?.secondary_color ?? undefined;

  // Determine which fields to use based on role
  const banner_image = is_admin
    ? dashboard_p?.dashboard_hero_image
    : dashboard_p?.student_dashboard_hero_image;

  const welcome_title = is_admin
    ? dashboard_p?.dashboard_title
    : dashboard_p?.student_dashboard_title;

  const welcome_desc = is_admin
    ? dashboard_p?.dashboard_description
    : dashboard_p?.student_dashboard_description;

  const announcement = dashboard_p?.student_announcement;

  // Local overrides after admin edits (so UI reflects changes without full refetch)
  const [local_banner, set_local_banner] = useState<string | null | undefined>(undefined);
  const [local_title, set_local_title] = useState<string | null | undefined>(undefined);
  const [local_desc, set_local_desc] = useState<string | null | undefined>(undefined);
  const [local_announcement, set_local_announcement] = useState<string | null | undefined>(undefined);

  const resolved_banner = local_banner !== undefined ? local_banner : banner_image;
  const resolved_title = local_title !== undefined ? local_title : welcome_title;
  const resolved_desc = local_desc !== undefined ? local_desc : welcome_desc;
  const resolved_announcement = local_announcement !== undefined ? local_announcement : announcement;

  const mode = (is_admin ? 'admin' : 'student') as 'admin' | 'student';

  return (
    <Container size="xl" py="xl" className="w-full">
      <Stack gap="xl">
        {/* Hero Banner */}
        <DashboardBanner
          image_url={resolved_banner}
          primary_color={primary_color}
          title={resolved_title}
          description={resolved_desc}
          mode={mode}
          on_saved={url => set_local_banner(url)}
        />

        {/* Welcome text and Actions */}
        <Stack gap="xs">
          <WelcomeSection
            title={resolved_title}
            description={resolved_desc}
            mode={mode}
            on_saved={(title, desc) => {
              set_local_title(title);
              set_local_desc(desc);
            }}
          />
          <QuickActions primary_color={primary_color} secondary_color={secondary_color} />
        </Stack>
        
        {/* Stats Grid */}
        {/* <StatsGrid primary_color={primary_color} /> */}

        {/* Announcement — visible if admin OR if there's content */}
        {(is_admin || resolved_announcement) && (
          <AnnouncementCard
            text={resolved_announcement}
            primary_color={primary_color}
            secondary_color={secondary_color}
            on_saved={text => set_local_announcement(text)}
          />
        )}

        {/* Main content grid */}
        <Grid gutter="lg">
          {/* Left column: Today's lessons */}
          <Grid.Col span={{ base: 12, md: 5 }}>
            <TodayLessons primary_color={primary_color} secondary_color={secondary_color} />
          </Grid.Col>

          {/* Right column: Notifications + Todo */}
          <Grid.Col span={{ base: 12, md: 7 }}>
            <Stack gap="lg">
              <NotificationsPanel primary_color={primary_color} secondary_color={secondary_color} />
              <TodoList primary_color={primary_color} secondary_color={secondary_color} />
            </Stack>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
}
