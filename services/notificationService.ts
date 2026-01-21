import api from '@/lib/api';

// --- Types ---
export type NotificationStatus = 'UNREAD' | 'READ' | 'ARCHIVED';
export type NotificationPriority = 'NORMAL' | 'HIGH' | 'CRITICAL';

export interface NotificationItem {
    id: number;
    event_type: string;
    title: string;
    message: string;
    priority: NotificationPriority;
    status: NotificationStatus;
    action_url: string | null;
    created_at: string;
    read_at: string | null;
    archived_at: string | null;
}

export interface UnreadCount {
    unread_count: number;
    high_priority_count: number;
}

export interface InboxParams {
    status?: NotificationStatus;
    priority?: NotificationPriority;
    limit?: number;
    offset?: number;
    ordering?: string;
}

export interface NotificationLog {
    id: number;
    event_type: string;
    channel: string;
    recipient_id: number;
    recipient_email: string | null;
    status: string;
    priority: string;
    subject: string;
    error_message: string | null;
    created_at: string;
    sent_at: string | null;
}

export interface LogParams {
    limit?: number;
    offset?: number;
    status?: string;
    channel?: string;
    search?: string;
}

// --- Service ---
export const notificationService = {
    // User Inbox
    getInbox: async (params?: InboxParams) => {
        const response = await api.get<{ count: number, results: NotificationItem[] }>('/notifications/inbox/', { params });
        return response.data.results;
    },

    getUnreadCount: async () => {
        const response = await api.get<UnreadCount>('/notifications/inbox/unread-count/');
        return response.data;
    },

    markAllRead: async () => {
        const response = await api.post('/notifications/inbox/mark-all-read/');
        return response.data;
    },

    markRead: async (id: number) => {
        const response = await api.post(`/notifications/inbox/${id}/read/`);
        return response.data;
    },

    archive: async (id: number) => {
        const response = await api.post(`/notifications/inbox/${id}/archive/`);
        return response.data;
    },

    // Admin Logs
    getLogs: async (params?: LogParams) => {
        const response = await api.get<{ count: number, results: NotificationLog[] }>('/notifications/logs/', { params });
        return response.data.results;
    },

    getStats: async (days: number = 7) => {
        const response = await api.get('/notifications/stats/', { params: { days } });
        return response.data;
    }
};
