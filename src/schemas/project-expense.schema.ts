import {z} from 'zod';
import {
    ExpenseCategory,
    ExpenseCategoryType,
    Unit, UnitType
} from "@/types/index.types.ts";
import {t} from "i18next";

export const EXPENSE_CATEGORIES = Object.values(ExpenseCategory);
export const UNIT_TYPES = Object.values(Unit);

const validateMaxTwoDecimals = (value?: number) => {
    if (value === undefined) {
        return true;
    }

    const decimalPlaces = (value.toString().split('.')[1] || '').length;
    return decimalPlaces <= 2;
};

export const createProjectExpenseSchema = z.object({
    project: z.string()
        .min(1, 'Proiectul este obligatoriu'),

    activity: z.string()
        .min(1, 'Activitatea este obligatorie'),

    vat: z.string()
        .min(1, 'TVA-ul este obligatorie'),

    name: z.string()
        .min(2, 'Numele trebuie să aibă cel puțin 2 caractere')
        .max(255, 'Numele nu poate depăși 255 de caractere'),

    unitType: z.enum(UNIT_TYPES as [UnitType, ...UnitType[]], {
        message: 'Tipul unității selectat nu este valid'
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
                throw new Error('Cantitatea trebuie să fie un număr valid');
            }
            return num;
        }
        return value;
    }).refine(
        (value) => value > 0,
        'Cantitatea trebuie să fie pozitivă'
    ).refine(
        (value) => validateMaxTwoDecimals(value),
        'Cantitatea nu poate avea mai mult de 2 zecimale'
    ),

    unitPrice: z.union([
        z.number(),
        z.string()
    ]).transform((value) => {
        if (typeof value === 'string') {
            if (value === '' || value === null || value === undefined) {
                throw new Error('Prețul unitar este obligatoriu');
            }
            const num = parseFloat(value);
            if (isNaN(num)) {
                throw new Error('Prețul unitar trebuie să fie un număr valid');
            }
            return num;
        }
        return value;
    }).refine(
        (value) => value > 0,
        'Prețul unitar trebuie să fie pozitiv'
    ).refine(
        (value) => validateMaxTwoDecimals(value),
        'Prețul unitar nu poate avea mai mult de 2 zecimale'
    ),

    category: z.enum(EXPENSE_CATEGORIES as [ExpenseCategoryType, ...ExpenseCategoryType[]], {
        message: 'Categoria selectată nu este validă'
    }),

    currency: z.enum(['RON', 'EUR', 'USD'], {
        message: 'Moneda selectată nu este validă'
    })
});

export type CreateProjectExpenseData = z.infer<typeof createProjectExpenseSchema>;

export const updateProjectExpenseSchema = z.object({
    id: z.string(),

    project: z.string()
        .optional()
        .or(z.literal('')),

    activity: z.string()
        .optional()
        .or(z.literal('')),

    vat: z.string()
        .optional()
        .or(z.literal('')),

    name: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || (value.length >= 2 && value.length <= 255),
            'Numele trebuie să aibă între 2 și 255 caractere'
        ),

    unitType: z.enum(UNIT_TYPES as [UnitType, ...UnitType[]], {
        message: 'Tipul unității selectat nu este valid'
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
                throw new Error('Cantitatea trebuie să fie un număr valid');
            }
            return num;
        }
        return value;
    }).refine(
        (value) => value === undefined || value > 0,
        'Cantitatea trebuie să fie pozitivă'
    ).refine(
        (value) => validateMaxTwoDecimals(value),
        'Cantitatea nu poate avea mai mult de 2 zecimale'
    ),

    unitPrice: z.union([
        z.number(),
        z.string()
    ]).optional().transform((value) => {
        if (value === undefined || value === null || value === '') {
            return undefined;
        }
        if (typeof value === 'string') {
            const num = parseFloat(value);
            if (isNaN(num)) {
                throw new Error('Prețul unitar trebuie să fie un număr valid');
            }
            return num;
        }
        return value;
    }).refine(
        (value) => value === undefined || value > 0,
        'Prețul unitar trebuie să fie pozitiv'
    ).refine(
        (value) => validateMaxTwoDecimals(value),
        'Prețul unitar nu poate avea mai mult de 2 zecimale'
    ),

    category: z.enum(EXPENSE_CATEGORIES as [ExpenseCategoryType, ...ExpenseCategoryType[]], {
        message: 'Categoria selectată nu este validă'
    }).optional(),

    currency: z.enum(['RON', 'EUR', 'USD'], {
        message: 'Moneda selectată nu este validă'
    }).optional()
});

export type UpdateProjectExpenseData = z.infer<typeof updateProjectExpenseSchema>;

export const getCreateProjectExpenseDefaultValues = (projectId?: string, activityId?: string, vatId?: string): CreateProjectExpenseData => ({
    project: projectId || '',
    activity: activityId || '',
    vat: vatId || '',
    name: '',
    unitType: Unit.NUMBER,
    quantity: 1,
    unitPrice: 0,
    category: ExpenseCategory.OTHER,
    currency: 'RON'
});

export const executeProjectExpenseSchema = z.object({
    vat: z.string()
        .min(1, t('schema.project_expense.vat_required')),

    quantity: z.union([
        z.number(),
        z.string()
    ]).transform((value) => {
        if (typeof value === 'string') {
            if (value === '' || value === null || value === undefined) {
                throw new Error(t('schema.project_expense.quantity_required'));
            }
            const num = parseFloat(value);
            if (isNaN(num)) {
                throw new Error(t('schema.project_expense.quantity_must_be_number'));
            }
            return num;
        }
        return value;
    }).refine(
        (value) => value > 0,
        t('schema.project_expense.quantity_must_be_positive')
    ).refine(
        (value) => validateMaxTwoDecimals(value),
        t('schema.project_expense.quantity_max_decimals')
    ),

    unitPrice: z.union([
        z.number(),
        z.string()
    ]).transform((value) => {
        if (typeof value === 'string') {
            if (value === '' || value === null || value === undefined) {
                throw new Error(t('schema.project_expense.unit_price_required'));
            }
            const num = parseFloat(value);
            if (isNaN(num)) {
                throw new Error(t('schema.project_expense.unit_price_must_be_number'));
            }
            return num;
        }
        return value;
    }).refine(
        (value) => value > 0,
        t('schema.project_expense.unit_price_must_be_positive')
    ).refine(
        (value) => validateMaxTwoDecimals(value),
        t('schema.project_expense.unit_price_max_decimals')
    ),

    date: z.string()
        .min(1, t('schema.project_expense.date_required'))
        .refine(
            (value) => !isNaN(Date.parse(value)),
            t('schema.project_expense.date_invalid')
        )
});

export type ExecuteProjectExpenseData = z.infer<typeof executeProjectExpenseSchema>;

export const getExecuteProjectExpenseDefaultValues = (expense: any): ExecuteProjectExpenseData => ({
    vat: expense.vat || '',
    quantity: expense.quantity || 1,
    unitPrice: expense.unitPrice || 0,
    date: new Date().toISOString().split('T')[0]
});