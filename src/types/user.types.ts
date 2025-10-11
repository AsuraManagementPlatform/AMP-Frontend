import {PaginatedResponse, UserGroup} from "@/types/index.types.ts";
import {UserCreateRequest} from "@/schemas/user.schema.ts";

export const UserStatus = {
    DRAFT: 'DRAFT',
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
} as const;

export type UserStatus = typeof UserStatus[keyof typeof UserStatus];
export interface UserMeResponse {
    id: string;
    full_name: string;
    first_name?: string;
    last_name?: string;
    email: string;
    cnp?: string;
    personal_numerical_number?: string;
    isLegalEntity: boolean;
    company_number?: string;
    company_name?: string;
    cui?: string;
    phone_number?: string;
    secondary_phone?: string;
    address?: string;
    city?: string;
    county?: string;
    postal_code?: string;
    country?: string;
    groups: UserGroup[];
    status: UserStatus;
    organization_id?: string;
    last_login?: string;
    registration_date?: string;
    is_active: boolean;
    profession?: string;
    bio?: string;
}

export interface User {
    id: string;
    full_name: string;
    first_name?: string;
    last_name?: string;
    email: string;
    cnp?: string;
    personal_numerical_number?: string;
    phone_number?: string;
    secondary_phone?: string;
    company_number?: string;
    company_name?: string;
    cui?: string;
    address?: string;
    city?: string;
    county?: string;
    postal_code?: string;
    country?: string;
    groups: string[];
    status: string;
    organization_id?: string;
    last_login?: string;
    registration_date?: string;
    is_active: boolean;
    profession?: string;
    bio?: string;
    created_at?: string;
    updated_at?: string;
}
export interface UserDisplayInfo {
    id: string;
    display_name: string;
    is_romanian_citizen: boolean;
    has_business_info: boolean;
    has_complete_profile: boolean;
    contact_info: UserContactInfo;
}

export interface UserContactInfo {
    email: string;
    phone_number?: string;
    secondary_phone?: string;
    address?: string;
    city?: string;
    county?: string;
    postal_code?: string;
    country?: string;
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
    update: (id: number, data: Partial<User>) => Promise<User>;
    delete: (id: number) => Promise<void>;
}

