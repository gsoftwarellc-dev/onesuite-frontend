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
    // New fields for Manager Dashboard
    sfaPercentage?: number;
    tieringPercentage?: number;
    overridingPercentage?: number;

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
    gstPaid?: 'yes' | 'no';
}

export const commissionService = {
    // Get all commissions (Personal)
    getCommissions: async (params?: {
        status?: CommissionStatus;
        consultantId?: string;
        startDate?: string;
        endDate?: string;
    }) => {
        // Backend returns paginated { count, results: [...] } with snake_case fields
        const response = await api.get<{ count: number, results: any[] }>('/commissions/my-commissions/', { params });

        // Fix: Map snake_case to camelCase for the frontend interface
        return response.data.results.map((item: any) => ({
            id: item.id.toString(),
            consultantName: item.consultant ? item.consultant.username : 'Unknown',
            consultantId: item.consultant ? item.consultant.id.toString() : '',
            clientName: item.reference_number, // Fallback as client name is not in base model
            productType: item.commission_type === 'base' ? 'Standard Commission' : 'Override',
            paymentDate: item.transaction_date,
            grossRevenue: parseFloat(item.sale_amount),
            netRevenue: parseFloat(item.sale_amount),
            commissionRate: 0,
            commissionAmount: parseFloat(item.calculated_amount),
            status: item.state as CommissionStatus,
            statusHistory: [],
            submittedDate: item.created_at,
            notes: `Ref: ${item.reference_number}`
        }));
    },

    // Get Pending Approvals (Manager View)
    getPendingApprovals: async () => {
        const response = await api.get<{ count: number, results: any[] }>('/commissions/approvals/pending/');
        return response.data.results.map((item: any) => ({
            id: item.commission.id.toString(),
            consultantName: item.commission.consultant ? item.commission.consultant.username : 'Unknown',
            consultantId: item.commission.consultant ? item.commission.consultant.id.toString() : '',
            clientName: item.commission.reference_number,
            productType: item.commission.commission_type === 'base' ? 'Standard Commission' : 'Override',
            paymentDate: item.commission.transaction_date,
            grossRevenue: parseFloat(item.commission.sale_amount),
            netRevenue: parseFloat(item.commission.sale_amount),
            commissionRate: 0,
            commissionAmount: parseFloat(item.commission.calculated_amount),
            // Mock data for UI development
            sfaPercentage: 10,
            tieringPercentage: 15,
            overridingPercentage: 3,

            status: item.commission.state as CommissionStatus,
            statusHistory: [],
            submittedDate: item.created_at, // Approval creation date
            notes: `Approval Ref: ${item.id}`
        }));
    },

    // Get Team Commissions (Manager View - Placeholder)
    getTeamCommissions: async () => {
        return [];
    },

    // Get a single commission by ID
    getCommission: async (id: string) => {
        const response = await api.get<any>(`/commissions/${id}/`);
        const item = response.data;
        return {
            id: item.id.toString(),
            consultantName: item.consultant ? item.consultant.username : 'Unknown',
            consultantId: item.consultant ? item.consultant.id.toString() : '',
            clientName: item.reference_number,
            productType: item.commission_type === 'base' ? 'Standard Commission' : 'Override',
            paymentDate: item.transaction_date,
            grossRevenue: parseFloat(item.sale_amount),
            netRevenue: parseFloat(item.sale_amount),
            commissionRate: parseFloat(item.commission_rate || '0'),
            commissionAmount: parseFloat(item.calculated_amount),
            status: item.state as CommissionStatus,
            statusHistory: [],
            submittedDate: item.created_at,
            notes: item.notes
        };
    },

    // Submit a new commission
    createCommission: async (data: CreateCommissionDTO) => {
        const response = await api.post<Commission>('/commissions/create/', data);
        return response.data;
    },

    // Update commission status (Authorize, Approve, Reject, Pay)
    updateStatus: async (id: string, status: CommissionStatus, note?: string) => {
        let endpoint = '';
        const payload: any = { notes: note };

        switch (status) {
            case 'approved': endpoint = 'approve'; break;
            case 'rejected': endpoint = 'reject'; payload.rejection_reason = note; break;
            case 'paid': endpoint = 'mark-paid'; break;
            case 'authorized': endpoint = 'submit'; break; // 'submit' maps to 'submitted' state
            default: throw new Error(`Status ${status} not supported via API`);
        }

        const response = await api.patch<Commission>(`/commissions/${id}/${endpoint}/`, payload);
        return response.data;
    },

    // Get statistics for the dashboard
    getStats: async (role: string) => {
        const response = await api.get('/commissions/summary/');
        return response.data;
    },

    // Approve a commission (Manager/Admin)
    approveCommission: async (id: string, note?: string) => {
        const response = await api.post<any>(`/commissions/${id}/approve/`, { note });
        return response.data;
    },

    // Reject a commission (Manager/Admin)
    rejectCommission: async (id: string, rejectionReason: string) => {
        const response = await api.post<any>(`/commissions/${id}/reject/`, {
            rejection_reason: rejectionReason
        });
        return response.data;
    }
};
