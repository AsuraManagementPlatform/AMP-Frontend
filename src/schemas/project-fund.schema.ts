import { z } from 'zod';
import {t} from "i18next";
import {ProjectFund} from "@/types/project-fund.types.ts";
import {validateMaxTwoDecimals} from "@/utils/validateTwoDegits.ts";
import {Currency} from "@/types/index.types.ts";

export const createProjectFundSchema = z.object({
    project: z.uuid().min(1, t('schema.project_fund.project_required')),

    activity: z.uuid()
        .optional()
        .nullable()
        .transform((val) => val === '' || val === null ? undefined : val),

    entity: z.uuid()
        .optional()
        .nullable()
        .transform((val) => val === '' || val === null ? undefined : val),

    estimatedAmount: z.union([
        z.number(),
        z.string()
    ]).transform((value) => {
        if (typeof value === 'string') {
            if (value === '' || value === null || value === undefined) {
                throw new Error(t('schema.project_fund.estimated_amount_required'));
            }
            const num = parseFloat(value);
            if (isNaN(num)) {
                throw new Error(t('schema.project_fund.estimated_amount_must_be_number'));
            }
            return num;
        }
        return value;
    }).refine(
        (value) => value >= 0,
        t('schema.project_fund.estimated_amount_must_be_positive')
    ).refine(
        (value) => validateMaxTwoDecimals(value),
        t('schema.project_fund.estimated_amount_max_decimals')
    ),

    source: z.string()
        .min(1, t('schema.project_fund.source_required'))
        .max(255, t('schema.project_fund.source_max')),

    category: z.string()
        .min(1, t('schema.project_fund.category_required'))
        .max(255, t('schema.project_fund.category_max')),

    sourceName: z.string()
        .min(1, t('schema.project_fund.source_name_required'))
        .max(255, t('schema.project_fund.source_name_max')),

    currency: z.enum([Currency.RON, Currency.EUR, Currency.USD], {
        message: t('schema.project_fund.currency_invalid')
    }),

    estimatedDate: z.string()
        .min(1, t('schema.project_fund.estimated_date_required'))
        .refine(
            (value) => !isNaN(Date.parse(value)),
            t('schema.project_fund.estimated_date_invalid')
        ),

    paymentMethod: z.string()
        .min(1, t('schema.project_fund.payment_method_required'))
        .max(255, t('schema.project_fund.payment_method_max')),

    scope: z.string()
        .min(1, t('schema.project_fund.scope_required'))
        .max(255, t('schema.project_fund.scope_max')),

    documentReference: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => {
                if (!value) return true;
                try {
                    new URL(value);
                    return true;
                } catch {
                    return false;
                }
            },
            t('schema.project_fund.document_reference_invalid')
        ),

    notes: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || value.length <= 511,
            t('schema.project_fund.notes_max')
        )
});

export type CreateProjectFundData = z.infer<typeof createProjectFundSchema>;

export const updateProjectFundSchema = createProjectFundSchema.partial().extend({
    id: z.string()
});

export type UpdateProjectFundData = z.infer<typeof updateProjectFundSchema>;

export const getCreateProjectFundDefaultValues = (projectId?: string): CreateProjectFundData => ({
    project: projectId || '',
    activity: undefined,
    entity: undefined,
    estimatedAmount: 0,
    source: '',
    category: '',
    sourceName: '',
    currency: Currency.RON,
    estimatedDate: new Date().toISOString().split('T')[0],
    paymentMethod: '',
    scope: '',
    documentReference: '',
    notes: ''
});

export const payProjectFundSchema = z.object({
    id: z.string(),
    amount: z.union([
        z.number(),
        z.string()
    ]).transform((value) => {
        if (typeof value === 'string') {
            if (value === '' || value === null || value === undefined) {
                throw new Error(t('schema.project_fund.amount_required'));
            }
            const num = parseFloat(value);
            if (isNaN(num)) {
                throw new Error(t('schema.project_fund.amount_must_be_number'));
            }
            return num;
        }
        return value;
    }).refine(
        (value) => value > 0,
        t('schema.project_fund.amount_must_be_positive')
    ).refine(
        (value) => validateMaxTwoDecimals(value),
        t('schema.project_fund.amount_max_decimals')
    ),

    date: z.string()
        .min(1, t('schema.project_fund.date_required'))
        .refine(
            (value) => !isNaN(Date.parse(value)),
            t('schema.project_fund.date_invalid')
        )
});

export type PayProjectFundData = z.infer<typeof payProjectFundSchema>;

export const getPayProjectFundDefaultValues = (projectFund: ProjectFund): PayProjectFundData => ({
    id: projectFund.id,
    amount: projectFund.estimatedAmount || 0,
    date: new Date().toISOString().split('T')[0]
});