'use client';

import { Grid, Stack, Title, Divider, Group, Badge, Text, Paper } from '@mantine/core';
import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';
import { UserListItem } from '@/schemas/users';

interface Props {
  user: UserListItem;
  is_own_profile?: boolean;
}

export function StudentGeneralInfo({ user, is_own_profile }: Props) {
  const t = useTranslations('Users');
  const tProfile = useTranslations('Profile');

  return (
    <Grid gutter="xl">
      <Grid.Col span={{ base: 12, md: 6 }}>
        <Stack gap="sm">
          <Title order={4} mb="xs">{t('student_details')}</Title>
          <InfoRow label={t('form.email')} value={user.email} />
          <InfoRow 
            label={tProfile('fields.birthday')} 
            value={user.birthday ? dayjs(user.birthday).format('DD.MM.YYYY') : null} 
          />
          <InfoRow label={tProfile('fields.city')} value={user.city} />
        </Stack>
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 6 }}>
        <Stack gap="sm">
          <Title order={4} mb="xs">{t('social')}</Title>
          <InfoRow label={tProfile('fields.telegram')} value={user.telegram} />
          <InfoRow label={tProfile('fields.instagram')} value={user.instagram} />
          
          {!is_own_profile && (
            <>
              <Divider my="xs" label={t('form.categories')} labelPosition="left" />
              <Group gap="xs">
                {user.categories?.map(c => (
                  <Badge key={c.id} variant="outline" color={c.color}>
                    {c.name}
                  </Badge>
                ))}
                {(!user.categories || user.categories.length === 0) && <Text size="sm" c="dimmed">—</Text>}
              </Group>
            </>
          )}
        </Stack>
      </Grid.Col>
      <Grid.Col span={12}>
        <Stack gap="xs">
          <Divider my="xs" />
          <Text fw={500} size="sm">{t('form.learning_goals')}:</Text>
          <Paper withBorder p="md" className="bg-white/5 border-white/10">
            <Text size="sm" className="whitespace-pre-wrap">
              {user.learning_goals || t('no_goals_yet')}
            </Text>
          </Paper>
        </Stack>
      </Grid.Col>
    </Grid>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Group justify="space-between" py="xs" className="border-b border-white/5 last:border-0">
      <Text size="sm" c="dimmed">{label}</Text>
      <Text size="sm" fw={500}>{value || '—'}</Text>
    </Group>
  );
}
