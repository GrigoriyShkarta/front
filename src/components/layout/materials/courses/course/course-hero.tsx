'use client';

import { 
    Stack, 
    Title, 
    Text, 
    Box, 
    Paper, 
    Image, 
    Breadcrumbs, 
    Anchor,
    Container,
    rem,
    Grid,
    Group,
    Button
} from '@mantine/core';
import { IoImageOutline, IoPencilOutline } from 'react-icons/io5';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useAuth } from '@/hooks/use-auth';
import { ROLES } from '@/types/auth.types';

interface Props {
    course_name: string;
    course_description?: string | null;
    image_url?: string | null;
    breadcrumb_items: React.ReactNode[];
    on_edit?: () => void;
}

/**
 * Hero section for the course view page
 */
export function CourseHero({ 
    course_name, 
    course_description, 
    image_url, 
    breadcrumb_items,
    on_edit
}: Props) {
    const t = useTranslations('Materials.courses');
    const common_t = useTranslations('Common');
    const { user } = useAuth();

    const can_edit = user && [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER].includes(user.role as any);

    return (
        <Box className="relative overflow-hidden pt-12 pb-24 border-b border-white/5">
            {/* Dynamic Background Gradient from Image */}
            {image_url && (
                <Box 
                    className="absolute inset-0 opacity-20 pointer-events-none blur-[100px] scale-150"
                    style={{ 
                        backgroundImage: `url(${image_url})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                />
            )}
            <Box 
                className="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" 
                style={{ backgroundColor: 'var(--mantine-primary-color-filled)' }}
            />
            
            <Container size="xl">
                <Stack gap="xl">
                    <Group justify="space-between" align="center">
                        <Breadcrumbs separator="→">
                            {breadcrumb_items}
                        </Breadcrumbs>

                        {can_edit && (
                            <Button 
                                leftSection={<IoPencilOutline size={16} />}
                                variant="light"
                                onClick={on_edit}
                            >
                                {common_t('edit')}
                            </Button>
                        )}
                    </Group>

                    <Grid gutter={40} align="center">
                        <Grid.Col span={{ base: 12, md: 7 }}>
                            <Stack gap="lg">
                                <Title order={1} size={rem(48)} className="leading-tight font-bold tracking-tight">
                                    {course_name}
                                </Title>
                                
                                <Text size="lg" c="dimmed" lh={1.6} className="max-w-2xl">
                                    {course_description || t('placeholder_description')}
                                </Text>
                            </Stack>
                        </Grid.Col>
                        
                        <Grid.Col span={{ base: 12, md: 5 }}>
                            <Paper 
                                radius="2xl" 
                                className="aspect-video relative overflow-hidden bg-white/5 border border-white/10 shadow-2xl"
                            >
                                {image_url ? (
                                    <Image 
                                        src={image_url} 
                                        className="w-full h-full object-cover" 
                                        alt={course_name}
                                    />
                                ) : (
                                    <Box className="w-full h-full flex flex-col items-center justify-center gap-4 text-white/20">
                                        <IoImageOutline size={64} />
                                        <Text fw={500}>{t('stats.no_preview')}</Text>
                                    </Box>
                                )}
                            </Paper>
                        </Grid.Col>
                    </Grid>
                </Stack>
            </Container>
        </Box>
    );
}
