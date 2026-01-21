"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DollarSign, Calendar, ChevronRight, FileText } from 'lucide-react';
import { payoutService, Payout } from '@/services/payoutService';
import { LoadingSkeleton } from '@/components/loading-skeleton';
import { toast } from 'sonner';

export default function PayoutsPage() {
    const [payouts, setPayouts] = useState<Payout[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadPayouts = async () => {
            try {
                const data = await payoutService.getMyHistory();
                // If backend returns pagination object, handle it.
                // Assuming array for now based on contract inspection (PayoutListSerializer many=True)
                // But PayoutViewSet.my_history uses paginate_queryset.
                // If paginated, data might be { results: [], count: ... } or just [] if no pagination.
                // Type casting safety
                if (Array.isArray(data)) {
                    setPayouts(data);
                } else if ((data as any).results) {
                    setPayouts((data as any).results);
                } else {
                    setPayouts([]);
                }
            } catch (error) {
                console.error('Failed to load payouts:', error);
                toast.error('Failed to load payout history');
            } finally {
                setIsLoading(false);
            }
        };
        loadPayouts();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PAID': return 'bg-green-100 text-green-800';
            case 'PROCESSING': return 'bg-blue-100 text-blue-800';
            case 'DRAFT': return 'bg-gray-100 text-gray-800';
            case 'ERROR': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (isLoading) {
        return <div className="p-6"><LoadingSkeleton /></div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Payouts</h1>
                <p className="text-gray-600 mt-2">View your payment history and statements</p>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Reference
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {payouts.map((payout) => (
                                <tr key={payout.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            {payout.paid_at ? new Date(payout.paid_at).toLocaleDateString() : 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {payout.payment_reference || 'Processing...'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                        S$ {parseFloat(payout.net_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payout.status)}`}>
                                            {payout.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                                        <Link href={`/payouts/${payout.id}`} className="flex items-center gap-1 hover:underline">
                                            View Details
                                            <ChevronRight className="w-4 h-4" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {payouts.length === 0 && (
                    <div className="text-center py-12">
                        <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No payouts found</p>
                    </div>
                )}
            </div>
        </div>
    );
}
