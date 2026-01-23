"use client";

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    CheckCircle,
    Clock,
    Users,
    TrendingUp,
    Search,
    Filter,
    ArrowUpRight,
    User,
    Upload,
    CheckSquare,
    FileText,
    ChevronDown,
    ArrowUpDown,
    MoreHorizontal,
    Calendar,
    XCircle,
    Check
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import { toast } from 'sonner';
import { LoadingSkeleton } from '@/components/loading-skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { commissionService, Commission } from '@/services/commissionService';
import { RoleGuard } from '@/components/guards/RoleGuard';

// --- Types & Mock Data ---

interface TeamMember {
    id: string;
    name: string;
    role: string;
    status: 'Active' | 'Inactive';
    totalSales: number;
    pendingCommissions: number;
}

const mockTeamMembers: TeamMember[] = [
    { id: '1', name: 'David Lee', role: 'Senior Consultant', status: 'Active', totalSales: 152000, pendingCommissions: 3 },
    { id: '2', name: 'Emily Zhang', role: 'Consultant', status: 'Active', totalSales: 98000, pendingCommissions: 5 },
    { id: '3', name: 'John Doe', role: 'Consultant', status: 'Active', totalSales: 87000, pendingCommissions: 2 },
    { id: '4', name: 'Sarah Wilson', role: 'Junior Consultant', status: 'Active', totalSales: 45000, pendingCommissions: 1 },
    { id: '5', name: 'Michael Brown', role: 'Consultant', status: 'Inactive', totalSales: 12000, pendingCommissions: 0 },
];

// --- Sub-Components ---

