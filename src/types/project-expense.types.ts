import {BaseEntity, Currency, TransactionStatus} from "@/types/index.types";

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

export type ExpenseCategory = typeof ExpenseCategory[keyof typeof ExpenseCategory];

export const UnitType = {
    HOUR: 'HOUR',
    DAY: 'DAY',
    NUMBER: 'NUMBER',
    BATCH: 'BATCH'
} as const;

export type UnitType = typeof UnitType[keyof typeof UnitType];

export interface ProjectExpense extends BaseEntity {
    project: string;
    activity: string;
    activityTitle?: string;
    name: string;
    unitType: UnitType;
    quantity: number;
    unitPrice: number;
    amount: number;
    vatAmount: number;
    totalAmount: number;
    category: ExpenseCategory;
    currency: Currency;
    status: TransactionStatus;
}

export interface ProjectExpenseCreateRequest {
    project: string;
    activity: string;
    name: string;
    unitType: UnitType;
    quantity: number;
    unitPrice: number;
    category: ExpenseCategory;
    currency: Currency;
    status: TransactionStatus;
}

export interface ProjectExpenseUpdateRequest extends Partial<ProjectExpenseCreateRequest> {}