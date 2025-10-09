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
    TRAINING: 'TRAINING',
    CONFERENCE: 'CONFERENCE',
    PRESENTATION: 'PRESENTATION',
    EVENT: 'EVENT',
    TASK: 'TASK',
    MILESTONE: 'MILESTONE',
    REVIEW: 'REVIEW',
    OTHER: 'OTHER',
} as const;

export type ActivityType = typeof ActivityType[keyof typeof ActivityType];

export interface Activity extends BaseEntity {
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
    results?: string;
    indicators?: string;
    total_activity_expenses_amount?: number;
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
    results?: string;
    indicators?: string;
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