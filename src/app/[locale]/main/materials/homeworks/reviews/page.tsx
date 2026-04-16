'use client';

import { PageContainer } from '@/components/common/page-container';
import { HomeworkReviewsLayout } from '@/components/layout/materials/homework/components/homework-reviews-layout';


/**
 * Global Homework Reviews page for teachers and admins.
 * Shows all homework assignments with student submissions to review.
 */
export default function HomeworkReviewsPage() {

  return (
    <PageContainer>
        <HomeworkReviewsLayout />
    </PageContainer>
  );
}
