import {z} from 'zod';
import {ExpenseCategory, UnitType} from '@/types/project-expense.types';
import {TransactionStatus} from "@/types/transaction.types.ts";

export const EXPENSE_CATEGORIES = Object.values(ExpenseCategory);
export const UNIT_TYPES = Object.values(UnitType);
export const TRANSACTION_STATUSES = Object.values(TransactionStatus);

export const createProjectExpenseSchema = z.object({
    project: z.string()
        .min(1, 'Proiectul este obligatoriu'),

    activity: z.string()
        .min(1, 'Activitatea este obligatorie'),

    name: z.string()
        .min(2, 'Numele trebuie s─â aib─â cel pu╚¢in 2 caractere')
        .max(255, 'Numele nu poate dep─â╚Öi 255 de caractere'),

    unit_type: z.enum(UNIT_TYPES as [string, ...string[]], {
        message: 'Tipul unit─â╚¢ii selectat nu este valid'
    }),

    quantity: z.union([
        z.number(),
        z.string()
    ]).transform((value) => {
        if (typeof value === 'string') {
            if (value === '' || value === null || value === undefined) {
                throw new Error('Cantitatea este obligatorie');
            }
            const num = parseFloat(value);
            if (isNaN(num)) {
                throw new Error('Cantitatea trebuie s─â fie un num─âr valid');
            }
            return num;
        }
        return value;
    }).refine(
        (value) => value > 0,
        'Cantitatea trebuie s─â fie pozitiv─â'
    ),

    unit_price: z.union([
        z.number(),
        z.string()
    ]).transform((value) => {
        if (typeof value === 'string') {
            if (value === '' || value === null || value === undefined) {
                throw new Error('Pre╚¢ul unitar este obligatoriu');
            }
            const num = parseFloat(value);
            if (isNaN(num)) {
                throw new Error('Pre╚¢ul unitar trebuie s─â fie un num─âr valid');
            }
            return num;
        }
        return value;
    }).refine(
        (value) => value > 0,
        'Pre╚¢ul unitar trebuie s─â fie pozitiv'
    ),

    category: z.enum(EXPENSE_CATEGORIES as [string, ...string[]], {
        message: 'Categoria selectat─â nu este valid─â'
    }),

    currency: z.enum(['RON', 'EUR', 'USD'], {
        message: 'Moneda selectat─â nu este valid─â'
    }),

    status: z.enum(TRANSACTION_STATUSES as [string, ...string[]], {
        message: 'Statusul selectat nu este valid'
    }).default(TransactionStatus.DRAFT)
});

export type CreateProjectExpenseData = z.infer<typeof createProjectExpenseSchema>;

export const updateProjectExpenseSchema = z.object({
    project: z.string()
        .optional()
        .or(z.literal('')),

    activity: z.string()
        .optional()
        .or(z.literal('')),

    name: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || (value.length >= 2 && value.length <= 255),
            'Numele trebuie s─â aib─â ├«ntre 2 ╚Öi 255 caractere'
        ),

    unit_type: z.enum(UNIT_TYPES as [string, ...string[]], {
        message: 'Tipul unit─â╚¢ii selectat nu este valid'
    }).optional(),

    quantity: z.union([
        z.number(),
        z.string()
    ]).optional().transform((value) => {
        if (value === undefined || value === null || value === '') {
            return undefined;
        }
        if (typeof value === 'string') {
            const num = parseFloat(value);
            if (isNaN(num)) {
                throw new Error('Cantitatea trebuie s─â fie un num─âr valid');
            }
            return num;
        }
        return value;
    }).refine(
        (value) => value === undefined || value > 0,
        'Cantitatea trebuie s─â fie pozitiv─â'
    ),

    unit_price: z.union([
        z.number(),
        z.string()
    ]).optional().transform((value) => {
        if (value === undefined || value === null || value === '') {
            return undefined;
        }
        if (typeof value === 'string') {
            const num = parseFloat(value);
            if (isNaN(num)) {
                throw new Error('Pre╚¢ul unitar trebuie s─â fie un num─âr valid');
            }
            return num;
        }
        return value;
    }).refine(
        (value) => value === undefined || value > 0,
        'Pre╚¢ul unitar trebuie s─â fie pozitiv'
    ),

    category: z.enum(EXPENSE_CATEGORIES as [string, ...string[]], {
        message: 'Categoria selectat─â nu este valid─â'
    }).optional(),

    currency: z.enum(['RON', 'EUR', 'USD'], {
        message: 'Moneda selectat─â nu este valid─â'
    }).optional(),

    status: z.enum(TRANSACTION_STATUSES as [string, ...string[]], {
        message: 'Statusul selectat nu este valid'
    }).optional()
});

export type UpdateProjectExpenseData = z.infer<typeof updateProjectExpenseSchema>;

export const getCreateProjectExpenseDefaultValues = (projectId?: string, activityId?: string): CreateProjectExpenseData => ({
    project: projectId || '',
    activity: activityId || '',
    name: '',
    unit_type: UnitType.NUMBER,
    quantity: 1,
    unit_price: 0,
    category: ExpenseCategory.OTHER,
    currency: 'RON',
    status: TransactionStatus.DRAFT
});
