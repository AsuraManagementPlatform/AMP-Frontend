import React from "react";

export * from './auth.types';
export * from './api.types';
export * from './dashboard.types';
export * from './adminPanel.types';
export * from './table.types.ts';
export * from './form.types.ts';
export * from './user.types.ts';

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
