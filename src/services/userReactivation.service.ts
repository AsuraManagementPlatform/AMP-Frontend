import { apiService } from '@/services/api.service';

export interface PendingReactivationUser {
    id: string;
    full_name: string;
    email: string;
    status: string;
    reactivation_requested_at: string;
    reactivation_reason?: string;
    rejection_reason?: string;
    organization_id?: string;
}

export interface PendingReactivationListResponse {
    users: PendingReactivationUser[];
    count: number;
}

export interface ReactivationApprovalResponse {
    message: string;
    user: PendingReactivationUser;
}

export const userReactivationService = {
    getPendingReactivations: async (): Promise<PendingReactivationListResponse> => {
        return apiService.get<PendingReactivationListResponse>('user/reactivation/pending');
    },

    approveReactivation: async (userId: string): Promise<ReactivationApprovalResponse> => {
        return apiService.post<ReactivationApprovalResponse>(`user/reactivation/approve/${userId}`);
    },

    rejectReactivation: async (userId: string, rejectionReason: string): Promise<ReactivationApprovalResponse> => {
        return apiService.post<ReactivationApprovalResponse>(
            `user/reactivation/reject/${userId}`,
            { rejection_reason: rejectionReason }
        );
    },
};
