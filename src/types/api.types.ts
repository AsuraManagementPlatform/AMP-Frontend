export interface ValidationError {
    field: string;
    message: string;
}

export interface ApiError {
    message: string;
    status: number;
    details?: ValidationError[];
}

export interface ApiConfig {
    readonly baseURL: string;
    readonly timeout: number;
    readonly headers: Record<string, string>;
}

export interface ListParams {
    page?: number;
    pageSize?: number;
    search?: string;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
    filters?: Record<string, any>;
}