export interface UserMeResponse {
    id: string,
    email: string;
    full_name: string;
    groups: string[];
}

export interface UserCreateRequest {
    full_name: string;
    email: string;
    personal_numerical_number?: string;
    company_number?: string;
    company_name?: string;
    group: string;
    phone_number?: string;
    status?: 'ACTIVE' | 'INACTIVE' | 'PENDING';
}

export interface UserCreateResponse {
    id: string;
    full_name: string;
    email: string;
    personal_numerical_number?: string;
    company_number?: string;
    company_name?: string;
    groups: string[];
    phone_number?: string;
    status: string;
    created_at: string;
    updated_at: string;
}

export interface ValidationError {
    field: string;
    message: string;
}

export interface ApiError {
    message: string;
    status: number;
    details?: ValidationError[];
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface ApiConfig {
    readonly baseURL: string;
    readonly timeout: number;
    readonly headers: Record<string, string>;
}