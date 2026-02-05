import { apiClient, handleApiError } from './api';

export interface Notification {
  id: number;
  user: number;
  user_name?: string;
  user_email?: string;
  notification_type: string;
  title: string;
  message: string;
  related_resource_type?: string;
  related_resource_id?: number;
  action_url?: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
  expires_at?: string;
}

export interface CreateNotificationData {
  user: number;
  notification_type: string;
  title: string;
  message: string;
  related_resource_type?: string;
  related_resource_id?: number;
  action_url?: string;
  expires_at?: string;
}

export interface NotificationFilters {
  user_id?: number;
  is_read?: boolean;
  notification_type?: string;
  exclude_expired?: boolean;
  search?: string;
  ordering?: string;
}

class NotificationService {
  private baseUrl = '/api/notifications';

  async getNotifications(filters?: NotificationFilters): Promise<{
    results: Notification[];
    count: number;
    next?: string;
    previous?: string;
  }> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters?.user_id) queryParams.append('user_id', filters.user_id.toString());
      if (filters?.is_read !== undefined) queryParams.append('is_read', filters.is_read.toString());
      if (filters?.notification_type) queryParams.append('notification_type', filters.notification_type);
      if (filters?.exclude_expired) queryParams.append('exclude_expired', 'true');
      if (filters?.search) queryParams.append('search', filters.search);
      if (filters?.ordering) queryParams.append('ordering', filters.ordering);

      const url = queryParams.toString() ? `${this.baseUrl}/?${queryParams}` : `${this.baseUrl}/`;
      const response = await apiClient.get<{
        success: boolean;
        data: Notification[];
        count: number;
        next?: string;
        previous?: string;
      }>(url);

      return {
        results: response.data || [],
        count: response.count || 0,
        next: response.next,
        previous: response.previous
      };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getUserNotifications(userId: number): Promise<Notification[]> {
    try {
      const response = await this.getNotifications({ 
        user_id: userId, 
        exclude_expired: true,
        ordering: '-created_at'
      });
      return response.results;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getNotification(id: number): Promise<Notification> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: Notification;
      }>(`${this.baseUrl}/${id}/`);
      
      if (!response.success) {
        throw new Error('Failed to fetch notification');
      }
      
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async createNotification(data: CreateNotificationData): Promise<Notification> {
    try {
      const response = await apiClient.post<{
        success: boolean;
        data: Notification;
      }>(`${this.baseUrl}/`, data);
      
      if (!response.success) {
        throw new Error('Failed to create notification');
      }
      
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async markAsRead(id: number): Promise<Notification> {
    try {
      const response = await apiClient.post<{
        success: boolean;
        data: Notification;
      }>(`${this.baseUrl}/${id}/mark_as_read/`);
      
      if (!response.success) {
        throw new Error('Failed to mark notification as read');
      }
      
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async markAllAsRead(userId: number): Promise<{ updated_count: number }> {
    try {
      const response = await apiClient.post<{
        success: boolean;
        message: string;
        updated_count: number;
      }>(`${this.baseUrl}/mark_all_as_read/`, { user_id: userId });
      
      if (!response.success) {
        throw new Error('Failed to mark all notifications as read');
      }
      
      return { updated_count: response.updated_count };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async deleteNotification(id: number): Promise<void> {
    try {
      const response = await apiClient.delete<{
        success: boolean;
        message: string;
      }>(`${this.baseUrl}/${id}/`);
      
      if (!response.success) {
        throw new Error('Failed to delete notification');
      }
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getUnreadCount(userId: number): Promise<number> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        unread_count: number;
      }>(`${this.baseUrl}/unread_count/?user_id=${userId}`);
      
      if (!response.success) {
        throw new Error('Failed to get unread count');
      }
      
      return response.unread_count;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async clearAllNotifications(userId: number): Promise<{ deleted_count: number }> {
    try {
      const response = await apiClient.delete<{
        success: boolean;
        message: string;
        deleted_count: number;
      }>(`${this.baseUrl}/clear_all/?user_id=${userId}`);
      
      if (!response.success) {
        throw new Error('Failed to clear notifications');
      }
      
      return { deleted_count: response.deleted_count };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;