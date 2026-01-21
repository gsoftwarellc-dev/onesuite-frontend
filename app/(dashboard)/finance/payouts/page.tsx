"use client";

import { useState, useEffect } from 'react';
import {
    Plus, Lock, Send, AlertCircle, FileText, CheckCircle, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { payoutService, PayoutBatch } from '@/services/payoutService';
import { LoadingSkeleton } from '@/components/loading-skeleton';
import { toast } from 'sonner';

export default function FinancePayoutsPage() {
    const [batches, setBatches] = useState<PayoutBatch[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Create Modal State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newBatchData, setNewBatchData] = useState({ period_id: '', run_date: '', notes: '' });

    const loadBatches = async () => {
        setIsLoading(true);
        try {
            const data = await payoutService.getBatches();
            setBatches(data);
        } catch (error) {
            console.error('Failed to load batches:', error);
            toast.error('Failed to load payout batches');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadBatches();
    }, []);

    const handleCreateBatch = async () => {
        try {
            if (!newBatchData.period_id) {
                toast.error("Period ID is required (Enter manually for now)");
                return;
            }
            await payoutService.createBatch({
                period_id: parseInt(newBatchData.period_id),
                run_date: newBatchData.run_date || undefined,
                notes: newBatchData.notes
            });
            toast.success("Batch created successfully");
            setIsCreateOpen(false);
            loadBatches();
        } catch (error: any) {
            toast.error(error.response?.data?.detail || "Failed to create batch");
        }
    };

    const handleLock = async (id: number) => {
        if (!confirm("Are you sure you want to LOCK this batch? No more changes will be allowed.")) return;
        try {
            await payoutService.lockBatch(id);
            toast.success("Batch locked successfully");
            loadBatches(); // Refresh status
        } catch (error: any) {
            toast.error(error.response?.data?.detail || "Failed to lock batch");
        }
    };

    const handleRelease = async (id: number) => {
        if (!confirm("Are you sure you want to RELEASE (PAY) this batch? This will mark all payouts as PAID.")) return;
        try {
            await payoutService.releaseBatch(id);
            toast.success("Batch released and paid successfully");
            loadBatches();
        } catch (error: any) {
            toast.error(error.response?.data?.detail || "Failed to release batch");
        }
    };

    if (isLoading && batches.length === 0) return <div className="p-6"><LoadingSkeleton /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Payout Management</h1>
                    <p className="text-gray-600 mt-2">Manage payout runs and batches</p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)} className="bg-[#F4323D] hover:bg-[#d62d37]">
                    <Plus className="w-4 h-4 mr-2" />
                    New Payout Run
                </Button>
            </div>

            {/* Batches Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Reference</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Period</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Run Date</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">Payouts / Total</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {batches.map((batch) => (
                            <tr key={batch.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                    {batch.reference_number}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {batch.period_name}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium 
                                        ${batch.status === 'RELEASED' ? 'bg-green-100 text-green-800' :
                                            batch.status === 'LOCKED' ? 'bg-orange-100 text-orange-800' :
                                                'bg-gray-100 text-gray-800'}`}>
                                        {batch.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {batch.run_date}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="text-sm font-medium text-gray-900">S$ {batch.total_amount?.toLocaleString() || '0.00'}</div>
                                    <div className="text-xs text-gray-500">{batch.payout_count} payouts</div>
                                </td>
                                <td className="px-6 py-4 text-right flex justify-end gap-2">
                                    {batch.status === 'DRAFT' && (
                                        <Button size="sm" variant="outline" onClick={() => handleLock(batch.id)}>
                                            <Lock className="w-4 h-4 mr-1" /> Lock
                                        </Button>
                                    )}
                                    {batch.status === 'LOCKED' && (
                                        <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleRelease(batch.id)}>
                                            <Send className="w-4 h-4 mr-1" /> Pay
                                        </Button>
                                    )}
                                    {batch.status === 'RELEASED' && (
                                        <span className="text-green-600 flex items-center text-sm">
                                            <CheckCircle className="w-4 h-4 mr-1" /> Paid
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {batches.length === 0 && (
                    <div className="p-12 text-center text-gray-500">No payout batches found.</div>
                )}
            </div>

            {/* Simple Create Modal (Overlay) */}
            {isCreateOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Create Payout Batch</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Period ID</label>
                                <Input
                                    placeholder="e.g. 1"
                                    value={newBatchData.period_id}
                                    onChange={e => setNewBatchData({ ...newBatchData, period_id: e.target.value })}
                                />
                                <p className="text-xs text-gray-500 mt-1">Check backend for valid period IDs</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Run Date</label>
                                <Input
                                    type="date"
                                    value={newBatchData.run_date}
                                    onChange={e => setNewBatchData({ ...newBatchData, run_date: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Notes</label>
                                <Input
                                    placeholder="Optional notes"
                                    value={newBatchData.notes}
                                    onChange={e => setNewBatchData({ ...newBatchData, notes: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreateBatch} className="bg-[#F4323D] hover:bg-[#d62d37]">Create Draft</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
