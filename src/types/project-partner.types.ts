import {BaseEntity} from "@/types/index.types.ts";
import {ProjectFund} from "@/types/project-fund.types.ts";

export const EngagementLevel = {
    NONE: 'none',
    PARTIAL: 'partial',
    FULLY: 'fully'
} as const;

export type EngagementLevel = typeof EngagementLevel[keyof typeof EngagementLevel];

export interface ProjectPartner extends BaseEntity {
    project: string;
    projectName: string;
    entity: string;
    entityName: string;
    engagementLevel?: EngagementLevel;
    budget: number;
    projectCurrency?: string;
    projectFunds?: ProjectFund[];
    totalDonations?: number;
    totalDonationsCount?: number;
}

export interface ProjectPartnerCreateRequest {
    project: string;
    entity: string;
    engagementLevel?: EngagementLevel;
    budget?: number;
}

export interface ProjectPartnerUpdateRequest {
    id: string;
    engagementLevel?: EngagementLevel;
    budget?: number;
}