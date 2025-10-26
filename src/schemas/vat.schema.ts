import {z} from "zod";
import {t} from "i18next";

export const createVatSchema = z.object({
    name: z.string().min(3, `${t('schema.vat.min_name')}`),
    value: z.coerce.number().min(0, `${t('schema.vat.min_value')}`).max(100, `${t('schema.vat.max_value')}`),
});

export type CreateVatData = z.infer<typeof createVatSchema>;

export const updateVatSchema = z.object({
    id: z.string(),
    name: z.string().min(3, `${t('schema.vat.min_name')}`),
    value: z.coerce.number().min(0, `${t('schema.vat.min_value')}`).max(100, `${t('schema.vat.max_value')}`),
})

export type UpdateVatData = z.infer<typeof updateVatSchema>;

export const getCreateVatDefaultValues = (): CreateVatData => ({
    name: '',
    value: 0
});
