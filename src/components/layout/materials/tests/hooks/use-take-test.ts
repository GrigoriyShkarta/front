import { useState, useEffect, useCallback, useRef } from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { useTranslations } from 'next-intl';

import { testAttemptActions } from '../actions/test-attempt-actions';
import { TestQuestion } from '../schemas/test-schema';
import { SubmitTestPayload, TestAttempt } from '../schemas/test-attempt-schema';

interface StudentAnswer {
  question_id: string;
  question_type: string;
  selected_option_ids?: string[];
  text_answer?: string;
}

interface UseTakeTestProps {
  test_id: string;
  questions: TestQuestion[];
  time_limit: number | null;
}

/**
 * Hook that manages the entire test-taking flow:
 * - Timer logic
 * - Answer tracking
 * - Navigation between questions
 * - Submission
 * @param props - test_id, questions array, and optional time_limit in minutes
 * @returns state and handlers for the test-taking UI
 */
export function useTakeTest({ test_id, questions, time_limit }: UseTakeTestProps) {
  const t = useTranslations('Materials.tests.take');
  const queryClient = useQueryClient();

  const [is_started, set_is_started] = useState(false);
  const [is_finished, set_is_finished] = useState(false);
  const [attempt_id, set_attempt_id] = useState<string | null>(null);
  const [current_index, set_current_index] = useState(0);
  const [answers, set_answers] = useState<Map<string, StudentAnswer>>(new Map());
  const [time_left, set_time_left] = useState<number | null>(null);
  const [time_spent, set_time_spent] = useState(0);
  const [result, set_result] = useState<TestAttempt | null>(null);

  const start_time_ref = useRef<number>(0);
  const timer_ref = useRef<NodeJS.Timeout | null>(null);

  // Start mutation (server-side initialization)
  const start_mutation = useMutation({
    mutationFn: () => testAttemptActions.start_attempt(test_id),
    onSuccess: (data) => {
        set_attempt_id(data.id);
        set_is_started(true);
        start_time_ref.current = Date.now();
        if (time_limit) {
            set_time_left(time_limit * 60);
        }
    },
    onError: () => {
        notifications.show({
            title: t('error'),
            message: t('start_error') || 'Failed to start test',
            color: 'red',
        });
    }
  });

  // Start the test
  const start_test = useCallback(() => {
    start_mutation.mutate();
  }, [start_mutation]);

  // Timer countdown
  useEffect(() => {
    if (!is_started || is_finished) return;

    timer_ref.current = setInterval(() => {
      set_time_spent(Math.floor((Date.now() - start_time_ref.current) / 1000));

      if (time_limit) {
        set_time_left((prev) => {
          if (prev !== null && prev <= 1) {
            handle_submit();
            return 0;
          }
          return prev !== null ? prev - 1 : null;
        });
      }
    }, 1000);

    return () => {
      if (timer_ref.current) clearInterval(timer_ref.current);
    };
  }, [is_started, is_finished, time_limit]);

  // Update answer for a question
  const set_answer = useCallback((question_id: string, answer: Partial<StudentAnswer>) => {
    set_answers((prev) => {
      const updated = new Map(prev);
      const existing = updated.get(question_id) || {
        question_id,
        question_type: questions.find(q => q.id === question_id)?.type || '',
      };
      updated.set(question_id, { ...existing, ...answer });
      return updated;
    });
  }, [questions]);

  // Navigation
  const go_to_question = useCallback((index: number) => {
    if (index >= 0 && index < questions.length) {
      set_current_index(index);
    }
  }, [questions.length]);

  const go_next = useCallback(() => {
    go_to_question(current_index + 1);
  }, [current_index, go_to_question]);

  const go_prev = useCallback(() => {
    go_to_question(current_index - 1);
  }, [current_index, go_to_question]);

  // Question status helpers
  const get_question_status = useCallback((question_id: string): 'unanswered' | 'answered' | 'skipped' => {
    const answer = answers.get(question_id);
    if (!answer) return 'unanswered';

    const has_selection = answer.selected_option_ids && answer.selected_option_ids.length > 0;
    const has_text = answer.text_answer && answer.text_answer.trim().length > 0;

    if (has_selection || has_text) return 'answered';
    return 'skipped';
  }, [answers]);

  const answered_count = questions.filter(q => get_question_status(q.id) === 'answered').length;

  // Submit mutation
  const submit_mutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SubmitTestPayload }) => 
        testAttemptActions.submit_test(id, payload),
    onSuccess: (data) => {
      set_is_finished(true);
      set_result(data);
      queryClient.invalidateQueries({ queryKey: ['tests'] });
      if (timer_ref.current) clearInterval(timer_ref.current);
    },
    onError: () => {
      notifications.show({
        title: t('error'),
        message: t('submit_error'),
        color: 'red',
      });
    },
  });

  // Submit handler
  const handle_submit = useCallback(() => {
    if (!attempt_id) return;
    if (timer_ref.current) clearInterval(timer_ref.current);

    const final_time_spent = Math.floor((Date.now() - start_time_ref.current) / 1000);

    const answers_array = questions.map(q => {
      const answer = answers.get(q.id);
      return {
        question_id: q.id,
        question_type: q.type,
        selected_option_ids: answer?.selected_option_ids || [],
        text_answer: answer?.text_answer || '',
      };
    });

    submit_mutation.mutate({
      id: attempt_id,
      payload: {
        test_id,
        answers: answers_array,
        time_spent: final_time_spent,
      }
    });
  }, [test_id, attempt_id, questions, answers, submit_mutation]);

  return {
    // State
    is_started,
    is_finished,
    is_submitting: submit_mutation.isPending,
    current_index,
    current_question: questions[current_index] || null,
    answers,
    time_left,
    time_spent,
    result,
    answered_count,
    total_questions: questions.length,

    // Actions
    start_test,
    set_answer,
    go_to_question,
    go_next,
    go_prev,
    handle_submit,
    get_question_status,
  };
}
