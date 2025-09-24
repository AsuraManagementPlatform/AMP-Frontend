import {PaginatedResponse, UserGroup} from "@/types/index.types.ts";
import {UserCreateRequest} from "@/schemas/user.schema.ts";

export const UserStatus = {
    DRAFT: 'DRAFT',
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
}

export type UserStatus = typeof UserStatus[keyof typeof UserStatus];

export interface UserMeResponse {
    id: string,
    full_name: string;
    email: string;
    personal_numerical_number: string;
    phone_number?: string;
    isLegalEntity: boolean;
    company_number?: string;
    company_name?: string;
    groups: UserGroup[];
    status: UserStatus;
    organization_id?: string;
}

export interface User {
    id: string,
    full_name: string;
    email: string;
    phone_number?: string;
    personal_numerical_number?: string;
    company_number?: string;
    company_name?: string;
    groups: string[];
    status: string;
    organization_id?: string;
}

export interface UserFilter {
    status?: UserStatus;
    company_name?: string;
    email?: string;
    groups?: string;
    search?: string;
}

export interface UserService {
    getList: (params?: any) => Promise<PaginatedResponse<User>>;
    getById: (id: number) => Promise<User>;
    create: (data: UserCreateRequest) => Promise<User>;
    //update: (id: number, data: UpdateUserRequest) => Promise<User>;
    delete: (id: number) => Promise<void>;
}
