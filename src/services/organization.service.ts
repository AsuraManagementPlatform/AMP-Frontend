import {Organization, OrganizationStatsResponse} from "@/types/organization.types";
import {apiService} from "@/services/api.service.ts";
import {ListParams, PaginatedResponse} from "@/types/index.types.ts";

export const organizationService = {
    getList: async (params?: ListParams): Promise<PaginatedResponse<Organization>> => {
        return apiService.getPaginatedList<Organization>('organization/list', params);
    },

    getById: async (id: string): Promise<Organization> => {
        return apiService.get<Organization>(`organization/${id}`);
    },

    getOrganizationStats: async (organizationId: string): Promise<OrganizationStatsResponse> => {
        return  await apiService.get<OrganizationStatsResponse>(`organization/stats/${organizationId}`);
    },

    create: async (data: Partial<Organization>): Promise<Organization> => {
        return apiService.post<Organization>('organization/create', data);
    },

    update: async (id: string, data: Partial<Organization>): Promise<Organization> => {
        return apiService.put<Organization>(`organization/update/${id}`, data);
    },

    delete: async (id: string): Promise<void> => {
        return apiService.delete<void>(`organization/delete/${id}`);
    },

    toggleModule: async (id: string, module: 'ERP' | 'CRM', enabled: boolean): Promise<Organization> => {
        return apiService.post<Organization>(`organization/${id}/toggle-module`, { module, enabled });
    },
};

export default organizationService;