import { apiService } from '@/services/api.service';
import { PaginatedResponse } from '@/types/index.types';
import {
    OrganizationDocument,
    OrganizationDocumentCreateRequest,
    OrganizationDocumentUpdateRequest
} from '@/types/organization-document.types';

export const organizationDocumentService = {
    getList: async (organizationId: string): Promise<PaginatedResponse<OrganizationDocument>> => {
        return apiService.getPaginatedList<OrganizationDocument>(
            `organization-documents/organization/${organizationId}/list`
        );
    },

    create: async (data: OrganizationDocumentCreateRequest): Promise<{ document: OrganizationDocument }> => {
        return apiService.post<{ document: OrganizationDocument }>('organization-documents/create', data);
    },

    update: async (documentId: string, data: OrganizationDocumentUpdateRequest): Promise<{ document: OrganizationDocument }> => {
        return apiService.put<{ document: OrganizationDocument }>(`organization-documents/update/${documentId}`, data);
    },

    delete: async (documentId: string): Promise<void> => {
        return apiService.delete<void>(`organization-documents/delete/${documentId}`);
    },
};

export default organizationDocumentService;
