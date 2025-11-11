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
    legalName?: string;
    shortName?: string;
    cui?: string;
    registrationNumber?: string;
    email: string;
    phoneNumber?: string;
    secondaryPhone?: string;
    faxNumber?: string;
    website?: string;
    address: string;
    address2?: string;
    city?: string;
    county?: string;
    postalCode?: string;
    country?: string;
    organizationType?: OrganizationType;
    industrySector?: string;
    description?: string;
    budget?: number;
    fundingSources?: string[];
    registrationDate?: string;
    taxExemptStatus?: boolean;
    employeeCount?: number;
    volunteerCount?: number;
    memberCount?: number;
    status: OrganizationStatus;
    adminUser?: string;
    isVerified?: boolean;
    socialMediaLinks?: Record<string, string>;
    activeModules?: string[];
}

export interface Organization {
    id: string;
    name: string;
    legalName?: string;
    shortName?: string;
    cui?: string;
    registrationNumber?: string;
    email: string;
    phoneNumber?: string;
    secondaryPhone?: string;
    faxNumber?: string;
    website?: string;
    address: string;
    address2?: string;
    city?: string;
    county?: string;
    postalCode?: string;
    country?: string;
    organizationType?: OrganizationType;
    industrySector?: string;
    description?: string;
    budget?: number;
    fundingSources?: string[];
    registrationDate?: string;
    taxExemptStatus?: boolean;
    membershipFeeEmployee?: number;
    membershipFeeVolunteer?: number;
    membershipFeeMember?: number;
    feeGracePeriodDays?: number;
    employeeCount?: number;
    volunteerCount?: number;
    memberCount?: number;
    memberStatistics?: OrganizationMemberStats;
    status: OrganizationStatus;
    adminUser: string;
    isVerified?: boolean;
    verificationDate?: string;
    socialMediaLinks?: Record<string, string>;
    activeModules?: string[];
    createdAt: string;
    updatedAt: string;
}

export interface OrganizationMemberStats {
    employeeCount: number;
    volunteerCount: number;
    memberCount: number;
    totalPeople: number;
}

export interface OrganizationStatsResponse {
    activeProjects: number;
    ongoingActivities: number;
    activeMembers: number;
    organizationId: string;
}