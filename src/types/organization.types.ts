export const OrganizationStatus = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    PENDING: 'pending'
} as const;

export type OrganizationStatus = typeof OrganizationStatus[keyof typeof OrganizationStatus];

export const OrganizationType = {
    NGO: 'NGO',
    ASSOCIATION: 'ASSOCIATION',
    FOUNDATION: 'FOUNDATION',
    COMPANY: 'COMPANY',
    COOPERATIVE: 'COOPERATIVE',
    OTHER: 'OTHER'
} as const;

export type OrganizationType = typeof OrganizationType[keyof typeof OrganizationType];
export interface OrganizationCreateRequest {
    name: string;
    legal_name?: string;
    short_name?: string;
    cui?: string;
    registration_number?: string;
    email: string;
    phone_number?: string;
    secondary_phone?: string;
    fax_number?: string;
    website?: string;
    address: string;
    address2?: string;
    city?: string;
    county?: string;
    postal_code?: string;
    country?: string;
    organization_type?: OrganizationType;
    industry_sector?: string;
    description?: string;
    budget?: number;
    funding_sources?: string[];
    registration_date?: string;
    tax_exempt_status?: boolean;
    employee_count?: number;
    volunteer_count?: number;
    member_count?: number;
    status: OrganizationStatus;
    admin_user?: string;
    is_verified?: boolean;
    social_media_links?: Record<string, string>;
    activeModules?: string[];
}

export interface Organization {
    id: string;
    name: string;
    legal_name?: string;
    short_name?: string;
    cui?: string;
    registration_number?: string;
    email: string;
    phone_number?: string;
    secondary_phone?: string;
    fax_number?: string;
    website?: string;
    address: string;
    address2?: string;
    city?: string;
    county?: string;
    postal_code?: string;
    country?: string;
    organization_type?: OrganizationType;
    industry_sector?: string;
    description?: string;
    budget?: number;
    funding_sources?: string[];
    registration_date?: string;
    tax_exempt_status?: boolean;
    membership_fee_employee?: number;
    membership_fee_volunteer?: number;
    membership_fee_member?: number;
    fee_grace_period_days?: number;
    membershipFeeEmployee?: number;
    membershipFeeVolunteer?: number;
    membershipFeeMember?: number;
    feeGracePeriodDays?: number;
    employee_count?: number;
    volunteer_count?: number;
    member_count?: number;
    member_statistics?: OrganizationMemberStats;
    status: OrganizationStatus;
    admin_user: string;
    is_verified?: boolean;
    verification_date?: string;
    social_media_links?: Record<string, string>;
    activeModules?: string[];
    created_at: string;
    updated_at: string;
}

export interface OrganizationCreateResponse extends Organization {}
export interface OrganizationDisplayInfo {
    id: string;
    display_name: string;
    is_romanian_entity: boolean;
    is_tax_compliant: boolean;
    has_complete_profile: boolean;
    contact_info: OrganizationContactInfo;
    member_statistics: OrganizationMemberStats;
}

export interface OrganizationContactInfo {
    email: string;
    phone_number?: string;
    secondary_phone?: string;
    fax_number?: string;
    website?: string;
    address: string;
    address2?: string;
    city?: string;
    county?: string;
    postal_code?: string;
    country?: string;
}

export interface OrganizationMemberStats {
    employee_count: number;
    volunteer_count: number;
    member_count: number;
    total_people: number;
}

export interface OrganizationStatsResponse {
    active_projects: number;
    ongoing_activities: number;
    active_members: number;
    organization_id: string;
}
