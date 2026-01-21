"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import {
    Users,
    CheckCircle,
    Clock,
    Search,
    ChevronDown,
    BarChart3,
    Upload,
    Filter,
    ArrowUp,
    ArrowDown,
    XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { analyticsService, ManagerDashboardDTO } from '@/services/analyticsService';
import { Input } from '@/components/ui/input';
import { commissionService, Commission, CommissionStatus } from '@/services/commissionService';
import { userService, User as UserType } from '@/services/userService';
import { RoleGuard } from '@/components/guards/RoleGuard';
import { StatusActionButton } from '@/components/dashboard/status-action-button';

export default function ManagerDashboard() {
    const router = useRouter();
    const [activeView, setActiveView] = useState<'dashboard' | 'review' | 'team' | 'reports'>('dashboard');
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [sortBy, setSortBy] = useState<'name-asc' | 'name-desc' | 'amount-desc'>('name-asc');
    const [searchQuery, setSearchQuery] = useState('');
    const [commissions, setCommissions] = useState<Commission[]>([]);
    const [teamMembers, setTeamMembers] = useState<UserType[]>([]);
    const [stats, setStats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const statusDistribution = [
        { name: 'Pending', value: commissions.filter(c => c.status === 'pending').length, color: '#F59E0B' },
        { name: 'Approved', value: commissions.filter(c => c.status === 'approved').length, color: '#10B981' },
        { name: 'Rejected', value: commissions.filter(c => c.status === 'rejected').length, color: '#EF4444' },
    ];

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);

                // 1. Analytics for KPIs (Source of Truth)
                const analytics = await analyticsService.getManagerDashboard();

                // 2. Operational Data for Table
                const fetchedCommissions = await commissionService.getCommissions();
                setCommissions(fetchedCommissions);

                // 3. Team Data
                const members = await userService.getTeamMembers();
                setTeamMembers(members);

                // Map Analytics to Stats
                setStats([
                    {
                        icon: Clock,
                        label: 'Pending Review',
                        value: analytics.summary.pending_approvals.toString(),
                        subtext: 'Requires your attention',
                        color: 'bg-yellow-500',
                    },
                    {
                        icon: CheckCircle,
                        label: 'Team Total (YTD)',
                        value: `S$${parseFloat(analytics.summary.team_total_ytd).toLocaleString()}`,
                        subtext: `From ${analytics.summary.team_size} members`,
                        color: 'bg-green-500',
                    },
                    {
                        icon: Users,
                        label: 'Team Size',
                        value: analytics.summary.team_size.toString(),
                        subtext: 'Active Consultants',
                        color: 'bg-blue-500',
                    }
                ]);

            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
                toast.error("Failed to load dashboard data.");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Filter and sort commissions
    const getFilteredCommissions = () => {
        const filtered = commissions.filter(commission => {
            const matchesStatus = selectedFilter === 'all' || commission.status === selectedFilter;
            const matchesConsultant = true; // consultantFilter === 'all' || commission.consultantName === consultantFilter;
            const matchesSearch =
                commission.consultantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                commission.productType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                commission.id.toLowerCase().includes(searchQuery.toLowerCase());

            return matchesStatus && matchesSearch && matchesConsultant;
        });

        // Sort
        if (sortBy === 'name-asc') {
            filtered.sort((a, b) => a.consultantName.localeCompare(b.consultantName));
        } else if (sortBy === 'name-desc') {
            filtered.sort((a, b) => b.consultantName.localeCompare(a.consultantName));
        } else if (sortBy === 'amount-desc') {
            filtered.sort((a, b) => b.commissionAmount - a.commissionAmount);
        }

        return filtered;
    };

    const handleStatusUpdate = async (id: string, newStatus: CommissionStatus) => {
        try {
            await commissionService.updateStatus(id, newStatus);
            toast.success(`Commission ${newStatus} successfully`);

            // Refresh local state
            setCommissions(prev => prev.map(c =>
                c.id === id ? { ...c, status: newStatus } : c
            ));
        } catch (error) {
            console.error("Failed to update status:", error);
            toast.error(`Failed to update status to ${newStatus}`);
        }
    };

    const filteredCommissions = getFilteredCommissions();

    const getStatusBadge = (status: CommissionStatus) => {
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

    const toggleSort = () => {
        setSortBy(current => current === 'name-asc' ? 'name-desc' : 'name-asc');
    };

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

                        {/* Quick Actions */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl mb-4">Quick Actions</h2>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <button
                                    onClick={() => router.push('/submit-commission')}
                                    className="bg-[#F4323D] text-white px-6 py-4 rounded-lg hover:bg-[#d62d37] transition-colors flex items-center justify-center gap-2"
                                >
                                    <Upload className="w-5 h-5" />
                                    <span>Submit Commission</span>
                                </button>
                                <button
                                    onClick={() => setActiveView('review')}
                                    className="bg-white border-2 border-gray-300 text-gray-700 px-6 py-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    <CheckCircle className="w-5 h-5" />
                                    <span>Review Commissions</span>
                                </button>
                                <button
                                    onClick={() => setActiveView('team')}
                                    className="bg-white border-2 border-gray-300 text-gray-700 px-6 py-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Users className="w-5 h-5" />
                                    <span>Manage Team</span>
                                </button>
                                <button
                                    onClick={() => setActiveView('reports')}
                                    className="bg-white border-2 border-gray-300 text-gray-700 px-6 py-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    <BarChart3 className="w-5 h-5" />
                                    <span>View Reports</span>
                                </button>
                            </div>
                        </div>

                        {/* Charts Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Team Performance Chart Placeholders */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-xl mb-6">Team Performance</h2>
                                <div className="h-[300px] flex items-center justify-center bg-gray-50 text-gray-400">
                                    Chart Data Loading...
                                </div>
                            </div>

                            {/* Status Distribution */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-xl mb-6">Commission Status Distribution</h2>
                                <div className="flex items-center justify-center">
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={statusDistribution}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={100}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {statusDistribution.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Commission Table */}
                        <div className="bg-white rounded-lg shadow">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl">Commission Overview</h2>
                                    <div className="text-sm text-gray-600">
                                        Showing {filteredCommissions.length} of {commissions.length} commissions
                                    </div>
                                </div>

                                {/* Filters */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                                    <div className="relative">
                                        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <Input
                                            type="text"
                                            placeholder="Search..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>

                                    <div className="relative">
                                        <Filter className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <select
                                            value={selectedFilter}
                                            onChange={(e) => setSelectedFilter(e.target.value)}
                                            className="w-full pl-10 pr-10 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background appearance-none"
                                        >
                                            <option value="all">All Status</option>
                                            <option value="pending">Pending</option>
                                            <option value="approved">Approved</option>
                                            <option value="paid">Paid</option>
                                            <option value="rejected">Rejected</option>
                                        </select>
                                        <ChevronDown className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    </div>
                                    <button
                                        onClick={toggleSort}
                                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm"
                                    >
                                        {sortBy === 'name-asc' ? (
                                            <>
                                                <ArrowUp className="w-4 h-4" />
                                                <span>A–Z</span>
                                            </>
                                        ) : (
                                            <>
                                                <ArrowDown className="w-4 h-4" />
                                                <span>Z–A</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-[#F4F4F4]">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Consultant Name</th>
                                            <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Product Type</th>
                                            <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Gross Revenue</th>
                                            <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Commission</th>
                                            <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredCommissions.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                                                    No commissions found.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredCommissions.slice(0, 10).map((commission) => (
                                                <tr key={commission.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {commission.paymentDate}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-2">
                                                            <div>
                                                                <div className="text-sm text-gray-900">{commission.consultantName}</div>
                                                                <div className="text-xs text-gray-500">{commission.consultantId}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                        {commission.productType}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        S$ {commission.grossRevenue.toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        S$ {commission.commissionAmount.toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {getStatusBadge(commission.status)}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );

            case 'team':
                return (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-2xl mb-6">Team Management</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {teamMembers.map((member) => (
                                <div key={member.id} className="border border-gray-200 rounded-lg p-4 hover:border-[#F4323D] transition-colors">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 bg-[#F4323D] rounded-full flex items-center justify-center text-white">
                                            {member.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="mb-1">{member.name}</h3>
                                            <p className="text-sm text-gray-600">{member.role}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Email:</span>
                                            <span className="font-medium">{member.email}</span>
                                        </div>
                                        {member.contactNumber && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Contact:</span>
                                                <span className="font-medium">{member.contactNumber}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4">
                            <Button variant="outline" onClick={() => setActiveView('dashboard')}>Back to Dashboard</Button>
                        </div>
                    </div>
                );

            case 'review':
                const pendingCommissions = commissions.filter(c => c.status === 'pending');

                return (
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold">Review Pending Commissions</h2>
                            <Button variant="outline" onClick={() => setActiveView('dashboard')}>Back to Dashboard</Button>
                        </div>

                        {pendingCommissions.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500 opacity-50" />
                                <p>All caught up! No pending commissions to review.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-[#F4F4F4]">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Consultant</th>
                                            <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Client / Product</th>
                                            <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Amount</th>
                                            <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {pendingCommissions.map((commission) => (
                                            <tr key={commission.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {commission.paymentDate}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{commission.consultantName}</div>
                                                    <div className="text-xs text-gray-500">{commission.consultantId}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{commission.clientName}</div>
                                                    <div className="text-xs text-gray-500">{commission.productType}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    S$ {commission.commissionAmount.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <StatusActionButton
                                                        currentStatus={commission.status}
                                                        userRole="manager"
                                                        onAuthorize={() => handleStatusUpdate(commission.id, 'authorized')}
                                                        onReject={() => handleStatusUpdate(commission.id, 'rejected')}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                );

            case 'reports':
                return (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl mb-4 text-center">Section under development</h2>
                        <Button onClick={() => setActiveView('dashboard')}>Back to Dashboard</Button>
                    </div>
                )
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
        <RoleGuard allowedRoles={['manager', 'admin']}>
            <div className="w-full">
                <h1 className="text-2xl font-bold tracking-tight mb-4">Manager Dashboard</h1>
                {renderMainContent()}
            </div>
        </RoleGuard>
    );
}
