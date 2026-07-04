import { httpClient } from '../../../infrastructure/http/httpClient';
import type { Order } from '../models/types';

export class OrderService {
  /**
   * Fetches paginated, filtered orders from the mock LIMS adapter database.
   */
  static async getOrders(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    priority?: string;
    physician?: string;
    investigation?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ orders: Order[]; total: number; page: number; limit: number }> {
    const query = new URLSearchParams();
    if (params) {
      if (params.page) query.append('page', String(params.page));
      if (params.limit) query.append('limit', String(params.limit));
      if (params.search) query.append('search', params.search);
      if (params.status) query.append('status', params.status);
      if (params.priority) query.append('priority', params.priority);
      if (params.physician) query.append('physician', params.physician);
      if (params.investigation) query.append('investigation', params.investigation);
      if (params.sortBy) query.append('sortBy', params.sortBy);
      if (params.sortOrder) query.append('sortOrder', params.sortOrder);
    }
    const response = await httpClient.get<{
      orders: Order[];
      total: number;
      page: number;
      limit: number;
    }>(`/orders?${query.toString()}`);
    return response.data;
  }

  /**
   * Retrieves single order by database ID.
   */
  static async getOrderById(id: string): Promise<Order> {
    const response = await httpClient.get<Order>(`/orders/${id}`);
    return response.data;
  }

  /**
   * Dispatches request to register a new clinical order.
   */
  static async createOrder(order: Omit<Order, 'orderId' | 'accessionNumber' | 'createdAt' | 'timeline' | 'auditTrail'>): Promise<Order> {
    const response = await httpClient.post<Order>('/orders', order);
    return response.data;
  }

  /**
   * Dispatches requisition updates.
   */
  static async updateOrder(id: string, order: Partial<Order>): Promise<Order> {
    const response = await httpClient.put<Order>(`/orders/${id}`, order);
    return response.data;
  }

  /**
   * Soft-cancels an order with auditing details.
   */
  static async cancelOrder(id: string, reason: string): Promise<Order> {
    const response = await httpClient.post<Order>(`/orders/${id}/cancel`, { reason });
    return response.data;
  }

  /**
   * Bulk updates multiple orders (change status, priority, etc).
   */
  static async bulkUpdateOrders(ids: string[], updates: Partial<Order>): Promise<{ count: number }> {
    const response = await httpClient.post<{ count: number }>('/orders/bulk-update', { ids, updates });
    return response.data;
  }
}
