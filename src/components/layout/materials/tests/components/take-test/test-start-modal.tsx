'use client';

import { Modal, Stack, Text, Button, Group, Box, rem } from '@mantine/core';
import { IoTimeOutline, IoDocumentTextOutline, IoPlayOutline } from 'react-icons/io5';
import { useTranslations } from 'next-intl';

interface Props {
  opened: boolean;
  on_start: () => void;
  on_close: () => void;
  test_name: string;
  questions_count: number;
  time_limit: number | null;
  max_score: number;
}

/**
 * Modal shown before starting the test.
 * Displays test info and asks for confirmation.
 */
export function TestStartModal({
  opened,
  on_start,
  on_close,
  test_name,
  questions_count,
  time_limit,
  max_score,
}: Props) {
  const t = useTranslations('Materials.tests.take');

  return (
    <Modal
      opened={opened}
      onClose={on_close}
      title={t('start_modal.title')}
      centered
      radius="lg"
      size="md"
      withCloseButton={false}
      closeOnClickOutside={false}
    >
      <Stack gap="lg">
        <Text size="lg" fw={700} className="text-center">
          {test_name}
        </Text>

        <Stack gap="sm">
          <Group gap="sm" className="p-3 rounded-lg bg-white/5 border border-white/10">
            <Box className="p-2 rounded-md bg-primary/10 text-primary">
              <IoDocumentTextOutline size={20} />
            </Box>
            <div>
              <Text size="sm" c="dimmed">{t('start_modal.questions')}</Text>
              <Text size="sm" fw={600}>{questions_count}</Text>
            </div>
          </Group>

          {time_limit && (
            <Group gap="sm" className="p-3 rounded-lg bg-orange-500/5 border border-orange-500/10">
              <Box className="p-2 rounded-md bg-orange-500/10 text-orange-500">
                <IoTimeOutline size={20} />
              </Box>
              <div>
                <Text size="sm" c="dimmed">{t('start_modal.time_limit')}</Text>
                <Text size="sm" fw={600}>{time_limit} {t('start_modal.minutes')}</Text>
              </div>
            </Group>
          )}

          <Group gap="sm" className="p-3 rounded-lg bg-white/5 border border-white/10">
            <Box className="p-2 rounded-md bg-primary/10 text-primary">
              <IoDocumentTextOutline size={20} />
            </Box>
            <div>
              <Text size="sm" c="dimmed">{t('start_modal.max_score')}</Text>
              <Text size="sm" fw={600}>{max_score} {t('start_modal.points')}</Text>
            </div>
          </Group>
        </Stack>

        {time_limit && (
          <Text size="xs" c="dimmed" className="text-center">
            {t('start_modal.time_warning')}
          </Text>
        )}

        <Group justify="center" gap="md">
          <Button variant="light" color="gray" onClick={on_close} radius="md">
            {t('start_modal.cancel')}
          </Button>
          <Button
            leftSection={<IoPlayOutline size={18} />}
            onClick={on_start}
            radius="md"
            className="bg-primary hover:opacity-90 shadow-lg shadow-primary/20"
          >
            {t('start_modal.begin')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
