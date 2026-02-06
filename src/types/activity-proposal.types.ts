import { BaseEntity } from "@/types/index.types";

export const ProposalStatus = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
    CHANGES_REQUESTED: 'CHANGES_REQUESTED'
} as const;

export type ProposalStatus = typeof ProposalStatus[keyof typeof ProposalStatus];

export interface ActivityProposal extends BaseEntity {
    proposer: string;
    proposerName: string;
    proposerEmail: string;
    project: string;
    projectName: string;
    organization: string;
    organizationName: string;
    parentActivity?: string;
    parentActivityName?: string;
    activityTitle: string;
    description: string;
    startDate: string;
    endDate: string;
    estimatedBudget?: number;
    justification: string;
    status: ProposalStatus;
    adminResponse?: string;
    approvedBy?: string;
    approvedByName?: string;
    createdActivity?: string;
    createdActivityName?: string;
    rejectionReason?: string;
    isReadByAdmin: boolean;
}

export interface ActivityProposalCreateRequest {
    project: string;
    organization: string;
    parentActivity?: string;
    activityTitle: string;
    description: string;
    startDate: string;
    endDate: string;
    estimatedBudget?: number;
    justification?: string;
}

export interface ActivityProposalApproveRequest {
    response?: string;
}

export interface ActivityProposalRejectRequest {
    reason: string;
}
