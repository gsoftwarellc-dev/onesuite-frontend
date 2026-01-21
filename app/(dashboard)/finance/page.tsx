"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { RoleGuard } from '@/components/guards/RoleGuard';
import { analyticsService, FinanceDashboardDTO } from '@/services/analyticsService';
import { LoadingSkeleton } from '@/components/loading-skeleton';

export default function FinanceDashboard() {
    const router = useRouter();
    const [dashboardData, setDashboardData] = useState<FinanceDashboardDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [year, setYear] = useState<string>(new Date().getFullYear().toString());

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                setLoading(true);
                const data = await analyticsService.getFinanceDashboard(parseInt(year));
                setDashboardData(data);
            } catch (error) {
                console.error('Failed to load finance dashboard:', error);
                toast.error('Failed to load analytics');
            } finally {
                setLoading(false);
            }
        };
        loadDashboard();
    }, [year]);

    if (loading) return <div className="p-6"><LoadingSkeleton /></div>;
    if (!dashboardData) return null;

    const { summary, commission_trend, top_performers, reconciliation_status } = dashboardData;

    const trendData = commission_trend.map(item => ({
        month: item.month,
        amount: parseFloat(item.total)
    }));

    const pieData = [
        { name: 'Matched', value: reconciliation_status.matched, color: '#10B981' },
        { name: 'Pending', value: reconciliation_status.pending, color: '#F59E0B' },
        { name: 'Discrepancy', value: reconciliation_status.discrepancy, color: '#EF4444' },
    ].filter(d => d.value > 0);

    return (
        <RoleGuard allowedRoles={['finance', 'admin']}>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold tracking-tight">Finance Dashboard</h1>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Year:</span>
                        <select
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            className="bg-white border text-sm rounded-md h-9 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="2024">2024</option>
                            <option value="2025">2025</option>
                            <option value="2026">2026</option>
                        </select>
                    </div>
                </div>

                {/* Payout Management Call-to-Action */}
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500 mb-6 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Payout Management</h3>
                        <p className="text-gray-600 text-sm">Create, lock, and release commission payout batches.</p>
                    </div>
                    <Button onClick={() => router.push('/finance/payouts')} className="bg-blue-600 hover:bg-blue-700">
                        Manage Payout Batches
                    </Button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="text-sm text-gray-500 mb-1">Total Paid ({year})</div>
                        <div className="text-2xl font-bold">S$ {parseFloat(summary.total_paid_ytd).toLocaleString()}</div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="text-sm text-gray-500 mb-1">Outstanding Liability</div>
                        <div className="text-2xl font-bold text-orange-600">S$ {parseFloat(summary.outstanding_liability).toLocaleString()}</div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="text-sm text-gray-500 mb-1">Payment Success Rate</div>
                        <div className="text-2xl font-bold text-green-600">{summary.payment_success_rate}</div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="text-sm text-gray-500 mb-1">Avg Cycle Days</div>
                        <div className="text-2xl font-bold">{summary.avg_cycle_days}</div>
                    </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Monthly Trend */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl">Commission Trends</h2>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="month" stroke="#666" fontSize={12} />
                                <YAxis stroke="#666" fontSize={12} tickFormatter={val => `$${val / 1000}k`} />
                                <Tooltip formatter={(val: number | undefined) => [`S$ ${(val || 0).toLocaleString()}`, 'Total']} />
                                <Legend />
                                <Line type="monotone" dataKey="amount" name="Commission Amt" stroke="#10B981" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Reconciliation Status */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl mb-6">Reconciliation Status</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        {pieData.length === 0 && <div className="text-center text-gray-500 mt-4">No reconciliation data</div>}
                    </div>
                </div>

                {/* Top Performers */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl mb-4">Top Performers (Global)</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {top_performers.map((p, i) => (
                            <div key={i} className="flex items-center justify-between border-b pb-2">
                                <span className="font-medium text-gray-900">#{p.rank} {p.name}</span>
                                <span className="font-bold text-gray-600">S$ {parseFloat(p.total).toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </RoleGuard>
    );
}
