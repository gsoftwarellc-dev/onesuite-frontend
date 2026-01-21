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
import { analyticsService, ConsultantDashboardDTO } from '@/services/analyticsService';
import { RoleGuard } from '@/components/guards/RoleGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar } from 'recharts';

export default function ConsultantDashboard() {
    const router = useRouter();
    const [dashboardData, setDashboardData] = useState<ConsultantDashboardDTO | null>(null);
    const [loading, setLoading] = useState(true);
    // Keep user state for welcome message if needed, or get from context/auth
    // Assuming RoleGuard handles auth check, but we might want user name. 
    // For now we'll focus on dashboard data.

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const data = await analyticsService.getConsultantDashboard();
                setDashboardData(data);
            } catch (error) {
                console.error('Failed to load dashboard:', error);
                toast.error('Failed to load analytics. Showing default view.');
                // Provide fallback empty data so the page still renders
                setDashboardData({
                    summary: {
                        total_paid_ytd: '0.00',
                        pending_amount: '0.00',
                        w9_status: 'Not Submitted',
                        tax_docs_count: 0
                    },
                    earnings_trend: [],
                    recent_payouts: [],
                    computed_at: new Date().toISOString()
                });
            } finally {
                setLoading(false);
            }
        };
        loadDashboard();
    }, []);

    const chartData = dashboardData?.earnings_trend.map(item => ({
        name: item.month,
        amount: parseFloat(item.total)
    })) || [];

    if (loading) return <div className="p-6"><LoadingSkeleton /></div>;
    if (!dashboardData) return null;

    const { summary, recent_payouts } = dashboardData;

    return (
        <RoleGuard allowedRoles={['consultant']}>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Consultant Dashboard</h1>
                    <p className="text-gray-600 mt-2">Your performance overview</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Earnings (YTD)</CardTitle>
                            <DollarSign className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">S$ {parseFloat(summary.total_paid_ytd).toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Paid out this year</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Earnings</CardTitle>
                            <Clock className="h-4 w-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">S$ {parseFloat(summary.pending_amount).toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Awaiting approval/payment</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">W-9 Status</CardTitle>
                            <FileText className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.w9_status || 'N/A'}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Tax Documents</CardTitle>
                            {/* AlertCircle replaced with FileText for consistency if AlertCircle not imported, but kept per previous plan */}
                            <FileText className="h-4 w-4 text-gray-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.tax_docs_count}</div>
                            <p className="text-xs text-muted-foreground">Available for download</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Button
                            onClick={() => router.push('/submit-commission')}
                            className="bg-gradient-to-r from-[#F4323D] to-[#ff5a65] text-white h-auto py-4 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                        >
                            <Upload className="w-5 h-5" />
                            <span>Submit New Commission</span>
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.push('/payslips')}
                            className="h-auto py-4 hover:bg-gray-50 flex items-center justify-center gap-2"
                        >
                            <Download className="w-5 h-5" />
                            <span>Download Payslip</span>
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.push('/history')}
                            className="h-auto py-4 hover:bg-gray-50 flex items-center justify-center gap-2"
                        >
                            <History className="w-5 h-5" />
                            <span>View History</span>
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Chart */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-4">Earnings History</h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `$${value}`}
                                    />
                                    <Tooltip
                                        formatter={(value: number | undefined) => [`S$ ${(value || 0).toLocaleString()}`, 'Earnings']}
                                        cursor={{ fill: 'transparent' }}
                                    />
                                    <Bar dataKey="amount" fill="#10B981" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                            {chartData.length === 0 && <div className="text-center text-gray-500 mt-[-150px]">No earnings data available</div>}
                        </div>
                    </div>

                    {/* Recent Payouts */}
                    <Card className="col-span-1 border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle>Recent Payouts</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recent_payouts.map((payout, i) => (
                                    <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                        <div>
                                            <p className="font-medium">S$ {parseFloat(payout.amount).toLocaleString()}</p>
                                            <p className="text-xs text-gray-500">{payout.date || 'Processing'}</p>
                                        </div>
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${payout.status === 'PAID'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {payout.status}
                                        </span>
                                    </div>
                                ))}
                                {recent_payouts.length === 0 && (
                                    <p className="text-sm text-gray-500 text-center">No recent payouts</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </RoleGuard>
    );
}
