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
    projectObjective?: string;
    title: string;
    description?: string;
    startingDate: string;
    estimatedEndingDate: string;
    endingDate?: string;
    status: ActivityStatus;
    type: ActivityType;
    location?: string;
    observation?: string;
    results?: string;
    indicators?: string;
    totalActivityExpensesAmount?: number;
}

export interface ActivityCreateRequest {
    project: string;
    projectObjective?: string;
    title: string;
    description?: string;
    startingDate: string;
    estimatedEndingDate: string;
    endingDate?: string;
    status: ActivityStatus;
    type: ActivityType;
    location?: string;
    observation?: string;
    results?: string;
    indicators?: string;
}

export interface ActivityUpdateRequest extends Partial<ActivityCreateRequest> {
    id: string;
}

export interface ActivityChangeStatusRequest {
    id: string;
    status: ActivityStatus;
}

export interface ActivityCompleteRequest {
    id: string;
    endingDate: string;
}

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
    project?: string;
    assignedTo?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
}