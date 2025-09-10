import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {ApiError, ApiConfig} from '@/types/index.types';
import {getAuthHeader} from "@/services/keycloak.service";
import env from '@/env';


export const API_CONFIG: ApiConfig = {
    baseURL: env.VITE_API_BASE_URL,
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
            
            // Debug logging for development
            if (import.meta.env.DEV) {
                console.log('[API] Request details:', {
                    url: `${config.baseURL}${config.url}`,
                    method: config.method?.toUpperCase(),
                    hasAuthHeader: !!authHeader.Authorization,
                    authHeaderPreview: authHeader.Authorization ? 
                        `${authHeader.Authorization.substring(0, 20)}...` : 'none'
                });
            }
        } else if (import.meta.env.DEV) {
            console.warn('[API] No authorization header available for request to:', config.url);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        // Log successful responses in development
        if (import.meta.env.DEV) {
            console.log('[API] Success response:', {
                url: response.config.url,
                status: response.status,
                method: response.config.method?.toUpperCase()
            });
        }
        return response;
    },
    (error) => {
        // Enhanced error logging
        if (import.meta.env.DEV) {
            console.error('[API] Error response:', {
                url: error.config?.url,
                method: error.config?.method?.toUpperCase(),
                status: error.response?.status,
                statusText: error.response?.statusText,
                responseData: error.response?.data,
                message: error.message
            });
        }

        if (error.response?.status === 401) {
            console.warn('[API] Unauthorized - token may be expired');
        }

        if (error.response?.status === 403) {
            console.warn('[API] Forbidden - user may not have required permissions');
        }

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