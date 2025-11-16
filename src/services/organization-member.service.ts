import { apiService } from '@/services/api.service';
import { OrganizationMember, OrganizationMemberWithDetails } from '@/types/organization-member.types';

export const organizationMemberService = {
    getList: async (organizationId?: string): Promise<{ organizationMembersList: OrganizationMemberWithDetails[] }> => {
        const url = organizationId 
            ? `organization-members/list?organization=${organizationId}`
            : 'organization-members/list';
        return apiService.get(url);
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

    activateMember: async (id: string): Promise<void> => {
        return apiService.post(`user/activate/${id}`, {});
    },

    deactivateMember: async (id: string): Promise<void> => {
        return apiService.post(`user/deactivate/${id}`, {});
    },
};

export default organizationMemberService;
