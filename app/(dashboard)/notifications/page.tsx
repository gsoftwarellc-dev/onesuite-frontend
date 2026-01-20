export default function NotificationsPage() {
    return (
        <div className="w-full">
            <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
                <p className="text-gray-600 mt-2">Stay updated with your commission activities</p>
            </div>

            <div className="bg-white rounded-lg shadow p-12">
                <div className="text-center max-w-md mx-auto">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                            className="w-8 h-8 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                            />
                        </svg>
                    </div>

                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        No New Notifications
                    </h2>

                    <p className="text-gray-600 mb-4">
                        You're all caught up! We'll notify you when there's something new.
                    </p>

                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-800">
                            <strong>Coming Soon:</strong> Full notification center with real-time updates,
                            commission status changes, approval reminders, and more.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
