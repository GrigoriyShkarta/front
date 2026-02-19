import { PageContainer } from '@/components/common/page-container';
import { Title, Text, Card, Group, Stack, SimpleGrid, Button, Badge, ThemeIcon, Box } from '@mantine/core';
import { IoCheckmarkCircleOutline, IoBriefcaseOutline, IoRocketOutline, IoDiamondOutline } from 'react-icons/io5';
import { useTranslations } from 'next-intl';

/**
 * Placeholder Pricing/Billing page.
 */
export default function BillingPage() {
  const t = useTranslations('Common');

  const plans = [
    {
      title: 'Basic',
      price: '$0',
      description: 'Perfect for small teams and personal projects.',
      features: ['Up to 5 users', '1GB storage', 'Basic support', 'Community access'],
      icon: <IoBriefcaseOutline size={24} />,
      color: 'gray',
    },
    {
      title: 'Pro',
      price: '$29',
      description: 'Best for growing businesses needing more power.',
      features: ['Up to 20 users', '10GB storage', 'Priority support', 'Advanced analytics'],
      icon: <IoRocketOutline size={24} />,
      color: 'blue',
      popular: true,
    },
    {
      title: 'Enterprise',
      price: 'Custom',
      description: 'Scale without limits with dedicated support.',
      features: ['Unlimited users', 'Unlimited storage', 'Dedicated manager', 'Custom integrations'],
      icon: <IoDiamondOutline size={24} />,
      color: 'indigo',
    },
  ];

  return (
    <PageContainer size="lg">
      <Stack gap="xl" align="center" mt="xl" mb={50}>
        <Stack gap="xs" align="center">
          <Badge variant="light" color="blue" size="lg" radius="sm">
            Pricing
          </Badge>
          <Title order={1} size="h1" className="text-center">
            {t('pricing_title')}
          </Title>
          <Text color="dimmed" size="lg" className="text-center max-w-2xl">
            Choose the plan that's right for your business. All plans include 14-day free trial.
          </Text>
        </Stack>

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl" verticalSpacing="xl" className="w-full">
          {plans.map((plan) => (
            <Card
              key={plan.title}
              withBorder
              padding="xl"
              radius="lg"
              className={`relative overflow-visible transition-all duration-300 hover:shadow-xl ${
                plan.popular ? 'border-blue-500 scale-105 z-10' : ''
              }`}
            >
              {plan.popular && (
                <Badge
                  color="blue"
                  variant="filled"
                  size="sm"
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 shadow-md"
                >
                  Most Popular
                </Badge>
              )}

              <Stack gap="md" className="h-full">
                <Group justify="space-between">
                  <ThemeIcon
                    size={48}
                    radius="md"
                    variant="light"
                    color={plan.color}
                  >
                    {plan.icon}
                  </ThemeIcon>
                  <Text fw={700} size="xl">
                    {plan.price}
                    <Text span size="sm" fw={500} color="dimmed">
                      /month
                    </Text>
                  </Text>
                </Group>

                <Box>
                  <Text fw={700} size="lg" mb={4}>
                    {plan.title}
                  </Text>
                  <Text size="sm" color="dimmed">
                    {plan.description}
                  </Text>
                </Box>

                <Stack gap="xs" mt="md" className="flex-grow">
                  {plan.features.map((feature) => (
                    <Group key={feature} gap="sm" wrap="nowrap">
                      <IoCheckmarkCircleOutline className="text-blue-500 shrink-0" size={18} />
                      <Text size="sm">{feature}</Text>
                    </Group>
                  ))}
                </Stack>

                <Button
                  fullWidth
                  variant={plan.popular ? 'filled' : 'light'}
                  color={plan.color}
                  radius="md"
                  size="md"
                  mt="xl"
                >
                  {plan.title === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                </Button>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      </Stack>
    </PageContainer>
  );
}
