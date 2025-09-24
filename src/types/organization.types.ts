export const OrganizationStatus = {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
    PENDING: 'PENDING'
} as const;

export type OrganizationStatus = typeof OrganizationStatus[keyof typeof OrganizationStatus];

export interface OrganizationCreateRequest {
    name: string;
    email: string;
    phone_number?: string;
    unique_code: string;
    address: string;
    address2?: string;
    status: OrganizationStatus;
    admin_user?: string; // Will be set automatically from context
}

export interface OrganizationCreateResponse {
    id: string;
    name: string;
    email: string;
    phone_number?: string;
    unique_code: string;
    address: string;
    address2?: string;
    status: string;
    admin_user: string;
    created_at: string;
    updated_at: string;
}

export interface OrganizationStatsResponse {
    active_projects: number;
    ongoing_activities: number;
    active_members: number;
    organization_id: string;
}