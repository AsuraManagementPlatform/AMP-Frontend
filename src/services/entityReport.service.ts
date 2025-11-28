import axios, { AxiosInstance } from 'axios';
import { apiService } from './api.service';
import { getAuthHeader } from './keycloak.service';

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
    return config;
  },
  (error) => Promise.reject(error)
);

export interface EntityReportSummary {
  totalEntities: number;
  activeEntities: number;
  inactiveEntities: number;
  juridicalEntities: number;
  physicalEntities: number;
  entitiesWithProjects: number;
  entitiesWithDonations: number;
  entitiesWithCommunications: number;
  totalDonationsAmount: number;
  totalProjectsInvolved: number;
}

export interface EntityByType {
  type: string;
  count: number;
}

export interface EntityByStatus {
  status: string;
  count: number;
}

export interface EntityWithProject {
  entityName: string;
  entityType: string;
  legalType: string;
  projectsCount: number;
  projects: Array<{
    projectName: string;
    engagementLevel: string;
  }>;
}

export interface EntityWithDonation {
  entityName: string;
  entityType: string;
  legalType: string;
  donationsCount: number;
  totalAmount: number;
  confirmedAmount: number;
}

export interface EntityDetail {
  name: string;
  legalType: string;
  type: string;
  status: string;
  email: string;
  phone: string;
  projectsCount: number;
  donationsCount: number;
  communicationsCount: number;
  totalDonationsAmount: number;
  confirmedDonationsAmount: number;
  hasActivity: boolean;
}

export interface EntityReportData {
  summary: EntityReportSummary;
  entitiesByType: EntityByType[];
  entitiesByStatus: EntityByStatus[];
  entitiesWithProjects: EntityWithProject[];
  entitiesWithDonations: EntityWithDonation[];
  entitiesDetail: EntityDetail[];
}

class EntityReportService {
  async generateReport(): Promise<EntityReportData> {
    const data = await apiService.get('organization/reports/entities/generate');
    return data as EntityReportData;
  }

  async downloadExcel(): Promise<Blob> {
    const response = await reportBlobClient.get('organization/reports/entities/download-excel');
    return response.data;
  }

  async downloadPDF(): Promise<Blob> {
    const response = await reportBlobClient.get('organization/reports/entities/download-pdf');
    return response.data;
  }
}

export const entityReportService = new EntityReportService();
export default entityReportService;
