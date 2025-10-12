import {Organization, OrganizationStatsResponse} from "@/types/organization.types";
import {apiService} from "@/services/api.service.ts";
import {ListParams, PaginatedResponse} from "@/types/index.types.ts";

export const organizationService = {
    getList: async (params?: ListParams): Promise<PaginatedResponse<Organization>> => {
        return apiService.getPaginatedList<Organization>('/api/organization/list', params);
    },

    getById: async (id: string): Promise<Organization> => {
        return apiService.get<Organization>(`/api/organization/${id}`);
    },

    getOrganizationStats: async (organizationId: string): Promise<OrganizationStatsResponse> => {
        return  await apiService.get<OrganizationStatsResponse>(`/api/organization/stats/${organizationId}`);
    },

    create: async (data: Partial<Organization>): Promise<Organization> => {
        return apiService.post<Organization>('/api/organization/create', data);
    },

    update: async (id: string, data: Partial<Organization>): Promise<Organization> => {
        return apiService.put<Organization>(`/api/organization/update/${id}`, data);
    },

    delete: async (id: string): Promise<void> => {
        return apiService.delete<void>(`/api/organization/delete/${id}`);
    },
};

export default organizationService;