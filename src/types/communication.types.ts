import { BaseEntity } from "@/types/index.types";

export const UserCommunicationType = {
    GENERAL_MESSAGE: 'GENERAL_MESSAGE',
    QUESTION_TO_ADMIN: 'QUESTION_TO_ADMIN',
    SUPPORT_REQUEST: 'SUPPORT_REQUEST',
    PERMISSION_REQUEST: 'PERMISSION_REQUEST',
    FEEDBACK: 'FEEDBACK',
    REPORT_ISSUE: 'REPORT_ISSUE',
    MEMBERSHIP_INQUIRY: 'MEMBERSHIP_INQUIRY',
    SURVEY_QUESTION: 'SURVEY_QUESTION',
    POLL_QUESTION: 'POLL_QUESTION',
    SPONSORSHIP_REQUEST: 'SPONSORSHIP_REQUEST',
    BROADCAST_TO_ORGANIZATION: 'BROADCAST_TO_ORGANIZATION',
    LEAVE_REQUEST: 'LEAVE_REQUEST',
    MEMBERSHIP_FEE_REMINDER: 'MEMBERSHIP_FEE_REMINDER',
    MEMBERSHIP_FEE_OVERDUE: 'MEMBERSHIP_FEE_OVERDUE',
    ACTIVITY_PROPOSAL: 'ACTIVITY_PROPOSAL',
    OTHER: 'OTHER'
} as const;

export type UserCommunicationType = typeof UserCommunicationType[keyof typeof UserCommunicationType];

export const UserCommunicationStatus = {
    PENDING: 'PENDING',
    IN_PROGRESS: 'IN_PROGRESS',
    RESOLVED: 'RESOLVED',
    CLOSED: 'CLOSED'
} as const;

export type UserCommunicationStatus = typeof UserCommunicationStatus[keyof typeof UserCommunicationStatus];

export const CommunicationPriority = {
    LOW: 'LOW',
    NORMAL: 'NORMAL',
    HIGH: 'HIGH',
    URGENT: 'URGENT'
} as const;

export type CommunicationPriority = typeof CommunicationPriority[keyof typeof CommunicationPriority];

export interface ConversationMessage {
    senderId: string;
    senderName: string;
    message: string;
    timestamp: string;
    isAdmin: boolean;
}

export interface Communication extends BaseEntity {
    type: UserCommunicationType;
    sender: string;
    senderName: string;
    senderEmail: string;
    recipient: string;
    recipientName: string;
    recipientEmail: string;
    organization: string;
    organizationName: string;
    subject: string;
    initialMessage: string;
    conversationHistory: ConversationMessage[];
    status: UserCommunicationStatus;
    priority: CommunicationPriority;
    isReadByRecipient: boolean;
    lastMessageAt: string;
    relatedProject?: string;
    projectName?: string;
    relatedActivity?: string;
    activityName?: string;
    messageCount: number;
    unreadCountForSender: number;
    deletedAt?: string | null;
}

export interface CommunicationCreateRequest {
    type: UserCommunicationType;
    recipient: string;
    organization: string;
    subject: string;
    initialMessage: string;
    priority?: CommunicationPriority;
    relatedProject?: string;
    relatedActivity?: string;
}

export interface CommunicationReplyRequest {
    message: string;
}

export interface CommunicationUpdateStatusRequest {
    status: UserCommunicationStatus;
    isReadByRecipient?: boolean;
}

export interface UnreadCountResponse {
    unreadCount: number;
    messagesUnread: number;
    leaveRequestsUnread: number;
}
