import {PaginatedResponse, User, UserMeResponse} from "@/types/index.types.ts";
import {apiService} from "@/services/api.service.ts";

export const userService = {
    getList: async (params?: any): Promise<PaginatedResponse<User>> => {
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

export const createEntityService = <T extends { id: number }>(endpoint: string) => {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;

    return {
        getList: async (params?: any): Promise<PaginatedResponse<T>> => {
            return apiService.getPaginatedList<T>(`/${cleanEndpoint}`, params);
        },

        getById: async (id: number): Promise<T> => {
            return apiService.get<T>(`/${cleanEndpoint}/${id}`);
        },

        create: async (data: Partial<T>): Promise<T> => {
            return apiService.post<T>(`/${cleanEndpoint}`, data);
        },

        update: async (id: number, data: Partial<T>): Promise<T> => {
            return apiService.put<T>(`/${cleanEndpoint}/${id}`, data);
        },

        delete: async (id: number): Promise<void> => {
            return apiService.delete<void>(`/${cleanEndpoint}/${id}`);
        },
    };
};

export default userService;