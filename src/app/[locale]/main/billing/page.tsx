'use client';

import { PageContainer } from '@/components/common/page-container';
import { Title, Text, Card, Group, Stack, SimpleGrid, Button, Badge, ThemeIcon, Box, rem, List } from '@mantine/core';
import { IoCheckmarkCircleOutline, IoRocketOutline, IoDiamondOutline, IoColorPaletteOutline, IoCloudOutline, IoPeopleOutline, IoInfiniteOutline } from 'react-icons/io5';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/use-auth';

export default function BillingPage() {
  const t = useTranslations('Pricing');
  const { user } = useAuth();

  const is_premium = user?.is_premium;

  const plans = [
    {
      id: 'basic',
      title: t('plans.basic.title'),
      price: '20',
      description: t('plans.basic.desc'),
      icon: <IoRocketOutline size={24} />,
      color: 'blue',
      features: [
        { label: t('features.storage', { count: 10 }), icon: <IoCloudOutline size={18} /> },
        { label: t('features.students', { count: 10 }), icon: <IoPeopleOutline size={18} /> },
        { label: t('features.customization_basic'), icon: <IoColorPaletteOutline size={18} /> },
        // { label: t('features.materials'), icon: <IoCheckmarkCircleOutline size={18} /> },
        { label: t('features.support_basic'), icon: <IoCheckmarkCircleOutline size={18} /> },
      ],
      current: !is_premium,
    },
    {
      id: 'premium',
      title: t('plans.premium.title'),
      price: '30',
      description: t('plans.premium.desc'),
      icon: <IoDiamondOutline size={24} />,
      color: 'indigo',
      popular: true,
      features: [
        { label: t('features.storage', { count: 50 }), icon: <IoCloudOutline size={18} /> },
        { label: t('features.students_unlimited'), icon: <IoInfiniteOutline size={18} /> },
        { label: t('features.customization_premium'), icon: <IoColorPaletteOutline size={18} /> },
        // { label: t('features.materials'), icon: <IoCheckmarkCircleOutline size={18} /> },
        { label: t('features.support_premium'), icon: <IoCheckmarkCircleOutline size={18} /> },
        { label: t('features.analytics_pro'), icon: <IoCheckmarkCircleOutline size={18} /> },
      ],
      current: is_premium,
    },
  ];

  return (
    <PageContainer size="lg">
      <Stack gap="xl" align="center" mt={40} mb={60}>
        <Stack gap="xs" align="center">
          <Badge variant="filled" color="blue" size="lg" radius="xl" className="shadow-sm">
            {t('title')}
          </Badge>
          <Title order={1} size="42px" fw={900} className="text-center tracking-tight">
            {t('title')}
          </Title>
          <Text color="dimmed" size="lg" className="text-center max-w-xl">
            {t('subtitle')}
          </Text>
        </Stack>

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={30} className="w-full max-w-4xl" mt={20}>
          {plans.map((plan) => (
            <Card
              key={plan.id}
              withBorder
              padding={35}
              radius="24px"
              className={`relative overflow-visible! transition-all duration-500 hover:-translate-y-2 flex flex-col ${
                plan.popular 
                  ? 'border-indigo-500/50 shadow-[0_20px_50px_rgba(79,70,229,0.15)] bg-white/5 backdrop-blur-md' 
                  : 'bg-white/5 border-white/10'
              }`}
            >
              {plan.popular && (
                <Badge
                  variant="gradient"
                  gradient={{ from: 'indigo', to: 'blue' }}
                  size="md"
                  radius="xl"
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-5 py-3 shadow-lg ring-4 ring-indigo-500/10"
                >
                  {t('popular')}
                </Badge>
              )}

              <Stack gap="xl" className="flex-grow">
                <Group justify="space-between" align="flex-start">
                  <Box>
                    <ThemeIcon
                      size={54}
                      radius="16px"
                      variant="gradient"
                      gradient={plan.popular ? { from: 'indigo', to: 'blue' } : { from: 'gray', to: 'slate' }}
                      className="mb-4 shadow-inner"
                    >
                      {plan.icon}
                    </ThemeIcon>
                    <Title order={2} size="28px" fw={800}>
                      {plan.title}
                    </Title>
                    <Text size="sm" c="dimmed" mt={4} className="leading-relaxed">
                      {plan.description}
                    </Text>
                  </Box>
                  <Box className="text-right">
                    <Group gap={4} align="flex-start" justify="flex-end">
                      <Text fw={900} size="36px" className="leading-none">
                        ${plan.price}
                      </Text>
                      <Text size="sm" fw={600} c="dimmed" mt={10}>
                        {t('price_month')}
                      </Text>
                    </Group>
                  </Box>
                </Group>

                <Stack gap="md" mt="md" className="flex-grow">
                  <Text size="xs" fw={700} tt="uppercase" c="dimmed" lts={1}>
                    {t('features.what_included')}
                  </Text>
                  <List
                    spacing="sm"
                    size="sm"
                    center
                    icon={
                      <ThemeIcon color={plan.color} size={22} radius="xl" variant="light">
                        <IoCheckmarkCircleOutline size={14} />
                      </ThemeIcon>
                    }
                  >
                    {plan.features.map((feature, idx) => (
                      <List.Item key={idx}>
                        <Group gap="xs" wrap="nowrap">
                           <Box className={plan.popular ? 'text-indigo-400' : 'text-blue-400'}>
                             {feature.icon}
                           </Box>
                           <Text size="sm" fw={500}>{feature.label}</Text>
                        </Group>
                      </List.Item>
                    ))}
                  </List>
                </Stack>

                <Button
                  fullWidth
                  variant={plan.current ? 'outline' : 'gradient'}
                  gradient={plan.popular ? { from: 'indigo', to: 'blue' } : { from: 'blue', to: 'cyan' }}
                  color={plan.color}
                  radius="xl"
                  size="lg"
                  mt="xl"
                  disabled={plan.current}
                  className={!plan.current ? 'shadow-md shadow-indigo-500/20 active:scale-[0.98] transition-transform' : ''}
                >
                  {plan.current ? t('current_plan') : t('get_started')}
                </Button>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
        
        <Text size="xs" c="dimmed" mt="xl">
          * All prices are in USD. Cancel anytime.
        </Text>
      </Stack>
    </PageContainer>
  );
}

