export const UserStatus = {
    DRAFT: 'DRAFT',
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
}

export type UserStatus = typeof UserStatus[keyof typeof UserStatus];


export interface CreateUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export interface CreateUserRequest {
    username: string;
    email: string;
    full_name: string;
    phone_number: string;
    personal_numerical_number?: string;
    company_number?: string;
    company_name?: string;
    group: string;
}

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