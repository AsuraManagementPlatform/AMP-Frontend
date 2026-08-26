import axios, { AxiosInstance, AxiosResponse } from 'axios';
import i18next from 'i18next';
import {ApiError, ApiConfig, PaginatedResponse, ListParams} from '@/types/index.types';
import {getAuthHeader} from "@/services/keycloak.service";
import { convertKeysToSnakeCase, convertKeysToCamelCase } from '@/utils/caseConverter';
import {
    SurveyQuestion,
    SurveyQuestionDetail,
    SurveyQuestionCreate,
    SurveyResponseSubmit,
    UserSurveyResponse,
    SurveyResults
} from '@/types/survey.types';

export const API_CONFIG: ApiConfig = {
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/',
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

        if (config.data) {
            config.data = convertKeysToSnakeCase(config.data);
        }

        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        if (response.data && response.config.responseType !== 'blob') {
            response.data = convertKeysToCamelCase(response.data);
        }
        return response;
    },
    (error) => {
        const apiError: ApiError = {
            message: resolveErrorMessage(error),
            status: error.response?.status || 0,
            details: error.response?.data?.details || error.response?.data?.errors || []
        };

        return Promise.reject(apiError);
    }
);

/**
 * Turn a backend error payload into text the user can read.
 * The backend answers with translation keys, so they are resolved here, once,
 * instead of in every component that displays an error.
 */
function resolveErrorMessage(error: any): string {
    const payload = error.response?.data;
    const backendMessage = typeof payload?.message === 'string'
        ? payload.message
        : (typeof payload?.detail === 'string' ? payload.detail : null);

    if (backendMessage) {
        return i18next.t(backendMessage);
    }

    if (error.response?.status) {
        return i18next.t('toast.default_error_message');
    }

    return error.message || i18next.t('toast.default_error_message');
}

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

    async patch<T>(url: string, data?: any): Promise<T> {
        const response: AxiosResponse<T> = await apiClient.patch(url, data);
        return response.data;
    }

    async delete<T>(url: string): Promise<T> {
        const response: AxiosResponse<T> = await apiClient.delete(url);
        return response.data;
    }

    async postFormData<T>(url: string, formData: FormData): Promise<T> {
        const response: AxiosResponse<T> = await apiClient.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }

    async getBlob(url: string): Promise<Blob> {
        const response: AxiosResponse<Blob> = await apiClient.get(url, { responseType: 'blob' });
        return response.data;
    }

    async getPaginatedList<T>(
        endpoint: string,
        params?: ListParams
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
                    const stringValue = typeof value === 'boolean' ? value.toString() : value.toString();
                    searchParams.append(key, stringValue);
                }
            });
        }

        const queryString = searchParams.toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;

        return this.get<PaginatedResponse<T>>(url);
    }

    async getActiveSurveyQuestions(): Promise<SurveyQuestion[]> {
        return this.get<SurveyQuestion[]>('survey/questions/active');
    }

    async getMySurveys(): Promise<SurveyQuestion[]> {
        return this.get<SurveyQuestion[]>('survey/questions/my-surveys');
    }

    async getSurveyQuestionDetail(id: string): Promise<SurveyQuestionDetail> {
        return this.get<SurveyQuestionDetail>(`survey/questions/${id}`);
    }

    async createSurveyQuestion(data: SurveyQuestionCreate): Promise<SurveyQuestion> {
        return this.post<SurveyQuestion>('survey/questions/create', data);
    }

    async deleteSurveyQuestion(id: string): Promise<{ message: string }> {
        return this.delete<{ message: string }>(`survey/questions/${id}/delete`);
    }

    async sendSurveyReminder(id: string): Promise<{ message: string }> {
        return this.post<{ message: string }>(`survey/questions/${id}/reminder`);
    }

    async publishSurveyQuestion(id: string, notifyMembers: boolean = true): Promise<{ message: string }> {
        return this.post<{ message: string }>(`survey/questions/${id}/publish`, { notify_members: notifyMembers });
    }

    async closeSurveyQuestion(id: string): Promise<{ message: string }> {
        return this.post<{ message: string }>(`survey/questions/${id}/close`);
    }

    async submitSurveyResponse(id: string, data: SurveyResponseSubmit): Promise<UserSurveyResponse> {
        return this.post<UserSurveyResponse>(`survey/questions/${id}/submit`, data);
    }

    async getSurveyResults(id: string): Promise<SurveyResults> {
        return this.get<SurveyResults>(`survey/questions/${id}/results`);
    }
}

export const apiService = new ApiService();
