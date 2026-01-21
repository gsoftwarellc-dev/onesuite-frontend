import api from '@/lib/api';

// --- Shared Types ---
export interface TrendItem {
    month: string;
    total: string; // Decimal string
    count?: number;
}

export interface Performer {
    rank: number;
    consultant_id: number;
    name: string;
    total: string;
}

// --- Consultant Types ---
export interface ConsultantSummary {
    total_paid_ytd: string;
    pending_amount: string;
    w9_status: string;
    tax_docs_count: number;
}

export interface RecentPayout {
    date: string | null;
    amount: string;
    status: string;
}

export interface ConsultantDashboardDTO {
    summary: ConsultantSummary;
    earnings_trend: TrendItem[];
    recent_payouts: RecentPayout[];
    computed_at: string;
}

// --- Manager Types ---
export interface ManagerSummary {
    team_total_ytd: string;
    team_size: number;
    pending_approvals: number;
}

export interface ManagerDashboardDTO {
    summary: ManagerSummary;
    team_trend: TrendItem[];
    top_team_members: Performer[];
    computed_at: string;
}

// --- Finance Types ---
export interface FinanceSummary {
    total_paid_ytd: string;
    outstanding_liability: string;
    payment_success_rate: string;
    avg_cycle_days: string;
}

export interface ReconciliationStatus {
    matched: number;
    pending: number;
    discrepancy: number;
}

export interface FinanceDashboardDTO {
    summary: FinanceSummary;
    commission_trend: TrendItem[];
    top_performers: Performer[];
    reconciliation_status: ReconciliationStatus;
    computed_at: string;
}

// --- Service ---
export const analyticsService = {
    // Consultant Dashboard
    getConsultantDashboard: async (months: number = 6) => {
        const response = await api.get<ConsultantDashboardDTO>('/analytics/dashboards/consultant/', {
            params: { months }
        });
        return response.data;
    },

    // Manager Dashboard
    getManagerDashboard: async (months: number = 6) => {
        const response = await api.get<ManagerDashboardDTO>('/analytics/dashboards/manager/', {
            params: { months }
        });
        return response.data;
    },

    // Finance Dashboard
    getFinanceDashboard: async (year?: number, months: number = 12) => {
        const response = await api.get<FinanceDashboardDTO>('/analytics/dashboards/finance/', {
            params: { year, months }
        });
        return response.data;
    },

    // Manager Real-time Pending Count
    getPendingCount: async () => {
        const response = await api.get<{ pending_count: number; pending_amount: string; as_of: string }>('/analytics/commissions/pending-count/');
        return response.data;
    }
};
