"use client";

import { useState, useEffect } from 'react';
import { notificationService, NotificationItem, NotificationStatus } from '@/services/notificationService';
import { Button } from '@/components/ui/button';
import { Check, Archive, Inbox } from 'lucide-react';
import { LoadingSkeleton } from '@/components/loading-skeleton';
import { toast } from 'sonner';

export default function NotificationsPage() {
    const [activeTab, setActiveTab] = useState<NotificationStatus | 'ALL'>('UNREAD');
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, [activeTab]);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const params = activeTab === 'ALL' ? {} : { status: activeTab };
            const data = await notificationService.getInbox(params);
            setNotifications(data);
        } catch (error) {
            console.error('Failed to load notifications', error);
            toast.error("Failed to load inbox");
        } finally {
            setLoading(false);
        }
    };

    const handleMarkRead = async (id: number) => {
        try {
            await notificationService.markRead(id);
            // Optimistic update
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: 'READ' } : n));
            if (activeTab === 'UNREAD') {
                setNotifications(prev => prev.filter(n => n.id !== id));
            }
            toast.success("Marked as read");
        } catch (error) {
            toast.error("Failed to update");
        }
    };

    const handleArchive = async (id: number) => {
        try {
            await notificationService.archive(id);
            // Optimistic update
            setNotifications(prev => prev.filter(n => n.id !== id));
            toast.success("Archived");
        } catch (error) {
            toast.error("Failed to archive");
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationService.markAllRead();
            if (activeTab === 'UNREAD') {
                setNotifications([]);
            } else {
                setNotifications(prev => prev.map(n => ({ ...n, status: 'READ' })));
            }
            toast.success("All marked as read");
        } catch (error) {
            toast.error("Failed to mark all read");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Inbox</h1>
                    <p className="text-gray-500">Manage your notifications and alerts</p>
                </div>
                {activeTab === 'UNREAD' && notifications.length > 0 && (
                    <Button onClick={handleMarkAllRead} variant="outline" className="gap-2">
                        <Check className="w-4 h-4" /> Mark all read
                    </Button>
                )}
            </div>

            <div className="flex gap-2 border-b border-gray-200 pb-1">
                <button
                    onClick={() => setActiveTab('UNREAD')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'UNREAD' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Unread
                </button>
                <button
                    onClick={() => setActiveTab('ALL')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'ALL' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    All
                </button>
                <button
                    onClick={() => setActiveTab('ARCHIVED')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'ARCHIVED' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Archived
                </button>
            </div>

            <div className="bg-white rounded-lg shadow min-h-[400px]">
                {loading ? (
                    <div className="p-6">
                        <LoadingSkeleton />
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[400px] text-gray-500">
                        <Inbox className="w-12 h-12 mb-4 text-gray-300" />
                        <p className="text-lg font-medium">No notifications found</p>
                        <p className="text-sm">You&apos;re all caught up!</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {notifications.map(item => (
                            <div key={item.id} className={`p-4 flex items-start gap-4 hover:bg-gray-50 transition-colors ${item.status === 'UNREAD' ? 'bg-blue-50/30' : ''}`}>
                                <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${item.status === 'UNREAD' ? 'bg-blue-600' : 'bg-transparent'}`} />
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <h3 className={`text-sm font-medium ${item.status === 'UNREAD' ? 'text-gray-900' : 'text-gray-600'}`}>
                                            {item.title}
                                        </h3>
                                        <span className="text-xs text-gray-400">
                                            {new Date(item.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">{item.message}</p>

                                    <div className="mt-3 flex items-center gap-3">
                                        {item.status === 'UNREAD' && (
                                            <button
                                                onClick={() => handleMarkRead(item.id)}
                                                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                            >
                                                Mark as read
                                            </button>
                                        )}
                                        {item.status !== 'ARCHIVED' && (
                                            <button
                                                onClick={() => handleArchive(item.id)}
                                                className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                                            >
                                                <Archive className="w-3 h-3" /> Archive
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${item.priority === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                                    item.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                                        'bg-gray-100 text-gray-600'
                                    }`}>
                                    {item.priority}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
