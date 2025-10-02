import { z } from 'zod';
import { ExpenseCategory, ExpenseStatus, IncomeCategory, IncomeStatus } from '@/types/financial.types';

export const createExpenseSchema = z.object({
    projectId: z.string()
        .min(1, 'ID-ul proiectului este obligatoriu'),
    
    category: z.enum([
        ExpenseCategory.PERSONNEL,
        ExpenseCategory.EQUIPMENT,
        ExpenseCategory.MATERIALS,
        ExpenseCategory.SERVICES,
        ExpenseCategory.TRAVEL,
        ExpenseCategory.UTILITIES,
        ExpenseCategory.MARKETING,
        ExpenseCategory.ADMINISTRATIVE,
        ExpenseCategory.OTHER
    ], {
        message: 'Categoria cheltuielii este invalidă'
    }),
    
    description: z.string()
        .min(2, 'Descrierea trebuie să aibă cel puțin 2 caractere')
        .max(500, 'Descrierea nu poate depăși 500 de caractere'),
    
    amount: z.number()
        .min(0.01, 'Suma trebuie să fie mai mare de 0')
        .refine(
            (value) => Number.isFinite(value) && value > 0,
            'Suma trebuie să fie un număr valid pozitiv'
        ),
    
    currency: z.string()
        .min(3, 'Moneda trebuie să aibă cel puțin 3 caractere')
        .max(3, 'Moneda trebuie să aibă exact 3 caractere')
        .default('RON'),
    
    status: z.enum([
        ExpenseStatus.DRAFT,
        ExpenseStatus.PENDING_APPROVAL,
        ExpenseStatus.APPROVED,
        ExpenseStatus.PAID,
        ExpenseStatus.REJECTED,
        ExpenseStatus.CANCELLED
    ], {
        message: 'Statusul cheltuielii este invalid'
    }),
    
    expenseDate: z.string()
        .min(1, 'Data cheltuielii este obligatorie')
        .refine(
            (value) => {
                return !isNaN(Date.parse(value));
            },
            'Data cheltuielii nu este validă'
        ),
    
    vendor: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => {
                if (!value) return true;
                return value.length <= 255;
            },
            'Numele furnizorului nu poate depăși 255 de caractere'
        ),
    
    receiptUrl: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => {
                if (!value) return true;
                return /^https?:\/\/.+/.test(value);
            },
            'URL-ul bonului trebuie să înceapă cu http:// sau https://'
        ),
    
    notes: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => {
                if (!value) return true;
                return value.length <= 1000;
            },
            'Notele nu pot depăși 1000 de caractere'
        )
});

export const createIncomeSchema = z.object({
    projectId: z.string()
        .min(1, 'ID-ul proiectului este obligatoriu'),
    
    category: z.enum([
        IncomeCategory.GRANT,
        IncomeCategory.DONATION,
        IncomeCategory.SPONSORSHIP,
        IncomeCategory.SERVICE_FEE,
        IncomeCategory.PRODUCT_SALE,
        IncomeCategory.MEMBERSHIP_FEE,
        IncomeCategory.OTHER
    ], {
        message: 'Categoria venitului este invalidă'
    }),
    
    description: z.string()
        .min(2, 'Descrierea trebuie să aibă cel puțin 2 caractere')
        .max(500, 'Descrierea nu poate depăși 500 de caractere'),
    
    amount: z.number()
        .min(0.01, 'Suma trebuie să fie mai mare de 0')
        .refine(
            (value) => Number.isFinite(value) && value > 0,
            'Suma trebuie să fie un număr valid pozitiv'
        ),
    
    currency: z.string()
        .min(3, 'Moneda trebuie să aibă cel puțin 3 caractere')
        .max(3, 'Moneda trebuie să aibă exact 3 caractere')
        .default('RON'),
    
    status: z.enum([
        IncomeStatus.EXPECTED,
        IncomeStatus.RECEIVED,
        IncomeStatus.CANCELLED,
        IncomeStatus.OVERDUE
    ], {
        message: 'Statusul venitului este invalid'
    }),
    
    source: z.string()
        .min(2, 'Sursa venitului trebuie să aibă cel puțin 2 caractere')
        .max(255, 'Sursa venitului nu poate depăși 255 de caractere'),
    
    expectedDate: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => {
                if (!value) return true;
                return !isNaN(Date.parse(value));
            },
            'Data estimată nu este validă'
        ),
    
    receivedDate: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => {
                if (!value) return true;
                return !isNaN(Date.parse(value));
            },
            'Data primirii nu este validă'
        ),
    
    invoiceNumber: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => {
                if (!value) return true;
                return value.length <= 100;
            },
            'Numărul facturii nu poate depăși 100 de caractere'
        ),
    
    contractReference: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => {
                if (!value) return true;
                return value.length <= 255;
            },
            'Referința contractului nu poate depăși 255 de caractere'
        ),
    
    notes: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => {
                if (!value) return true;
                return value.length <= 1000;
            },
            'Notele nu pot depăși 1000 de caractere'
        )
});

export type CreateExpenseData = z.infer<typeof createExpenseSchema>;
export type CreateIncomeData = z.infer<typeof createIncomeSchema>;

export const getCreateExpenseDefaultValues = (): CreateExpenseData => ({
    projectId: '',
    category: ExpenseCategory.OTHER,
    description: '',
    amount: 0,
    currency: 'RON',
    status: ExpenseStatus.DRAFT,
    expenseDate: new Date().toISOString().split('T')[0],
    vendor: '',
    receiptUrl: '',
    notes: ''
});

export const getCreateIncomeDefaultValues = (): CreateIncomeData => ({
    projectId: '',
    category: IncomeCategory.OTHER,
    description: '',
    amount: 0,
    currency: 'RON',
    status: IncomeStatus.EXPECTED,
    source: '',
    expectedDate: '',
    receivedDate: '',
    invoiceNumber: '',
    contractReference: '',
    notes: ''
});
