'use client';

import { Tabs, Table, Text, Avatar, Group, Box } from '@mantine/core';
import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';
import { Link } from '@/i18n/routing';
import { useAuth } from '@/hooks/use-auth';
import { getCurrencySymbol } from '@/lib/constants';

interface ReportTablesProps {
  realIncome: any[];
  expectedIncome: any[];
}

export function ReportTables({ realIncome, expectedIncome }: ReportTablesProps) {
  const t = useTranslations('Finance.reports');
  const { user } = useAuth();
  const currencySymbol = getCurrencySymbol(user?.space?.personalization?.currency);

  const getStatusStyle = (status: string, isExpected: boolean) => {
    switch (status) {
      case 'renewal':
        return { color: 'blue.4', label: t('payment_types.renewal') };
      case 'balance':
        return { color: 'orange.4', label: t('payment_types.balance') };
      case 'partially_paid':
        return { color: 'orange.4', label: isExpected ? t('payment_types.balance') : t('payment_types.paid') };
      case 'paid':
        return { color: 'green.4', label: t('payment_types.paid') };
      default:
        return { color: isExpected ? 'blue.4' : 'green.4', label: '' };
    }
  };

  const renderTable = (data: any[], dateField: string, isExpectedTable: boolean) => (
    <Table verticalSpacing="sm">
      <Table.Thead>
        <Table.Tr>
          <Table.Th>{t('student')}</Table.Th>
          <Table.Th>{t('subscription')}</Table.Th>
          <Table.Th>{t('amount')}</Table.Th>
          <Table.Th>{t('date')}</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {data.map((item) => {
          const { color, label } = getStatusStyle(item.payment_status, isExpectedTable);
          const itemDate = dayjs(item[dateField]);
          
          const isOverdue = isExpectedTable && item.isLatestSub && itemDate.isBefore(dayjs(), 'day');
          const profilePath = `/main/users/${item.student.id}`;
          
          return (
            <Table.Tr key={item.id || `${item.student.id}-${item.reportDate}-${item.payment_status}`}>
              <Table.Td>
                <Box 
                  component={Link} 
                  href={profilePath} 
                  className="block cursor-pointer hover:opacity-80 transition-opacity no-underline"
                >
                  <Group gap="sm" wrap="nowrap">
                    <Avatar src={item.student.avatar} radius="xl" size="sm">
                      {item.student.name?.charAt(0)}
                    </Avatar>
                    <Text size="sm" fw={500} c="var(--mantine-color-text)">
                      {item.student.name}
                    </Text>
                  </Group>
                </Box>
              </Table.Td>
              <Table.Td>
                <Text 
                  size="sm" 
                  component={Link} 
                  href={profilePath}
                  className="cursor-pointer hover:text-blue-400 transition-colors no-underline"
                  c="dimmed"
                >
                  {item.name || item.subscription?.name || '-'}
                </Text>
              </Table.Td>
              <Table.Td>
                <Group gap={6}>
                  <Text size="sm" fw={700} c={color}>
                      {item.price.toLocaleString()} {currencySymbol}
                  </Text>
                  {label && (
                      <Text size="xs" c="dimmed" fw={500}>
                          ({label.toLowerCase()})
                      </Text>
                  )}
                </Group>
              </Table.Td>
              <Table.Td>
                <Text size="sm" fw={isOverdue ? 700 : 400} c={isOverdue ? 'red.6' : 'dimmed'}>
                  {itemDate.format('DD.MM.YYYY')}
                  {isOverdue && (
                      <Text component="span" size="xs" ml={4} fw={800}>(!)</Text>
                  )}
                </Text>
              </Table.Td>
            </Table.Tr>
          );
        })}
        {data.length === 0 && (
          <Table.Tr>
            <Table.Td colSpan={4}>
              <Text ta="center" py="xl" c="dimmed">
                {t('no_data')}
              </Text>
            </Table.Td>
          </Table.Tr>
        )}
      </Table.Tbody>
    </Table>
  );

  return (
    <Tabs defaultValue="real" variant="pills" className="bg-white/2 rounded-md border border-white/5">
      <Tabs.List p="xs" className="border-b border-white/5">
        <Tabs.Tab value="real">{t('real_income_tab')}</Tabs.Tab>
        <Tabs.Tab value="expected">{t('expected_income_tab')}</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="real" p="md">
        {renderTable(realIncome, 'payment_date', false)}
      </Tabs.Panel>

      <Tabs.Panel value="expected" p="md">
        {renderTable(expectedIncome, 'next_payment_date', true)}
      </Tabs.Panel>
    </Tabs>
  );
}
