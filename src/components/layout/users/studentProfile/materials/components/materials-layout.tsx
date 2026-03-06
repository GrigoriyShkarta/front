'use client';

import { useState } from 'react';
import { Tabs, Stack } from '@mantine/core';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/use-auth';
import { StudentCourses } from './student-courses';
import { AdditionalMaterials } from './additional-materials';
import { StudentMaterialTypeLayout } from './student-material-type-layout';

interface Props {
  student_id: string;
  initial_tab?: string;
}

export function MaterialsLayout({ student_id, initial_tab = 'courses' }: Props) {
  const { user } = useAuth();
  const is_student = user?.role === 'student';
  const t = useTranslations('Materials');
  const [active_tab, set_active_tab] = useState<string | null>(initial_tab);

  if (is_student && initial_tab) {
    return (
      <Stack gap="md">
        {active_tab === 'courses' && <StudentCourses student_id={student_id} />}
        {active_tab === 'additional' && <AdditionalMaterials student_id={student_id} />}
      </Stack>
    );
  }

  return (
    <Stack gap="md">
      <Tabs value={active_tab} onChange={set_active_tab} variant="pills">
        <Tabs.List>
          <Tabs.Tab value="courses">{t('courses_tab') || 'Courses'}</Tabs.Tab>
          <Tabs.Tab value="additional">{t('additional_tab') || 'Lessons'}</Tabs.Tab>
          {!is_student && (
            <>
              <Tabs.Tab value="audio">{t('audio_tab') || 'Audio'}</Tabs.Tab>
              <Tabs.Tab value="photo">{t('photo_tab') || 'Photo'}</Tabs.Tab>
              <Tabs.Tab value="video">{t('video_tab') || 'Video'}</Tabs.Tab>
              <Tabs.Tab value="files">{t('files_tab') || 'Files'}</Tabs.Tab>
            </>
          )}
        </Tabs.List>

        <Tabs.Panel value="courses" pt="md">
          <StudentCourses student_id={student_id} />
        </Tabs.Panel>
        
        <Tabs.Panel value="additional" pt="md">
          <AdditionalMaterials student_id={student_id} />
        </Tabs.Panel>

        <Tabs.Panel value="audio" pt="md">
          <StudentMaterialTypeLayout student_id={student_id} type="audio" />
        </Tabs.Panel>

        <Tabs.Panel value="photo" pt="md">
          <StudentMaterialTypeLayout student_id={student_id} type="photo" />
        </Tabs.Panel>

        <Tabs.Panel value="video" pt="md">
          <StudentMaterialTypeLayout student_id={student_id} type="video" />
        </Tabs.Panel>

        <Tabs.Panel value="files" pt="md">
          <StudentMaterialTypeLayout student_id={student_id} type="file" />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
