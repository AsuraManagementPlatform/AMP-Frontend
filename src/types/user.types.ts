import {UserGroup} from "@/types/auth.types.ts";

export const UserStatus = {
    DRAFT: 'DRAFT',
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
}

export type UserStatus = typeof UserStatus[keyof typeof UserStatus];

export interface CreateUserFormData {
    full_name: string;
    email: string;
    personal_numerical_number: string;
    phone_number?: string;
    company_number?: string;
    company_name?: string;
    group: UserGroup;
    status: UserStatus;
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

export interface UserMeResponse {
    id: string,
    email: string;
    full_name: string;
    groups: string[];
}

