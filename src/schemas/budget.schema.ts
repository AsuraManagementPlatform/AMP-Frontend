import { z } from 'zod';
import { BudgetCategory, BudgetStatus } from '@/types/budget.types';

export const createBudgetItemSchema = z.object({
    category: z.enum([
        BudgetCategory.PERSONNEL,
        BudgetCategory.EQUIPMENT,
        BudgetCategory.MATERIALS,
        BudgetCategory.SERVICES,
        BudgetCategory.TRAVEL,
        BudgetCategory.OVERHEAD,
        BudgetCategory.OTHER
    ], {
        message: 'Categoria bugetului este invalidă'
    }),
    
    description: z.string()
        .min(2, 'Descrierea trebuie să aibă cel puțin 2 caractere')
        .max(500, 'Descrierea nu poate depăși 500 de caractere'),
    
    plannedAmount: z.number()
        .min(0.01, 'Suma planificată trebuie să fie mai mare de 0')
        .refine(
            (value) => Number.isFinite(value) && value > 0,
            'Suma trebuie să fie un număr valid pozitiv'
        ),
    
    actualAmount: z.number()
        .optional()
        .refine(
            (value) => {
                if (value === undefined) return true;
                return Number.isFinite(value) && value >= 0;
            },
            'Suma actuală trebuie să fie un număr valid pozitiv'
        ),
    
    currency: z.string()
        .min(3, 'Moneda trebuie să aibă cel puțin 3 caractere')
        .max(3, 'Moneda trebuie să aibă exact 3 caractere')
        .default('RON'),
    
    notes: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => {
                if (!value) return true;
                return value.length <= 500;
            },
            'Notele nu pot depăși 500 de caractere'
        )
});

export const createProjectBudgetSchema = z.object({
    projectId: z.string()
        .min(1, 'ID-ul proiectului este obligatoriu'),
    
    currency: z.string()
        .min(3, 'Moneda trebuie să aibă cel puțin 3 caractere')
        .max(3, 'Moneda trebuie să aibă exact 3 caractere')
        .default('RON'),
    
    status: z.enum([
        BudgetStatus.DRAFT,
        BudgetStatus.APPROVED,
        BudgetStatus.ACTIVE,
        BudgetStatus.COMPLETED,
        BudgetStatus.CANCELLED
    ], {
        message: 'Statusul bugetului este invalid'
    }),
    
    items: z.array(createBudgetItemSchema)
        .min(1, 'Bugetul trebuie să aibă cel puțin o linie'),
    
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

export type CreateBudgetItemData = z.infer<typeof createBudgetItemSchema>;
export type CreateProjectBudgetData = z.infer<typeof createProjectBudgetSchema>;

export const getCreateBudgetItemDefaultValues = (): CreateBudgetItemData => ({
    category: BudgetCategory.OTHER,
    description: '',
    plannedAmount: 0,
    actualAmount: undefined,
    currency: 'RON',
    notes: ''
});

export const getCreateProjectBudgetDefaultValues = (): CreateProjectBudgetData => ({
    projectId: '',
    currency: 'RON',
    status: BudgetStatus.DRAFT,
    items: [getCreateBudgetItemDefaultValues()],
    notes: ''
});