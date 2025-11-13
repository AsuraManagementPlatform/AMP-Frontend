export const SurveyStatus = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  PARTIAL: 'PARTIAL',
  ABANDONED: 'ABANDONED',
  CLOSED: 'CLOSED'
} as const;

export type SurveyStatus = typeof SurveyStatus[keyof typeof SurveyStatus];

export const QuestionType = {
  TEXT: 'TEXT',
  SINGLE_CHOICE: 'SINGLE_CHOICE',
  MULTIPLE_CHOICE: 'MULTIPLE_CHOICE',
  RATING: 'RATING',
  YES_NO: 'YES_NO'
} as const;

export type QuestionType = typeof QuestionType[keyof typeof QuestionType];

export interface Question {
  text: string;
  type: QuestionType;
  options?: string[];
  allowMultiple?: boolean;
  isRequired?: boolean;
  order: number;
}

export interface SurveyQuestion {
  id: string;
  organization: string;
  createdBy: string;
  createdByName: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: SurveyStatus;
  isAnonymous: boolean;
  reminderSent: boolean;
  questions: Question[];
  responseCount: number;
  totalAssignments?: number;
  createdAt: string;
  updatedAt: string;
  assignmentStatus?: 'PENDING' | 'COMPLETED' | 'REMINDED' | 'EXPIRED';
  hasResponded?: boolean;
  isOverdue?: boolean;
  assignedAt?: string;
  completedAt?: string | null;
}

export interface SurveyQuestionDetail extends SurveyQuestion {
  assignments: SurveyAssignment[];
  responses: UserSurveyResponse[];
  hasUserResponded: boolean;
}

export interface UserSurveyResponse {
  id: string;
  surveyQuestion: string;
  user: string | null;
  userName?: string;
  answers: Record<string, any>;
  submittedAt: string;
  isAnonymous: boolean;
}

export interface SurveyAssignment {
  id: string;
  user: string;
  userName: string;
  userEmail: string;
  status: 'PENDING' | 'COMPLETED' | 'REMINDED' | 'EXPIRED';
  assignedAt: string;
  remindedAt: string | null;
  completedAt: string | null;
  response: UserSurveyResponse | null;
}

export interface SurveyQuestionCreate {
  organization: string;
  title: string;
  description: string;
  questions: Question[];
  startDate: string;
  endDate: string;
  isAnonymous: boolean;
  selectedMembers: string[];
}

export interface SurveyResponseSubmit {
  answers: Record<string, any>;
}

export interface SurveyResults {
  totalResponses: number;
  questions: QuestionResult[];
}

export interface QuestionResult {
  question: string;
  type: QuestionType;
  order: number;
  answers: any[];
}
