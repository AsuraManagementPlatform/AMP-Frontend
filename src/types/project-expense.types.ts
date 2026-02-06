import {BaseEntity, Currency, ProjectFundAllocation} from "@/types/index.types";

export const ProjectExpenseStatus = {
    PLANNED: 'PLANNED',
    PARTIALLY_PAID: 'PARTIALLY_PAID',
    PAID: 'PAID',
    CANCELLED: 'CANCELLED'
} as const;

export type ProjectExpenseStatusType = typeof ProjectExpenseStatus[keyof typeof ProjectExpenseStatus];

export const ExpenseCategory = {
    PERSONNEL: 'PERSONNEL',
    EQUIPMENT: 'EQUIPMENT',
    MATERIALS: 'MATERIALS',
    SERVICES: 'SERVICES',
    TRAVEL: 'TRAVEL',
    UTILITIES: 'UTILITIES',
    MARKETING: 'MARKETING',
    ADMINISTRATIVE: 'ADMINISTRATIVE',
    OTHER: 'OTHER'
} as const;

export type ExpenseCategoryType = typeof ExpenseCategory[keyof typeof ExpenseCategory];

export const Unit = {
    HOUR: 'HOUR',
    DAY: 'DAY',
    NUMBER: 'NUMBER',
    BATCH: 'BATCH'
} as const;

export type UnitType = typeof Unit[keyof typeof Unit];

export const ProjectExpenseTransactionSource = {
    CREATED: 'CREATED',
    UPDATED: 'UPDATED',
    EXECUTED: 'EXECUTED',
    CANCELLED: 'CANCELLED'
} as const;

export type ProjectExpenseTransactionSourceType = typeof ProjectExpenseTransactionSource[keyof typeof ProjectExpenseTransactionSource];

export interface ProjectExpenseTransaction extends BaseEntity {
    projectExpense: string;
    source: ProjectExpenseTransactionSourceType;
    vatValue: number;
    name: string;
    unitType: UnitType;
    quantity: number;
    unitPrice: number;
    amount: number;
    vatAmount: number;
    totalAmount: number;
    currency: Currency;
}

export interface ProjectExpense extends BaseEntity {
    project: string;
    activity?: string;
    activityTitle?: string;
    vat: string;
    vatName: string;
    vatValue: number;
    name: string;
    unitType: UnitType;
    quantity: number;
    unitPrice: number;
    amount: number;
    vatAmount: number;
    totalAmount: number;
    executedQuantity: number;
    executedAmount: number;
    remainingQuantity: number;
    remainingAmount: number;
    executionPercentage: number;
    category: ExpenseCategoryType;
    currency: Currency;
    status: ProjectExpenseStatusType;
    fundAllocations: ProjectFundAllocation[];
    transactions: ProjectExpenseTransaction[];
    documentsCount?: number;
}

export interface ProjectExpenseCreateRequest {
    project: string;
    activity?: string | null;
    vat: string;
    name: string;
    unitType: UnitType;
    quantity: number;
    unitPrice: number;
    category: ExpenseCategoryType;
    currency: Currency;
}

export interface ProjectExpenseUpdateRequest extends Partial<ProjectExpenseCreateRequest> {
    id: string;
}

export interface ProjectExpenseExecuteRequest {
    vat: string;
    quantity: number;
    unitPrice: number;
    date: string;
    fundAllocations: {
        fundId: string;
        amount: number;
    }[];
    documentId?: string;
}