"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Search,
    Filter,
    Calendar,
    ChevronDown,
    FileText,
    ArrowUpDown
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { commissionService, Commission } from '@/services/commissionService';
import { LoadingSkeleton } from '@/components/loading-skeleton';
import { toast } from 'sonner';
import { RoleGuard } from '@/components/guards/RoleGuard';

export default function HistoryPage() {
    const router = useRouter();
    const [commissions, setCommissions] = useState<Commission[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [timeFilter, setTimeFilter] = useState('All Time');
    const [productFilter, setProductFilter] = useState('All Product Types');

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

    // Filter Logic
    const filteredCommissions = commissions.filter(c => {
        const matchesSearch = c.consultantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.id.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesProduct = productFilter === 'All Product Types' || c.productType === productFilter;

        // Note: Time filter logic needs real date parsing. 
        // For now, mirroring dashboard which assumes 'All Time' shows all or has partial mock logic.
        // If exact date filtering is needed, we'd parse c.paymentDate/submittedDate.

        return matchesSearch && matchesProduct;
    });

    if (isLoading) {
        return (
            <div className="p-6">
                <LoadingSkeleton />
            </div>
        );
    }

    return (
        <RoleGuard allowedRoles={['consultant']}>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Commission History</h1>
                    <p className="text-gray-500 mt-1">View and manage your complete commission records.</p>
                </div>

                {/* Filters Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Search by client or ID..."
                                className="pl-9 bg-white border-gray-200"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-wrap gap-4">
                            <div className="relative">
                                <select
                                    className="h-10 pl-9 pr-8 rounded-md border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-[#F4323D] appearance-none cursor-pointer min-w-[140px]"
                                    value={timeFilter}
                                    onChange={(e) => setTimeFilter(e.target.value)}
                                >
                                    <option>All Time</option>
                                    <option>This Month</option>
                                    <option>This Quarter</option>
                                    <option>This Year</option>
                                </select>
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                            <div className="relative">
                                <select
                                    className="h-10 pl-9 pr-8 rounded-md border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-[#F4323D] appearance-none cursor-pointer min-w-[180px]"
                                    value={productFilter}
                                    onChange={(e) => setProductFilter(e.target.value)}
                                >
                                    <option>All Product Types</option>
                                    <option>Financial Advisory</option>
                                    <option>Tax Consultation</option>
                                    <option>Business Strategy</option>
                                    <option>Audit Services</option>
                                </select>
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 text-sm text-gray-500">
                        Showing {filteredCommissions.length} of {commissions.length} commissions
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Date</th>
                                    <th className="px-6 py-4 font-medium">Client</th>
                                    <th className="px-6 py-4 font-medium">Product Type</th>
                                    <th className="px-6 py-4 font-medium">Amount</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCommissions.map((commission) => (
                                    <tr key={commission.id} className="bg-white border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 text-gray-900 font-medium">
                                            {commission.paymentDate || new Date(commission.submittedDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{commission.clientName || 'Unknown Client'}</div>
                                            <div className="text-xs text-gray-400">{commission.id}</div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {commission.productType}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            S$ {commission.commissionAmount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${['paid'].includes(commission.status.toLowerCase()) ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                    ['approved', 'authorized'].includes(commission.status.toLowerCase()) ? 'bg-green-50 text-green-700 border-green-100' :
                                                        'bg-yellow-50 text-yellow-700 border-yellow-100'
                                                }`}>
                                                {commission.status.toLowerCase() === 'submitted' ? 'Pending' :
                                                    commission.status.charAt(0).toUpperCase() + commission.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-[#F4323D] font-medium hover:text-[#d62d37] text-xs">
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredCommissions.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                            <p className="text-lg font-medium text-gray-600">No commissions found</p>
                                            <p className="text-sm mt-1">Try adjusting your search criteria</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </RoleGuard>
    );
}
