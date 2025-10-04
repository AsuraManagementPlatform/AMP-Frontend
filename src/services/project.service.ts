import {ListParams, PaginatedResponse} from "@/types/index.types.ts";
import {Project, ProjectCreateRequest, ProjectUpdateRequest, ProjectStats} from "@/types/project.types.ts";
import {apiService} from "@/services/api.service.ts";

export const projectService = {
    getList: async (params?: ListParams): Promise<PaginatedResponse<Project>> => {
        return apiService.getPaginatedList<Project>('project/list', params);
    },

    getById: async (id: string): Promise<Project> => {
        return apiService.get<Project>(`project/${id}`);
    },

    getProjectStats: async (projectId: string): Promise<ProjectStats> => {
        return await apiService.get<ProjectStats>(`project/stats/${projectId}`);
    },

    create: async (data: ProjectCreateRequest): Promise<Project> => {
        return apiService.post<Project>('project/create', data);
    },

    update: async (id: string, data: ProjectUpdateRequest): Promise<Project> => {
        return apiService.put<Project>(`project/update/${id}`, data);
    },

    delete: async (id: string): Promise<void> => {
        return apiService.delete<void>(`project/delete/${id}`);
    },
};

export default projectService;