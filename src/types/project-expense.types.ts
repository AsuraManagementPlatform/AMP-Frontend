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
    activity_title?: string;
    name: string;
    unit_type: UnitType;
    quantity: number;
    unit_price: number;
    amount: number;
    vat_amount: number;
    total_amount: number;
    category: ExpenseCategory;
    currency: Currency;
    status: TransactionStatus;
}

export interface ProjectExpenseCreateRequest {
    project: string;
    activity: string;
    name: string;
    unit_type: UnitType;
    quantity: number;
    unit_price: number;
    category: ExpenseCategory;
    currency: Currency;
    status: TransactionStatus;
}

export interface ProjectExpenseUpdateRequest extends Partial<ProjectExpenseCreateRequest> {}