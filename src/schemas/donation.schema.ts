import { z } from 'zod';
import { DonationType, PaymentMethod, DonationScope } from '@/types/donation.types';

const URL_REGEX = /^https?:\/\/.+/i;

export const createDonationSchema = z.object({
    entityId: z.string()
        .uuid('ID-ul entității trebuie să fie valid'),
    
    type: z.enum([
        DonationType.MONETARY,
        DonationType.IN_KIND,
        DonationType.SERVICE,
        DonationType.SPONSORSHIP,
        DonationType.OTHER
    ], {
        message: 'Tipul donației este invalid'
    }),
    
    scope: z.enum([
        DonationScope.GENERAL,
        DonationScope.PROJECT,
        DonationScope.ACTIVITY,
        DonationScope.EMERGENCY
    ], {
        message: 'Scopul donației este invalid'
    }),
    
    date: z.string()
        .min(1, 'Data donației este obligatorie')
        .refine(
            (value) => !isNaN(Date.parse(value)),
            'Data donației nu este validă'
        ),
    
    amount: z.number()
        .min(0, 'Suma trebuie să fie pozitivă')
        .max(999999999, 'Suma este prea mare'),
    
    currency: z.string()
        .min(3, 'Moneda trebuie să aibă cel puțin 3 caractere')
        .max(10, 'Moneda nu poate depăși 10 caractere')
        .regex(/^[A-Z]{3}$/i, 'Moneda trebuie să fie în format ISO (ex: RON, EUR, USD)'),
    
    paymentMethod: z.enum([
        PaymentMethod.CASH,
        PaymentMethod.BANK_TRANSFER,
        PaymentMethod.CARD,
        PaymentMethod.OTHER
    ], {
        message: 'Metoda de plată este invalidă'
    }),
    
    projectId: z.string()
        .uuid('ID-ul proiectului trebuie să fie valid')
        .optional()
        .or(z.literal('')),
    
    activityId: z.string()
        .uuid('ID-ul activității trebuie să fie valid')
        .optional()
        .or(z.literal('')),
    
    documentReference: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => {
                if (!value) return true;
                return URL_REGEX.test(value);
            },
            'Referința trebuie să fie un URL valid (ex: https://...)'
        ),
    
    notes: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => {
                if (!value) return true;
                return value.length <= 511;
            },
            'Notele nu pot depăși 511 caractere'
        )
});

export type CreateDonationData = z.infer<typeof createDonationSchema>;

export const getCreateDonationDefaultValues = (): CreateDonationData => ({
    entityId: '',
    type: DonationType.MONETARY,
    scope: DonationScope.GENERAL,
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    currency: 'RON',
    paymentMethod: PaymentMethod.BANK_TRANSFER,
    projectId: '',
    activityId: '',
    documentReference: '',
    notes: ''
});
