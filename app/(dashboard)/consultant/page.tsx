"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    DollarSign,
    CheckCircle,
    Clock,
    FileText,
    Upload,
    Download,
    History,
    Search,
    Filter,
    Calendar,
    ChevronDown,
    ArrowUpRight,
    ArrowDownRight,
    MoreHorizontal,
    TrendingUp
} from 'lucide-react';
import {
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { toast } from 'sonner';
import { LoadingSkeleton } from '@/components/loading-skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { commissionService, Commission } from '@/services/commissionService';
import { analyticsService, ConsultantDashboardDTO } from '@/services/analyticsService';
import { RoleGuard } from '@/components/guards/RoleGuard';

export default function ConsultantDashboard() {
    const router = useRouter();
    const [dashboardData, setDashboardData] = useState<ConsultantDashboardDTO | null>(null);
    const [commissions, setCommissions] = useState<Commission[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters for History Table
    const [searchTerm, setSearchTerm] = useState('');
    const [timeFilter, setTimeFilter] = useState('All Time');
    const [productFilter, setProductFilter] = useState('All Product Types');

    useEffect(() => {
        const loadData = async () => {
            try {
                // Parallel fetching
                const [dashData, commsData] = await Promise.all([
                    analyticsService.getConsultantDashboard(),
                    commissionService.getCommissions()
                ]);

                setDashboardData(dashData);
                setCommissions(commsData);
            } catch (error) {
                console.error('Failed to load dashboard:', error);
                toast.error('Failed to load dashboard data. Showing fallback.');
                // Fallbacks handled in render or individual states if needed
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) return <div className="p-6"><LoadingSkeleton /></div>;
    // Fallback for empty dashboardData if API failed completely
    const summary = dashboardData?.summary || {
        total_paid_ytd: '0',
        pending_amount: '0',
        w9_status: 'N/A',
        tax_docs_count: 0
    };

    // --- Derived Data for Charts ---

    // 1. Commission Trend (Line Chart) - Using real earnings trend
    const trendData = dashboardData?.earnings_trend.map(item => ({
        month: item.month,
        amount: parseFloat(item.total)
    })) || [];

    // Ensure we have 6 months of data for the chart look, otherwise pad it? 
    // For now use what we have. API usually returns configured months.

    // 2. Status Distribution (Pie Chart) - Derived from real commissions
    const statusCounts = commissions.reduce((acc, curr) => {
        const status = curr.status.toLowerCase();
        // Map backend status to UI categories
        // submitted -> Pending
        // approved/authorized -> Approved
        // paid -> Paid
        let category = 'Other';
        if (['submitted', 'pending'].includes(status)) category = 'Pending';
        else if (['approved', 'authorized'].includes(status)) category = 'Approved';
        else if (['paid'].includes(status)) category = 'Paid';

        acc[category] = (acc[category] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const pieData = [
        { name: 'Paid', value: statusCounts['Paid'] || 0, color: '#3b82f6' },      // Blue
        { name: 'Approved', value: statusCounts['Approved'] || 0, color: '#10b981' }, // Green
        { name: 'Pending', value: statusCounts['Pending'] || 0, color: '#f59e0b' },  // Yellow/Orange
    ].filter(d => d.value > 0);

    // --- Helper for Stats Cards ---
    const StatsCard = ({ title, value, sub, icon: Icon, colorClass, trend, trendUp }: any) => (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-lg ${colorClass} text-white`}>
                    <Icon className="w-6 h-6" />
                </div>
                {trend && (
                    <div className={`flex items-center text-xs font-medium ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
                        {trendUp ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                        {trend}
                    </div>
                )}
            </div>
            <div>
                <h3 className="text-2xl font-bold mb-1">{value}</h3>
                <p className="text-gray-500 text-sm font-medium">{title}</p>
                <p className="text-xs text-gray-400 mt-1">{sub}</p>
            </div>
        </div>
    );

    // Filter Logic for Table
    const filteredCommissions = commissions.filter(c => {
        const matchesSearch = c.consultantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.id.toLowerCase().includes(searchTerm.toLowerCase());
        // Basic Product Filter Mock (If productType exists)
        const matchesProduct = productFilter === 'All Product Types' || c.productType === productFilter;

        // Basic Time Filter Mock (Real impl would parse dates)
        // For now, assume 'All Time' shows all.
        return matchesSearch && matchesProduct;
    });

    return (
        <RoleGuard allowedRoles={['consultant']}>
            <div className="space-y-8 pb-10">
                {/* Header Section */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
                    <p className="text-gray-500 mt-1">Make today count, {summary.w9_status !== 'Verified' ? 'Please complete your W9' : 'You are ready to sell!'}</p>
                </div>

                {/* 1. Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatsCard
                        title="Total Earned"
                        value={`S$${parseFloat(summary.total_paid_ytd).toLocaleString()}`}
                        sub="Year to Date"
                        icon={DollarSign}
                        colorClass="bg-blue-500"
                        trend="12.5%"
                        trendUp={true}
                    />
                    <StatsCard
                        title="Pending"
                        value={`S$${parseFloat(summary.pending_amount).toLocaleString()}`}
                        sub="Commissions awaiting review"
                        icon={Clock}
                        colorClass="bg-yellow-500"
                        trend="8.2%"
                        trendUp={false}
                    />
                    <StatsCard
                        title="Approved"
                        value={`S$${(pieData.find(d => d.name === 'Approved')?.value || 0)} Commissions`}
                        sub="Ready for payment"
                        icon={CheckCircle}
                        colorClass="bg-green-500"
                        trend="5.3%"
                        trendUp={true}
                    />
                    {/* Fourth Card: Paid (Mocking 'Last Payment' logic if not in summary) */}
                    <StatsCard
                        title="Paid"
                        value={`S$${parseFloat(summary.total_paid_ytd).toLocaleString()}`} // Using YTD as proxy for big number
                        sub="Last payment: 28/12/2025"
                        icon={DollarSign}
                        colorClass="bg-purple-500"
                        trend="15.7%"
                        trendUp={true}
                    />
                </div>

                {/* 2. Quick Actions */}
                <div className="bg-transparent">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800">Quick Actions</h2>
                    <div className="flex flex-col md:flex-row gap-4">
                        <Button
                            className="bg-[#F4323D] hover:bg-[#d62d37] text-white flex-1 h-12 shadow-sm"
                            onClick={() => router.push('/submit-commission')}
                        >
                            <Upload className="w-4 h-4 mr-2" /> Submit New Commission
                        </Button>
                        <Button
                            variant="outline"
                            className="flex-1 h-12 border-gray-200 bg-white hover:bg-gray-50 text-gray-700 shadow-sm"
                            onClick={() => router.push('/payslips')}
                        >
                            <Download className="w-4 h-4 mr-2" /> Download Payslip
                        </Button>
                        <Button
                            variant="outline"
                            className="flex-1 h-12 border-gray-200 bg-white hover:bg-gray-50 text-gray-700 shadow-sm"
                            onClick={() => router.push('/history')}
                        >
                            <History className="w-4 h-4 mr-2" /> View History
                        </Button>
                    </div>
                </div>

                {/* 3. Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Line Chart */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-semibold text-gray-800">Commission Trend (Last 6 Months)</h3>
                            <TrendingUp className="w-4 h-4 text-red-500" />
                        </div>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={trendData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} tickFormatter={(val) => `$${val}`} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        formatter={(val: any) => [`S$${val}`, 'Earned']}
                                    />
                                    <Line type="monotone" dataKey="amount" stroke="#F4323D" strokeWidth={3} dot={{ r: 4, fill: '#F4323D', strokeWidth: 2, stroke: '#fff' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Pie Chart */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                        <h3 className="font-semibold text-gray-800 mb-6">Commission Status Distribution</h3>
                        <div className="h-[250px] w-full flex items-center justify-center relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} iconType="square" />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Center Text Trick (Optional) */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="text-center">
                                    <span className="text-xs text-gray-500 block">Total</span>
                                    <span className="text-xl font-bold text-gray-800">{commissions.length}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Commission History Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">My Commission History</h3>
                        </div>
                        <div className="text-sm font-medium text-[#F4323D] cursor-pointer hover:underline" onClick={() => router.push('/history')}>
                            View All →
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="p-4 bg-gray-50/50 flex flex-col lg:flex-row gap-4 border-b border-gray-100">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Search by client or ID..."
                                className="pl-9 bg-white border-gray-200"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-4">
                            <div className="relative">
                                <select
                                    className="h-10 pl-9 pr-8 rounded-md border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-[#F4323D] appearance-none cursor-pointer"
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
                        <div className="flex items-center text-sm text-gray-500 ml-auto">
                            Showing {filteredCommissions.length} of {commissions.length} commissions
                        </div>
                    </div>

                    {/* Table */}
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
                                {filteredCommissions.slice(0, 5).map((commission) => (
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
                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                            No commissions found matching your filters.
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
