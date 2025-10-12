import React from "react";

export * from './auth.types';
export * from './api.types';
export * from './dashboard.types';
export * from './adminPanel.types';
export * from './table.types.ts';
export * from './form.types.ts';
export * from './user.types.ts';
export * from './project.types.ts';
export * from './activity.types.ts';
export * from './userExperience.types.ts';
export * from './budget.types.ts';
export * from './entity.types.ts';
export * from './financial.types.ts';
export * from './project-member.types.ts';
export * from './project-finance.types.ts';

export const Currency = {
    RON: 'RON',
    EUR: 'EUR',
    USD: 'USD'
} as const;

export type Currency = typeof Currency[keyof typeof Currency];

export const TransactionStatus = {
    DRAFT: 'DRAFT',
    PENDING_APPROVAL: 'PENDING_APPROVAL',
    APPROVED: 'APPROVED',
    PAID: 'PAID',
    REJECTED: 'REJECTED',
    CANCELLED: 'CANCELLED'
} as const;

export type TransactionStatus = typeof TransactionStatus[keyof typeof TransactionStatus];

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
