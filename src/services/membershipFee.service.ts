import { apiService } from '@/services/api.service';
import { ListParams, PaginatedResponse } from '@/types/index.types';
import {
    MembershipFee,
    MembershipFeeCreateRequest,
    MembershipFeeUpdateRequest,
    MembershipFeePaymentRequest,
    MembershipFeeFilter
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

    getOverdueFees: async (organizationId?: string): Promise<PaginatedResponse<MembershipFee>> => {
        const params: (ListParams & { overdue_only?: boolean }) | undefined = { overdue_only: true };
        if (organizationId) {
            return membershipFeeService.getByOrganization(organizationId, params);
        }
        return membershipFeeService.getList(params);
    },
};
