import { apiService, API_CONFIG } from '@/services/api.service';
import { OrganizationMember, OrganizationMemberWithDetails, ImportJobStatus } from '@/types/organization-member.types';

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

    exportUsers: async (): Promise<Blob> => {
        const authHeader = await import('@/services/keycloak.service').then(m => m.getAuthHeader());
        const baseURL = API_CONFIG.baseURL.endsWith('/') ? API_CONFIG.baseURL : `${API_CONFIG.baseURL}/`;
        const response = await fetch(`${baseURL}organization-members/export/`, {
            method: 'GET',
            headers: {
                ...authHeader,
            },
        });
        
        if (!response.ok) {
            throw new Error('Failed to export users');
        }
        
        return response.blob();
    },

    importUsers: async (file: File): Promise<{ jobId: string; totalRows: number }> => {
        const formData = new FormData();
        formData.append('file', file);
        
        const authHeader = await import('@/services/keycloak.service').then(m => m.getAuthHeader());
        const baseURL = API_CONFIG.baseURL.endsWith('/') ? API_CONFIG.baseURL : `${API_CONFIG.baseURL}/`;
        const response = await fetch(`${baseURL}organization-members/import/`, {
            method: 'POST',
            headers: {
                ...authHeader,
            },
            body: formData,
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw { message: error.message, status: response.status, details: error.details };
        }
        
        const data = await response.json();
        return {
            jobId: data.job_id || data.jobId,
            totalRows: data.total_rows || data.totalRows
        };
    },

    getImportStatus: async (jobId: string): Promise<ImportJobStatus> => {
        return apiService.get(`organization-members/import-jobs/${jobId}/status/`);
    },
};

export default organizationMemberService;
