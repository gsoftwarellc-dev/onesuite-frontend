import api from '@/lib/api';

export type CommissionStatus = 'draft' | 'submitted' | 'pending' | 'authorized' | 'approved' | 'paid' | 'rejected' | 'processing';

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
        try {
            // Backend returns paginated { count, results: [...] } with snake_case fields
            const response = await api.get<{ count: number, results: any[] }>('/commissions/my-commissions/', { params });

            // Handle empty or missing results
            if (!response.data || !response.data.results) {
                return [];
            }

            // Fix: Map snake_case to camelCase for the frontend interface
            return response.data.results.map((item: any) => ({
                id: item.id?.toString() || '',
                consultantName: item.consultant?.username || 'Unknown',
                consultantId: item.consultant?.id?.toString() || '',
                clientName: item.reference_number || 'N/A',
                productType: item.commission_type === 'base' ? 'Standard Commission' : 'Override',
                paymentDate: item.transaction_date || new Date().toISOString().split('T')[0],
                grossRevenue: parseFloat(item.sale_amount || '0'),
                netRevenue: parseFloat(item.sale_amount || '0'),
                commissionRate: parseFloat(item.commission_rate || '0'),
                commissionAmount: parseFloat(item.calculated_amount || '0'),
                status: (item.state === 'submitted' ? 'pending' : item.state) as CommissionStatus,
                statusHistory: [],
                submittedDate: item.created_at || new Date().toISOString(),
                notes: `Ref: ${item.reference_number || item.id}`
            }));
        } catch (error: any) {
            console.error('Error fetching commissions:', error);
            return [];
        }
    },

    // Get Pending Approvals (Manager View)
    // Supports filtering by status or 'all' for dashboard metrics
    getPendingApprovals: async (statusParam: string = 'submitted') => {
        try {
            const response = await api.get<any>('/commissions/approvals/pending/', {
                params: { status: statusParam }
            });

            // Handle both response formats:
            // 1. Paginated: { count, results: [...] }
            // 2. Direct array: [...]
            let items = Array.isArray(response.data) ? response.data : response.data.results || [];

            // If items is empty or undefined, return empty array
            if (!items || items.length === 0) {
                return [];
            }

            return items.map((item: any) => {
                // Handle both nested (item.commission) and flat (item) structures
                const commission = item.commission || item;

                return {
                    id: commission.id?.toString() || '',
                    consultantName: commission.consultant?.username || 'Unknown',
                    consultantId: commission.consultant?.id?.toString() || '',
                    clientName: commission.reference_number || 'N/A',
                    productType: commission.commission_type === 'base' ? 'Standard Commission' : 'Override',
                    paymentDate: commission.transaction_date || new Date().toISOString().split('T')[0],
                    grossRevenue: parseFloat(commission.sale_amount || '0'),
                    netRevenue: parseFloat(commission.sale_amount || '0'),
                    commissionRate: parseFloat(commission.commission_rate || '0'),
                    commissionAmount: parseFloat(commission.calculated_amount || '0'),
                    sfaPercentage: 10,
                    tieringPercentage: 15,
                    overridingPercentage: 3,
                    status: (commission.state === 'submitted' ? 'pending' : commission.state) as CommissionStatus,
                    statusHistory: [],
                    submittedDate: item.created_at || commission.created_at || new Date().toISOString(),
                    notes: `Ref: ${commission.reference_number || commission.id}`
                };
            });
        } catch (error: any) {
            console.error('Error fetching pending approvals:', error);
            // Return empty array instead of throwing to prevent UI crash
            return [];
        }
    },

    // Get Team Commissions (Manager View)
    getTeamCommissions: async () => {
        try {
            const response = await api.get<any>('/commissions/my-team/');
            // Backend returns array of { consultant: User, total_sales, pending_count, ... }
            return response.data || [];
        } catch (error) {
            console.error('Error fetching team commissions:', error);
            return [];
        }
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
        // Get user ID from JWT token
        const token = localStorage.getItem('access_token');

        if (!token) {
            throw new Error('No authentication token found. Please login again.');
        }

        // Decode JWT to get user ID (JWT format: header.payload.signature)
        let consultantId: number;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            consultantId = payload.user_id || payload.sub || payload.id;

            if (!consultantId) {
                throw new Error('User ID not found in token. Please login again.');
            }

            console.log('👤 User ID from token:', consultantId);
        } catch (decodeError) {
            console.error('Failed to decode token:', decodeError);
            throw new Error('Invalid authentication token. Please login again.');
        }

        // Calculate commission rate from SFA and Tiering
        // Backend expects a single commission_rate, so we combine SFA * Tiering
        const commissionRate = data.sfa * (data.tiering / 100);

        // Calculate the commission amount
        const saleAmount = data.grossRevenue;
        const gstRate = data.gstPaid === 'yes' ? 10 : 0; // Assume 10% GST if paid

        // Calculate: (sale_amount / (1 + gst_rate/100)) * (commission_rate / 100)
        const baseAmount = gstRate > 0 ? saleAmount / (1 + gstRate / 100) : saleAmount;
        const calculatedAmount = baseAmount * (commissionRate / 100);

        // Generate unique reference number
        const referenceNumber = `COM-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        // Build notes with all the extra information
        const notes = [
            `Client: ${data.clientName}`,
            `Product: ${data.productType}`,
            `SFA: ${data.sfa}%`,
            `Tiering: ${data.tiering}%`,
            data.referralName ? `Referral: ${data.referralName} (${data.referralPercentage}%)` : '',
            data.probationIncentive ? `Probation Incentive: S$${data.probationIncentive}` : '',
            data.otherClaimsRemarks ? `Other Claims: ${data.otherClaimsRemarks} (S$${data.otherClaimsAmount})` : '',
        ].filter(Boolean).join(' | ');

        // Transform to backend format
        const backendPayload = {
            consultant_id: consultantId,
            transaction_date: data.paymentDate, // Already in YYYY-MM-DD format
            sale_amount: saleAmount,
            gst_rate: gstRate,
            commission_rate: commissionRate,
            calculated_amount: calculatedAmount,
            reference_number: referenceNumber,
            notes: notes
        };

        console.log('📤 Sending commission payload:', backendPayload);

        try {
            const response = await api.post<any>('/commissions/create/', backendPayload);
            console.log('✅ Commission created:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('❌ API Error:', error.response?.data);
            throw error;
        }
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
