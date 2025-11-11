import {ListParams, PaginatedResponse} from '@/types/index.types';
import {apiService} from "@/services/api.service.ts";
import {
    ProjectPartner,
    ProjectPartnerCreateRequest,
    ProjectPartnerUpdateRequest
} from "@/types/project-partner.types.ts";

const projectPartnerService = {
    getList: async (params?: ListParams): Promise<PaginatedResponse<ProjectPartner>> => {
        return apiService.getPaginatedList<ProjectPartner>('project_partner/list', params);
    },

    getById: async (id: string): Promise<ProjectPartner> => {
        return apiService.get<ProjectPartner>(`project_partner/${id}`);
    },

    create: async (data: ProjectPartnerCreateRequest): Promise<ProjectPartner> => {
        return apiService.post<ProjectPartner>('project_partner/create', data);
    },

    update: async (data: ProjectPartnerUpdateRequest): Promise<ProjectPartner> => {
        return apiService.put<ProjectPartner>(`project_partner/update/${data.id}`, data);
    },

    delete: async (id: string): Promise<void> => {
        return apiService.delete(`project_partner/delete/${id}`);
    },
};

export default projectPartnerService;
