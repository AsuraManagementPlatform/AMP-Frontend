import { BaseEntity, Currency } from "@/types/index.types";
import { ActivityStatus } from "@/types/activity.types";
import { ExpenseCategoryType } from "@/types/project-expense.types";

export const ReportType = {
    FINANCIAL: 'FINANCIAL',
    PROGRESS: 'PROGRESS'
} as const;

export type ReportType = typeof ReportType[keyof typeof ReportType];

export const ProjectHealthStatus = {
    ON_TRACK: 'ON_TRACK',
    AT_RISK: 'AT_RISK',
    CRITICAL: 'CRITICAL',
    DELAYED: 'DELAYED',
    COMPLETED: 'COMPLETED'
} as const;

export type ProjectHealthStatus = typeof ProjectHealthStatus[keyof typeof ProjectHealthStatus];

export interface ReportMetadata {
    generatedAt: string;
    generatedBy: string;
    generatedByName: string;
    currency: Currency;
    fromCache?: boolean;
    calculationTimeMs?: number;
}

export interface FinancialSummary {
    totalRevenue: number;
    totalExpenses: number;
    currentBalance: number;
    budgetConsumed: number;
    projectBudget: number;
    plannedBudget: number;
    currency: string;
}

export interface BudgetTimelinePoint {
    date: string;
    plannedBudget: number;
    cumulativeRevenue: number;
    cumulativeExpenses: number;
    availableBalance: number;
    budgetRemaining: number;
}

export interface CategoryBreakdown {
    category: string;
    amount: number;
    percentage: number;
    count: number;
}

export interface SourceBreakdown {
    source: string;
    sourceName: string;
    amount: number;
    percentage: number;
    count: number;
}

export interface ActivityBreakdown {
    activityId: string | null;
    activityTitle: string;
    amount: number;
    percentage: number;
}

export interface TimelineData {
    month: string;
    amount: number;
}

export interface FundDetail {
    id: string;
    source: string;
    sourceName: string;
    category: string;
    amount: number;
    date: string;
    status: string;
}

export interface ExpenseDetail {
    id: string;
    name: string;
    category: ExpenseCategoryType;
    activity?: string;
    activityTitle?: string;
    planned: number;
    executed: number;
    remaining: number;
    status: string;
}

export interface RevenueDetails {
    bySource: SourceBreakdown[];
    byCategory: CategoryBreakdown[];
    byActivity: ActivityBreakdown[];
    timeline: TimelineData[];
    funds: FundDetail[];
}

export interface ExpenseDetails {
    byCategory: CategoryBreakdown[];
    byActivity: ActivityBreakdown[];
    timeline: TimelineData[];
    expenses: ExpenseDetail[];
}

export interface Deviation {
    type: 'REVENUE' | 'EXPENSE';
    item: string;
    planned: number;
    actual: number;
    deviation: number;
    deviationPercentage: number;
    explanation?: string;
}

export interface Alert {
    type: 'INFO' | 'WARNING' | 'CRITICAL';
    message: string;
    value?: number;
}

export interface Observations {
    significantDeviations: Deviation[];
    alerts: Alert[];
}

export interface FinancialReport extends BaseEntity {
    reportType: 'FINANCIAL';
    project: string;
    projectName: string;
    periodStart: string;
    periodEnd: string;
    summary: FinancialSummary;
    budgetTimeline: BudgetTimelinePoint[];
    revenueDetails: RevenueDetails;
    expenseDetails: ExpenseDetails;
    observations: Observations;
    metadata: ReportMetadata;
}

export interface ProjectStatusInfo {
    overallHealth: ProjectHealthStatus;
    timeProgress: number;
    workProgress: number;
    startDate: string;
    endDate: string;
    daysRemaining: number;
}

export interface ActivitySummary {
    totalActivities: number;
    completed: number;
    inProgress: number;
    planned: number;
    postponed: number;
    cancelled: number;
    completionRate: number;
    byStatus: Array<{
        status: string;
        count: number;
        percentage: number;
    }>;
    recentlyCompleted: Array<{
        id: string;
        name: string;
        completedAt: string | null;
        endDate: string | null;
    }>;
    upcoming: Array<{
        id: string;
        name: string;
        startDate: string;
        endDate: string;
    }>;
    overdue: Array<{
        id: string;
        name: string;
        dueDate: string;
        status: string;
    }>;
    onTimeCompletion: number;
    activitiesByStatus?: ActivitiesByStatus;
}

