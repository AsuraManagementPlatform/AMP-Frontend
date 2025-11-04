export const OrganizationMemberType = {
    EMPLOYEE: 'EMPLOYEE',
    VOLUNTEER: 'VOLUNTEER',
    MEMBER: 'MEMBER',
} as const;

export type OrganizationMemberType = typeof OrganizationMemberType[keyof typeof OrganizationMemberType];

export const OrganizationMemberStatus = {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
    PENDING: 'PENDING',
    SUSPENDED: 'SUSPENDED',
} as const;

export type OrganizationMemberStatus = typeof OrganizationMemberStatus[keyof typeof OrganizationMemberStatus];

export interface OrganizationMember {
    id: string;
    member: string;
    organization: string;
    status: OrganizationMemberStatus;
    type: OrganizationMemberType;
    joinDate: string;
    position?: string;
    available: boolean;
    observation: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface OrganizationMemberWithDetails extends OrganizationMember {
    memberDetails: {
        id: string;
        fullName: string;
        email: string;
        phoneNumber?: string;
    };
    organizationDetails?: {
        id: string;
        name: string;
    };
    currentProjects?: Array<{
        id: string;
        name: string;
        role: string;
        status: string;
    }>;
    currentActivities?: Array<{
        id: string;
        title: string;
        role: string;
        projectName?: string;
        projectId?: string;
    }>;
    isFeePayer?: boolean;
}
