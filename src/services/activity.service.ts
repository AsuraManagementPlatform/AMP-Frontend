import {ListParams, PaginatedResponse} from "@/types/index.types.ts";
import {Activity, ActivityCreateRequest, ActivityUpdateRequest, ActivityStats} from "@/types/activity.types.ts";
import {apiService} from "@/services/api.service.ts";

export const activityService = {
    getList: async (params?: ListParams): Promise<PaginatedResponse<Activity>> => {
        return apiService.getPaginatedList<Activity>('activity/list', params);
    },

    getById: async (id: string): Promise<Activity> => {
        return apiService.get<Activity>(`activity/${id}`);
    },

    getActivityStats: async (project?: string): Promise<ActivityStats> => {
        const endpoint = project ? `activity/stats/${project}` : 'activity/stats';
        return await apiService.get<ActivityStats>(endpoint);
    },

    create: async (data: ActivityCreateRequest): Promise<Activity> => {
        return apiService.post<Activity>('activity/create', data);
    },

    update: async (id: string, data: ActivityUpdateRequest): Promise<Activity> => {
        return apiService.put<Activity>(`activity/update/${id}`, data);
    },

    delete: async (id: string): Promise<void> => {
        return apiService.delete<void>(`activity/delete/${id}`);
    },
};

export default activityService;