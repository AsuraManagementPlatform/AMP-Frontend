import {ListParams, PaginatedResponse, User, UserMeResponse} from "@/types/index.types.ts";
import {apiService} from "@/services/api.service.ts";

export const userService = {
    getList: async (params?: ListParams): Promise<PaginatedResponse<User>> => {
        return apiService.getPaginatedList<User>('/api/user/list', params);
    },

    getById: async (id: string): Promise<User> => {
        return apiService.get<User>(`/api/user/${id}`);
    },

    getCurrentUser: async (): Promise<UserMeResponse> => {
        return apiService.get<UserMeResponse>('/api/user/me');
    },

    create: async (data: Partial<User>): Promise<User> => {
        return apiService.post<User>('/api/user/create', data);
    },

    update: async (id: string, data: Partial<User>): Promise<User> => {
        return apiService.put<User>(`/api/user/update/${id}`, data);
    },

    delete: async (id: string): Promise<void> => {
        return apiService.delete<void>(`/api/user/delete/${id}`);
    },
};

export default userService;