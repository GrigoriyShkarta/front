'use client';

import { 
    Stack, 
    Title, 
    Text, 
    Group, 
    Paper, 
    Divider
} from '@mantine/core';
import { IoBookOutline, IoTimeOutline } from 'react-icons/io5';
import { useTranslations } from 'next-intl';

interface Props {
    lessons_count: number;
    total_duration: number;
}

/**
 * Sidebar statistics for the course
 */
export function CourseStats({ lessons_count, total_duration }: Props) {
    const t = useTranslations('Materials.courses');

    const format_duration = (mins: number) => {
        if (mins < 60) return `${mins} ${t('min')}`;
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return m > 0 ? `${h}${t('h')} ${m}${t('m')}` : `${h}${t('h')}`;
    };

    return (
        <Paper p="xl" radius="2xl" withBorder className="bg-white/5 shadow-lg" style={{ borderColor: 'var(--space-secondary)' }}>
            <Title order={4} mb="lg">{t('stats.title')}</Title>
            <Divider className="mb-4 border-white/5" />
            <Stack gap="md">
                <Group justify="space-between">
                    <Group gap="xs">
                        <IoBookOutline style={{ color: 'var(--mantine-primary-color-filled)' }} />
                        <Text size="sm">{t('number_of_lessons')}</Text>
                    </Group>
                    <Text size="sm" fw={600}>{lessons_count}</Text>
                </Group>
                <Group justify="space-between">
                    <Group gap="xs">
                        <IoTimeOutline style={{ color: 'var(--mantine-primary-color-filled)' }} />
                        <Text size="sm">{t('stats.estimated_time')}</Text>
                    </Group>
                    <Text size="sm" fw={600}>{total_duration > 0 ? format_duration(total_duration) : '—'}</Text>
                </Group>
            </Stack>
        </Paper>
    );
}
