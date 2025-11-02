import { BaseEntity } from "@/types/index.types";

export const CommunicationType = {
    EMAIL: 'email',
    PHONE: 'phone',
    MEETING: 'meeting',
    LETTER: 'letter',
    NEWSLETTER: 'newsletter',
    OTHER: 'other'
};

export type CommunicationType = typeof CommunicationType[keyof typeof CommunicationType];

export const CommunicationStatus = {
    PLANNED: 'planned',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
};

export type CommunicationStatus = typeof CommunicationStatus[keyof typeof CommunicationStatus];

export interface EntityCommunication extends BaseEntity {
    entity: string;
    entityName: string;
    responsible: string;
    responsibleEmail: string;
    date: string;
    type: CommunicationType;
    topic: string;
    content: string;
    notes?: string;
    nextStep?: string;
}

export interface EntityCommunicationCreateRequest {
    entity: string;
    responsible: string;
    date: string;
    type: CommunicationType;
    topic: string;
    content: string;
    notes?: string;
    nextSteps?: string;
}

export interface EntityCommunicationUpdateRequest extends Partial<EntityCommunicationCreateRequest> {
    id: string;
}
