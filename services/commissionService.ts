import api from '@/lib/api';

export type CommissionStatus = 'pending' | 'authorized' | 'approved' | 'paid' | 'rejected' | 'processing';

export interface Commission {
    id: string;
    consultantName: string;
    consultantId: string;
    clientName: string;
    productType: string;
    policyNumber?: string;
    paymentDate: string;
    grossRevenue: number;
    netRevenue: number;
    commissionRate: number;
    commissionAmount: number;
    status: CommissionStatus;
    statusHistory: {
        status: CommissionStatus;
        date: string;
        note?: string;
        updatedBy: string;
    }[];
    submittedDate: string;
    notes?: string;
}

export interface CreateCommissionDTO {
    clientName: string;
    productType: string;
    paymentDate: string;
    grossRevenue: number;
    sfa: number;
    tiering: number;
    referralPercentage?: number;
    referralName?: string;
    probationIncentive?: number;
    otherClaimsRemarks?: string;
    otherClaimsAmount?: number;
}

export const commissionService = {
    // Get all commissions (with optional filters)
    getCommissions: async (params?: {
        status?: CommissionStatus;
        consultantId?: string;
        startDate?: string;
        endDate?: string;
    }) => {
        const response = await api.get<Commission[]>('/commissions', { params });
        return response.data;
    },

    // Get a single commission by ID
    getCommission: async (id: string) => {
        const response = await api.get<Commission>(`/commissions/${id}`);
        return response.data;
    },

    // Submit a new commission
    createCommission: async (data: CreateCommissionDTO) => {
        const response = await api.post<Commission>('/commissions', data);
        return response.data;
    },

    // Update commission status (Authorize, Approve, Reject, Pay)
    updateStatus: async (id: string, status: CommissionStatus, note?: string) => {
        const response = await api.patch<Commission>(`/commissions/${id}/status`, { status, note });
        return response.data;
    },

    // Get statistics for the dashboard
    getStats: async (role: string) => {
        const response = await api.get(`/commissions/stats?role=${role}`);
        return response.data;
    }
};
