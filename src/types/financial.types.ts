import {BaseEntity} from "@/types/index.types.ts";

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

export const ExpenseStatus = {
    DRAFT: 'DRAFT',
    PENDING_APPROVAL: 'PENDING_APPROVAL',
    APPROVED: 'APPROVED',
    PAID: 'PAID',
    REJECTED: 'REJECTED',
    CANCELLED: 'CANCELLED'
} as const;

export type ExpenseStatus = typeof ExpenseStatus[keyof typeof ExpenseStatus];

export const IncomeCategory = {
    GRANT: 'GRANT',
    DONATION: 'DONATION',
    SPONSORSHIP: 'SPONSORSHIP',
    SERVICE_FEE: 'SERVICE_FEE',
    PRODUCT_SALE: 'PRODUCT_SALE',
    MEMBERSHIP_FEE: 'MEMBERSHIP_FEE',
    OTHER: 'OTHER'
} as const;

export type IncomeCategory = typeof IncomeCategory[keyof typeof IncomeCategory];

export const IncomeStatus = {
    EXPECTED: 'EXPECTED',
    RECEIVED: 'RECEIVED',
    CANCELLED: 'CANCELLED',
    OVERDUE: 'OVERDUE'
} as const;

export type IncomeStatus = typeof IncomeStatus[keyof typeof IncomeStatus];

export interface ProjectExpense extends BaseEntity {
    projectId: string;
    category: ExpenseCategory;
    description: string;
    amount: number;
    currency: string;
    status: ExpenseStatus;
    expenseDate: string;
    vendor?: string;
    receiptUrl?: string;
    approvedBy?: string;
    approvedAt?: string;
    paidAt?: string;
    notes?: string;
}

export interface ProjectIncome extends BaseEntity {
    projectId: string;
    category: IncomeCategory;
    description: string;
    amount: number;
    currency: string;
    status: IncomeStatus;
    source: string;
    expectedDate?: string;
    receivedDate?: string;
    invoiceNumber?: string;
    contractReference?: string;
    notes?: string;
}

// Create/Update requests
export interface ProjectExpenseCreateRequest {
    projectId: string;
    category: ExpenseCategory;
    description: string;
    amount: number;
    currency: string;
    status: ExpenseStatus;
    expenseDate: string;
    vendor?: string;
    receiptUrl?: string;
    notes?: string;
}

export interface ProjectExpenseUpdateRequest extends Partial<ProjectExpenseCreateRequest> {
    approvedBy?: string;
    paidAt?: string;
}

export interface ProjectIncomeCreateRequest {
    projectId: string;
    category: IncomeCategory;
    description: string;
    amount: number;
    currency: string;
    status: IncomeStatus;
    source: string;
    expectedDate?: string;
    receivedDate?: string;
    invoiceNumber?: string;
    contractReference?: string;
    notes?: string;
}

export interface ProjectIncomeUpdateRequest extends Partial<ProjectIncomeCreateRequest> {}

export interface FinancialSummary {
    projectId: string;
    totalExpenses: number;
    totalIncome: number;
    pendingExpenses: number;
    expectedIncome: number;
    netCashFlow: number;
    expensesByCategory: Record<ExpenseCategory, number>;
    incomeByCategory: Record<IncomeCategory, number>;
    currency: string;
}

export interface ExpenseFilter {
    category?: ExpenseCategory;
    status?: ExpenseStatus;
    projectId?: string;
    vendor?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
}

export interface IncomeFilter {
    category?: IncomeCategory;
    status?: IncomeStatus;
    projectId?: string;
    source?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
}