const DefaultDashboardView = ({
    commissions,
    handleReviewCommissions,
    handleManageTeam,
    handleViewReports,
    searchTerm, setSearchTerm,
    startDate, setStartDate,
    endDate, setEndDate,
    statusFilter, setStatusFilter,
    teamFilter, setTeamFilter,
    consultantFilter, setConsultantFilter,
    filtersRef
}: any) => {
    const router = useRouter();

    // Calculate real metrics from commission data
    const pendingCount = commissions.filter((c: Commission) => c.status === 'pending').length;
    const approvedThisMonth = commissions
        .filter((c: Commission) => {
            const isApproved = ['approved', 'authorized'].includes(c.status);
            const thisMonth = new Date(c.submittedDate).getMonth() === new Date().getMonth();
            return isApproved && thisMonth;
        })
        .reduce((sum: number, c: Commission) => sum + c.commissionAmount, 0);

    // Calculate team performance data from real commissions
    const consultantPerformance = commissions.reduce((acc: any, c: Commission) => {
        if (!acc[c.consultantName]) {
            acc[c.consultantName] = 0;
        }
        acc[c.consultantName] += c.commissionAmount;
        return acc;
    }, {});

    const teamPerformanceData = Object.entries(consultantPerformance)
        .map(([name, amount]) => ({ name, amount }))
        .sort((a: any, b: any) => b.amount - a.amount)
        .slice(0, 5); // Top 5 performers

    // Calculate pie chart data from real commission statuses
    const statusCounts = commissions.reduce((acc: any, c: Commission) => {
        if (c.status === 'pending') acc.pending++;
        else if (['approved', 'authorized'].includes(c.status)) acc.approved++;
        else if (c.status === 'rejected') acc.rejected++;
        return acc;
    }, { approved: 0, pending: 0, rejected: 0 });

    const total = statusCounts.approved + statusCounts.pending + statusCounts.rejected;
    const pieData = total > 0 ? [
        { name: 'Approved', value: Math.round((statusCounts.approved / total) * 100), color: '#10b981' },
        { name: 'Pending', value: Math.round((statusCounts.pending / total) * 100), color: '#f59e0b' },
        { name: 'Rejected', value: Math.round((statusCounts.rejected / total) * 100), color: '#ef4444' },
    ].filter(d => d.value > 0) : [];

    const StatsCard = ({ title, value, sub, icon: Icon, iconColorClass }: any) => (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col justify-between h-full">
            <div className={`w-10 h-10 rounded-lg ${iconColorClass} flex items-center justify-center mb-4 text-white`}>
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
                <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                <p className="text-xs text-gray-400">{sub}</p>
            </div>
        </div>
    );

    // Filter Logic for Dashboard Table
    const filteredCommissions = commissions.filter((c: Commission) => {
        const matchesSearch =
            c.consultantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.clientName?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'All Status' ||
            (statusFilter === 'Pending' && c.status === 'pending') ||
            (statusFilter === 'Approved' && ['approved', 'authorized'].includes(c.status)) ||
            (statusFilter === 'Paid' && c.status === 'paid');

        const matchesTeam = teamFilter === 'All Teams';
        const matchesConsultant = consultantFilter === 'All Consultants' || c.consultantName === consultantFilter;

        let matchesDate = true;
        if (startDate || endDate) {
            const commDate = new Date(c.paymentDate || c.submittedDate).getTime();
            const start = startDate ? new Date(startDate).getTime() : 0;
            const end = endDate ? new Date(endDate).getTime() : Infinity;
            matchesDate = commDate >= start && commDate <= end;
        }

        return matchesSearch && matchesStatus && matchesTeam && matchesConsultant && matchesDate;
    });


    return (
        <div className="space-y-8 pb-10">
            {/* 1. Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Pending Review"
                    value={pendingCount}
                    sub="Requires your attention"
                    icon={Clock}
                    iconColorClass="bg-yellow-500"
                />
                <StatsCard
                    title="Approved This Month"
                    value={`S$${approvedThisMonth.toLocaleString()}`}
                    sub="Current month"
                    icon={CheckCircle}
                    iconColorClass="bg-green-500"
                />
                <StatsCard
                    title="Total Commissions"
                    value={commissions.length}
                    sub="All time"
                    icon={Users}
                    iconColorClass="bg-blue-500"
                />
                <StatsCard
                    title="Approval Rate"
                    value={total > 0 ? `${Math.round((statusCounts.approved / total) * 100)}%` : '0%'}
                    sub="Approved vs Total"
                    icon={TrendingUp}
                    iconColorClass="bg-purple-500"
                />
            </div>

            {/* 2. Quick Actions */}
            <div className="space-y-2">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="flex flex-col md:flex-row gap-4">
                    <Button className="bg-[#F4323D] hover:bg-[#d62d37] text-white flex-1 h-12 shadow-sm" onClick={() => router.push('/submit-commission')}>
                        <Upload className="w-4 h-4 mr-2" /> Submit Commission
                    </Button>
                    <Button variant="outline" className="flex-1 h-12 bg-white border-gray-200 text-gray-700 shadow-sm hover:bg-gray-50 hover:text-gray-900" onClick={handleReviewCommissions}>
                        <CheckSquare className="w-4 h-4 mr-2" /> Review Commissions
                    </Button>
                    <Button variant="outline" className="flex-1 h-12 bg-white border-gray-200 text-gray-700 shadow-sm hover:bg-gray-50 hover:text-gray-900" onClick={handleManageTeam}>
                        <Users className="w-4 h-4 mr-2" /> Manage Team
                    </Button>
                    <Button variant="outline" className="flex-1 h-12 bg-white border-gray-200 text-gray-700 shadow-sm hover:bg-gray-50 hover:text-gray-900" onClick={handleViewReports}>
                        <FileText className="w-4 h-4 mr-2" /> View Reports
                    </Button>
                </div>
            </div>

            {/* 3. Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-6">Team Performance</h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={teamPerformanceData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} interval={0} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={(val) => `$${val / 1000}k`} />
                                <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="amount" fill="#F4323D" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col">
                    <h3 className="font-bold text-gray-900 mb-6">Commission Status Distribution</h3>
                    <div className="flex-1 flex items-center justify-center relative min-h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={0} outerRadius={100} paddingAngle={0} dataKey="value">
                                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} stroke="white" strokeWidth={2} />)}
                                </Pie>
                                <Legend layout="vertical" verticalAlign="middle" align="right" iconType="circle" formatter={(value, entry: any) => <span className="text-gray-600 font-medium ml-2">{value} {entry.payload.value}%</span>} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* 4. Commission Overview Table Section */}
            <div ref={filtersRef} className="bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900">Commission Overview</h3>
                    <span className="text-sm text-gray-500">Showing {filteredCommissions.length} of {commissions.length} commissions</span>
                </div>

                <div className="p-6 flex flex-col xl:flex-row gap-4 flex-wrap">
                    {/* Search & Filters (Same as before) -- Duplicated for brevity, could be extracted */}
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input placeholder="Search..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-2 xl:pb-0 items-center">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 font-medium whitespace-nowrap hidden md:block">Date:</span>
                            <input type="date" className="h-10 px-3 rounded-md border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#F4323D] text-gray-600" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                            <span className="text-gray-400">-</span>
                            <input type="date" className="h-10 px-3 rounded-md border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#F4323D] text-gray-600" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                        </div>
                        <div className="relative min-w-[140px]">
                            <select className="w-full h-10 pl-9 pr-8 rounded-md border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-[#F4323D] appearance-none cursor-pointer" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                <option>All Status</option><option>Pending</option><option>Approved</option><option>Paid</option>
                            </select>
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                        {/* ... Other filters ... */}
                        <div className="relative min-w-[160px]">
                            <select className="w-full h-10 pl-9 pr-8 rounded-md border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-[#F4323D] appearance-none cursor-pointer" value={consultantFilter} onChange={(e) => setConsultantFilter(e.target.value)}>
                                <option>All Consultants</option>
                                {consultantOptions && consultantOptions.map((name: string) => (
                                    <option key={name} value={name}>{name}</option>
                                ))}
                            </select>
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50/50 text-xs font-bold text-gray-500 uppercase border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Date</th><th className="px-6 py-4">Consultant Name</th><th className="px-6 py-4">Product Type</th><th className="px-6 py-4">Gross Revenue</th><th className="px-6 py-4">SFA %</th><th className="px-6 py-4">Tiering %</th><th className="px-6 py-4">Overriding %</th><th className="px-6 py-4">Commission</th><th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredCommissions.map((commission: any) => (
                                <tr key={commission.id} className="hover:bg-gray-50/50 transition-colors bg-white">
                                    <td className="px-6 py-4 font-medium text-gray-900">{commission.paymentDate || new Date(commission.submittedDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div><div className="font-bold text-gray-900">{commission.consultantName}</div><div className="text-xs text-gray-500">COM-{commission.id}</div></div>
                                            {commission.productType === 'Override' && <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-1.5 py-0.5 rounded">Override</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{commission.productType}</td>
                                    <td className="px-6 py-4 text-gray-900">S$ {commission.grossRevenue.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-gray-600">{commission.sfaPercentage || 10}%</td>
                                    <td className="px-6 py-4 text-gray-600">{commission.tieringPercentage || 15}%</td>
                                    <td className="px-6 py-4 text-purple-600 font-medium">{commission.overridingPercentage || 3}%</td>
                                    <td className="px-6 py-4 font-bold text-gray-900">S$ {commission.commissionAmount.toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${['paid'].includes(commission.status) ? 'bg-blue-50 text-blue-700 border-blue-100' : ['approved', 'authorized'].includes(commission.status) ? 'bg-green-50 text-green-700 border-green-100' : 'bg-yellow-50 text-yellow-700 border-yellow-100'}`}>
                                            {commission.status.charAt(0).toUpperCase() + commission.status.slice(1)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {filteredCommissions.length === 0 && <tr><td colSpan={9} className="px-6 py-8 text-center text-gray-500">No commissions found.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const TeamView = () => {
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadTeam = async () => {
            try {
                const data = await commissionService.getTeamCommissions();
                // Map backend response to TeamMember interface
                // Backend format: { consultant: { id, username, email }, total_sales, commission_earned, pending_count }
                const mappedMembers = data.map((item: any) => ({
                    id: item.consultant.id.toString(),
                    name: item.consultant.username,
                    role: 'Consultant', // Default role
                    status: 'Active', // Assume active if returned
                    totalSales: parseFloat(item.total_sales || '0'),
                    pendingCommissions: item.pending_count || 0
                }));
                setTeamMembers(mappedMembers);
            } catch (error) {
                console.error('Failed to load team data:', error);
                toast.error('Failed to load team data');
            } finally {
                setLoading(false);
            }
        };
        loadTeam();
    }, []);

    if (loading) return <LoadingSkeleton />;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Team Management</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50/50 text-xs font-bold text-gray-500 uppercase border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Total Sales (YTD)</th>
                            <th className="px-6 py-4">Pending Commissions</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {teamMembers.length > 0 ? (
                            teamMembers.map((member) => (
                                <tr key={member.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{member.name}</td>
                                    <td className="px-6 py-4 text-gray-600">{member.role}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${member.status === 'Active' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                                            {member.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-900 font-medium">S$ {member.totalSales.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-gray-600">{member.pendingCommissions}</td>
                                    <td className="px-6 py-4 text-right">
                                        <Button variant="ghost" size="sm" className="h-8 text-gray-500" onClick={() => toast.info(`Viewing profile: ${member.name}`)}>
                                            View Profile
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                    No team members found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const ApprovalsView = ({ commissions, onRefresh }: { commissions: Commission[], onRefresh: () => void }) => {
    const [loading, setLoading] = useState<string | null>(null);
    // Check Status Logic: Pending commissions
    const pendingCommissions = commissions.filter(c => c.status === 'pending');

    const handleApprove = async (id: string) => {
        setLoading(id);
        try {
            await commissionService.approveCommission(id);
            toast.success(`Commission COM-${id} Approved`, {
                description: 'Notification sent to consultant.'
            });
            // Refresh the list
            onRefresh();
        } catch (error: any) {
            console.error('Failed to approve commission:', error);
            toast.error('Failed to approve commission', {
                description: error.response?.data?.message || 'Please try again'
            });
        } finally {
            setLoading(null);
        }
    };

    const handleReject = async (id: string) => {
        // For now, use a simple reason. Later can add modal for custom reason
        const reason = prompt('Enter rejection reason:');
        if (!reason) {
            toast.info('Rejection cancelled');
            return;
        }

        setLoading(id);
        try {
            await commissionService.rejectCommission(id, reason);
            toast.error(`Commission COM-${id} Rejected`, {
                description: `Reason: ${reason}`
            });
            // Refresh the list
            onRefresh();
        } catch (error: any) {
            console.error('Failed to reject commission:', error);
            toast.error('Failed to reject commission', {
                description: error.response?.data?.message || 'Please try again'
            });
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Pending Approvals</h2>
                <span className="bg-yellow-100 text-yellow-800 text-sm font-bold px-3 py-1 rounded-full">
                    {pendingCommissions.length} Pending
                </span>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50/50 text-xs font-bold text-gray-500 uppercase border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Consultant</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">Product</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {pendingCommissions.length > 0 ? (
                            pendingCommissions.map((commission) => (
                                <tr key={commission.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 text-gray-900">{new Date(commission.submittedDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 font-bold text-gray-900">{commission.consultantName}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900">S$ {commission.commissionAmount.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-gray-600">{commission.productType}</td>
                                    <td className="px-6 py-4">
                                        <span className="bg-yellow-50 text-yellow-700 border border-yellow-100 px-2.5 py-1 rounded-full text-xs font-bold">
                                            Pending
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 flex justify-center gap-2">
                                        <Button
                                            size="sm"
                                            className="bg-green-600 hover:bg-green-700 text-white h-8 w-8 p-0 rounded-full shadow-sm"
                                            onClick={() => handleApprove(commission.id)}
                                            title="Approve"
                                        >
                                            <Check className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            className="h-8 w-8 p-0 rounded-full shadow-sm"
                                            onClick={() => handleReject(commission.id)}
                                            title="Reject"
                                        >
                                            <XCircle className="w-4 h-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                    <CheckCircle className="w-12 h-12 mx-auto text-green-100 mb-3" />
                                    <p className="text-lg font-medium text-gray-900">All caught up!</p>
                                    <p className="text-sm">No pending commissions to review.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// --- Main Container ---

function ManagerDashboardContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const viewParam = searchParams.get('view');
    const filtersRef = useRef<HTMLDivElement>(null);

    const [commissions, setCommissions] = useState<Commission[]>([]);
    const [loading, setLoading] = useState(true);

    // Default filters state (can be lifted more if needed)
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [teamFilter, setTeamFilter] = useState('All Teams');
    const [consultantFilter, setConsultantFilter] = useState('All Consultants');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const [consultantOptions, setConsultantOptions] = useState<string[]>([]);

    useEffect(() => {
        loadCommissions();
        loadTeamOptions();
    }, []);

    const loadTeamOptions = async () => {
        try {
            const teamData = await commissionService.getTeamCommissions();
            // Extract unique consultant names
            if (Array.isArray(teamData)) {
                // Determine structure: Backend returns results: [{ consultant: { username: ... } }] 
                // but service now might unwrap it. Safe check:
                const names = teamData
                    .map((m: any) => m.consultant?.username)
                    .filter(Boolean); // Remove null/undefined
                setConsultantOptions(Array.from(new Set(names))); // Unique
            }
        } catch (error) {
            console.error('Failed to load team options', error);
        }
    };

    // Helper function to load/refresh commissions
    const loadCommissions = async () => {
        try {
            // Fetch ALL status ('all') so metrics include approved/paid commissions
            const data = await commissionService.getPendingApprovals('all');
            setCommissions(data);
        } catch (error) {
            console.error('Failed to load manager dashboard:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    // Helper functions for Dashboard Quick Actions
    const handleReviewCommissions = () => {
        // Option 1: Scroll to table in dashboard view
        // setStatusFilter('Pending');
        // filtersRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Option 2: Navigate to dedicated view (Chosen)
        router.push('/manager?view=review');
    };

    const handleManageTeam = () => {
        router.push('/manager?view=team');
    };

    const handleViewReports = () => {
        setStartDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
        setEndDate(new Date().toISOString().split('T')[0]);
        filtersRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        toast.success("Date range set to this month");
    };


    if (loading) return <div className="p-6"><LoadingSkeleton /></div>;

    // Render Logic based on 'view' param
    if (viewParam === 'team') {
        return <TeamView />;
    }

    if (viewParam === 'review') {
        return <ApprovalsView commissions={commissions} onRefresh={loadCommissions} />;
    }

    return (
        <DefaultDashboardView
            commissions={commissions}
            handleReviewCommissions={handleReviewCommissions}
            handleManageTeam={handleManageTeam}
            handleViewReports={handleViewReports}
            searchTerm={searchTerm} setSearchTerm={setSearchTerm}
            startDate={startDate} setStartDate={setStartDate}
            endDate={endDate} setEndDate={setEndDate}
            statusFilter={statusFilter} setStatusFilter={setStatusFilter}
            teamFilter={teamFilter} setTeamFilter={setTeamFilter}
            consultantFilter={consultantFilter} setConsultantFilter={setConsultantFilter}
            consultantOptions={consultantOptions}
            filtersRef={filtersRef}
        />
    );
}

export default function ManagerDashboard() {
    return (
        <RoleGuard allowedRoles={['manager']}>
            <Suspense fallback={<LoadingSkeleton />}>
                <ManagerDashboardContent />
            </Suspense>
        </RoleGuard>
    );
}
