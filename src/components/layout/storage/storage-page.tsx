'use client';

import { 
  Box, 
  Text, 
  Paper, 
  Stack, 
  Group, 
  SimpleGrid, 
  Title, 
  LoadingOverlay, 
  useMantineColorScheme,
  ThemeIcon,
  rem,
  ActionIcon,
  Tooltip,
  Divider,
  Badge,
  List,
  ThemeIcon as MantineThemeIcon
} from '@mantine/core';
import { useTranslations } from 'next-intl';
import { useStorageStats } from './hooks/use-storage-stats';
import { 
  IoMusicalNotesOutline, 
  IoImageOutline, 
  IoVideocamOutline, 
  IoDocumentOutline, 
  IoArrowForwardOutline,
  IoInformationCircleOutline,
  IoSettingsOutline,
  IoCloudDoneOutline,
  IoFileTrayOutline,
  IoLibraryOutline,
  IoCloudOutline
} from 'react-icons/io5';
import { Link } from '@/i18n/routing';
import { PageContainer } from '@/components/common/page-container';
import dayjs from 'dayjs';

const format_bytes = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const STORAGE_CATEGORIES = [
  { key: 'audio', icon: IoMusicalNotesOutline, color: '#60a5fa', href: '/main/materials/audio' },
  { key: 'photo', icon: IoImageOutline, color: '#f87171', href: '/main/materials/photo' },
  { key: 'video', icon: IoVideocamOutline, color: '#4ade80', href: '/main/materials/video' },
  { key: 'file', icon: IoDocumentOutline, color: '#fb923c', href: '/main/materials/file' },
  { key: 'other', icon: IoSettingsOutline, color: '#94a3b8', href: null },
];

