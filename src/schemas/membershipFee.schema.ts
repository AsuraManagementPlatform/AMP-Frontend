import { z } from 'zod';
import { RenewPeriod, PaymentMethod, RateType } from '@/types/membershipFee.types';

export const createMembershipFeeSchema = z.object({
    memberId: z.uuid('ID-ul membrului trebuie să fie valid'),
    organizationId: z.uuid('ID organizație invalid').optional(),
    rateType: z.enum([RateType.EMPLOYEE, RateType.VOLUNTEER, RateType.MEMBER, RateType.CUSTOM]).refine((val) => val !== undefined, {
        message: 'Tipul cotizației este obligatoriu'
    }),
    customAmount: z.coerce.number().min(0.01, 'Suma trebuie sa fie pozitiva').max(999999.99).optional(),
    currency: z.string().optional(),
    renewPeriod: z.enum([RenewPeriod.MONTHLY, RenewPeriod.QUARTERLY, RenewPeriod.SEMI_ANNUAL, RenewPeriod.ANNUAL, RenewPeriod.ONE_TIME]),
    startedFrom: z.string().min(1, 'Data de început este obligatorie'),
    endedAt: z.string().min(1, 'Data de sfârșit este obligatorie'),
    autoRenew: z.boolean().default(false),
    paymentMethod: z.enum([PaymentMethod.BANK_TRANSFER, PaymentMethod.CREDIT_CARD, PaymentMethod.CASH, PaymentMethod.STRIPE, PaymentMethod.PAYPAL, PaymentMethod.OTHER]).optional(),
    notes: z.string().optional()
}).refine(
    (data) => {
        if (data.rateType === RateType.CUSTOM) {
            return data.customAmount && data.customAmount > 0;
        }
        return true;
    },
    {
        message: 'Suma personalizată este obligatorie când selectezi "Sumă personalizată"',
        path: ['customAmount']
    }
);

export type CreateMembershipFeeData = z.infer<typeof createMembershipFeeSchema>;

export const updateMembershipFeeSchema = z.object({
    memberId: z.uuid('ID-ul membrului trebuie să fie valid'),
    organizationId: z.uuid('ID organizație invalid').optional(),
    amount: z.coerce.number().min(0.01, 'Suma trebuie sa fie pozitiva').max(999999.99),
    currency: z.string().default('RON'),
    renewPeriod: z.enum([RenewPeriod.MONTHLY, RenewPeriod.QUARTERLY, RenewPeriod.SEMI_ANNUAL, RenewPeriod.ANNUAL, RenewPeriod.ONE_TIME]),
    startedFrom: z.string().min(1, 'Data de început este obligatorie'),
    endedAt: z.string().min(1, 'Data de sfârșit este obligatorie'),
    autoRenew: z.boolean().default(false),
    paymentMethod: z.enum([PaymentMethod.BANK_TRANSFER, PaymentMethod.CREDIT_CARD, PaymentMethod.CASH, PaymentMethod.STRIPE, PaymentMethod.PAYPAL, PaymentMethod.OTHER]).optional(),
    notes: z.string().optional()
});

export type UpdateMembershipFeeData = z.infer<typeof updateMembershipFeeSchema>;

export const getCreateMembershipFeeDefaultValues = (memberId?: string, organizationId?: string): Partial<CreateMembershipFeeData> => ({
    memberId: memberId || '',
    organizationId: organizationId || '',
    rateType: '' as any,
    customAmount: undefined,
    currency: undefined,
    renewPeriod: RenewPeriod.ANNUAL,
    startedFrom: new Date().toISOString().split('T')[0],
    endedAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    autoRenew: false,
    paymentMethod: undefined,
    notes: undefined
});

export const processPaymentSchema = z.object({
    paymentMethod: z.enum([PaymentMethod.BANK_TRANSFER, PaymentMethod.CREDIT_CARD, PaymentMethod.CASH, PaymentMethod.STRIPE, PaymentMethod.PAYPAL, PaymentMethod.OTHER]),
    transactionReference: z.string().optional().or(z.literal('')),
    paymentDate: z.string().optional().or(z.literal('')),
    documentReference: z.string().url('Linkul trebuie să fie valid').optional().or(z.literal(''))
});

export type ProcessPaymentData = z.infer<typeof processPaymentSchema>;

export const getProcessPaymentDefaultValues = (): ProcessPaymentData => ({
    paymentMethod: PaymentMethod.BANK_TRANSFER,
    transactionReference: '',
    paymentDate: new Date().toISOString().split('T')[0],
    documentReference: ''
});

export const processPaymentSelfSchema = z.object({
    paymentMethod: z.enum([PaymentMethod.BANK_TRANSFER, PaymentMethod.CREDIT_CARD, PaymentMethod.CASH, PaymentMethod.STRIPE, PaymentMethod.PAYPAL, PaymentMethod.OTHER]),
    transactionReference: z.string().min(1, 'Referința tranzacției este obligatorie'),
    paymentDate: z.string().optional().or(z.literal('')),
    documentReference: z.string().url('Linkul către dovada plății este obligatoriu').min(1, 'Dovada plății este obligatorie')
});

export type ProcessPaymentSelfData = z.infer<typeof processPaymentSelfSchema>;

export const getProcessPaymentSelfDefaultValues = (): ProcessPaymentSelfData => ({
    paymentMethod: PaymentMethod.BANK_TRANSFER,
    transactionReference: '',
    paymentDate: new Date().toISOString().split('T')[0],
    documentReference: ''
});