export interface ActivityDetail {
    id: string;
    title: string;
    status: ActivityStatus;
    startingDate: string;
    estimatedEndingDate: string;
    endingDate?: string | null;
    completedAt?: string | null;
    progressPercentage: number;
    description?: string;
    location?: string;
    objective?: string;
    objectiveId?: string | null;
    budget: number;
}

export interface ActivitiesByStatus {
    completed: ActivityDetail[];
    inProgress: ActivityDetail[];
    planned: ActivityDetail[];
    overdue: ActivityDetail[];
    cancelled: ActivityDetail[];
}

export interface ObjectiveAchievement {
    achievementRate: number;
    activityBasedAchievement: {
        totalActivities: number;
        completedActivities: number;
        percentage: number;
    };
}

export interface Issue {
    type: 'BUDGET' | 'TIMELINE' | 'RESOURCE' | 'OTHER';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    description: string;
    identifiedAt: string;
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
}

export interface Action {
    problemId?: string;
    action: string;
    responsible: string;
    deadline: string;
    status: 'PENDING' | 'COMPLETED';
}

export interface IssuesAndActions {
    identifiedIssues: Array<{
        id: string;
        description: string;
        severity: 'LOW' | 'MEDIUM' | 'HIGH';
        count: number;
    }>;
    mitigationActions: Array<{
        action: string;
        priority: 'LOW' | 'MEDIUM' | 'HIGH';
        deadline: string;
    }>;
}

export interface TeamMember {
    id: string;
    name: string;
    email: string;
    type: string;
    role?: string;
    status?: string;
    addedToProject?: string;
    activeFrom?: string;
    activeTo?: string;
    contractualDocumentNumber?: string;
}

export interface Partner {
    id: string;
    name: string;
    type: string;
    engagementLevel?: string;
    contactPerson?: string;
    contactEmail?: string;
    contactPhone?: string;
    address?: string;
}

export interface RoleBreakdown {
    role: string;
    count: number;
    members: TeamMember[];
}

export interface HumanResources {
    totalMembers: number;
    totalPartners: number;
    byRole: RoleBreakdown[];
    byType: CategoryBreakdown[];
    members: TeamMember[];
    partners: Partner[];
}

export interface ImpactIndicator {
    name: string;
    target: number;
    achieved: number;
    unit: string;
    percentage: number;
}

export interface QualitativeIndicator {
    name: string;
    description: string;
    status: 'ACHIEVED' | 'PARTIAL' | 'NOT_ACHIEVED';
}

export interface ActivityResult {
    activityId: string;
    activityTitle: string;
    results: string;
}

export interface Impact {
    quantitativeIndicators: ImpactIndicator[];
    qualitativeIndicators: QualitativeIndicator[];
    activityResults: ActivityResult[];
}

export interface Recommendation {
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    action: string;
    responsible?: string;
    deadline?: string;
}

export interface Recommendations {
    recommendations: Array<{
        priority: 'LOW' | 'MEDIUM' | 'HIGH';
        category: string;
        recommendation: string;
    }>;
}

export interface ProgressReport extends BaseEntity {
    reportType: 'PROGRESS';
    project: string;
    projectName: string;
    periodStart: string;
    periodEnd: string;
    projectStatus: ProjectStatusInfo;
    activities: ActivitySummary;
    activitiesByStatus: ActivitiesByStatus;
    objectives: ObjectiveAchievement;
    issues: IssuesAndActions;
    humanResources: HumanResources;
    impact: Impact;
    recommendations: Recommendations;
    metadata: ReportMetadata;
}

export interface ReportGenerateParams {
    projectId: string;
    startDate: string;
    endDate: string;
    forceRefresh?: boolean;
}

export interface ReportResponse {
    report: FinancialReport | ProgressReport;
    fromCache: boolean;
    generationTime: number;
}
