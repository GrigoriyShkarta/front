import { api } from '@/lib/api';
import { SubscriptionListResponse, SubscriptionMaterial, SubscriptionFormData } from '../schemas/subscription-schema';

interface GetSubscriptionsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const subscriptionActions = {
  /**
   * Get paginated list of subscriptions
   */
  get_subscriptions: async (params: GetSubscriptionsParams): Promise<SubscriptionListResponse> => {
    const response = await api.get('/finance/subscriptions', { params });
    return response.data;
  },

  /**
   * Create new subscription
   */
  create_subscription: async (data: SubscriptionFormData): Promise<SubscriptionMaterial> => {
    const response = await api.post('/finance/subscriptions', data);
    return response.data;
  },

  /**
   * Update existing subscription
   */
  update_subscription: async (id: string, data: Partial<SubscriptionFormData>): Promise<SubscriptionMaterial> => {
    const response = await api.patch(`/finance/subscriptions/${id}`, data);
    return response.data;
  },

  /**
   * Delete single subscription
   */
  delete_subscription: async (id: string): Promise<void> => {
    await api.delete(`/finance/subscriptions/${id}`);
  },

  /**
   * Delete multiple subscriptions
   */
  bulk_delete_subscriptions: async (ids: string[]): Promise<void> => {
    await api.delete('/finance/subscriptions', { data: { ids } });
  }
};
