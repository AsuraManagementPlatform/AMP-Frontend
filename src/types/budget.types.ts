import {BaseEntity} from "@/types/index.types.ts";

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

export interface BudgetItem extends BaseEntity {
    projectId: string;
    category: BudgetCategory;
    description: string;
    plannedAmount: number;
    actualAmount?: number;
    currency: string;
    notes?: string;
}

export interface ProjectBudget extends BaseEntity {
    projectId: string;
    totalPlannedAmount: number;
    totalActualAmount: number;
    currency: string;
    status: BudgetStatus;
    approvedBy?: string;
    approvedAt?: string;
    items: BudgetItem[];
    notes?: string;
}

export interface BudgetProjectIncome extends BaseEntity {
    projectId: string;
    source: string;
    description: string;
    plannedAmount: number;
    actualAmount?: number;
    currency: string;
    receivedDate?: string;
    expectedDate?: string;
    notes?: string;
}
export interface BudgetItemCreateRequest {
    category: BudgetCategory;
    description: string;
    plannedAmount: number;
    actualAmount?: number;
    currency: string;
    notes?: string;
}

export interface ProjectBudgetCreateRequest {
    projectId: string;
    currency: string;
    status: BudgetStatus;
    items: BudgetItemCreateRequest[];
    notes?: string;
}

export interface ProjectBudgetUpdateRequest {
    status?: BudgetStatus;
    items?: BudgetItemCreateRequest[];
    notes?: string;
    approvedBy?: string;
}

export interface BudgetProjectIncomeCreateRequest {
    projectId: string;
    source: string;
    description: string;
    plannedAmount: number;
    actualAmount?: number;
    currency: string;
    receivedDate?: string;
    expectedDate?: string;
    notes?: string;
}

export interface BudgetProjectIncomeUpdateRequest extends Partial<BudgetProjectIncomeCreateRequest> {}

export interface BudgetSummary {
    projectId: string;
    totalPlannedBudget: number;
    totalActualBudget: number;
    totalPlannedIncome: number;
    totalActualIncome: number;
    budgetUtilization: number;
    remainingBudget: number;
    currency: string;
}
