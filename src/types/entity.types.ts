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