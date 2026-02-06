import {ListParams, PaginatedResponse} from "@/types/index.types.ts";
import {Project, ProjectCreateRequest, ProjectUpdateRequest, ProjectStats, ProjectDeletionPreview} from "@/types/project.types.ts";
import {apiService} from "@/services/api.service.ts";

export const projectService = {
    getList: async (params?: ListParams): Promise<PaginatedResponse<Project>> => {
        return apiService.getPaginatedList<Project>('project/list', params);
    },

    getMyProjects: async (params?: ListParams): Promise<PaginatedResponse<any>> => {
        return apiService.getPaginatedList<any>('project/member/list', params);
    },

    getMyActivities: async (params?: ListParams): Promise<PaginatedResponse<any>> => {
        return apiService.getPaginatedList<any>('activity-member/list', params);
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

    update: async (data: ProjectUpdateRequest): Promise<Project> => {
        return apiService.put<Project>(`project/update/${data.id}`, data);
    },

    delete: async (id: string): Promise<void> => {
        return apiService.delete<void>(`project/delete/${id}`);
    },

    getDeletionPreview: async (id: string): Promise<ProjectDeletionPreview> => {
        return apiService.get<ProjectDeletionPreview>(`project/delete/${id}/preview`);
    },
};

export default projectService;