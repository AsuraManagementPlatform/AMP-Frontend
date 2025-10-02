import { z } from 'zod';
import { MembershipFeeStatus, RenewPeriod, PaymentMethod } from '@/types/membershipFee.types';
const TRANSACTION_REF_REGEX = /^[A-Za-z0-9_-]+$/;
export const createMembershipFeeSchema = z.object({
    member_id: z.string()
        .min(1, 'Membrul este obligatoriu')
        .uuid('ID-ul membrului trebuie să fie valid'),
    
    organization_id: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => {
                if (!value || value.trim() === '') return true;
                return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
            },
            { message: 'ID-ul organizației trebuie să fie valid' }
        ),
    
    amount: z.number()
        .min(0.01, 'Suma trebuie să fie pozitivă')
        .max(999999.99, 'Suma nu poate depăși 999,999.99'),
    
    currency: z.string()
        .optional()
        .default('RON')
        .refine(
            (value) => ['RON', 'EUR', 'USD'].includes(value),
            { message: 'Moneda trebuie să fie RON, EUR sau USD' }
        ),
    
    renew_period: z.enum([
        RenewPeriod.MONTHLY,
        RenewPeriod.QUARTERLY,
        RenewPeriod.SEMI_ANNUAL,
        RenewPeriod.ANNUAL,
        RenewPeriod.ONE_TIME
    ], {
        message: 'Perioada de reînnoire trebuie să fie una din valorile predefinite'
    }),
    
    started_from: z.string()
        .min(1, 'Data de început este obligatorie')
        .refine(
            (value) => !isNaN(Date.parse(value)),
            { message: 'Data de început trebuie să fie o dată validă' }
        ),
    
    ended_at: z.string()
        .min(1, 'Data de sfârșit este obligatorie')
        .refine(
            (value) => !isNaN(Date.parse(value)),
            { message: 'Data de sfârșit trebuie să fie o dată validă' }
        ),
    
    auto_renew: z.boolean()
        .optional()
        .default(false),
    
    payment_method: z.enum([
        PaymentMethod.BANK_TRANSFER,
        PaymentMethod.CREDIT_CARD,
        PaymentMethod.CASH,
        PaymentMethod.STRIPE,
        PaymentMethod.PAYPAL,
        PaymentMethod.OTHER
    ], {
        message: 'Metoda de plată trebuie să fie una din valorile predefinite'
    }).optional(),
    
    notes: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || value.length <= 1000,
            { message: 'Notele nu pot depăși 1000 de caractere' }
        )
}).refine(
    (data) => {
        const startDate = new Date(data.started_from);
        const endDate = new Date(data.ended_at);
        return startDate < endDate;
    },
    {
        message: 'Data de început trebuie să fie înaintea datei de sfârșit',
        path: ['ended_at']
    }
);
export const updateMembershipFeeSchema = z.object({
    amount: z.number()
        .min(0.01, 'Suma trebuie să fie pozitivă')
        .max(999999.99, 'Suma nu poate depăși 999,999.99')
        .optional(),
    
    status: z.enum([
        MembershipFeeStatus.PENDING,
        MembershipFeeStatus.PAID,
        MembershipFeeStatus.OVERDUE,
        MembershipFeeStatus.CANCELLED,
        MembershipFeeStatus.REFUNDED
    ], {
        message: 'Statusul trebuie să fie unul din valorile predefinite'
    }).optional(),
    
    payment_method: z.enum([
        PaymentMethod.BANK_TRANSFER,
        PaymentMethod.CREDIT_CARD,
        PaymentMethod.CASH,
        PaymentMethod.STRIPE,
        PaymentMethod.PAYPAL,
        PaymentMethod.OTHER
    ], {
        message: 'Metoda de plată trebuie să fie una din valorile predefinite'
    }).optional(),
    
    payment_date: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => {
                if (!value || value.trim() === '') return true;
                return !isNaN(Date.parse(value));
            },
            { message: 'Data plății trebuie să fie o dată validă' }
        ),
    
    transaction_reference: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => {
                if (!value || value.trim() === '') return true;
                return TRANSACTION_REF_REGEX.test(value);
            },
            { message: 'Referința tranzacției poate conține doar litere, cifre, liniuțe și underscore' }
        ),
    
    auto_renew: z.boolean()
        .optional(),
    
    notes: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || value.length <= 1000,
            { message: 'Notele nu pot depăși 1000 de caractere' }
        )
});
export const processFeePaymentSchema = z.object({
    payment_method: z.enum([
        PaymentMethod.BANK_TRANSFER,
        PaymentMethod.CREDIT_CARD,
        PaymentMethod.CASH,
        PaymentMethod.STRIPE,
        PaymentMethod.PAYPAL,
        PaymentMethod.OTHER
    ], {
        message: 'Metoda de plată este obligatorie'
    }),
    
    transaction_reference: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => {
                if (!value || value.trim() === '') return true;
                return TRANSACTION_REF_REGEX.test(value);
            },
            { message: 'Referința tranzacției poate conține doar litere, cifre, liniuțe și underscore' }
        ),
    
    payment_date: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => {
                if (!value || value.trim() === '') return true;
                return !isNaN(Date.parse(value));
            },
            { message: 'Data plății trebuie să fie o dată validă' }
        ),
    
    processed_by_id: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => {
                if (!value || value.trim() === '') return true;
                return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
            },
            { message: 'ID-ul procesatorului trebuie să fie valid' }
        )
});
export const bulkUpdateFeesSchema = z.object({
    fee_ids: z.array(z.string().uuid('ID-ul fee-ului trebuie să fie valid'))
        .min(1, 'Trebuie să selectați cel puțin un fee')
        .max(100, 'Nu puteți actualiza mai mult de 100 de fee-uri simultan'),
    
    updates: updateMembershipFeeSchema
});
export const membershipFeeFilterSchema = z.object({
    member_id: z.string()
        .optional()
        .or(z.literal('')),
    
    organization_id: z.string()
        .optional()
        .or(z.literal('')),
    
    status: z.enum([
        MembershipFeeStatus.PENDING,
        MembershipFeeStatus.PAID,
        MembershipFeeStatus.OVERDUE,
        MembershipFeeStatus.CANCELLED,
        MembershipFeeStatus.REFUNDED
    ]).optional(),
    
    renew_period: z.enum([
        RenewPeriod.MONTHLY,
        RenewPeriod.QUARTERLY,
        RenewPeriod.SEMI_ANNUAL,
        RenewPeriod.ANNUAL,
        RenewPeriod.ONE_TIME
    ]).optional(),
    
    payment_method: z.enum([
        PaymentMethod.BANK_TRANSFER,
        PaymentMethod.CREDIT_CARD,
        PaymentMethod.CASH,
        PaymentMethod.STRIPE,
        PaymentMethod.PAYPAL,
        PaymentMethod.OTHER
    ]).optional(),
    
    auto_renew: z.boolean().optional(),
    overdue_only: z.boolean().optional(),
    upcoming_renewals: z.boolean().optional(),
    
    start_date: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => {
                if (!value || value.trim() === '') return true;
                return !isNaN(Date.parse(value));
            },
            { message: 'Data de început trebuie să fie o dată validă' }
        ),
    
    end_date: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => {
                if (!value || value.trim() === '') return true;
                return !isNaN(Date.parse(value));
            },
            { message: 'Data de sfârșit trebuie să fie o dată validă' }
        )
}).refine(
    (data) => {
        if (!data.start_date || !data.end_date) return true;
        const startDate = new Date(data.start_date);
        const endDate = new Date(data.end_date);
        return startDate <= endDate;
    },
    {
        message: 'Data de început trebuie să fie înaintea sau egală cu data de sfârșit',
        path: ['end_date']
    }
);
export type CreateMembershipFeeData = z.infer<typeof createMembershipFeeSchema>;
export type UpdateMembershipFeeData = z.infer<typeof updateMembershipFeeSchema>;
export type ProcessFeePaymentData = z.infer<typeof processFeePaymentSchema>;
export type BulkUpdateFeesData = z.infer<typeof bulkUpdateFeesSchema>;
export type MembershipFeeFilterData = z.infer<typeof membershipFeeFilterSchema>;
export const getCreateMembershipFeeDefaultValues = (
    memberId?: string,
    organizationId?: string
): CreateMembershipFeeData => ({
    member_id: memberId || '',
    organization_id: organizationId || '',
    amount: 0,
    currency: 'RON',
    renew_period: RenewPeriod.ANNUAL,
    started_from: new Date().toISOString().split('T')[0],
    ended_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    auto_renew: false,
    notes: ''
});

export const getProcessPaymentDefaultValues = (): ProcessFeePaymentData => ({
    payment_method: PaymentMethod.BANK_TRANSFER,
    transaction_reference: '',
    payment_date: new Date().toISOString().split('T')[0],
    processed_by_id: ''
});

export const getMembershipFeeFilterDefaultValues = (): MembershipFeeFilterData => ({
    member_id: '',
    organization_id: '',
    auto_renew: undefined,
    overdue_only: false,
    upcoming_renewals: false,
    start_date: '',
    end_date: ''
});