export function StoragePage() {
  const t = useTranslations('Storage');
  const { stats, top_files, is_loading } = useStorageStats();
  const { colorScheme } = useMantineColorScheme();
  const is_dark = colorScheme === 'dark';

  if (is_loading) {
    return <LoadingOverlay visible zIndex={1000} overlayProps={{ blur: 2 }} />;
  }

  if (!stats) return null;

  const data = STORAGE_CATEGORIES.map(cat => ({
    ...cat,
    value: stats[cat.key as keyof typeof stats] as number,
    label: t(`category_${cat.key}`) || cat.key.charAt(0).toUpperCase() + cat.key.slice(1)
  }));

  const total_used = stats.total_used;
  const limit = stats.limit;
  const used_percent = Math.min(100, (total_used / limit) * 100);

  // Donut Chart Calculations
  const radius = 95;
  const stroke = 14;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;

  let current_offset = 0;

  return (
    <PageContainer>
      <Stack gap="xl">
        <Group justify="space-between" align="flex-end">
          <Group align="center" gap="md">
            <Box className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary shadow-sm border border-secondary/20 shrink-0">
              <IoCloudOutline size={28} />
            </Box>
            <Stack gap={0}>
              <Title order={2} fw={800} className="tracking-tight">
                {t('page_title') || 'Cloud Storage'}
              </Title>
              <Text c="dimmed" size="sm">
                {t('page_description') || 'Manage your space storage and see detailed statistics.'}
            </Text>
          </Stack>
          <Badge variant="light" color="primary" size="lg" radius="sm">
            {t('plan_limit') || 'Plan Limit'}: {format_bytes(limit)}
          </Badge>
          </Group>
        </Group>

        <SimpleGrid cols={{ base: 1, lg: 3 }} spacing="xl">
          {/* Main Chart Section */}
          <Paper 
            withBorder 
            p="xl" 
            radius="lg" 
            className="shadow-sm"
            style={{ 
              backgroundColor: is_dark ? 'rgba(255,255,255,0.02)' : 'white',
              position: 'relative'
            }}
          >
            <Stack align="center" gap="lg">
              <Box style={{ position: 'relative', width: radius * 2, height: radius * 2 }}>
                <svg
                  height={radius * 2}
                  width={radius * 2}
                  style={{ transform: 'rotate(-90deg)' }}
                >
                  <circle
                    stroke={is_dark ? 'rgba(255,255,255,0.05)' : 'var(--mantine-primary-color-light)'}
                    fill="transparent"
                    strokeWidth={stroke}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                  />
                  {data.map((item) => {
                    const percentage = (item.value / limit) * 100;
                    if (percentage === 0) return null;
                    const strokeDashoffset = circumference - (percentage / 100) * circumference;
                    const offset = (current_offset / 100) * circumference;
                    current_offset += percentage;

                    return (
                      <circle
                        key={item.key}
                        stroke={item.color}
                        fill="transparent"
                        strokeWidth={stroke}
                        strokeDasharray={circumference + ' ' + circumference}
                        style={{ 
                          strokeDashoffset: strokeDashoffset, 
                          transform: `rotate(${(offset / circumference) * 360}deg)`, 
                          transformOrigin: 'center', 
                          transition: 'all 0.5s ease' 
                        }}
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                        strokeLinecap="round"
                      />
                    );
                  })}
                </svg>
                <Box style={{ 
                  position: 'absolute', 
                  inset: 0, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <Text size="xl" fw={800}>{Math.round(used_percent)}%</Text>
                  <Text size="xs" c="dimmed" fw={600} tt="uppercase">{t('used') || 'Used'}</Text>
                </Box>
              </Box>

              <Stack gap={4} align="center">
                <Text size="lg" fw={700}>{format_bytes(total_used)}</Text>
                <Text size="xs" c="dimmed">{t('of_limit', { limit: format_bytes(limit) }) || `of ${format_bytes(limit)} used`}</Text>
              </Stack>

              <Divider w="100%" label={t('breakdown') || 'Breakdown'} labelPosition="center" />

              <Stack w="100%" gap="xs">
                {data.map(item => (
                   <Stack key={item.key} gap={2}>
                     <Group justify="space-between" wrap="nowrap">
                       <Group gap="sm" wrap="nowrap">
                         <Box w={10} h={10} style={{ borderRadius: 2, backgroundColor: item.color }} />
                         <Text size="xs" fw={600}>{item.label}</Text>
                       </Group>
                       <Text size="xs" c="dimmed" fw={500}>{format_bytes(item.value)}</Text>
                     </Group>
                     {item.key === 'other' && (
                       <Text size="10px" c="dimmed" ml={18} style={{ lineHeight: 1.2 }}>
                         {t('category_other_description')}
                       </Text>
                     )}
                   </Stack>
                ))}
              </Stack>
            </Stack>
          </Paper>

          {/* Details and Top Files */}
          <Stack gap="xl" style={{ gridColumn: 'span 2' }}>
             <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
                <Paper withBorder p="xl" radius="lg" className="shadow-sm">
                  <Title order={4} mb="lg" fw={700} display="flex" style={{ alignItems: 'center', gap: 8 }}>
                    <IoLibraryOutline size={20} /> {t('quick_access') || 'Quick Access'}
                  </Title>
                  <Stack gap="sm">
                    {data.filter(i => i.href).map(item => (
                      <Paper 
                        key={item.key} 
                        component={Link} 
                        href={item.href!}
                        withBorder 
                        p="md" 
                        radius="md" 
                        className="transition-all hover:bg-gray-50 dark:hover:bg-white/5 group"
                      >
                        <Group justify="space-between">
                          <Group gap="md">
                            <ThemeIcon color="primary" variant="light" size="lg" radius="xl">
                              <item.icon size={20} />
                            </ThemeIcon>
                            <Stack gap={0}>
                              <Text fw={600} size="sm">{item.label}</Text>
                              <Text size="xs" c="dimmed">{format_bytes(item.value)}</Text>
                            </Stack>
                          </Group>
                          <IoArrowForwardOutline className="opacity-0 group-hover:opacity-100 transition-all" />
                        </Group>
                      </Paper>
                    ))}
                  </Stack>
                </Paper>

                <Stack gap="xl">
                  <Paper withBorder p="xl" radius="lg" className="shadow-sm" style={{ background: 'var(--space-accent-bg)', color: 'var(--space-accent-text, #ffffff)', border: 'none' }}>
                    <Group justify="space-between" align="flex-start">
                      <Stack gap="xs" style={{ flex: 1 }}>
                        <Title order={4} fw={700}>{t('storage_health') || 'Storage Health'}</Title>
                        <Text size="sm" opacity={0.9}>
                          {used_percent < 80 
                            ? (t('health_good') || 'Your storage usage is within safe limits. Keep it up!') 
                            : (t('health_warning') || 'You are running out of space. Consider deleting some old files.')}
                        </Text>
                      </Stack>
                      <IoCloudDoneOutline size={40} opacity={0.3} />
                    </Group>
                  </Paper>

                  <Paper withBorder p="xl" radius="lg" className="shadow-sm">
                    <Title order={4} mb="md" fw={700} display="flex" style={{ alignItems: 'center', gap: 8 }}>
                      <IoInformationCircleOutline size={20} /> {t('tips_title') || 'Optimization Tips'}
                    </Title>
                    <List spacing="xs" size="xs" icon={<MantineThemeIcon color="primary" size={14} radius="xl"><IoInformationCircleOutline size={8} /></MantineThemeIcon>}>
                       <List.Item>{t('tip_video') || 'Videos consume the most space. Audit your video materials regularly.'}</List.Item>
                       <List.Item>{t('tip_temp') || 'Temporary files in "Other" can be cleared by contacting support.'}</List.Item>
                       <List.Item>{t('tip_upgrade') || 'Need more space? You can always upgrade your plan in Billing.'}</List.Item>
                    </List>
                  </Paper>
                </Stack>
             </SimpleGrid>

             <Paper withBorder p="xl" radius="lg" className="shadow-sm">
                <Title order={4} mb="lg" fw={700} display="flex" style={{ alignItems: 'center', gap: 8 }}>
                  <IoFileTrayOutline size={20} /> {t('top_files_title') || 'Largest Files'}
                </Title>
                <Stack gap="xs">
                  {top_files && top_files.length > 0 ? (
                    top_files.map((file: any) => {
                      const category = STORAGE_CATEGORIES.find(c => c.key === file.type);
                      return (
                        <Paper 
                          key={`${file.type}-${file.id}`} 
                          withBorder 
                          p="sm" 
                          radius="md" 
                          className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                        >
                          <Group justify="space-between">
                            <Group gap="md">
                              <ThemeIcon color="primary" variant="light" size="md" radius="xl">
                                {category?.icon && <category.icon size={16} />}
                              </ThemeIcon>
                              <Stack gap={0}>
                                <Text fw={600} size="sm" truncate style={{ maxWidth: rem(300) }}>{file.name}</Text>
                                <Text size="xs" c="dimmed">
                                  {format_bytes(file.size)} • {dayjs(file.created_at).format('DD.MM.YYYY')}
                                </Text>
                              </Stack>
                            </Group>
                            {category?.href && (
                              <Tooltip label={t('view_in_library') || 'View in library'}>
                                <ActionIcon 
                                  variant="subtle" 
                                  color="gray" 
                                  component={Link} 
                                  href={category.href}
                                >
                                  <IoArrowForwardOutline size={16} />
                                </ActionIcon>
                              </Tooltip>
                            )}
                          </Group>
                        </Paper>
                      );
                    })
                  ) : (
                    <Text c="dimmed" size="sm" ta="center" py="xl">
                      {t('no_files_found') || 'No large files found.'}
                    </Text>
                  )}
                </Stack>
             </Paper>
          </Stack>
        </SimpleGrid>
      </Stack>
    </PageContainer>
  );
}
