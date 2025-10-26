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
    startingDate: string;
    endingDate: string;
    status: ProjectStatus;
    priority?: ProjectPriority;
    organization: string;
    location: string;
    budget: number;
    currency: string;
    budgetPlanningDate: string;
    budgetResponsible: string;
    budgetResponsibleName?: string;
    budgetNotes?: string;
    teamSize?: number;
    activitiesCount?: number;
    activeFunds: number;
    activeExpenses: number;
}

export interface ProjectCreateRequest {
    name: string;
    description?: string;
    category: string;
    startingDate: string;
    endingDate: string;
    status: ProjectStatus;
    organization: string;
    location: string;
    budget: number;
    currency: string;
    budgetPlanningDate: string;
    budgetResponsible: string;
    budgetNotes?: string;
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