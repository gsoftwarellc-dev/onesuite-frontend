"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Download, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { payoutService, Payout } from '@/services/payoutService';
import { LoadingSkeleton } from '@/components/loading-skeleton';
import { toast } from 'sonner';

export default function PayoutDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [payout, setPayout] = useState<Payout | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!params.id) return;

        const loadPayout = async () => {
            try {
                const data = await payoutService.getPayout(params.id as string);
                setPayout(data);
            } catch (error) {
                console.error('Failed to load payout:', error);
                toast.error('Failed to load payout details');
                router.push('/payouts');
            } finally {
                setIsLoading(false);
            }
        };
        loadPayout();
    }, [params.id, router]);

    if (isLoading) return <div className="p-6"><LoadingSkeleton /></div>;
    if (!payout) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Button
                variant="ghost"
                onClick={() => router.back()}
                className="mb-4 pl-0 hover:bg-transparent hover:text-blue-600"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Payouts
            </Button>

            {/* Header Card */}
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-[#F4323D]">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Payout Statement</h1>
                        <p className="text-gray-500 mt-1">Ref: {payout.payment_reference || `PAY-${payout.id}`}</p>
                        <div className="flex items-center gap-2 mt-2">
                            {payout.status === 'PAID' && <CheckCircle className="w-4 h-4 text-green-600" />}
                            {payout.status === 'PROCESSING' && <Clock className="w-4 h-4 text-blue-600" />}
                            <span className="font-medium text-gray-700">{payout.status}</span>
                            {payout.paid_at && (
                                <span className="text-gray-500 text-sm">
                                    • Paid on {new Date(payout.paid_at).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-500 mb-1">Net Pay</p>
                        <p className="text-3xl font-bold text-[#F4323D]">
                            S$ {parseFloat(payout.net_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>
            </div>

            {/* Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-sm text-gray-500 mb-1">Total Commission</p>
                    <p className="text-xl font-semibold">S$ {parseFloat(payout.total_commission).toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-sm text-gray-500 mb-1">Adjustments</p>
                    <p className="text-xl font-semibold text-blue-600">S$ {parseFloat(payout.total_adjustment).toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-sm text-gray-500 mb-1">Tax / Deductions</p>
                    <p className="text-xl font-semibold text-red-600">S$ {parseFloat(payout.total_tax).toLocaleString()}</p>
                </div>
            </div>

            {/* Line Items */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-semibold">Commission Details</h2>
                </div>
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Comm Ref</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Description</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {payout.line_items?.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                    {item.commission_reference}
                                    <div className="text-xs text-gray-500">{item.commission_date}</div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {item.description}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">
                                    S$ {parseFloat(item.amount).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {(!payout.line_items || payout.line_items.length === 0) && (
                    <div className="p-6 text-center text-gray-500">No line items found.</div>
                )}
            </div>
        </div>
    );
}
