'use client';

import { TestResultsLayout } from '@/components/layout/materials/tests/components/results/test-results-layout';
import { PageContainer } from '@/components/common/page-container';

/**
 * Global Test Reviews page for administrators.
 * Shows attempts across all tests that need review.
 */
export default function TestReviewsPage() {

  return (
    <PageContainer>
        <TestResultsLayout />
    </PageContainer>
  );
}
