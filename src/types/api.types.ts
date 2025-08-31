export interface UserMeResponse {
    id: string,
    username: string;
    fullName: string;
    userGroups: string[];
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

export interface PaginatedResponse<T> {
    results: T[];
    count: number;
    next: string | null;
    previous: string | null;
}

export interface ApiConfig {
    readonly baseURL: string;
    readonly timeout: number;
    readonly headers: Record<string, string>;
}