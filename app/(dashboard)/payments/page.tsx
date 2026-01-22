"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
    CheckCircle,
    Search,
    Filter,
    ChevronDown,
    ArrowUp,
    ArrowDown,
    XCircle,
    Clock,
    DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { commissionService, Commission, CommissionStatus } from '@/services/commissionService';
import { RoleGuard } from '@/components/guards/RoleGuard';

export default function PaymentsPage() {
    const router = useRouter();
    const [commissions, setCommissions] = useState<Commission[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'date-desc' | 'amount-desc'>('date-desc');

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                setLoading(true);
                const allCommissions = await commissionService.getCommissions();
                // Filter for only PAID commissions for the Payments view
                const paid = allCommissions.filter(c => c.status === 'paid');
                setCommissions(paid);
            } catch (error) {
                console.error("Failed to fetch payments:", error);
                toast.error("Failed to load payment history.");
            } finally {
                setLoading(false);
            }
        };

        fetchPayments();
    }, []);

    const filteredCommissions = commissions.filter(c =>
        c.consultantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.id.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => {
        if (sortBy === 'amount-desc') return b.commissionAmount - a.commissionAmount;
        // Default date desc
        return new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime();
    });

    const totalPaid = filteredCommissions.reduce((sum, c) => sum + c.commissionAmount, 0);

    if (loading) {
        return (
            <div className="w-full h-96 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <RoleGuard allowedRoles={['finance', 'admin', 'director']}>
            <div className="w-full space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Payments History</h1>
                        <p className="text-gray-500 text-sm">View all processed commission payments.</p>
                    </div>
                    <div className="bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                        <span className="text-sm text-green-700 font-medium">Total Disbursed: </span>
                        <span className="text-lg font-bold text-green-800">S$ {totalPaid.toLocaleString()}</span>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex flex-col sm:flex-row gap-4 justify-between">
                            <div className="relative flex-1 max-w-md">
                                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <Input
                                    type="text"
                                    placeholder="Search consultant or ID..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => setSortBy(prev => prev === 'date-desc' ? 'amount-desc' : 'date-desc')}
                                className="flex items-center gap-2"
                            >
                                <ArrowDown className="w-4 h-4" />
                                {sortBy === 'date-desc' ? 'Sort by Date' : 'Sort by Amount'}
                            </Button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-[#F4F4F4]">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Payment Date</th>
                                    <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Consultant</th>
                                    <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Product</th>
                                    <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredCommissions.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                            <DollarSign className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                            <p>No payment records found.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCommissions.map((commission) => (
                                        <tr key={commission.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {commission.paymentDate}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{commission.consultantName}</div>
                                                <div className="text-xs text-gray-500">{commission.consultantId}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {commission.productType}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                S$ {commission.commissionAmount.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-3 py-1 rounded-full text-xs inline-flex items-center gap-1 bg-blue-100 text-blue-800">
                                                    <CheckCircle className="w-3 h-3" />
                                                    Paid
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </RoleGuard>
    );
}
