import { apiService } from '@/services/api.service';
import { ListParams, PaginatedResponse } from '@/types/index.types';
import {
    MembershipFee,
    MembershipFeeCreateRequest,
    MembershipFeeUpdateRequest,
    MembershipFeePaymentRequest,
    MembershipFeeFilter,
    MembershipFeePayment,
    MembershipFeePaymentCreateRequest,
    MembershipFeePaymentApprovalRequest,
    MembershipFeeConfig,
    MembershipFeeConfigUpdateRequest
} from '@/types/membershipFee.types';

export const membershipFeeService = {
    getList: async (params?: ListParams & MembershipFeeFilter): Promise<PaginatedResponse<MembershipFee>> => {
        return apiService.getPaginatedList<MembershipFee>('membership_fee/list', params);
    },

    getById: async (id: string): Promise<MembershipFee> => {
        return apiService.get<MembershipFee>(`membership_fee/${id}`);
    },

    getByMember: async (memberId: string, params?: ListParams): Promise<PaginatedResponse<MembershipFee>> => {
        return apiService.getPaginatedList<MembershipFee>(`membership_fee/member/${memberId}`, params);
    },

    getByOrganization: async (organizationId: string, params?: ListParams): Promise<PaginatedResponse<MembershipFee>> => {
        return apiService.getPaginatedList<MembershipFee>(`membership_fee/organization/${organizationId}`, params);
    },

    create: async (data: MembershipFeeCreateRequest): Promise<MembershipFee> => {
        return apiService.post<MembershipFee>('membership_fee/create', data);
    },

    update: async (id: string, data: MembershipFeeUpdateRequest): Promise<MembershipFee> => {
        return apiService.put<MembershipFee>(`membership_fee/update/${id}`, data);
    },

    delete: async (id: string): Promise<void> => {
        return apiService.delete<void>(`membership_fee/delete/${id}`);
    },

    markAsPaid: async (id: string, data: MembershipFeePaymentRequest): Promise<MembershipFee> => {
        return apiService.post<MembershipFee>(`membership_fee/${id}/mark-as-paid`, data);
    },

    generateNext: async (memberId: string): Promise<MembershipFee> => {
        return apiService.post<MembershipFee>(`membership_fee/generate-next/${memberId}`, {});
    },

    getOverdueFees: async (organizationId?: string): Promise<PaginatedResponse<MembershipFee>> => {
        const params: (ListParams & { overdue_only?: boolean }) | undefined = { overdue_only: true };
        if (organizationId) {
            return membershipFeeService.getByOrganization(organizationId, params);
        }
        return membershipFeeService.getList(params);
    },

    autoCheckRenewal: async (memberId: string): Promise<{ shouldRefresh: boolean; renewalsCreated: any[] }> => {
        return apiService.post<{ shouldRefresh: boolean; renewalsCreated: any[] }>(
            `membership_fee/auto-check-renewal/${memberId}`,
            {}
        );
    },

    getPayments: async (feeId: string): Promise<MembershipFeePayment[]> => {
        return apiService.get<MembershipFeePayment[]>(`membership_fee/${feeId}/payments`);
    },

    createPayment: async (feeId: string, data: MembershipFeePaymentCreateRequest): Promise<MembershipFeePayment> => {
        return apiService.post<MembershipFeePayment>(`membership_fee/${feeId}/payments`, data);
    },

    approvePayment: async (paymentId: string): Promise<MembershipFeePayment> => {
        return apiService.post<MembershipFeePayment>(`membership_fee/payments/${paymentId}/approve`, {});
    },

    rejectPayment: async (paymentId: string, data: MembershipFeePaymentApprovalRequest): Promise<MembershipFeePayment> => {
        return apiService.post<MembershipFeePayment>(`membership_fee/payments/${paymentId}/reject`, data);
    },

    getConfigs: async (): Promise<MembershipFeeConfig[]> => {
        return apiService.get<MembershipFeeConfig[]>('membership_fee/config');
    },

    updateConfigs: async (data: MembershipFeeConfigUpdateRequest): Promise<{ message: string; configs: MembershipFeeConfig[] }> => {
        return apiService.put<{ message: string; configs: MembershipFeeConfig[] }>('membership_fee/config/bulk-update', data);
    },
};
