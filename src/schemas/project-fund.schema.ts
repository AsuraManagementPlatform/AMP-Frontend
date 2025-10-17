import { z } from 'zod';

export const createProjectFundSchema = z.object({
    project: z.string()
        .min(1, 'Proiectul este obligatoriu'),

    estimatedAmount: z.union([
        z.number(),
        z.string()
    ]).transform((value) => {
        if (typeof value === 'string') {
            if (value === '' || value === null || value === undefined) {
                throw new Error('Suma estimată este obligatorie');
            }
            const num = parseFloat(value);
            if (isNaN(num)) {
                throw new Error('Suma estimată trebuie să fie un număr valid');
            }
            return num;
        }
        return value;
    }).refine(
        (value) => value >= 0,
        'Suma estimată nu poate fi negativă'
    ),

    amount: z.union([
        z.number(),
        z.string()
    ]).transform((value) => {
        if (typeof value === 'string') {
            if (value === '' || value === null || value === undefined) {
                throw new Error('Suma este obligatorie');
            }
            const num = parseFloat(value);
            if (isNaN(num)) {
                throw new Error('Suma trebuie să fie un număr valid');
            }
            return num;
        }
        return value;
    }).refine(
        (value) => value >= 0,
        'Suma nu poate fi negativă'
    ),

    source: z.string()
        .min(1, 'Sursa este obligatorie')
        .max(255, 'Sursa nu poate depăși 255 de caractere'),

    category: z.string()
        .min(1, 'Categoria este obligatorie')
        .max(255, 'Categoria nu poate depăși 255 de caractere'),

    sourceName: z.string()
        .min(1, 'Numele sursei este obligatoriu')
        .max(255, 'Numele sursei nu poate depăși 255 de caractere'),

    currency: z.enum(['RON', 'EUR', 'USD'], {
        message: 'Moneda selectată nu este validă'
    }),

    estimatedDate: z.string()
        .min(1, 'Data estimată este obligatorie')
        .refine(
            (value) => !isNaN(Date.parse(value)),
            'Data estimată nu este validă'
        ),

    date: z.string()
        .min(1, 'Data este obligatorie')
        .refine(
            (value) => !isNaN(Date.parse(value)),
            'Data nu este validă'
        ),

    paymentMethod: z.string()
        .min(1, 'Metoda de plată este obligatorie')
        .max(255, 'Metoda de plată nu poate depăși 255 de caractere'),

    scope: z.string()
        .min(1, 'Scopul este obligatoriu')
        .max(255, 'Scopul nu poate depăși 255 de caractere'),

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
            'Referința documentului trebuie să fie un URL valid'
        ),

    notes: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || value.length <= 511,
            'Notele nu pot depăși 511 caractere'
        )
}).refine((data) => {
    if (data.estimatedDate && data.date) {
        const estimatedDate = new Date(data.estimatedDate);
        const actualDate = new Date(data.date);
        if (isNaN(estimatedDate.getTime()) || isNaN(actualDate.getTime())) {
            return false;
        }
        return actualDate >= estimatedDate;
    }
    return true;
}, {
    message: 'Data actuală nu poate fi înainte de data estimată',
    path: ['date']
});

export type CreateProjectFundData = z.infer<typeof createProjectFundSchema>;

export const updateProjectFundSchema = z.object({
    project: z.string()
        .optional()
        .or(z.literal('')),

    estimatedAmount: z.union([
        z.number(),
        z.string()
    ]).optional().transform((value) => {
        if (value === undefined || value === null || value === '') {
            return undefined;
        }
        if (typeof value === 'string') {
            const num = parseFloat(value);
            if (isNaN(num)) {
                throw new Error('Suma estimată trebuie să fie un număr valid');
            }
            return num;
        }
        return value;
    }).refine(
        (value) => value === undefined || value >= 0,
        'Suma estimată nu poate fi negativă'
    ),

    amount: z.union([
        z.number(),
        z.string()
    ]).optional().transform((value) => {
        if (value === undefined || value === null || value === '') {
            return undefined;
        }
        if (typeof value === 'string') {
            const num = parseFloat(value);
            if (isNaN(num)) {
                throw new Error('Suma trebuie să fie un număr valid');
            }
            return num;
        }
        return value;
    }).refine(
        (value) => value === undefined || value >= 0,
        'Suma nu poate fi negativă'
    ),

    source: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || value.length <= 255,
            'Sursa nu poate depăși 255 de caractere'
        ),

    category: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || value.length <= 255,
            'Categoria nu poate depăși 255 de caractere'
        ),

    sourceName: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || value.length <= 255,
            'Numele sursei nu poate depăși 255 de caractere'
        ),

    currency: z.enum(['RON', 'EUR', 'USD'], {
        message: 'Moneda selectată nu este validă'
    }).optional(),

    estimatedDate: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || !isNaN(Date.parse(value)),
            'Data estimată nu este validă'
        ),

    date: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || !isNaN(Date.parse(value)),
            'Data nu este validă'
        ),

    paymentMethod: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || value.length <= 255,
            'Metoda de plată nu poate depăși 255 de caractere'
        ),

    scope: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || value.length <= 255,
            'Scopul nu poate depăși 255 de caractere'
        ),

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
            'Referința documentului trebuie să fie un URL valid'
        ),

    notes: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || value.length <= 511,
            'Notele nu pot depăși 511 caractere'
        )
}).refine((data) => {
    if (data.estimatedDate && data.date) {
        const estimatedDate = new Date(data.estimatedDate);
        const actualDate = new Date(data.date);
        if (isNaN(estimatedDate.getTime()) || isNaN(actualDate.getTime())) {
            return true;
        }
        return actualDate >= estimatedDate;
    }
    return true;
}, {
    message: 'Data actuală nu poate fi înainte de data estimată',
    path: ['date']
});

export type UpdateProjectFundData = z.infer<typeof updateProjectFundSchema>;

export const getCreateProjectFundDefaultValues = (projectId?: string): CreateProjectFundData => ({
    project: projectId || '',
    estimatedAmount: 0,
    amount: 0,
    source: '',
    category: '',
    sourceName: '',
    currency: 'RON',
    estimatedDate: '',
    date: '',
    paymentMethod: '',
    scope: '',
    documentReference: '',
    notes: ''
});
