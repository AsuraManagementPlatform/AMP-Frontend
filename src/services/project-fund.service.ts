import { ListParams, PaginatedResponse } from "@/types/index.types.ts";
import { ProjectFund, ProjectFundCreateRequest, ProjectFundUpdateRequest } from "@/types/project-finance.types.ts";
import { apiService } from "@/services/api.service.ts";

export const projectFundService = {
    getList: async (params?: ListParams): Promise<PaginatedResponse<ProjectFund>> => {
        return apiService.getPaginatedList<ProjectFund>('project_fund/list', params);
    },

    getById: async (id: string): Promise<ProjectFund> => {
        return apiService.get<ProjectFund>(`project_fund/${id}`);
    },

    create: async (data: ProjectFundCreateRequest): Promise<ProjectFund> => {
        return apiService.post<ProjectFund>('project_fund/create', data);
    },

    update: async (id: string, data: ProjectFundUpdateRequest): Promise<ProjectFund> => {
        return apiService.put<ProjectFund>(`project_fund/update/${id}`, data);
    },

    delete: async (id: string): Promise<void> => {
        return apiService.delete<void>(`project_fund/delete/${id}`);
    },
};

export default projectFundService;