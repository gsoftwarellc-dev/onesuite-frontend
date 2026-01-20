import api from '@/lib/api';

export interface NotificationUnreadCount {
    unread_count: number;
    high_priority_count?: number;
}

export const notificationService = {
    /**
     * Get unread notification count
     * GET /api/notifications/inbox/unread-count/
     */
    getUnreadCount: async (): Promise<NotificationUnreadCount> => {
        const response = await api.get<NotificationUnreadCount>('/notifications/inbox/unread-count/');
        return response.data;
    },
};
