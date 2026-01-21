"use client";

import { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, FileText, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { commissionService, Commission } from '@/services/commissionService';
import { LoadingSkeleton } from '@/components/loading-skeleton';
import { toast } from 'sonner';

export default function HistoryPage() {
    const [commissions, setCommissions] = useState<Commission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const loadCommissions = async () => {
            try {
                const data = await commissionService.getCommissions();
                setCommissions(data);
            } catch (error) {
                console.error('Failed to load commissions:', error);
                toast.error('Failed to load commission history');
            } finally {
                setIsLoading(false);
            }
        };
        loadCommissions();
    }, []);

    const getStatusBadge = (status: string) => {
        const baseClasses = 'px-3 py-1 rounded-full text-xs inline-flex items-center gap-1 font-medium';
        switch (status) {
            case 'pending':
                return (
                    <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
                        <Clock className="w-3 h-3" />
                        Pending
                    </span>
                );
            case 'approved':
            case 'authorized':
                return (
                    <span className={`${baseClasses} bg-green-100 text-green-800`}>
                        <CheckCircle className="w-3 h-3" />
                        Approved
                    </span>
                );
            case 'paid':
                return (
                    <span className={`${baseClasses} bg-blue-100 text-blue-800`}>
                        <CheckCircle className="w-3 h-3" />
                        Paid
                    </span>
                );
            case 'rejected':
                return (
                    <span className={`${baseClasses} bg-red-100 text-red-800`}>
                        <XCircle className="w-3 h-3" />
                        Rejected
                    </span>
                );
            default:
                return null;
        }
    };

    const filteredCommissions = commissions.filter(commission =>
        commission.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        commission.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        commission.productType.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="p-6">
                <LoadingSkeleton />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Commission History</h1>
                <p className="text-gray-600 mt-2">View all your commission records and their status</p>
            </div>

            {/* Search */}
            <div className="bg-white rounded-lg shadow p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                        type="text"
                        placeholder="Search by client name, ID, or product type..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Client
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Product
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredCommissions.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {item.paymentDate}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{item.clientName}</div>
                                        <div className="text-xs text-gray-500">{item.id}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {item.productType}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                        S$ {item.commissionAmount.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(item.status)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredCommissions.length === 0 && (
                    <div className="text-center py-12">
                        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600 text-lg">No commissions found</p>
                        <p className="text-gray-500 text-sm mt-2">
                            {searchQuery ? 'Try adjusting your search' : 'Your commission history will appear here'}
                        </p>
                    </div>
                )}
            </div>

            {filteredCommissions.length > 0 && (
                <div className="text-sm text-gray-600 text-center">
                    Showing {filteredCommissions.length} commission{filteredCommissions.length !== 1 ? 's' : ''}
                </div>
            )}
        </div>
    );
}
