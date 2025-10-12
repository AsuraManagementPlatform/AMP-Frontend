import {BaseEntity} from "@/types/index.types.ts";

export const ProjectStatus = {
    DRAFT: 'DRAFT',
    ACTIVE: 'ACTIVE',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
    ON_HOLD: 'ON_HOLD'
} as const;

export type ProjectStatus = typeof ProjectStatus[keyof typeof ProjectStatus];

export const ProjectPriority = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    URGENT: 'URGENT'
} as const;

export type ProjectPriority = typeof ProjectPriority[keyof typeof ProjectPriority];

export interface Project extends BaseEntity {
    name: string;
    description?: string;
    category: string;
    starting_date: string;
    ending_date: string;
    status: ProjectStatus;
    priority?: ProjectPriority;
    organization: string;
    location: string;
    budget: number;
    currency: string;
    budget_planning_date: string;
    budget_responsible: string;
    budget_responsible_name?: string;
    budget_notes?: string;
    teamSize?: number;
    activitiesCount?: number;
}

export interface ProjectCreateRequest {
    name: string;
    description?: string;
    category: string;
    starting_date: string;
    ending_date: string;
    status: ProjectStatus;
    organization: string;
    location: string;
    budget: number;
    currency: string;
    budget_planning_date: string;
    budget_responsible: string;
    budget_notes?: string;
}

export interface ProjectUpdateRequest extends Partial<ProjectCreateRequest> {}

export interface ProjectStats {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    totalBudget: number;
    spentBudget: number;
}

export interface ProjectFilter {
    status?: ProjectStatus;
    priority?: ProjectPriority;
    organizationId?: string;
    managerId?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
}