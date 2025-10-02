/**
 * Membership Fee Types for CRM/ERP Compliance
 * Defines TypeScript interfaces for automated cotizații management
 */

export const MembershipFeeStatus = {
    PENDING: 'PENDING',
    PAID: 'PAID',
    OVERDUE: 'OVERDUE',
    CANCELLED: 'CANCELLED',
    REFUNDED: 'REFUNDED'
} as const;

export type MembershipFeeStatus = typeof MembershipFeeStatus[keyof typeof MembershipFeeStatus];

export const RenewPeriod = {
    MONTHLY: 'MONTHLY',
    QUARTERLY: 'QUARTERLY',
    SEMI_ANNUAL: 'SEMI_ANNUAL',
    ANNUAL: 'ANNUAL',
    ONE_TIME: 'ONE_TIME'
} as const;

export type RenewPeriod = typeof RenewPeriod[keyof typeof RenewPeriod];

export const PaymentMethod = {
    BANK_TRANSFER: 'BANK_TRANSFER',
    CREDIT_CARD: 'CREDIT_CARD',
    CASH: 'CASH',
    STRIPE: 'STRIPE',
    PAYPAL: 'PAYPAL',
    OTHER: 'OTHER'
} as const;

export type PaymentMethod = typeof PaymentMethod[keyof typeof PaymentMethod];

export interface MembershipFee {
    id: string;
    member_id: string;
    organization_id?: string;
    processed_by_id?: string;
    amount: number;
    currency: string;
    renew_period: RenewPeriod;
    started_from: string;
    ended_at: string;
    next_due_date?: string;
    status: MembershipFeeStatus;
    payment_method?: PaymentMethod;
    payment_date?: string;
    transaction_reference?: string;
    document_reference?: string;
    invoice_number?: string;
    receipt_number?: string;
    stripe_id?: string;
    auto_renew: boolean;
    notification_sent: boolean;
    reminder_count: number;
    last_reminder_sent?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface MembershipFeeCreateRequest {
    member_id: string;
    organization_id?: string;
    amount: number;
    currency?: string;
    renew_period: RenewPeriod;
    started_from: string;
    ended_at: string;
    auto_renew?: boolean;
    payment_method?: PaymentMethod;
    notes?: string;
}

export interface MembershipFeeUpdateRequest {
    amount?: number;
    status?: MembershipFeeStatus;
    payment_method?: PaymentMethod;
    payment_date?: string;
    transaction_reference?: string;
    auto_renew?: boolean;
    notes?: string;
}

export interface MembershipFeePaymentRequest {
    payment_method: PaymentMethod;
    transaction_reference?: string;
    payment_date?: string;
    processed_by_id?: string;
}
export interface MembershipFeeDisplayInfo {
    id: string;
    member_name: string;
    organization_name?: string;
    total_amount_with_currency: string;
    is_overdue: boolean;
    days_until_due: number;
    status: MembershipFeeStatus;
    can_send_reminder: boolean;
}

export interface MembershipFeeReport {
    total_fees: number;
    total_revenue: number;
    status_breakdown: Record<MembershipFeeStatus, number>;
    payment_method_breakdown: Record<PaymentMethod, number>;
    overdue_count: number;
    upcoming_renewals: number;
    auto_renew_enabled: number;
    generated_at: string;
}

export interface FeeAutomationStats {
    processed: number;
    notifications_sent: number;
    errors: number;
    renewals_created?: number;
}
export interface MembershipFeeFilter {
    member_id?: string;
    organization_id?: string;
    status?: MembershipFeeStatus;
    renew_period?: RenewPeriod;
    payment_method?: PaymentMethod;
    auto_renew?: boolean;
    overdue_only?: boolean;
    upcoming_renewals?: boolean;
    start_date?: string;
    end_date?: string;
}
export interface MembershipFeeService {
    getList: (params?: MembershipFeeFilter) => Promise<PaginatedResponse<MembershipFee>>;
    getById: (id: string) => Promise<MembershipFee>;
    create: (data: MembershipFeeCreateRequest) => Promise<MembershipFee>;
    update: (id: string, data: MembershipFeeUpdateRequest) => Promise<MembershipFee>;
    delete: (id: string) => Promise<void>;
    markAsPaid: (id: string, data: MembershipFeePaymentRequest) => Promise<MembershipFee>;
    sendReminder: (id: string) => Promise<boolean>;
    generateReport: (organizationId?: string) => Promise<MembershipFeeReport>;
    processOverdue: () => Promise<FeeAutomationStats>;
    processRenewals: (daysAhead?: number) => Promise<FeeAutomationStats>;
    bulkUpdate: (ids: string[], updates: MembershipFeeUpdateRequest) => Promise<FeeAutomationStats>;
}
export interface FeeCalculation {
    base_amount: number;
    period_multiplier: number;
    total_amount: number;
    next_due_date: string;
    period_display: string;
}
import { PaginatedResponse } from "@/types/index.types";
