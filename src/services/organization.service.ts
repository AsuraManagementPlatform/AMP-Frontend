import { OrganizationCreateRequest, OrganizationCreateResponse, OrganizationStatsResponse } from "@/types/organization.types";
import apiClient from "@/services/api.service";

export const organizationService = {
    /**
     * Get all organizations (admin only)
     */
    getAllOrganizations: async (): Promise<OrganizationCreateResponse[]> => {
        const response = await apiClient.get('/api/organization/list');
        return response.data.organizations || [];
    },

    /**
     * Get specific organization by ID
     */
    getOrganizationById: async (organizationId: string): Promise<OrganizationCreateResponse> => {
        const response = await apiClient.get<OrganizationCreateResponse>(`/api/organization/${organizationId}`);
        return response.data;
    },

    /**
     * Get organization statistics (organization admin only)
     */
    getOrganizationStats: async (organizationId: string): Promise<OrganizationStatsResponse> => {
        const response = await apiClient.get<OrganizationStatsResponse>(`/api/organization/stats/${organizationId}`);
        return response.data;
    },

    /**
     * Create new organization
     */
    createOrganization: async (organizationData: OrganizationCreateRequest): Promise<OrganizationCreateResponse> => {
        const response = await apiClient.post('/api/organization/create', organizationData);
        return response.data.organization || response.data;
    },

    /**
     * Update organization information
     */
    updateOrganization: async (organizationId: string, organizationData: Partial<OrganizationCreateRequest>): Promise<OrganizationCreateResponse> => {
        const response = await apiClient.put<OrganizationCreateResponse>(`/api/organization/update/${organizationId}`, organizationData);
        return response.data;
    },

    /**
     * Delete organization
     */
    deleteOrganization: async (organizationId: string): Promise<void> => {
        await apiClient.delete(`/api/organization/delete/${organizationId}`);
    }
};

export default organizationService;