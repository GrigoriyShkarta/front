import { Drawer, Stack, MultiSelect, Button, Group } from '@mantine/core';
import { useTranslations } from 'next-intl';
import { useCategories } from '@/components/layout/categories/hooks/use-categories';
import { IoFilterOutline } from 'react-icons/io5';

interface Props {
  opened: boolean;
  onClose: () => void;
  categoryIds: string[];
  onCategoryIdsChange: (ids: string[]) => void;
  title?: string;
}

export function CategoryFilterDrawer({ opened, onClose, categoryIds, onCategoryIdsChange, title }: Props) {
  const common_t = useTranslations('Common');
  const tCat = useTranslations('Categories');
  
  const { categories } = useCategories();

  const handle_clear = () => {
    onCategoryIdsChange([]);
    onClose();
  };

  const handle_apply = () => {
    onClose();
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={title || common_t('filters')}
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
          leftSection={<IoFilterOutline />}
        />

        <Group justify="flex-end">
          <Button variant="subtle" color="gray" onClick={handle_clear}>
            {common_t('clear')}
          </Button>
          <Button onClick={handle_apply}>
            {common_t('apply')}
          </Button>
        </Group>
      </Stack>
    </Drawer>
  );
}
