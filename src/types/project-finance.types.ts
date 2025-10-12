import { BaseEntity } from './index.types';

export interface ProjectFund extends BaseEntity {
    project: string;
    estimated_amount: number;
    amount: number;
    source: string;
    category: string;
    source_name: string;
    currency: string;
    estimated_date: string;
    date: string;
    payment_method: string;
    scope: string;
    document_reference?: string;
    notes?: string;
}

export interface ProjectFundCreateRequest {
    project: string;
    estimated_amount: number;
    amount: number;
    source: string;
    category: string;
    source_name: string;
    currency: string;
    estimated_date: string;
    date: string;
    payment_method: string;
    scope: string;
    document_reference?: string;
    notes?: string;
}

export interface ProjectFundUpdateRequest extends Partial<ProjectFundCreateRequest> {}
