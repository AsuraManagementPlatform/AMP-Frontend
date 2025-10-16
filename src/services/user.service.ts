import {ListParams, PaginatedResponse, User} from "@/types/index.types.ts";
import {apiService} from "@/services/api.service.ts";

export const userService = {
    getList: async (params?: ListParams): Promise<PaginatedResponse<User>> => {
        return apiService.getPaginatedList<User>('/api/user/list', params);
    },

    getManagers: async (params?: ListParams): Promise<PaginatedResponse<User>> => {
        return apiService.getPaginatedList<User>('/api/user/managers', params);
    },

    getById: async (id: string): Promise<User> => {
        return apiService.get<User>(`/api/user/${id}`);
    },

    getCurrentUser: async (): Promise<User> => {
        return apiService.get<User>('/api/user/me');
    },

    updateCurrentUser: async (data: Partial<User>): Promise<User> => {
        return apiService.put<User>('/api/user/me', data);
    },

    create: async (data: Partial<User>): Promise<User> => {
        return apiService.post<User>('/api/user/create', data);
    },

    update: async (id: string, data: Partial<User>): Promise<{ user: User; email_changed?: boolean; message: string }> => {
        return apiService.put<{ user: User; email_changed?: boolean; message: string }>(`/api/user/update/${id}`, data);
    },

    delete: async (id: string): Promise<void> => {
        return apiService.delete<void>(`/api/user/delete/${id}`);
    },

    deactivateUser: async (id: string): Promise<void> => {
        return apiService.post<void>(`/api/user/deactivate/${id}`, {});
    },

    reactivateUser: async (id: string): Promise<void> => {
        return apiService.post<void>(`/api/user/reactivate/${id}`, {});
    },

    resetPassword: async (id: string): Promise<{ message: string; email: string }> => {
        return apiService.post<{ message: string; email: string }>(`/api/user/reset-password/${id}`, {});
    },
};

export default userService;