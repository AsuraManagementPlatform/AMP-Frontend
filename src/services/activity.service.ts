import {ListParams, PaginatedResponse} from "@/types/index.types.ts";
import {Activity, ActivityCreateRequest, ActivityUpdateRequest, ActivityStats} from "@/types/activity.types.ts";
import {apiService} from "@/services/api.service.ts";

export const activityService = {
    getList: async (params?: ListParams): Promise<PaginatedResponse<Activity>> => {
        return apiService.getPaginatedList<Activity>('/api/activity/list', params);
    },

    getById: async (id: string): Promise<Activity> => {
        return apiService.get<Activity>(`/api/activity/${id}`);
    },

    getByProjectId: async (projectId: string, params?: ListParams): Promise<PaginatedResponse<Activity>> => {
        return apiService.getPaginatedList<Activity>(`/api/activity/project/${projectId}`, params);
    },

    getActivityStats: async (projectId?: string): Promise<ActivityStats> => {
        const endpoint = projectId ? `/api/activity/stats/${projectId}` : '/api/activity/stats';
        return await apiService.get<ActivityStats>(endpoint);
    },

    create: async (data: ActivityCreateRequest): Promise<Activity> => {
        return apiService.post<Activity>('/api/activity/create', data);
    },

    update: async (id: string, data: ActivityUpdateRequest): Promise<Activity> => {
        return apiService.put<Activity>(`/api/activity/update/${id}`, data);
    },

    delete: async (id: string): Promise<void> => {
        return apiService.delete<void>(`/api/activity/delete/${id}`);
    },
};

export default activityService;