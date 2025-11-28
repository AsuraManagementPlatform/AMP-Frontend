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

export interface DonationReportData {
  summary: {
    totalDonations: number;
    totalAmount: number;
    confirmedDonations: number;
    pendingDonations: number;
    rejectedDonations: number;
    uniqueEntities: number;
    donationsWithProject: number;
    donationsWithActivity: number;
    generalDonations: number;
    averageDonation: number;
  };
  donationsByEntity: Array<{
    entityName: string;
    entityType: string;
    totalDonations: number;
    totalAmount: number;
    confirmedAmount: number;
    pendingAmount: number;
    lastDonationDate: string;
  }>;
  donationsByProject: Array<{
    projectName: string;
    totalDonations: number;
    totalAmount: number;
    confirmedAmount: number;
  }>;
  donationsByType: Array<{
    type: string;
    totalDonations: number;
    totalAmount: number;
  }>;
}

export interface GenerateDonationReportRequest {
  yearFrom: number;
  yearTo: number;
}

class DonationReportService {
  async generateReport(request: GenerateDonationReportRequest): Promise<DonationReportData> {
    const data = await apiService.post('organization/reports/donations/generate', {
      year_from: request.yearFrom,
      year_to: request.yearTo,
    });
    return data as DonationReportData;
  }

  async downloadExcel(yearFrom: number, yearTo: number): Promise<Blob> {
    const response = await reportBlobClient.post('organization/reports/donations/download-excel', {
      yearFrom,
      yearTo,
    });
    return response.data;
  }

  async downloadPDF(yearFrom: number, yearTo: number): Promise<Blob> {
    const response = await reportBlobClient.post('organization/reports/donations/download-pdf', {
      yearFrom,
      yearTo,
    });
    return response.data;
  }
}

export const donationReportService = new DonationReportService();
