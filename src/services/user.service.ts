import {ListParams, PaginatedResponse, User} from "@/types/index.types.ts";
import {apiService} from "@/services/api.service.ts";

export const userService = {
    getList: async (params?: ListParams): Promise<PaginatedResponse<User>> => {
        return apiService.getPaginatedList<User>('user/list', params);
    },

    getById: async (id: string): Promise<User> => {
        const response: any = await apiService.get(`user/${id}`);
        return response.users || response;
    },

    getCurrentUser: async (): Promise<User> => {
        return apiService.get<User>('user/me');
    },

    updateCurrentUser: async (data: Partial<User>): Promise<User> => {
        return apiService.put<User>('user/me', data);
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

    resetPassword: async (id: string): Promise<{ message: string; email: string }> => {
        return apiService.post<{ message: string; email: string }>(`user/reset-password/${id}`, {});
    },
};

export default userService;