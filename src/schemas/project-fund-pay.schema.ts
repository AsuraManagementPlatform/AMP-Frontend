import { z } from 'zod';
import { t } from 'i18next';
import {ProjectFund} from "@/types/project-fund.types.ts";

const validateMaxTwoDecimals = (value?: number) => {
    if (value === undefined) {
        throw new Error(t('schema.max_decimals'));
    }

    const decimalPlaces = (value.toString().split('.')[1] || '').length;
    if (decimalPlaces > 2) {
        throw new Error(t('schema.max_decimals'));
    }
    return true;
};

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
    amount: 0,
    date: new Date().toISOString().split('T')[0]
});