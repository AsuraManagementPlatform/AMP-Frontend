import {BaseEntity, Currency, ProjectFundAllocation} from "@/types/index.types";

export const ProjectExpenseStatus = {
  PLANNED: 'PLANNED',
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

export interface ProjectExpense extends BaseEntity {
    project: string;
    activity: string;
    vat: string;
    activityTitle?: string;
    name: string;
    unitType: UnitType;
    quantity: number;
    unitPrice: number;
    amount: number;
    vatAmount: number;
    totalAmount: number;
    category: ExpenseCategoryType;
    currency: Currency;
    status: ProjectExpenseStatusType;
    fundAllocations?: ProjectFundAllocation[];
}

export interface ProjectExpenseCreateRequest {
    project: string;
    activity: string;
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
}

export interface FundAllocationSuggestion {
    fundId: string;
    fundName: string;
    remainingAmount: number;
    allocatedAmount: number;
}
