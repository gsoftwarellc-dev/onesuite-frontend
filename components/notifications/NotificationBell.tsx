"use client";

import { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { notificationService, UnreadCount, NotificationItem } from '@/services/notificationService';
import { toast } from 'sonner';

export function NotificationBell() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [counts, setCounts] = useState<UnreadCount>({ unread_count: 0, high_priority_count: 0 });
    const [recentParams, setRecentParams] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Poll for unread status
    useEffect(() => {
        fetchCounts();
        const interval = setInterval(fetchCounts, 30000); // 30s poll
        return () => clearInterval(interval);
    }, []);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchCounts = async () => {
        try {
            const data = await notificationService.getUnreadCount();
            setCounts(data);
        } catch (error) {
            console.error('Failed to fetch notification counts', error);
        }
    };

    const fetchRecent = async () => {
        setLoading(true);
        try {
            const data = await notificationService.getInbox({ limit: 5 });
            setRecentParams(data);
        } catch (error) {
            console.error('Failed to fetch inbox', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleOpen = () => {
        if (!isOpen) {
            fetchRecent();
        }
        setIsOpen(!isOpen);
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationService.markAllRead();
            setCounts({ unread_count: 0, high_priority_count: 0 });
            setRecentParams(prev => prev.map(n => ({ ...n, status: 'READ' })));
            toast.success("All notifications marked as read");
        } catch (error) {
            toast.error("Failed to mark all read");
        }
    };

    const handleItemClick = async (item: NotificationItem) => {
        if (item.status === 'UNREAD') {
            try {
                await notificationService.markRead(item.id);
                setCounts(prev => ({
                    ...prev,
                    unread_count: Math.max(0, prev.unread_count - 1),
                    high_priority_count: item.priority === 'HIGH' || item.priority === 'CRITICAL'
                        ? Math.max(0, prev.high_priority_count - 1)
                        : prev.high_priority_count
                }));
            } catch (ignored) { }
        }

        if (item.action_url) {
            router.push(item.action_url);
            setIsOpen(false);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={toggleOpen}
            >
                <Bell className="h-5 w-5 text-gray-600" />
                {counts.unread_count > 0 && (
                    <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center border-2 border-white">
                        {counts.unread_count > 9 ? '9+' : counts.unread_count}
                    </span>
                )}
            </Button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
                    <div className="p-3 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h3 className="font-semibold text-sm">Notifications</h3>
                        {counts.unread_count > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                            >
                                <Check className="w-3 h-3" /> Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-[300px] overflow-y-auto">
                        {loading ? (
                            <div className="p-4 text-center text-gray-500 text-sm">Loading...</div>
                        ) : recentParams.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <Inbox className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                <p className="text-sm">No notifications</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {recentParams.map(item => (
                                    <div
                                        key={item.id}
                                        onClick={() => handleItemClick(item)}
                                        className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors ${item.status === 'UNREAD' ? 'bg-blue-50/50' : ''}`}
                                    >
                                        <div className="flex gap-3">
                                            <div className="flex-1">
                                                <p className={`text-sm ${item.status === 'UNREAD' ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                                                    {item.title}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                    {item.message}
                                                </p>
                                                <p className="text-[10px] text-gray-400 mt-1">
                                                    {new Date(item.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            {item.status === 'UNREAD' && (
                                                <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-2 border-t border-gray-100 bg-gray-50">
                        <Button
                            variant="ghost"
                            className="w-full text-xs h-8 text-gray-600"
                            onClick={() => {
                                router.push('/notifications');
                                setIsOpen(false);
                            }}
                        >
                            View All Notifications
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
