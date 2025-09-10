import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {ApiError, ApiConfig} from '@/types/index.types';
import {getAuthHeader} from "@/services/keycloak.service";


export const API_CONFIG: ApiConfig = {
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
} as const;

const apiClient: AxiosInstance = axios.create({
    baseURL: API_CONFIG.baseURL,
    timeout: API_CONFIG.timeout,
    headers: API_CONFIG.headers,
});

apiClient.interceptors.request.use(
    (config) => {
        const authHeader = getAuthHeader();
        if (authHeader.Authorization) {
            config.headers.Authorization = authHeader.Authorization;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    (error) => {
        const apiError: ApiError = {
            message: error.response?.data?.message || error.message || 'An error occurred',
            status: error.response?.status || 0,
            details: error.response?.data?.details || []
        };

        return Promise.reject(apiError);
    }
);

export const organizationApi = {
    /**
     * Get all organizations user has access to
     */
    getOrganizations: async () => {
        const response = await apiClient.get('/api/organizations');
        return response.data;
    },
};

export default apiClient;