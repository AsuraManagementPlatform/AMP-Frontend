import { BaseEntity } from "@/types/index.types.ts";

export const DonationType = {
    MONETARY: 'monetary',
    IN_KIND: 'in_kind',
    SERVICE: 'service',
    SPONSORSHIP: 'sponsorship',
    OTHER: 'other'
} as const;

export type DonationType = typeof DonationType[keyof typeof DonationType];

export const PaymentMethod = {
    CASH: 'cash',
    BANK_TRANSFER: 'bank_transfer',
    CARD: 'card',
    OTHER: 'other'
} as const;

export type PaymentMethod = typeof PaymentMethod[keyof typeof PaymentMethod];

export const DonationScope = {
    GENERAL: 'general',
    PROJECT: 'project',
    ACTIVITY: 'activity',
    EMERGENCY: 'emergency'
} as const;

export type DonationScope = typeof DonationScope[keyof typeof DonationScope];

export interface EntityDonation extends BaseEntity {
    entityId: string;
    entityName?: string;
    projectId?: string;
    projectName?: string;
    activityId?: string;
    activityName?: string;
    date: string;
    amount: number;
    currency: string;
    type: DonationType;
    paymentMethod: PaymentMethod;
    scope: DonationScope;
    documentReference?: string;
    notes?: string;
}

export interface EntityDonationCreateRequest {
    entityId: string;
    projectId?: string;
    activityId?: string;
    date: string;
    amount: number;
    currency: string;
    type: DonationType;
    paymentMethod: PaymentMethod;
    scope: DonationScope;
    documentReference?: string;
    notes?: string;
}

export interface EntityDonationUpdateRequest extends Partial<EntityDonationCreateRequest> {}

export interface DonationFilters {
    entityId?: string;
    projectId?: string;
    activityId?: string;
    type?: DonationType;
    paymentMethod?: PaymentMethod;
    scope?: DonationScope;
    dateFrom?: string;
    dateTo?: string;
    minAmount?: number;
    maxAmount?: number;
    search?: string;
}

export interface DonationStats {
    totalDonations: number;
    totalAmount: number;
    averageAmount: number;
    monetaryCount: number;
    inKindCount: number;
    serviceCount: number;
    sponsorshipCount: number;
}

export interface SponsorshipTarget {
    id: string;
    type: 'project' | 'activity';
    name: string;
    description?: string;
    budget?: number;
    currentFunding?: number;
}
