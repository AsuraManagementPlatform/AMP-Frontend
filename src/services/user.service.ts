import {UserMeResponse} from "@/types/api.types.ts";
import apiClient from "@/services/api.service.ts";
import {CreateUserRequest, UpdateUserRequest} from "@/types/adminPanel.types.ts";

export const userService = {
    /**
     * Get all users (admin only)
     */
    getAllUsers: async (): Promise<UserMeResponse[]> => {
        const response = await apiClient.get<UserMeResponse[]>('/api/user/list');
        return response.data;
    },

    /**
     * Get current user information
     */
    getCurrentUser: async (): Promise<UserMeResponse> => {
        const response = await apiClient.get<UserMeResponse>('/api/user/me');
        return response.data;
    },

    /**
     * Get specific user by ID
     */
    getUserById: async (userId: string): Promise<UserMeResponse> => {
        const response = await apiClient.get<UserMeResponse>(`/api/user/${userId}`);
        return response.data;
    },

    /**
     * Create new user
     */
    createUser: async (userData: CreateUserRequest): Promise<UserMeResponse> => {
        const response = await apiClient.post<UserMeResponse>('/api/user/create', userData);
        return response.data;
    },

    /**
     * Update user information
     */
    updateUser: async (userId: string, userData: UpdateUserRequest): Promise<UserMeResponse> => {
        const response = await apiClient.put<UserMeResponse>(`/api/user/update/${userId}`, userData);
        return response.data;
    },

    /**
     * Delete user
     */
    deleteUser: async (userId: string): Promise<void> => {
        await apiClient.delete(`/api/user/delete/${userId}`);
    }
};

export default userService;