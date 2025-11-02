import React from "react";

export * from './auth.types';
export * from './api.types';
export * from './dashboard.types';
export * from './table.types.ts';
export * from './form.types.ts';
export * from './user.types.ts';
export * from './project.types.ts';
export * from './activity.types.ts';
export * from './userExperience.types.ts';
export * from './budget.types.ts';
export * from './entity.types.ts';
export * from './project-member.types.ts';
export * from './project-fund.types.ts';
export * from './project-expense.types.ts';
export * from './vat.types.ts';
export * from './entity-donation.types.ts';
export * from './entity-communication.types.ts'

export const Currency = {
    RON: 'RON',
    EUR: 'EUR',
    USD: 'USD'
} as const;

export type Currency = typeof Currency[keyof typeof Currency];

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
