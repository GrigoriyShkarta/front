'use client';

import { useParams } from 'next/navigation';
import { TestAttemptReviewLayout } from '@/components/layout/materials/tests/components/review/test-attempt-review-layout';

/**
 * Route page for test attempt review
 * Delegates all logic and rendering to TestAttemptReviewLayout
 */
export default function TestAttemptReviewPage() {
    const params = useParams();
    const id = params.id as string;

    return <TestAttemptReviewLayout id={id} />;
}
