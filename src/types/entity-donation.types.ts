import {BaseEntity, Currency} from "@/types/index.types.ts";

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
    ONLINE: 'online',
    OTHER: 'other'
} as const;

export type PaymentMethod = typeof PaymentMethod[keyof typeof PaymentMethod];

export const DonationScope = {
    GENERAL: 'general',
    PROJECT: 'project',
    ACTIVITY: 'activity',
    EMERGENCY: 'emergency',
    OPERATIONAL: 'operational'
} as const;

export type DonationScope = typeof DonationScope[keyof typeof DonationScope];

export interface EntityDonation extends BaseEntity {
    entity: string;
    entityName: string;
    project?: string;
    projectName?: string;
    activity?: string;
    activityTitle?: string;
    date: string;
    amount: number;
    currency: Currency;
    type: DonationType;
    paymentMethod: PaymentMethod;
    scope: DonationScope;
    documentReference?: string;
    notes?: string;
}

export interface EntityDonationCreateRequest {
    entity: string;
    project?: string | null;
    activity?: string | null;
    date: string;
    amount: number;
    currency: Currency;
    type: DonationType;
    paymentMethod: PaymentMethod;
    scope: DonationScope;
    documentReference?: string;
    notes?: string;
}

export interface EntityDonationUpdateRequest extends Partial<EntityDonationCreateRequest> {
    id: string;
}

export interface EntityDonationStats {
    totalAmount: number;
    totalCount: number;
    averageAmount: number;
    uniqueEntities: number;
}