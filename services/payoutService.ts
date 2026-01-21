import api from '@/lib/api';

export type PayoutStatus = 'DRAFT' | 'PROCESSING' | 'PAID' | 'ERROR';
export type BatchStatus = 'DRAFT' | 'LOCKED' | 'RELEASED' | 'VOID';

export interface PayoutPeriod {
    id: number;
    name: string;
    start_date: string;
    end_date: string;
    status: 'OPEN' | 'CLOSED';
}

export interface PayoutLineItem {
    id: number;
    amount: string; // Decimal string from backend
    description: string;
    commission_reference: string;
    commission_date: string;
}

export interface Payout {
    id: number;
    consultant: {
        id: number;
        username: string;
        first_name: string;
        last_name: string;
    };
    status: PayoutStatus;
    net_amount: string; // Decimal string
    total_commission: string;
    total_adjustment: string;
    total_tax: string;
    paid_at: string | null;
    payment_reference: string;
    line_items?: PayoutLineItem[]; // Only in detail view
}

export interface PayoutBatch {
    id: number;
    reference_number: string;
    period: number;
    period_name: string;
    run_date: string;
    status: BatchStatus;
    notes: string;
    payout_count: number;
    total_amount: number; // Aggregate from serializer
    created_at: string;
    released_at: string | null;
}

export interface CreateBatchDTO {
    period_id: number;
    run_date?: string; // YYYY-MM-DD
    notes?: string;
}

export const payoutService = {
    // Consultant: Get own history
    getMyHistory: async (params?: { page?: number }) => {
        // Backend maps /api/payouts/ to filter by user (consultant history)
        const response = await api.get<Payout[]>('/payouts/', { params });
        return response.data;
    },

    // Get Payout Detail (with line items)
    getPayout: async (id: string | number) => {
        const response = await api.get<Payout>(`/payouts/${id}/`);
        return response.data;
    },

    // Finance: List Batches
    getBatches: async () => {
        const response = await api.get<PayoutBatch[]>('/payouts/batches/');
        return response.data;
    },

    // Finance: Get Batch Detail
    getBatch: async (id: string | number) => {
        const response = await api.get<PayoutBatch>(`/payouts/batches/${id}/`);
        return response.data;
    },

    // Finance: Create Draft Batch
    createBatch: async (data: CreateBatchDTO) => {
        const response = await api.post<PayoutBatch>('/payouts/batches/', data);
        return response.data;
    },

    // Finance: Lock Batch
    lockBatch: async (id: string | number) => {
        const response = await api.post<PayoutBatch>(`/payouts/batches/${id}/lock/`);
        return response.data;
    },

    // Finance: Release Batch (Mark Paid)
    releaseBatch: async (id: string | number) => {
        const response = await api.post<PayoutBatch>(`/payouts/batches/${id}/release/`);
        return response.data;
    },

    // Finance: Void Batch
    voidBatch: async (id: string | number) => {
        const response = await api.post<PayoutBatch>(`/payouts/batches/${id}/void/`);
        return response.data;
    },

    // Helpers
    // Fetch periods needed for batch creation dropdown
    // Assuming periods are under /api/payouts/periods/ ? 
    // Wait, contract didn't list periods endpoint explicitly, but BatchCreate needs period_id.
    // I will assume /api/payouts/periods/ exists or use hardcoded list if 404.
    // Based on views inspection, PayoutPeriod is a Model. Usually there's a viewset.
    // I didn't see PayoutPeriodViewSet in payouts/views.py.
    // I might have to rely on user inputting ID or check if there's a periods endpoint.
    // Re-checking views.py: No PayoutPeriodViewSet. 
    // This is a missing endpoint. I will NOT implement getPeriods() yet.
    // Or maybe it's exposed via another app?
};
