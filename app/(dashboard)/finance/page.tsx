"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
    CheckCircle,
    XCircle,
    Clock,
    DollarSign,
    CreditCard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusActionButton } from '@/components/dashboard/status-action-button';
import { commissionService, Commission, CommissionStatus } from '@/services/commissionService';

export default function FinanceDashboard() {
    const router = useRouter();
    const [activeView, setActiveView] = useState<'dashboard' | 'commissions' | 'payments' | 'users' | 'reports' | 'settings'>('dashboard');
    const [commissions, setCommissions] = useState<Commission[]>([]);
    const [stats, setStats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [monthlyPaymentData, setMonthlyPaymentData] = useState<any[]>([]);
    const [paymentStatusData, setPaymentStatusData] = useState<any[]>([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const fetchedCommissions = await commissionService.getCommissions(); // Finance sees all or based on permissions
                setCommissions(fetchedCommissions);

                // Calculate Stats
                const pendingCount = fetchedCommissions.filter(c => c.status === 'pending').length;
                const pendingValue = fetchedCommissions
                    .filter(c => c.status === 'pending')
                    .reduce((sum, c) => sum + c.commissionAmount, 0);

                const approvedUnpaidCount = fetchedCommissions.filter(c => c.status === 'approved').length;
                const approvedUnpaidValue = fetchedCommissions
                    .filter(c => c.status === 'approved')
                    .reduce((sum, c) => sum + c.commissionAmount, 0);

                const paidValue = fetchedCommissions
                    .filter(c => c.status === 'paid')
                    .reduce((sum, c) => sum + c.commissionAmount, 0);

                setStats([
                    {
                        icon: DollarSign,
                        label: 'Total Pending',
                        value: `S$${pendingValue.toLocaleString()}`,
                        subtext: `${pendingCount} commissions`,
                        color: 'bg-yellow-500',
                        trend: '+12%', // Mock trend for now
                    },
                    {
                        icon: CheckCircle,
                        label: 'Approved (Unpaid)',
                        value: `S$${approvedUnpaidValue.toLocaleString()}`,
                        subtext: `${approvedUnpaidCount} commissions`,
                        color: 'bg-blue-500',
                        trend: '+8%',
                    },
                    {
                        icon: CreditCard,
                        label: 'Total Paid',
                        value: `S$${paidValue.toLocaleString()}`,
                        subtext: 'All time',
                        color: 'bg-green-500',
                        trend: '+15%',
                    },
                ]);

                // Calculate Payment Status Distribution
                const statusCounts = {
                    Paid: fetchedCommissions.filter(c => c.status === 'paid').length,
                    Approved: fetchedCommissions.filter(c => c.status === 'approved').length,
                    Pending: fetchedCommissions.filter(c => c.status === 'pending').length,
                };

                setPaymentStatusData([
                    { name: 'Paid', value: statusCounts.Paid, color: '#10B981' },
                    { name: 'Approved', value: statusCounts.Approved, color: '#3B82F6' },
                    { name: 'Pending', value: statusCounts.Pending, color: '#F59E0B' },
                ].filter(d => d.value > 0));

                // Mock Monthly Data (Replace with real date aggregation later)
                setMonthlyPaymentData([
                    { month: 'Jul', paid: 195000, pending: 42000 },
                    { month: 'Aug', paid: 208000, pending: 38000 },
                    { month: 'Sep', paid: 198000, pending: 45000 },
                    { month: 'Oct', paid: 224000, pending: 52000 },
                    { month: 'Nov', paid: 218000, pending: 48000 },
                    { month: 'Dec', paid: 234500, pending: 125400 },
                ]);

            } catch (error) {
                console.error("Failed to load finance data:", error);
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

            // Refresh local state
            setCommissions(prev => prev.map(c =>
                c.id === id ? { ...c, status: newStatus } : c
            ));
        } catch (error) {
            toast.error(`Failed to update status to ${newStatus}`);
        }
    };

    const getStatusBadge = (status: CommissionStatus) => {
        const baseClasses = 'px-2.5 py-1 rounded-full text-xs inline-flex items-center gap-1';
        switch (status) {
            case 'pending':
                return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}><Clock className="w-3 h-3" /> Pending</span>;
            case 'approved':
            case 'authorized':
                return <span className={`${baseClasses} bg-blue-100 text-blue-800`}><CheckCircle className="w-3 h-3" /> Approved</span>;
            case 'paid':
                return <span className={`${baseClasses} bg-green-100 text-green-800`}><CreditCard className="w-3 h-3" /> Paid</span>;
            case 'rejected':
                return <span className={`${baseClasses} bg-red-100 text-red-800`}><XCircle className="w-3 h-3" /> Rejected</span>;
            default:
                return null;
        }
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
                                    <div className="text-sm text-gray-600 mb-1">{stat.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Charts Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Monthly Payment Trends */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl">Monthly Payment Trends</h2>
                                </div>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={monthlyPaymentData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis
                                            dataKey="month"
                                            stroke="#666"
                                            style={{ fontSize: '12px' }}
                                        />
                                        <YAxis
                                            stroke="#666"
                                            style={{ fontSize: '12px' }}
                                            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                                        />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="paid" stroke="#10B981" />
                                        <Line type="monotone" dataKey="pending" stroke="#F59E0B" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Payment Status Distribution */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-xl mb-6">Payment Status Distribution</h2>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={paymentStatusData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {paymentStatusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Detailed Table */}
                        <div className="bg-white rounded-lg shadow">
                            <div className="p-6 border-b border-gray-200 flex justify-between">
                                <h2 className="text-xl">Recent Commissions</h2>
                                <Button variant="ghost" className="text-red-500" onClick={() => setActiveView('commissions')}>View All</Button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-[#F4F4F4]">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs uppercase tracking-wider">ID</th>
                                            <th className="px-4 py-3 text-left text-xs uppercase tracking-wider">Consultant</th>
                                            <th className="px-4 py-3 text-left text-xs uppercase tracking-wider">Amount</th>
                                            <th className="px-4 py-3 text-left text-xs uppercase tracking-wider">Status</th>
                                            <th className="px-4 py-3 text-left text-xs uppercase tracking-wider">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {commissions.slice(0, 10).map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 whitespace-nowrap text-sm">{item.id}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm">{item.consultantName}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm">S${item.commissionAmount.toLocaleString()}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">{getStatusBadge(item.status)}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <StatusActionButton
                                                        currentStatus={item.status}
                                                        userRole="finance"
                                                        onAuthorize={() => handleStatusUpdate(item.id, 'authorized')}
                                                        onApprove={() => handleStatusUpdate(item.id, 'approved')}
                                                        onReject={() => handleStatusUpdate(item.id, 'rejected')}
                                                        onMarkPaid={() => handleStatusUpdate(item.id, 'paid')}
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

            case 'commissions':
                return (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl mb-4">Master Commission Table</h2>
                        <Button onClick={() => setActiveView('dashboard')}>Back to Dashboard</Button>
                        {/* Full table would go here */}
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
        <div className="w-full">
            <h1 className="text-2xl font-bold tracking-tight mb-4">Finance Dashboard</h1>
            {renderMainContent()}
        </div>
    );
}
