import {BaseEntity, Currency} from './index.types';

export const ProjectFundStatus = {
    PLANNED: 'PLANNED',
    PAID: 'PAID',
    CANCELLED: 'CANCELLED'
} as const;

export type ProjectFundStatus = typeof ProjectFundStatus[keyof typeof ProjectFundStatus];

export interface ProjectFund extends BaseEntity {
    project: string;
    activity?: string;
    activityTitle?: string;
    entityDonation?: string;
    estimatedAmount: number;
    amount: number;
    allocatedAmount: number;
    remainingAmount: number;
    source: string;
    category: string;
    sourceName: string;
    currency: Currency;
    estimatedDate: string;
    date?: string;
    paymentMethod: string;
    scope: string;
    documentReference?: string;
    notes?: string;
    status: ProjectFundStatus;
    allocations: ProjectFundAllocation[];
}

export interface ProjectFundCreateRequest {
    project: string;
    activity?: string;
    entity?: string;
    estimatedAmount: number;
    source: string;
    category: string;
    sourceName: string;
    currency: Currency;
    estimatedDate: string;
    paymentMethod: string;
    scope: string;
    documentReference?: string;
    notes?: string;
}

export interface ProjectFundUpdateRequest extends Partial<ProjectFundCreateRequest> {
    id: string;
}

export interface ProjectFundPayRequest {
    id: string;
    amount: number;
    date: string;
}

export const FundAllocationStatus = {
    ACTIVE: 'ACTIVE',
    CANCELLED: 'CANCELLED'
} as const;

export type FundAllocationStatus = typeof FundAllocationStatus[keyof typeof FundAllocationStatus];

export interface ProjectFundAllocation {
    id: string;
    projectFund: string;
    projectExpense: string;
    allocatedAmount: number;
    status: FundAllocationStatus;
    createdAt: string;
    expenseName?: string;
    fundSource?: string;
}

export interface AvailableFundForExpense extends BaseEntity {
    project: string;
    activity?: string;
    activityTitle?: string;
    amount: number;
    allocatedAmount: number;
    remainingAmount: number;
    source: string;
    category: string;
    sourceName: string;
    currency: Currency;
    date?: string;
    paymentMethod: string;
    scope: string;
    status: ProjectFundStatus;
    priority: 'high' | 'normal';
}

export interface AvailableFundsResponse {
    expenseId: string;
    expenseTotalAmount: number;
    expenseActivity: string | null;
    expenseActivityTitle: string | null;
    totalAvailable: number;
    hasSufficientFunds: boolean;
    activityFunds: AvailableFundForExpense[];
    projectFunds: AvailableFundForExpense[];
}