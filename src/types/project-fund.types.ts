import {BaseEntity, Currency} from './index.types';

export const ProjectFundStatus = {
    PLANNED: 'PLANNED',
    PAID: 'PAID',
    CANCELLED: 'CANCELLED'
} as const;

export interface ProjectFund extends BaseEntity {
    project: string;
    estimatedAmount: number;
    amount: number;
    source: string;
    category: string;
    sourceName: string;
    currency: Currency;
    estimatedDate: string;
    date: string;
    paymentMethod: string;
    scope: string;
    documentReference?: string;
    notes?: string;
    status: string;
}

export interface ProjectFundCreateRequest {
    project: string;
    estimatedAmount: number;
    source: string;
    category: string;
    sourceName: string;
    currency: string;
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
    status: string;
}

export interface ProjectFundCancelRequest {
    id: string;
}
