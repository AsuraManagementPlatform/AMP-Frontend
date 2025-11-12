import { apiService } from '@/services/api.service';
import { OrganizationMember, OrganizationMemberWithDetails } from '@/types/organization-member.types';

export const organizationMemberService = {
    getList: async (): Promise<{ organizationMembersList: OrganizationMemberWithDetails[] }> => {
        return apiService.get('organization-members/list');
    },

    getById: async (id: string): Promise<OrganizationMember> => {
        return apiService.get(`organization-members/${id}`);
    },

    create: async (data: Partial<OrganizationMember>): Promise<OrganizationMember> => {
        return apiService.post('organization-members/create', data);
    },

    update: async (id: string, data: Partial<OrganizationMember>): Promise<OrganizationMember> => {
        return apiService.put(`organization-members/update/${id}`, data);
    },

    delete: async (id: string): Promise<void> => {
        return apiService.delete(`organization-members/delete/${id}`);
    },

    deactivateMember: async (id: string): Promise<void> => {
        return apiService.post(`organization-members/deactivate/${id}`, {});
    },

    reactivateMember: async (id: string): Promise<void> => {
        return apiService.post(`organization-members/reactivate/${id}`, {});
    },
};

export default organizationMemberService;
