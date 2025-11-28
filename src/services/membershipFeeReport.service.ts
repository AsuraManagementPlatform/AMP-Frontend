import axios, { AxiosInstance } from 'axios';
import { apiService } from '@/services/api.service';
import { getAuthHeader } from '@/services/keycloak.service';
import { convertKeysToSnakeCase } from '@/utils/caseConverter';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/';

const reportBlobClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  responseType: 'blob',
});

reportBlobClient.interceptors.request.use(
  (config) => {
    const authHeader = getAuthHeader();
    if (authHeader.Authorization) {
      config.headers.Authorization = authHeader.Authorization;
    }
    if (config.data) {
      config.data = convertKeysToSnakeCase(config.data);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export interface GenerateMembershipFeeReportRequest {
  startDate: string;
  endDate: string;
  forceRefresh?: boolean;
}

export interface MembershipFeeReportSummary {
  totalMembers: number;
  contributorMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  totalFeesDue: number;
  totalFeesCollected: number;
  totalPending: number;
  totalOverdue: number;
  totalOutstanding: number;
  collectionRate: number;
  averageFeePerMember: number;
  currency: string;
  onTimePayments: number;
  latePayments: number;
  onTimeRate: number;
  feesByStatus: Record<string, { count: number; amount: number }>;
}

export interface MemberBreakdown {
  memberId: string;
  fullName: string;
  email: string;
  registrationDate: string | null;
  status: string;
  periodFees: {
    totalDue: number;
    totalPaid: number;
    outstanding: number;
    paymentRate: number;
  };
  lifetimeStats: {
    membershipDurationMonths: number;
    totalFeesEverDue: number;
    totalFeesEverPaid: number;
    lifetimeOutstanding: number;
  };
  paymentBehavior: {
    onTimePayments: number;
    latePayments: number;
    preferredPaymentMethod: string | null;
  };
  feesDetail: Array<{
    feeId: string;
    period: string;
    startedFrom: string;
    endedAt: string;
    amount: number;
    paidAmount: number;
    status: string;
    paymentMethod: string | null;
    paymentDate: string | null;
    transactionReference: string | null;
    daysToPayment: number | null;
    isOverdue: boolean;
  }>;
}

export interface PaymentTimelineData {
  date: string;
  periodLabel: string;
  cumulativeFeesDue: number;
  cumulativeCollected: number;
  cumulativeOutstanding: number;
  monthlyFeesDue: number;
  monthlyCollected: number;
  monthlyCollectionRate: number;
  paymentMethods: Record<string, number>;
  totalPaymentsCount: number;
  uniqueMembersPaid: number;
}

export interface PaymentMethodBreakdown {
  count: number;
  totalAmount: number;
  percentage: number;
  averageAmount: number;
}

export interface ArrearsAnalysis {
  totalMembersWithArrears: number;
  totalOutstandingAmount: number;
  averageOutstandingPerMember: number;
  byAge: Record<string, { count: number; amount: number; members: string[] }>;
  membersWithArrears: Array<{
    memberId: string;
    fullName: string;
    outstandingAmount: number;
    oldestUnpaidFee: {
      period: string;
      amount: number;
      daysOverdue: number;
    };
    unpaidFeesCount: number;
    lastPaymentDate: string | null;
    contact: {
      email: string;
      phone: string | null;
    };
  }>;
}

export interface MembershipFeeReportData {
  organization: {
    id: string;
    name: string;
  };
  period: {
    startDate: string;
    endDate: string;
  };
  summary: MembershipFeeReportSummary;
  membersBreakdown: MemberBreakdown[];
  paymentTimeline: PaymentTimelineData[];
  paymentMethodsBreakdown: Record<string, PaymentMethodBreakdown>;
  arrearsAnalysis: ArrearsAnalysis;
  observations: {
    alerts: Array<{
      type: string;
      message: string;
      value: number;
      actionRequired: boolean;
    }>;
    recommendations: Array<{
      priority: string;
      category: string;
      recommendation: string;
    }>;
  };
  metadata: {
    reportType: string;
    generatedAt: string;
    generatedBy: string | null;
    generatedByName: string | null;
    currency: string;
    fromCache: boolean;
  };
}

class MembershipFeeReportService {
  async generateReport(data: GenerateMembershipFeeReportRequest): Promise<MembershipFeeReportData> {
    return apiService.post<MembershipFeeReportData>('organization/reports/membership-fees/generate', {
      startDate: data.startDate,
      endDate: data.endDate,
      forceRefresh: data.forceRefresh || false,
    });
  }

  async downloadPDF(data: GenerateMembershipFeeReportRequest): Promise<Blob> {
    const response = await reportBlobClient.post('organization/reports/membership-fees/download-pdf', {
      start_date: data.startDate,
      end_date: data.endDate,
    });
    return response.data;
  }

  async downloadExcel(data: GenerateMembershipFeeReportRequest): Promise<Blob> {
    const response = await reportBlobClient.post('organization/reports/membership-fees/download-excel', {
      start_date: data.startDate,
      end_date: data.endDate,
    });
    return response.data;
  }
}

export const membershipFeeReportService = new MembershipFeeReportService();
