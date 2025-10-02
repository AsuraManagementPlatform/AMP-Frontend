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
    title: string;
    description?: string;
    type: ActivityType;
    status: ActivityStatus;
    startDate: string;
    endDate?: string;
    location?: string;
    projectId: string;
    assignedTo?: string[];
    estimatedHours?: number;
    actualHours?: number;
    notes?: string;
}

export interface ActivityCreateRequest {
    title: string;
    description?: string;
    type: ActivityType;
    status: ActivityStatus;
    startDate: string;
    endDate?: string;
    location?: string;
    projectId: string;
    assignedTo?: string[];
    estimatedHours?: number;
    notes?: string;
}

export interface ActivityUpdateRequest extends Partial<ActivityCreateRequest> {
    actualHours?: number;
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
    projectId?: string;
    assignedTo?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
}