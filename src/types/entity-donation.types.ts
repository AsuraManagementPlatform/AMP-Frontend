import {BaseEntity, Currency} from "@/types/index.types.ts";
import {EngagementLevel} from "@/types/project-partner.types.ts";

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

export const DonationStatus = {
    PENDING: 'PENDING',
    CONFIRMED: 'CONFIRMED',
    REJECTED: 'REJECTED',
    CANCELLED: 'CANCELLED'
} as const;

export type DonationStatus = typeof DonationStatus[keyof typeof DonationStatus];

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
    type: string;
    paymentMethod: PaymentMethod;
    scope: DonationScope;
    status: DonationStatus;
    documentReference?: string;
    notes?: string;
    projectFund?: string;
    confirmedBy?: string;
    confirmedByName?: string;
    confirmedAt?: string;
}

export interface EntityDonationCreateRequest {
    entity: string;
    project?: string;
    activity?: string;
    date: string;
    amount: number;
    currency: Currency;
    type: string;
    paymentMethod: PaymentMethod;
    scope: DonationScope;
    documentReference?: string;
    notes?: string;
    engagementLevel?: EngagementLevel;
}

export interface EntityDonationUpdateRequest extends Partial<Omit<EntityDonationCreateRequest, 'engagementLevel'>> {
    id: string;
}

export interface EntityDonationStats {
    totalAmount: number;
    totalCount: number;
    averageAmount: number;
    uniqueEntities: number;
}

export interface EntityPartnershipProject {
    project: string;
    projectName: string;
    engagementLevel: string | null;
    totalDonations: number;
    donationsCount: number;
    donations: EntityDonation[];
}