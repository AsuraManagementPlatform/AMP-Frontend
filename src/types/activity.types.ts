import {BaseEntity} from "@/types/index.types.ts";

export const ActivityStatus = {
    PLANNED: 'PLANNED',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
    POSTPONED: 'POSTPONED'
} as const;

export type ActivityStatus = typeof ActivityStatus[keyof typeof ActivityStatus];

export const ActivityType = {
    MEETING: 'MEETING',
    WORKSHOP: 'WORKSHOP',
    EVENT: 'EVENT',
    TASK: 'TASK',
    MILESTONE: 'MILESTONE',
    REVIEW: 'REVIEW'
} as const;

export type ActivityType = typeof ActivityType[keyof typeof ActivityType];

export interface Activity extends BaseEntity {
    projectId: string;
    title: string;
    description?: string;
    startDate: string;
    endDate?: string;
    status: ActivityStatus;
    type: ActivityType;
    location?: string;
    observation?: string;
}

export interface ActivityCreateRequest {
    project: string;
    project_objective?: string;
    title: string;
    description?: string;
    starting_date: string;
    estimated_ending_date: string;
    ending_date?: string;
    status: ActivityStatus;
    type: ActivityType;
    location?: string;
    observation?: string;
}

export interface ActivityUpdateRequest extends Partial<ActivityCreateRequest> {}

export interface ActivityStats {
    totalActivities: number;
    completedActivities: number;
    inProgressActivities: number;
    plannedActivities: number;
    totalEstimatedHours: number;
    totalActualHours: number;
}

export interface ActivityFilter {
    status?: ActivityStatus;
    type?: ActivityType;
    projectId?: string;
    assignedTo?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
}