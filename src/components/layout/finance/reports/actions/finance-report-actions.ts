import { api } from '@/lib/api';

export interface FinanceTransaction {
  id: string;
  amount: number;
  payment_date: string;
  payment_status: string;
  subscription_id: string;
  student_id: string;
  name: string;
  student: {
    id: string;
    name: string;
    avatar?: string;
    email: string;
  };
  subscription?: {
    id: string;
    name: string;
  };
}

export interface GetTransactionsParams {
  start_date?: string;
  end_date?: string;
  subscription_id?: string;
  student_id?: string;
}

export const financeReportActions = {
  /**
   * Get all transactions for a period
   */
  get_transactions: async (params: GetTransactionsParams): Promise<FinanceTransaction[]> => {
    const response = await api.get('/finance/subscriptions/transactions', { params });
    return response.data;
  },

  /**
   * Get payment history for a specific subscription
   */
  get_subscription_transactions: async (subscription_id: string): Promise<FinanceTransaction[]> => {
    const response = await api.get(`/finance/subscriptions/transactions/subscription/${subscription_id}`);
    return response.data;
  }
};
