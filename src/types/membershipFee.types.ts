/**
 * Membership Fee Types for CRM/ERP Compliance
 * Defines TypeScript interfaces for automated cotizații management
 */

export const MembershipFeeStatus = {
    PENDING: 'PENDING',
    PENDING_VERIFICATION: 'PENDING_VERIFICATION',
    PAID: 'PAID',
    PARTIALLY_PAID: 'PARTIALLY_PAID',
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

export const PaymentStatus = {
    PENDING_APPROVAL: 'PENDING_APPROVAL',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED'
} as const;

export type PaymentStatus = typeof PaymentStatus[keyof typeof PaymentStatus];

export const RateType = {
    EMPLOYEE: 'EMPLOYEE',
    VOLUNTEER: 'VOLUNTEER',
    MEMBER: 'MEMBER',
    CUSTOM: 'CUSTOM'
} as const;

export type RateType = typeof RateType[keyof typeof RateType];

export interface MembershipFeePayment {
    id: string;
    membershipFeeId: string;
    amount: number;
    paymentDate: string;
    paymentProof?: string;
    paymentProofUrl?: string;
    paymentMethod?: PaymentMethod;
    notes?: string;
    status: PaymentStatus;
    approvedBy?: string;
    approvedByName?: string;
    approvedAt?: string;
    rejectionReason?: string;
    processedBy?: string;
    processedByName?: string;
    createdAt: string;
    updatedAt: string;
}

export interface MembershipFee {
    id: string;
    memberId: string;
    memberName?: string;
    memberGroups?: string[];
    organizationId?: string;
    organizationName?: string;
    processedById?: string;
    amount: number;
    currency: string;
    renewPeriod: RenewPeriod;
    startedFrom: string;
    endedAt: string;
    nextDueDate?: string;
    status: MembershipFeeStatus;
    paymentMethod?: PaymentMethod;
    paymentDate?: string;
    transactionReference?: string;
    documentReference?: string;
    invoiceNumber?: string;
    receiptNumber?: string;
    stripeId?: string;
    autoRenew: boolean;
    notificationSent: boolean;
    reminderCount: number;
    lastReminderSent?: string;
    notes?: string;
    isOverdue: boolean;
    daysUntilDue: number;
    totalAmountWithCurrency: string;
    gracePeriodDays: number;
    actualDeadline: string;
    paidAmount: number;
    remainingAmount: number;
    paymentProgress: string;
    finalDeadline: string;
    isPastFinalDeadline: boolean;
    payments?: MembershipFeePayment[];
    createdAt: string;
    updatedAt: string;
}

export interface MembershipFeeCreateRequest {
    member: string;
    organization?: string;
    rateType?: RateType;
    amount?: number;
    currency?: string;
    renewPeriod?: RenewPeriod;
    startedFrom?: string;
    endedAt?: string;
    paymentMethod?: PaymentMethod;
    autoRenew?: boolean;
    notes?: string;
}

export interface MembershipFeeUpdateRequest {
    member?: string;
    amount?: number;
    currency?: string;
    renew_period?: RenewPeriod;
    started_from?: string;
    ended_at?: string;
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
    document_reference?: string;
    processed_by_id?: string;
}

export interface MembershipFeePaymentCreateRequest {
    amount: number;
    paymentDate: string;
    paymentMethod?: PaymentMethod;
    paymentProof?: File;
    notes?: string;
}

export interface MembershipFeePaymentApprovalRequest {
    rejectionReason?: string;
}

export interface MembershipFeeDisplayInfo {
    id: string;
    member_name: string;
    organization_name?: string;
    total_amount_with_currency: string;
    is_overdue: boolean;
    days_until_due: number;
    grace_period_days: number;
    actual_deadline: string;
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

export interface MemberContributor {
    memberId: string;
    memberName: string;
    memberType: 'EMPLOYEE' | 'VOLUNTEER' | 'MEMBER' | 'ADMIN';
    totalPaid: number;
    totalPending: number;
    totalPendingVerification: number;
    totalOverdue: number;
    hasOverdueFees: boolean;
    lastPaymentDate?: string;
    nextDueDate?: string;
    feeCount: number;
    currency: string;
    fees: MembershipFee[];
}

import { PaginatedResponse } from "@/types/index.types";
