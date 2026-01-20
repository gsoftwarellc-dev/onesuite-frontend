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
    Phone,
    XCircle,
    TrendingUp,
    TrendingDown,
} from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { LoadingSkeleton } from '@/components/loading-skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { commissionService, Commission } from '@/services/commissionService';
import { userService, User } from '@/services/userService';

export default function ConsultantDashboard() {
    const router = useRouter();
    const [activeView, setActiveView] = useState<'dashboard' | 'submit' | 'history' | 'payslips' | 'profile'>('dashboard');
    const [filterDate, setFilterDate] = useState('all');
    const [filterProductType, setFilterProductType] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [commissions, setCommissions] = useState<Commission[]>([]);
    const [userProfile, setUserProfile] = useState<User | null>(null);
    const [stats, setStats] = useState<any[]>([]);
    const [monthlyData, setMonthlyData] = useState<any[]>([]);
    const [statusData, setStatusData] = useState<any[]>([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                // Fetch profile and commissions in parallel
                const [profile, fetchedCommissions] = await Promise.all([
                    userService.getProfile(),
                    commissionService.getCommissions() // Backend should filter by current user
                ]);

                setUserProfile(profile);
                setCommissions(fetchedCommissions);

                // Calculate stats based on fetched data
                const totalEarned = fetchedCommissions
                    .filter(c => c.status === 'paid' || c.status === 'approved')
                    .reduce((sum, c) => sum + c.commissionAmount, 0);

                const pendingAmount = fetchedCommissions
                    .filter(c => c.status === 'pending')
                    .reduce((sum, c) => sum + c.commissionAmount, 0);

                const paidAmount = fetchedCommissions
                    .filter(c => c.status === 'paid')
                    .reduce((sum, c) => sum + c.commissionAmount, 0);

                const approvedAmount = fetchedCommissions
                    .filter(c => c.status === 'approved')
                    .reduce((sum, c) => sum + c.commissionAmount, 0);

                setStats([
                    {
                        icon: DollarSign,
                        label: 'Total Earned',
                        value: `S$${totalEarned.toLocaleString()}`,
                        subtext: 'Year to Date',
                        color: 'bg-blue-500',
                        trend: { value: 12.5, isPositive: true },
                    },
                    {
                        icon: Clock,
                        label: 'Pending',
                        value: `S$${pendingAmount.toLocaleString()}`,
                        subtext: 'Commissions awaiting review',
                        color: 'bg-yellow-500',
                        trend: { value: 0, isPositive: true },
                    },
                    {
                        icon: CheckCircle,
                        label: 'Approved',
                        value: `S$${approvedAmount.toLocaleString()}`,
                        subtext: 'Ready for payment',
                        color: 'bg-green-500',
                        trend: { value: 5.3, isPositive: true },
                    },
                    {
                        icon: DollarSign,
                        label: 'Paid',
                        value: `S$${paidAmount.toLocaleString()}`,
                        subtext: 'Total paid out',
                        color: 'bg-purple-500',
                        trend: { value: 15.7, isPositive: true },
                    },
                ]);

                // Calculate Status Distribution
                const statusCounts = {
                    paid: fetchedCommissions.filter(c => c.status === 'paid').length,
                    approved: fetchedCommissions.filter(c => c.status === 'approved').length,
                    pending: fetchedCommissions.filter(c => c.status === 'pending').length || 0, // Ensure at least 0
                    rejected: fetchedCommissions.filter(c => c.status === 'rejected').length
                };

                setStatusData([
                    { name: 'Paid', value: statusCounts.paid, color: '#3B82F6' },
                    { name: 'Approved', value: statusCounts.approved, color: '#10B981' },
                    { name: 'Pending', value: statusCounts.pending, color: '#F59E0B' },
                    // { name: 'Rejected', value: statusCounts.rejected, color: '#EF4444' },
                ].filter(item => item.value > 0)); // Only show non-zero in pie chart

                // Calculate Monthly Data (Mock logic for now, real logic needs date parsing)
                // Just using static for visual trend as example until we have real date parsing logic
                setMonthlyData([
                    { month: 'Jul', amount: 3200 },
                    { month: 'Aug', amount: 3800 },
                    { month: 'Sep', amount: 3200 },
                    { month: 'Oct', amount: 4500 },
                    { month: 'Nov', amount: 3800 },
                    { month: 'Dec', amount: 4200 },
                ]);


            } catch (error) {
                console.error("Failed to fetch consultant data:", error);
                toast.error("Failed to load data. Using offline mode.");
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);


    // Mock Payslips (API endpoint usually separate)
    const payslips = [
        { month: 'December 2025', amount: 'S$4,200', status: 'Available' },
        { month: 'November 2025', amount: 'S$3,800', status: 'Available' },
    ];

    const getStatusBadge = (status: string) => {
        const baseClasses = 'px-3 py-1 rounded-full text-xs inline-flex items-center gap-1';
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

    // Get unique product types for filter
    const productTypes = Array.from(new Set(commissions.map(c => c.productType)));

    // Filter commissions based on date and product type
    const filteredCommissions = commissions.filter(commission => {
        const matchesSearch = commission.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            commission.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesProductType = filterProductType === 'all' || commission.productType === filterProductType;

        // Date filtering logic can be enhanced here
        return matchesSearch && matchesProductType;
    });

    if (isLoading) {
        return (
            <div className="p-6">
                <LoadingSkeleton />
            </div>
        )
    }

    const renderMainContent = () => {
        switch (activeView) {
            case 'dashboard':
                return (
                    <div className="space-y-6">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {stats.map((stat, i) => (
                                <div key={i} className="bg-white rounded-lg shadow p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                                            <stat.icon className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {stat.trend.isPositive ? (
                                                <TrendingUp className="w-4 h-4 text-green-500" />
                                            ) : (
                                                <TrendingDown className="w-4 h-4 text-red-500" />
                                            )}
                                            <span className="text-sm text-gray-500">{stat.trend.value}%</span>
                                        </div>
                                    </div>
                                    <div className="text-2xl mb-1">{stat.value}</div>
                                    <div className="text-sm text-gray-600 mb-2">{stat.label}</div>
                                    <div className="text-xs text-gray-500">{stat.subtext}</div>
                                </div>
                            ))}
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl mb-4">Quick Actions</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <button
                                    onClick={() => router.push('/submit-commission')}
                                    className="bg-gradient-to-r from-[#F4323D] to-[#ff5a65] text-white px-6 py-4 rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                                >
                                    <Upload className="w-5 h-5" />
                                    <span>Submit New Commission</span>
                                </button>
                                <button
                                    onClick={() => setActiveView('payslips')}
                                    className="bg-white border-2 border-gray-300 text-gray-700 px-6 py-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Download className="w-5 h-5" />
                                    <span>Download Payslip</span>
                                </button>
                                <button
                                    onClick={() => setActiveView('history')}
                                    className="bg-white border-2 border-gray-300 text-gray-700 px-6 py-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    <History className="w-5 h-5" />
                                    <span>View History</span>
                                </button>
                            </div>
                        </div>

                        {/* Charts Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Commission Trend Chart */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl">Commission Trend (Last 6 Months)</h2>
                                    <TrendingUp className="w-5 h-5 text-[#F4323D]" />
                                </div>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={monthlyData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis
                                            dataKey="month"
                                            stroke="#666"
                                            style={{ fontSize: '12px' }}
                                        />
                                        <YAxis
                                            stroke="#666"
                                            style={{ fontSize: '12px' }}
                                            tickFormatter={(value) => `$${value}`}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#fff',
                                                border: '1px solid #e0e0e0',
                                                borderRadius: '8px',
                                                padding: '8px 12px'
                                            }}
                                            formatter={(value: any) => [`S$${value.toLocaleString()}`, 'Commission']}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="amount"
                                            stroke="#F4323D"
                                            strokeWidth={3}
                                            dot={{ fill: '#F4323D', r: 5 }}
                                            activeDot={{ r: 7 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Commission Status Distribution */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-xl mb-6">Commission Status Distribution</h2>
                                <div className="flex items-center justify-center">
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={statusData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={100}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {statusData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="mt-4 grid grid-cols-2 gap-3">
                                    {statusData.map((item) => (
                                        <div key={item.name} className="flex items-center gap-2">
                                            <div
                                                className="w-4 h-4 rounded"
                                                style={{ backgroundColor: item.color }}
                                            />
                                            <span className="text-sm text-gray-700">{item.name}: {item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Commission History Table (Preview) */}
                        <div className="bg-white rounded-lg shadow">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl">My Commission History</h2>
                                    <button
                                        onClick={() => setActiveView('history')}
                                        className="text-[#F4323D] hover:text-[#d62d37] text-sm"
                                    >
                                        View All →
                                    </button>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-[#F4F4F4]">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Client</th>
                                            <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Product</th>
                                            <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Amount</th>
                                            <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredCommissions.slice(0, 5).map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {item.paymentDate}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{item.clientName}</div>
                                                    <div className="text-xs text-gray-500">{item.id}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {item.productType}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
                                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600">No commissions found.</p>
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 'history':
                return (
                    <div className="bg-white rounded-lg shadow">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-2xl mb-4">Complete Commission History</h2>
                            <Button variant="outline" onClick={() => setActiveView('dashboard')}>Back to Dashboard</Button>
                        </div>
                        {/* Reusing simplified table for history view for now */}
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-[#F4F4F4]">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Client</th>
                                        <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Product</th>
                                        <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Amount</th>
                                        <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredCommissions.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {item.paymentDate}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{item.clientName}</div>
                                                <div className="text-xs text-gray-500">{item.id}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {item.productType}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
                    </div>
                );

            case 'payslips':
                return (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-2xl mb-6">Payslips</h2>
                        <div className="space-y-4">
                            {payslips.map((payslip, index) => (
                                <div
                                    key={index}
                                    className="border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:border-[#F4323D] transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-[#F4323D] bg-opacity-10 rounded-lg flex items-center justify-center">
                                            <FileText className="w-6 h-6 text-[#F4323D]" />
                                        </div>
                                        <div>
                                            <h3 className="mb-1">{payslip.month}</h3>
                                            <p className="text-sm text-gray-600">{payslip.amount}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                            {payslip.status}
                                        </span>
                                        <Button variant="default">
                                            <Download className="w-4 h-4 mr-2" />
                                            View & Download
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4">
                            <Button variant="outline" onClick={() => setActiveView('dashboard')}>Back to Dashboard</Button>
                        </div>
                    </div>
                )

            case 'profile':
                return (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-2xl mb-6">Profile Information</h2>
                        <div className="max-w-2xl">
                            <div className="flex items-start gap-6 mb-8">
                                <div className="w-24 h-24 bg-[#F4323D] rounded-full flex items-center justify-center text-white text-3xl">
                                    {userProfile?.name?.substring(0, 2).toUpperCase() || "ME"}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl mb-2">{userProfile?.name}</h3>
                                    <p className="text-gray-600 mb-1">{userProfile?.email}</p>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full">
                                            {userProfile?.role}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="border-b border-gray-200 pb-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Phone className="w-5 h-5 text-gray-400" />
                                        <span className="text-sm text-gray-600">Contact Number</span>
                                    </div>
                                    <p className="text-lg ml-8">{userProfile?.contactNumber || "N/A"}</p>
                                </div>

                                <div className="border-b border-gray-200 pb-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Calendar className="w-5 h-5 text-gray-400" />
                                        <span className="text-sm text-gray-600">Date of Join</span>
                                    </div>
                                    <p className="text-lg ml-8">{userProfile?.joinedDate || "N/A"}</p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4">
                            <Button variant="outline" onClick={() => setActiveView('dashboard')}>Back to Dashboard</Button>
                        </div>
                    </div>
                );
            default:
                return <div>View not found</div>;
        }
    };


    return (
        <div className="w-full">
            <h1 className="text-2xl font-bold tracking-tight mb-4">Dashboard</h1>
            {renderMainContent()}
        </div>
    );
}
