import { 
  FinancialReport, 
  ProgressReport, 
  ReportGenerateParams 
} from '@/types/report.types';
import { apiService } from '@/services/api.service';
import axios from 'axios';
import { API_CONFIG } from '@/services/api.service';
import { getAuthHeader } from '@/services/keycloak.service';
import { convertKeysToSnakeCase } from '@/utils/caseConverter';

const apiClient = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: API_CONFIG.headers,
});

apiClient.interceptors.request.use(
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

export const reportService = {
  generateFinancialReport: async (params: ReportGenerateParams): Promise<FinancialReport> => {
    return apiService.post<FinancialReport>('project/reports/financial', params);
  },

  generateProgressReport: async (params: ReportGenerateParams): Promise<ProgressReport> => {
    return apiService.post<ProgressReport>('project/reports/progress', params);
  },

  downloadFinancialReportPDF: async (params: ReportGenerateParams): Promise<Blob> => {
    const response = await apiClient.post('project/reports/financial/pdf', params, {
      responseType: 'blob',
    });
    return response.data;
  },

  downloadFinancialReportExcel: async (params: ReportGenerateParams): Promise<Blob> => {
    const response = await apiClient.post('project/reports/financial/excel', params, {
      responseType: 'blob',
    });
    return response.data;
  },

  downloadProgressReportPDF: async (params: ReportGenerateParams): Promise<Blob> => {
    const response = await apiClient.post('project/reports/progress/pdf', params, {
      responseType: 'blob',
    });
    return response.data;
  },

  downloadProgressReportExcel: async (params: ReportGenerateParams): Promise<Blob> => {
    const response = await apiClient.post('project/reports/progress/excel', params, {
      responseType: 'blob',
    });
    return response.data;
  },
};

export default reportService;
