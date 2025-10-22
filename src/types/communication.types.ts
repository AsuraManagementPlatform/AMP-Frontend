import { BaseEntity } from "@/types/index.types";

export const CommunicationType = {
    EMAIL: 'email',
    PHONE: 'phone',
    MEETING: 'meeting',
    LETTER: 'letter',
    NEWSLETTER: 'newsletter',
    OTHER: 'other'
} as const;

export type CommunicationType = typeof CommunicationType[keyof typeof CommunicationType];

export const CommunicationStatus = {
    PLANNED: 'planned',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
} as const;

export type CommunicationStatus = typeof CommunicationStatus[keyof typeof CommunicationStatus];

export interface EntityCommunication extends BaseEntity {
    entityId: string;
    entityName?: string;
    date: string;
    type: CommunicationType;
    status: CommunicationStatus;
    subject: string;
    content: string;
    contactPerson?: string;
    responsibleUser?: string;
    responsibleUserName?: string;
    nextSteps?: string;
    projectId?: string;
    projectName?: string;
    attachments?: string[];
}

export interface EntityCommunicationCreateRequest {
    entityId: string;
    date: string;
    type: CommunicationType;
    status: CommunicationStatus;
    subject: string;
    content: string;
    contactPerson?: string;
    responsibleUser?: string;
    nextSteps?: string;
    projectId?: string;
}

export interface EntityCommunicationUpdateRequest extends Partial<EntityCommunicationCreateRequest> {}

export interface CommunicationFilters {
    entityId?: string;
    type?: CommunicationType;
    status?: CommunicationStatus;
    startDate?: string;
    endDate?: string;
    search?: string;
}

export interface CommunicationStats {
    totalCommunications: number;
    emailCount: number;
    phoneCount: number;
    meetingCount: number;
    completedCount: number;
    plannedCount: number;
    cancelledCount: number;
}