import { Drawer, Stack, MultiSelect, Button, Group, Select } from '@mantine/core';
import { useTranslations } from 'next-intl';
import { useCategories } from '@/components/layout/categories/hooks/use-categories';
import { IoFilterOutline } from 'react-icons/io5';

interface Props {
  opened: boolean;
  onClose: () => void;
  categoryIds: string[];
  onCategoryIdsChange: (ids: string[]) => void;
  paymentStatuses: string[];
  onPaymentStatusesChange: (statuses: string[]) => void;
}

export function UserFilterDrawer({ 
  opened, 
  onClose, 
  categoryIds, 
  onCategoryIdsChange, 
  paymentStatuses,
  onPaymentStatusesChange
}: Props) {
  const common_t = useTranslations('Common');
  const tCat = useTranslations('Categories');
  const tUsers = useTranslations('Users');
  
  const { categories } = useCategories();

  const handle_clear = () => {
    onCategoryIdsChange([]);
    onPaymentStatusesChange([]);
    onClose();
  };

  const handle_apply = () => {
    onClose();
  };

  const payment_status_data = [
    { value: 'paid', label: common_t('payment_statuses.paid') },
    { value: 'partially_paid', label: common_t('payment_statuses.partially_paid') },
    { value: 'unpaid', label: common_t('payment_statuses.unpaid') },
  ];

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={common_t('filters')}
      position="right"
      size="md"
    >
      <Stack gap="lg">
        <MultiSelect
          label={tCat('title')}
          placeholder={tCat('select_categories')}
          data={categories.map(c => ({ value: c.id, label: c.name }))}
          value={categoryIds}
          onChange={onCategoryIdsChange}
          searchable
          clearable
          leftSection={<IoFilterOutline size={16} />}
        />

        <MultiSelect
          label={common_t('payment_status')}
          placeholder={tUsers('form.status_placeholder') || 'Select status'}
          data={payment_status_data}
          value={paymentStatuses}
          onChange={onPaymentStatusesChange}
          clearable
          leftSection={<IoFilterOutline size={16} />}
        />

        <Group justify="flex-end" mt="xl">
          <Button variant="subtle" color="gray" onClick={handle_clear}>
            {common_t('clear')}
          </Button>
          <Button 
            onClick={handle_apply}
            color="primary"
            className="bg-primary hover:opacity-90 transition-all shadow-md shadow-primary/20"
          >
            {common_t('apply')}
          </Button>
        </Group>
      </Stack>
    </Drawer>
  );
}
