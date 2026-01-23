"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { commissionService } from '@/services/commissionService';
import { LoadingSkeleton } from '@/components/loading-skeleton';
import { toast } from 'sonner';

export default function PayslipsPage() {
    const router = useRouter();
    const [payslips, setPayslips] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadPayslips = async () => {
            try {
                const data = await commissionService.getPayslips();
                setPayslips(data);
            } catch (error) {
                toast.error('Failed to load payslips');
            } finally {
                setLoading(false);
            }
        };
        loadPayslips();
    }, []);

    if (loading) return <div className="p-6"><LoadingSkeleton /></div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Payslips</h1>
                <p className="text-gray-600 mt-2">Download your monthly commission payslips</p>
            </div>

            <div className="bg-white rounded-lg shadow">
                <div className="p-6">
                    <div className="space-y-4">
                        {payslips.length > 0 ? (
                            payslips.map((payslip, index) => (
                                <div
                                    key={index}
                                    className="border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:border-[#F4323D] hover:shadow-md transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-[#F4323D] bg-opacity-10 rounded-lg flex items-center justify-center">
                                            <FileText className="w-6 h-6 text-[#F4323D]" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg">{payslip.month_label}</h3>
                                            <p className="text-sm text-gray-600">S$ {parseFloat(payslip.amount).toLocaleString()}</p>
                                            <p className="text-xs text-gray-500 mt-1">Generated on {payslip.generated_on}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                            {payslip.status}
                                        </span>
                                        <Button
                                            variant="default"
                                            className="bg-[#F4323D] hover:bg-[#d62d37]"
                                            onClick={() => router.push(`/payslips/${payslip.month_id}`)}
                                        >
                                            <Download className="w-4 h-4 mr-2" />
                                            View & Download
                                        </Button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 text-gray-500">
                                <p>No payslips found yet. Once commissions are marked as "Paid", they will appear here.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
