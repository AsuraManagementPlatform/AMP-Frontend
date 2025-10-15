export const BudgetCategory = {
    PERSONNEL: 'PERSONNEL',
    EQUIPMENT: 'EQUIPMENT',
    MATERIALS: 'MATERIALS',
    SERVICES: 'SERVICES',
    TRAVEL: 'TRAVEL',
    OVERHEAD: 'OVERHEAD',
    OTHER: 'OTHER'
} as const;

export type BudgetCategory = typeof BudgetCategory[keyof typeof BudgetCategory];

export const BudgetStatus = {
    DRAFT: 'DRAFT',
    APPROVED: 'APPROVED',
    ACTIVE: 'ACTIVE',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED'
} as const;

export type BudgetStatus = typeof BudgetStatus[keyof typeof BudgetStatus];
