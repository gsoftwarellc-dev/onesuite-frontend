import api from '@/lib/api';

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'consultant' | 'manager' | 'finance' | 'director' | 'admin';
    avatarUrl?: string;
    teamId?: string;
    joinedDate: string;
    contactNumber?: string;
    designation?: string;
}

export const userService = {
    // Get current user profile
    getProfile: async () => {
        const response = await api.get<User>('/users/me');
        return response.data;
    },

    // Get team members (for managers/directors)
    getTeamMembers: async (teamId?: string) => {
        const response = await api.get<User[]>('/users/team', { params: { teamId } });
        return response.data;
    },

    // Update user profile
    updateProfile: async (data: Partial<User>) => {
        const response = await api.patch<User>('/users/me', data);
        return response.data;
    },

    // Change Password
    changePassword: async (data: any) => {
        const response = await api.post('/users/set_password/', data);
        return response.data;
    }
};
