export * from './auth.types';
export * from './api.types';
export * from './dashboard.types';
export * from './adminPanel.types';

export interface BaseEntity {
    id: string;
    createdAt: string;
    updatedAt: string;
}

export interface PaginatedResponse<T> {
    results: T[];
    count: number;
    next: string | null;
    previous: string | null;
}

export interface BaseComponentProps {
    className?: string;
    children?: React.ReactNode;
}
