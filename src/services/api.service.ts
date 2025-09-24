import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {ApiError, ApiConfig, PaginatedResponse} from '@/types/index.types';
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
            details: error.response?.data?.details || error.response?.data?.errors || []
        };

        return Promise.reject(apiError);
    }
);

export class ApiService {
    async get<T>(url: string): Promise<T> {
        const response: AxiosResponse<T> = await apiClient.get(url);
        return response.data;
    }

    async post<T>(url: string, data?: any): Promise<T> {
        const response: AxiosResponse<T> = await apiClient.post(url, data);
        return response.data;
    }

    async put<T>(url: string, data?: any): Promise<T> {
        const response: AxiosResponse<T> = await apiClient.put(url, data);
        return response.data;
    }

    async delete<T>(url: string): Promise<T> {
        const response: AxiosResponse<T> = await apiClient.delete(url);
        return response.data;
    }

    async getPaginatedList<T>(
        endpoint: string,
        params?: {
            page?: number;
            pageSize?: number;
            search?: string;
            sortBy?: string;
            sortDirection?: 'asc' | 'desc';
            filters?: Record<string, any>;
        }
    ): Promise<PaginatedResponse<T>> {
        const searchParams = new URLSearchParams();

        if (params?.page && params.page > 0) {
            searchParams.append('page', params.page.toString());
        }
        if (params?.pageSize && params.pageSize > 0) {
            searchParams.append('page_size', params.pageSize.toString());
        }
        if (params?.search?.trim()) {
            searchParams.append('search', params.search.trim());
        }
        if (params?.sortBy?.trim()) {
            searchParams.append('sort_by', params.sortBy.trim());
        }
        if (params?.sortDirection) {
            searchParams.append('sort_direction', params.sortDirection);
        }

        if (params?.filters) {
            Object.entries(params.filters).forEach(([key, value]) => {
                if (value !== null && value !== undefined && value !== '') {
                    // Convert boolean values to strings
                    const stringValue = typeof value === 'boolean' ? value.toString() : value.toString();
                    searchParams.append(key, stringValue);
                }
            });
        }

        const queryString = searchParams.toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;

        return this.get<PaginatedResponse<T>>(url);
    }
}

export const apiService = new ApiService();