export type VotingSessionStatus = 'DRAFT' | 'SCHEDULED' | 'IN_PROGRESS' | 'CLOSED' | 'ARCHIVED';
export type VotingParticipantStatus = 'ELIGIBLE' | 'JOINED' | 'VOTED';

export interface VotingQuestion {
    id: string;
    text: string;
    order: number;
}

export interface VotingSessionListItem {
    id: string;
    title: string;
    description?: string;
    startDate: string;
    endDate: string;
    status: VotingSessionStatus;
    meetUrl?: string;
    meetPassword?: string;
    eligibleCount: number;
    joinedCount: number;
    votedCount: number;
    canDownloadReport: boolean;
}

export interface VotingSessionDetail extends VotingSessionListItem {
    questions: VotingQuestion[];
    participantStatus?: VotingParticipantStatus | null;
    canJoin: boolean;
    canVote: boolean;
    isEligible: boolean;
    hasVoted: boolean;
}

export interface VotingSessionCreatePayload {
    title: string;
    description?: string;
    startDate: string;
    endDate: string;
    meetPassword?: string;
    questions: Array<{ text: string }>;
}

export interface VotingSessionVotePayload {
    answers: Record<string, boolean>;
}
