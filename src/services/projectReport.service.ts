import axios, { AxiosInstance } from 'axios';
import { apiService } from './api.service';
import { getAuthHeader } from './keycloak.service';
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

export interface ProjectReportSummary {
  totalProjects: number;
  projectsByStatus: Record<string, number>;
  totalPlannedBudget: number;
  totalActivities: number;
  completedActivities: number;
  activityCompletionRate: number;
  totalFunds: number;
  totalExpenses: number;
  budgetExecutionRate: number;
  availableBudget: number;
}

export interface ProjectData {
  id: string;
  name: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  location: string;
  startingDate: string;
  endingDate: string;
  plannedBudget: number;
  currency: string;
  budgetResponsible: string;
  totalActivities: number;
  completedActivities: number;
  totalFunds: number;
  totalExpenses: number;
  availableBudget: number;
}

export interface ActivityData {
  id: string;
  projectId: string;
  projectName: string;
  title: string;
  description: string;
  type: string;
  status: string;
  location: string;
  startingDate: string;
  estimatedEndingDate: string;
  endingDate: string | null;
  completedAt: string | null;
}

export interface BudgetData {
  projectId: string;
  projectName: string;
  plannedBudget: number;
  totalFunds: number;
  totalExpenses: number;
  availableBudget: number;
  executionRate: number;
}

export interface ExpenseData {
  id: string;
  projectId: string;
  projectName: string;
  activityId: string | null;
  activityTitle: string | null;
  name: string;
  description: string;
  category: string;
  amount: number;
  currency: string;
  status: string;
  plannedDate: string;
  executionDate: string | null;
}

export interface ProjectReportData {
  summary: ProjectReportSummary;
  projects: ProjectData[];
  activities: ActivityData[];
  budget: BudgetData[];
  expenses: ExpenseData[];
}

export interface GenerateProjectReportRequest {
  yearFrom: number;
  yearTo: number;
}

export const projectReportService = {
  async generateReport(data: GenerateProjectReportRequest): Promise<ProjectReportData> {
    return apiService.post<ProjectReportData>(
      '/organization/reports/projects/generate',
      { year_from: data.yearFrom, year_to: data.yearTo }
    );
  },

  async downloadExcel(data: GenerateProjectReportRequest): Promise<Blob> {
    const response = await reportBlobClient.post('/organization/reports/projects/download-excel', {
      year_from: data.yearFrom,
      year_to: data.yearTo,
    });
    return response.data;
  },

  async downloadPDF(data: GenerateProjectReportRequest): Promise<Blob> {
    const response = await reportBlobClient.post('/organization/reports/projects/download-pdf', {
      year_from: data.yearFrom,
      year_to: data.yearTo,
    });
    return response.data;
  }
};
