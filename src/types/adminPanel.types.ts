import {UserStatus} from "@/types/user.types.ts";

export interface UpdateUserRequest {
    username: string;
    email: string;
    full_name: string;
    phone_number: string;
    personal_numerical_number?: string;
    company_number?: string;
    company_name?: string;
    group: string;
    status?: UserStatus;
}

export interface AdminPanelStats {
    totalUsers: number;
    adminUsers: number;
    organizationAdmins: number;
    activeUsers: number;
    suspendedUsers: number;
}