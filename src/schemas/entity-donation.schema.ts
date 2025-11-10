import {z} from 'zod';
import {t} from 'i18next';
import {DonationScope, DonationType, EntityDonation, PaymentMethod} from '@/types/entity-donation.types.ts';
import {validateMaxTwoDecimals} from "@/utils/validateTwoDegits.ts";
import {Currency} from "@/types/index.types.ts";

const URL_REGEX = /^https?:\/\/.+/i;

export const DONATION_TYPES = Object.values(DonationType);
export const PAYMENT_METHODS = Object.values(PaymentMethod);
export const DONATION_SCOPES = Object.values(DonationScope);
export const CURRENCIES = Object.values(Currency);

const createAmountValidation = () => z.union([
    z.number(),
    z.string()
]).transform((value) => {
    if (value === undefined || value === null || value === '') {
        throw new Error(t('schema.entity_donation.amount_required'));
    }
    if (typeof value === 'string') {
        const num = parseFloat(value);
        if (isNaN(num)) {
            throw new Error(t('schema.entity_donation.amount_must_be_number'));
        }
        return num;
    }
    return value;
}).refine(
    (value) => value > 0,
    t('schema.entity_donation.amount_must_be_positive')
).refine(
    (value) => validateMaxTwoDecimals(value),
    t('schema.entity_donation.amount_max_decimals')
);

export const createDonationSchema = z.object({
    entity: z.uuid(t('schema.entity_donation.entity_invalid'))
        .min(1, t('schema.entity_donation.entity_required')),

    type: z.enum(DONATION_TYPES as [DonationType, ...DonationType[]], {
        message: t('schema.entity_donation.type_invalid')
    }),

    scope: z.enum(DONATION_SCOPES as [DonationScope, ...DonationScope[]], {
        message: t('schema.entity_donation.scope_invalid')
    }),

    date: z.string()
        .min(1, t('schema.entity_donation.date_required'))
        .refine(
            (value) => !isNaN(Date.parse(value)),
            t('schema.entity_donation.date_invalid')
        ),

    amount: createAmountValidation(),

    currency: z.enum(CURRENCIES as [Currency, ...Currency[]], {
        message: t('schema.entity_donation.currency_invalid')
    }),

    paymentMethod: z.enum(PAYMENT_METHODS as [PaymentMethod, ...PaymentMethod[]], {
        message: t('schema.entity_donation.payment_method_invalid')
    }),

    project: z.uuid(t('schema.entity_donation.project_invalid'))
        .optional()
        .nullable()
        .transform((val) => val === '' || val === null ? null : val),

    activity: z.uuid(t('schema.entity_donation.activity_invalid'))
        .optional()
        .nullable()
        .transform((val) => val === '' || val === null ? null : val),

    documentReference: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => {
                if (!value) return true;
                return URL_REGEX.test(value);
            },
            t('schema.entity_donation.document_reference_invalid')
        ),

    notes: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => {
                if (!value) return true;
                return value.length <= 511;
            },
            t('schema.entity_donation.notes_max_length')
        )
});

export type CreateEntityDonationData = z.infer<typeof createDonationSchema>;

export const updateDonationSchema = createDonationSchema.extend({
    id: z.uuid(),
});

export type UpdateEntityDonationData = z.infer<typeof updateDonationSchema>;

export const getCreateDonationDefaultValues = (entity?: string): CreateEntityDonationData => ({
    entity: entity || '',
    type: DonationType.MONETARY,
    scope: DonationScope.GENERAL,
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    currency: Currency.RON,
    paymentMethod: PaymentMethod.BANK_TRANSFER,
    project: null,
    activity: null,
    documentReference: '',
    notes: ''
});

export const getUpdateDonationDefaultValues = (entityDonation: EntityDonation): UpdateEntityDonationData => ({
    id: entityDonation.id,
    entity: entityDonation.entity,
    type: entityDonation.type || DonationType.MONETARY,
    scope: entityDonation.scope || DonationScope.GENERAL,
    date: entityDonation.date || new Date().toISOString().split('T')[0],
    amount: entityDonation.amount || 0,
    currency: entityDonation.currency || Currency.RON,
    paymentMethod: entityDonation.paymentMethod || PaymentMethod.BANK_TRANSFER,
    project: entityDonation.project || null,
    activity: entityDonation.activity || null,
    documentReference: entityDonation.documentReference || '',
    notes: entityDonation.notes || ''
});