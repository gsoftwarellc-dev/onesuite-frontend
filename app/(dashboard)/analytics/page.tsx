"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import {
    TrendingUp,
    Users,
    DollarSign,
    Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { analyticsService, FinanceDashboardDTO } from '@/services/analyticsService';
import { RoleGuard } from '@/components/guards/RoleGuard';
import { LoadingSkeleton } from '@/components/loading-skeleton';

export default function AnalyticsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [year, setYear] = useState<string>(new Date().getFullYear().toString());

    // Analytics Page typically shows high-level company trends
    // We can reuse FinanceDashboard data which covers "Global" scope

    useEffect(() => {
        const loadAnalytics = async () => {
            try {
                setLoading(true);
                // Directors/Admins can see Finance Dashboard data (Company Wide)
                const data = await analyticsService.getFinanceDashboard(parseInt(year));
                setStats(data);
            } catch (error) {
                console.error('Failed to load analytics:', error);
                toast.error('Failed to load analytics data');
            } finally {
                setLoading(false);
            }
        };
        loadAnalytics();
    }, [year]);

    if (loading) return <div className="p-6"><LoadingSkeleton /></div>;
    if (!stats) return <div className="p-6 text-center">No data available</div>;

    const { summary, commission_trend, top_performers, reconciliation_status } = stats;

    const trendData = commission_trend.map((item: any) => ({
        month: item.month,
        amount: parseFloat(item.total)
    }));

    const pieData = [
        { name: 'Matched', value: reconciliation_status?.matched || 0, color: '#10B981' },
        { name: 'Pending', value: reconciliation_status?.pending || 0, color: '#F59E0B' },
        { name: 'Discrepancy', value: reconciliation_status?.discrepancy || 0, color: '#EF4444' },
    ].filter(d => d.value > 0);

    return (
        <RoleGuard allowedRoles={['director', 'admin']}>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Company Analytics</h1>
                        <p className="text-gray-500 text-sm">Comprehensive performance metrics.</p>
                    </div>
                    <select
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="bg-white border text-sm rounded-md h-9 px-3"
                    >
                        <option value="2024">2024</option>
                        <option value="2025">2025</option>
                        <option value="2026">2026</option>
                    </select>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-6 rounded-lg shadow border-t-4 border-blue-500">
                        <div className="text-sm text-gray-500 mb-1">Total Paid (YTD)</div>
                        <div className="text-2xl font-bold">S$ {parseFloat(summary.total_paid_ytd).toLocaleString()}</div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow border-t-4 border-green-500">
                        <div className="text-sm text-gray-500 mb-1">Success Rate</div>
                        <div className="text-2xl font-bold">{summary.payment_success_rate}</div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow border-t-4 border-purple-500">
                        <div className="text-sm text-gray-500 mb-1">Avg Cycle</div>
                        <div className="text-2xl font-bold">{summary.avg_cycle_days}</div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow border-t-4 border-orange-500">
                        <div className="text-sm text-gray-500 mb-1">Liability</div>
                        <div className="text-2xl font-bold">S$ {parseFloat(summary.outstanding_liability).toLocaleString()}</div>
                    </div>
                </div>

                {/* Main Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold mb-6">Revenue Trend</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value / 1000}k`} />
                                <Tooltip formatter={(val: number | string | Array<number | string>) => [
                                    typeof val === 'number' ? `S$ ${val.toLocaleString()}` : val,
                                    'Revenue'
                                ]} />
                                <Line type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold mb-6">Reconciliation Health</h2>
                        <div className="flex items-center justify-center h-[300px]">
                            {pieData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="text-gray-400">No data available</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </RoleGuard>
    );
}
