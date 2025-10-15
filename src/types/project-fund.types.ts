import { BaseEntity } from './index.types';

export interface ProjectFund extends BaseEntity {
    project: string;
    estimatedAmount: number;
    amount: number;
    source: string;
    category: string;
    sourceName: string;
    currency: string;
    estimatedDate: string;
    date: string;
    paymentMethod: string;
    scope: string;
    documentReference?: string;
    notes?: string;
}

export interface ProjectFundCreateRequest {
    project: string;
    estimatedAmount: number;
    amount: number;
    source: string;
    category: string;
    sourceName: string;
    currency: string;
    estimatedDate: string;
    date: string;
    paymentMethod: string;
    scope: string;
    documentReference?: string;
    notes?: string;
}

export interface ProjectFundUpdateRequest extends Partial<ProjectFundCreateRequest> {}
