import {BaseEntity} from "@/types/index.types.ts";

export const LegalType = {
    FIZICA: 'fizica',
    JURIDICA: 'juridica'
} as const;

export type LegalType = typeof LegalType[keyof typeof LegalType];

export const EntityType = {
    DONOR: 'donor',
    SPONSOR: 'sponsor',
    PARTNER: 'partner',
    VOLUNTEER: 'voluntar',
    BENEFICIARY: 'beneficiar',
    OTHER: 'altul'
} as const;

export type EntityType = typeof EntityType[keyof typeof EntityType];

export const EntityStatus = {
    ACTIV: 'activ',
    INACTIV: 'inactiv',
    POTENTIAL: 'potential',
    BLOCAT: 'blocat'
} as const;

export type EntityStatus = typeof EntityStatus[keyof typeof EntityStatus];

export const EngagementLevel = {
    DELOC: 'deloc',
    PARTIAL: 'partial',
    TOTAL: 'total'
} as const;

export type EngagementLevel = typeof EngagementLevel[keyof typeof EngagementLevel];

export const ContributionType = {
    FINANCIAL: 'financiar',
    IN_KIND: 'in_kind',
    SERVICES: 'servicii',
    EQUIPMENT: 'echipament',
    VOLUNTEER_TIME: 'volunteer_time'
} as const;

export type ContributionType = typeof ContributionType[keyof typeof ContributionType];

export interface Entity extends BaseEntity {
    organization: string;
    organizationName: string;
    legalType: LegalType;
    name: string;
    identificationNumber: string;
    email: string;
    phone: string;
    address: string;
    address2?: string;
    type: EntityType;
    status: EntityStatus;
    observation?: string;
    engagementLevel?: EngagementLevel;
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

export interface EntityCreateRequest {
    organization: string;
    legalType: LegalType;
    name: string;
    identificationNumber: string;
    email: string;
    phone: string;
    address: string;
    address2?: string;
    type: EntityType;
    status?: EntityStatus;
    observation?: string;
    engagementLevel?: EngagementLevel;
}

export interface EntityUpdateRequest extends Partial<EntityCreateRequest> {
    id: string;
}

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

export interface EntityContributionUpdateRequest extends Partial<EntityContributionCreateRequest> {
    id: string;
}

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