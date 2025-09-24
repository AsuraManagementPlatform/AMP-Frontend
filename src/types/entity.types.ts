import {BaseEntity} from "@/types/index.types.ts";

export const EntityType = {
    DONATOR: 'DONATOR',
    SPONSOR: 'SPONSOR',
    PARTNER: 'PARTNER'
} as const;

export type EntityType = typeof EntityType[keyof typeof EntityType];

export const EntityStatus = {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
    PENDING: 'PENDING',
    SUSPENDED: 'SUSPENDED'
} as const;

export type EntityStatus = typeof EntityStatus[keyof typeof EntityStatus];

export const ContributionType = {
    FINANCIAL: 'FINANCIAL',
    IN_KIND: 'IN_KIND',
    SERVICES: 'SERVICES',
    EQUIPMENT: 'EQUIPMENT',
    VOLUNTEER_TIME: 'VOLUNTEER_TIME'
} as const;

export type ContributionType = typeof ContributionType[keyof typeof ContributionType];

export interface Entity extends BaseEntity {
    name: string;
    type: EntityType;
    status: EntityStatus;
    email?: string;
    phoneNumber?: string;
    address?: string;
    contactPerson?: string;
    website?: string;
    description?: string;
    organizationId: string;
    userId?: string; // Optional - if entity has associated user account
    taxId?: string;
    registrationNumber?: string;
}

export interface EntityContribution extends BaseEntity {
    entityId: string;
    projectId?: string;
    type: ContributionType;
    description: string;
    value?: number;
    currency?: string;
    date: string;
    notes?: string;
}

export interface EntityRelationship extends BaseEntity {
    entityId: string;
    projectId?: string;
    organizationId: string;
    relationshipType: 'PRIMARY' | 'SECONDARY';
    startDate: string;
    endDate?: string;
    terms?: string;
    notes?: string;
}

// Create/Update requests
export interface EntityCreateRequest {
    name: string;
    type: EntityType;
    status: EntityStatus;
    email?: string;
    phoneNumber?: string;
    address?: string;
    contactPerson?: string;
    website?: string;
    description?: string;
    organizationId: string;
    userId?: string;
    taxId?: string;
    registrationNumber?: string;
}

export interface EntityUpdateRequest extends Partial<EntityCreateRequest> {}

export interface EntityContributionCreateRequest {
    entityId: string;
    projectId?: string;
    type: ContributionType;
    description: string;
    value?: number;
    currency?: string;
    date: string;
    notes?: string;
}

export interface EntityContributionUpdateRequest extends Partial<EntityContributionCreateRequest> {}

export interface EntityRelationshipCreateRequest {
    entityId: string;
    projectId?: string;
    organizationId: string;
    relationshipType: 'PRIMARY' | 'SECONDARY';
    startDate: string;
    endDate?: string;
    terms?: string;
    notes?: string;
}

export interface EntityStats {
    totalEntities: number;
    totalDonators: number;
    totalSponsors: number;
    totalPartners: number;
    totalContributions: number;
    totalContributionValue: number;
    activeRelationships: number;
}

export interface EntityFilter {
    type?: EntityType;
    status?: EntityStatus;
    organizationId?: string;
    hasUser?: boolean;
    search?: string;
}