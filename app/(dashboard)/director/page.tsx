"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
    Users,
    CheckCircle,
    XCircle,
    Shield,
    TrendingUp,
    Search,
    ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusFlow } from '@/components/dashboard/status-flow';
import { StatusActionButton } from '@/components/dashboard/status-action-button';
import { commissionService, Commission, CommissionStatus } from '@/services/commissionService';

export default function DirectorDashboard() {
    const router = useRouter();
    const [activeView, setActiveView] = useState<'dashboard' | 'review' | 'reports'>('dashboard');
    const [selectedFilter, setSelectedFilter] = useState('authorized');
    const [searchQuery, setSearchQuery] = useState('');
    const [commissions, setCommissions] = useState<Commission[]>([]);
    const [stats, setStats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [approvalTrendData, setApprovalTrendData] = useState<any[]>([]);
    const [teamPerformanceData, setTeamPerformanceData] = useState<any[]>([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const fetchedCommissions = await commissionService.getCommissions();
                setCommissions(fetchedCommissions);

                // Calculate Stats
                const authorizedCount = fetchedCommissions.filter(c => c.status === 'authorized').length;

                const approvedValue = fetchedCommissions
                    .filter(c => c.status === 'approved')
                    .reduce((sum, c) => sum + c.commissionAmount, 0);

                const totalApprovals = fetchedCommissions.filter(c => c.status === 'approved').length;
                const totalRejections = fetchedCommissions.filter(c => c.status === 'rejected').length;
                const totalProcessed = totalApprovals + totalRejections;
                const approvalRate = totalProcessed > 0
                    ? ((totalApprovals / totalProcessed) * 100).toFixed(1)
                    : '100';

                setStats([
                    {
                        icon: Shield,
                        label: 'Awaiting Approval',
                        value: authorizedCount.toString(),
                        subtext: 'Authorized commissions',
                        color: 'bg-blue-500',
                    },
                    {
                        icon: CheckCircle,
                        label: 'Approved This Month', // Simplification: Total Approved for now
                        value: `S$${approvedValue.toLocaleString()}`,
                        subtext: 'Total approved value',
                        color: 'bg-green-500',
                    },
                    {
                        icon: TrendingUp,
                        label: 'Approval Rate',
                        value: `${approvalRate}%`,
                        subtext: 'All time',
                        color: 'bg-purple-500',
                    },
                ]);

                // Mock Trend Data (Need historical API for real trend)
                setApprovalTrendData([
                    { month: 'Jul', approved: 145, rejected: 8 },
                    { month: 'Aug', approved: 158, rejected: 12 },
                    { month: 'Sep', approved: 142, rejected: 6 },
                    { month: 'Oct', approved: 167, rejected: 9 },
                    { month: 'Nov', approved: 153, rejected: 7 },
                    { month: 'Dec', approved: 178, rejected: 10 },
                ]);

                // Mock Team Performance
                setTeamPerformanceData([
                    { name: 'Advisory A', total: 285400 },
                    { name: 'Advisory B', total: 312800 },
                    { name: 'Strategy A', total: 396700 },
                    { name: 'Strategy B', total: 268900 },
                ]);

            } catch (error) {
                console.error("Failed to load director data:", error);
                toast.error("Failed to load data.");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const handleStatusUpdate = async (id: string, newStatus: CommissionStatus) => {
        try {
            await commissionService.updateStatus(id, newStatus);
            toast.success(`Commission ${newStatus} successfully`);
            setCommissions(prev => prev.map(c =>
                c.id === id ? { ...c, status: newStatus } : c
            ));
        } catch (error) {
            toast.error(`Failed to update status to ${newStatus}`);
        }
    };

    const filteredCommissions = commissions.filter(commission => {
        const matchesStatus = selectedFilter === 'all' || commission.status === selectedFilter;
        // Search logic might need adjustment based on available fields in Commission type
        const matchesSearch =
            commission.consultantName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            commission.productType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            commission.id.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesStatus && matchesSearch;
    });

    const renderMainContent = () => {
        switch (activeView) {
            case 'dashboard':
                return (
                    <div className="space-y-6">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {stats.map((stat, i) => (
                                <div key={i} className="bg-white rounded-lg shadow p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                                            <stat.icon className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                    <div className="text-2xl mb-1">{stat.value}</div>
                                    <div className="text-sm text-gray-600 mb-2">{stat.label}</div>
                                    <div className="text-xs text-gray-500">{stat.subtext}</div>
                                </div>
                            ))}
                        </div>

                        {/* Charts Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Approval Trend */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-xl mb-6">Approval Trend</h2>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={approvalTrendData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="month" stroke="#666" style={{ fontSize: '12px' }} />
                                        <YAxis stroke="#666" style={{ fontSize: '12px' }} />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="approved" stroke="#10B981" />
                                        <Line type="monotone" dataKey="rejected" stroke="#EF4444" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Team Performance */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-xl mb-6">Team Performance</h2>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={teamPerformanceData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="name" stroke="#666" style={{ fontSize: '12px' }} angle={-45} textAnchor="end" height={80} />
                                        <YAxis stroke="#666" style={{ fontSize: '12px' }} />
                                        <Tooltip />
                                        <Bar dataKey="total" fill="#F4323D" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Commissions Use Table */}
                        <div className="bg-white rounded-lg shadow">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl">Commissions Requiring Approval</h2>
                                </div>

                                {/* Filters */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="relative">
                                        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <Input
                                            type="text"
                                            placeholder="Search commissions..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>

                                    <div className="relative">
                                        <select
                                            value={selectedFilter}
                                            onChange={(e) => setSelectedFilter(e.target.value)}
                                            className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background appearance-none"
                                        >
                                            <option value="all">All Status</option>
                                            <option value="authorized">Awaiting Approval</option>
                                            <option value="approved">Approved</option>
                                            <option value="paid">Paid</option>
                                        </select>
                                        <ChevronDown className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-[#F4F4F4]">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs uppercase tracking-wider">ID</th>
                                            <th className="px-6 py-3 text-left text-xs uppercase tracking-wider">Consultant</th>
                                            <th className="px-6 py-3 text-left text-xs uppercase tracking-wider">Amount</th>
                                            <th className="px-6 py-3 text-left text-xs uppercase tracking-wider">Status Flow</th>
                                            <th className="px-6 py-3 text-left text-xs uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredCommissions.slice(0, 10).map((commission) => (
                                            <tr key={commission.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{commission.id}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{commission.consultantName}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">S$ {commission.commissionAmount.toLocaleString()}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <StatusFlow currentStatus={commission.status} size="sm" />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <StatusActionButton
                                                        currentStatus={commission.status}
                                                        userRole="director"
                                                        onApprove={() => handleStatusUpdate(commission.id, 'approved')}
                                                        onReject={() => handleStatusUpdate(commission.id, 'rejected')}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );

            case 'reports':
                return (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl mb-4">Director Reports</h2>
                        <Button onClick={() => setActiveView('dashboard')}>Back to Dashboard</Button>
                    </div>
                );

            default:
                return <div>View not found</div>;
        }
    };

    if (loading) {
        return (
            <div className="w-full h-96 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
            </div>
        );
    }


    return (
        <div className="w-full">
            <h1 className="text-2xl font-bold tracking-tight mb-4">Director Dashboard</h1>
            {renderMainContent()}
        </div>
    );
}
