import { Metadata } from 'next';
import { HomeworkSubmissionReviewLayout } from '@/components/layout/materials/homework/components/reviews/homework-submission-review-layout';

export const metadata: Metadata = {
  title: 'Homework Review | Lirnexa',
  description: 'Individual student homework submission review and grading.',
};

/**
 * Individual student homework submission review page.
 * @param params - ID of the submission
 * @returns React page component
 */
export default async function HomeworkReviewDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  
  return <HomeworkSubmissionReviewLayout id={id} />;
}
