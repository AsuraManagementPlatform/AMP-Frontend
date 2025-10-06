import {ListParams, PaginatedResponse, User, UserMeResponse} from "@/types/index.types.ts";
import {apiService} from "@/services/api.service.ts";

export const userService = {
    getList: async (params?: ListParams): Promise<PaginatedResponse<User>> => {
        return apiService.getPaginatedList<User>('user/list', params);
    },

    getManagers: async (params?: ListParams): Promise<PaginatedResponse<User>> => {
        return apiService.getPaginatedList<User>('user/managers', params);
    },

    getById: async (id: string): Promise<User> => {
        return apiService.get<User>(`user/${id}`);
    },

    getCurrentUser: async (): Promise<UserMeResponse> => {
        return apiService.get<UserMeResponse>('user/me');
    },

    create: async (data: Partial<User>): Promise<User> => {
        return apiService.post<User>('user/create', data);
    },

    update: async (id: string, data: Partial<User>): Promise<User> => {
        return apiService.put<User>(`user/update/${id}`, data);
    },

    delete: async (id: string): Promise<void> => {
        return apiService.delete<void>(`user/delete/${id}`);
    },

    deactivateUser: async (id: string): Promise<void> => {
        return apiService.post<void>(`user/deactivate/${id}`, {});
    },

    reactivateUser: async (id: string): Promise<void> => {
        return apiService.post<void>(`user/reactivate/${id}`, {});
    },
};

export default userService;