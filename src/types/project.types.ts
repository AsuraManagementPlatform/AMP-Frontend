import {BaseEntity, Currency} from "@/types/index.types.ts";

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
    category?: string;
    location?: string;
    status: ProjectStatus;
    priority: ProjectPriority;
    starting_date: string;
    ending_date: string;
    budget?: number;
    currency?: Currency;
    budget_planning_date?: string;
    budget_notes?: string;
    organization: string;
    budget_responsible?: string;
    sustainability?: string;
    tags?: string[];
}

export interface ProjectCreateRequest {
    name: string;
    description?: string;
    category: string;
    location: string;
    status: ProjectStatus;
    priority: ProjectPriority;
    starting_date: string;
    ending_date: string;
    budget: number;
    currency: string;
    budget_planning_date?: string;
    budget_notes?: string;
    organization: string;
    budget_responsible: string;
    sustainability?: string;
    tags?: string[];
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

export const PROJECT_CATEGORY_OPTIONS = [
    { value: 'educatie', label: 'Educație' },
    { value: 'mediu', label: 'Mediu' },
    { value: 'social', label: 'Social' },
    { value: 'cultura', label: 'Cultură' },
    { value: 'sanatate', label: 'Sănătate' },
    { value: 'tehnologie', label: 'Tehnologie' },
    { value: 'altele', label: 'Altele' }
];

export const PROJECT_CATEGORIES = PROJECT_CATEGORY_OPTIONS.map(opt => opt.value);

export const PROJECT_PRIORITY_OPTIONS = [
    { value: ProjectPriority.LOW, label: 'Scăzută' },
    { value: ProjectPriority.MEDIUM, label: 'Medie' },
    { value: ProjectPriority.HIGH, label: 'Înaltă' },
    { value: ProjectPriority.URGENT, label: 'Urgentă' }
];