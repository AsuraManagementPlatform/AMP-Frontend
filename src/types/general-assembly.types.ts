export type GeneralAssemblyStatus = 'DRAFT' | 'SCHEDULED' | 'IN_PROGRESS' | 'CLOSED' | 'ARCHIVED';
export type MeetingType = 'ONLINE' | 'IN_PERSON';
export type VoteChoice = 'YES' | 'NO' | 'ABSTAIN';

export interface AgendaItemDocument {
    id: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    description?: string;
    createdAt: string;
    uploadedByName?: string;
}

export interface AgendaItem {
    id: string;
    order: number;
    title: string;
    description?: string;
    requiresVote: boolean;
    documents?: AgendaItemDocument[];
}

export interface AgendaItemWithResults extends AgendaItem {
    yesCount: number;
    noCount: number;
    abstainCount: number;
    totalVotes: number;
}

export interface GeneralAssemblyParticipant {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    isManuallyAdded: boolean;
    hasOpenedLink: boolean;
    openedLinkAt?: string;
    hasVoted: boolean;
    votedAt?: string;
}

export interface GeneralAssemblyListItem {
    id: string;
    title: string;
    description?: string;
    startDate: string;
    endDate: string;
    status: GeneralAssemblyStatus;
    meetingType: MeetingType;
    location?: string;
    meetUrl?: string;
    participantCount: number;
    openedCount: number;
    votedCount: number;
    canDownloadReport: boolean;
    createdByName: string;
    createdAt: string;
}

export interface GeneralAssemblyDetail extends GeneralAssemblyListItem {
    meetPassword?: string;
    reminderSent: boolean;
    reminderSentAt?: string;
    exportPdfPath?: string;
    exportCsvPath?: string;
    exportedAt?: string;
    createdBy: string;
    organizationName: string;
    agendaItems: AgendaItemWithResults[];
    updatedAt: string;
    currentUserParticipant?: {
        id: string;
        hasOpenedLink: boolean;
        hasVoted: boolean;
        votedAt?: string;
    };
}

export interface MemberAssemblyView {
    id: string;
    title: string;
    description?: string;
    startDate: string;
    endDate: string;
    status: GeneralAssemblyStatus;
    meetingType: MeetingType;
    location?: string;
    meetUrl?: string;
    meetPassword?: string;
    organizationName: string;
    agendaItems: AgendaItem[];
    participantStatus?: {
        id: string;
        hasOpenedLink: boolean;
        hasVoted: boolean;
        votedAt?: string;
    };
}

export interface EligibleMember {
    id: string;
    fullName: string;
    email: string;
}

export interface OrganizationMember {
    id: string;
    fullName: string;
    email: string;
    isEligible: boolean;
}

export interface AgendaItemInput {
    id?: string;
    title: string;
    description?: string;
    requiresVote: boolean;
    documents?: File[];
}

export interface GeneralAssemblyCreatePayload {
    title: string;
    description?: string;
    startDate: string;
    endDate: string;
    meetingType: MeetingType;
    location?: string;
    agendaItems: AgendaItemInput[];
    includeAllEligible: boolean;
    manualParticipants?: string[];
}

export interface VoteSubmissionPayload {
    votes: Record<string, VoteChoice>;
}

export interface GeneralAssemblyResults {
    assemblyId: string;
    title: string;
    startDate: string;
    endDate: string;
    status: GeneralAssemblyStatus;
    participantCount: number;
    openedCount: number;
    votedCount: number;
    agendaItems: AgendaItemWithResults[];
}

export interface ArchivedAssemblyData {
    participantCount: number;
    openedCount: number;
    votedCount: number;
    agendaItems: AgendaItemWithResults[];
    participants: GeneralAssemblyParticipant[];
}
