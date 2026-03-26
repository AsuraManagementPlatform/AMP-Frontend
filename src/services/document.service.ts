import { apiService } from './api.service';
import { Document, DocumentUploadParams, DocumentListParams } from '@/types/document.types';
import axios from 'axios';
import { getAuthHeader } from './keycloak.service';
import { convertKeysToCamelCase } from '@/utils/caseConverter';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/';

class DocumentService {
  private readonly baseUrl = 'document';

  async upload(params: DocumentUploadParams): Promise<Document> {
    const formData = new FormData();
    formData.append('file', params.file);
    formData.append('category', params.category);

    if (params.membershipFeeId) {
      formData.append('membership_fee_id', params.membershipFeeId);
    }
    if (params.entityDonationId) {
      formData.append('entity_donation_id', params.entityDonationId);
    }
    if (params.entityId) {
      formData.append('entity_id', params.entityId);
    }
    if (params.projectId) {
      formData.append('project_id', params.projectId);
    }
    if (params.projectFundId) {
      formData.append('project_fund_id', params.projectFundId);
    }
    if (params.projectExpenseId) {
      formData.append('project_expense_id', params.projectExpenseId);
    }
    if (params.activityId) {
      formData.append('activity_id', params.activityId);
    }
    if (params.userId) {
      formData.append('user_id', params.userId);
    }
    if (params.subcategory) {
      formData.append('subcategory', params.subcategory);
    }
    if (params.isTemporal !== undefined) {
      formData.append('is_temporal', String(params.isTemporal));
    }
    if (params.description) {
      formData.append('description', params.description);
    }
    if (params.tags && params.tags.length > 0) {
      formData.append('tags', JSON.stringify(params.tags));
    }

    const response = await axios.post(
      `${API_BASE_URL}${this.baseUrl}/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...getAuthHeader(),
        },
      }
    );

    return convertKeysToCamelCase(response.data) as Document;
  }

  async list(params?: DocumentListParams): Promise<Document[]> {
    const queryParams: Record<string, string> = {};

    if (params?.category) {
      queryParams.category = params.category;
    }
    if (params?.subcategory) {
      queryParams.subcategory = params.subcategory;
    }
    if (params?.year !== undefined) {
      queryParams.year = String(params.year);
    }
    if (params?.month !== undefined) {
      queryParams.month = String(params.month);
    }
    if (params?.isPermanent !== undefined) {
      queryParams.is_permanent = String(params.isPermanent);
    }
    if (params?.membershipFeeId) {
      queryParams.membership_fee_id = params.membershipFeeId;
    }
    if (params?.entityDonationId) {
      queryParams.entity_donation_id = params.entityDonationId;
    }
    if (params?.entityId) {
      queryParams.entity_id = params.entityId;
    }
    if (params?.projectId) {
      queryParams.project_id = params.projectId;
    }
    if (params?.projectFundId) {
      queryParams.project_fund_id = params.projectFundId;
    }
    if (params?.projectExpenseId) {
      queryParams.project_expense_id = params.projectExpenseId;
    }
    if (params?.activityId) {
      queryParams.activity_id = params.activityId;
    }
    if (params?.userId) {
      queryParams.user_id = params.userId;
    }
    if (params?.fileType) {
      queryParams.file_type = params.fileType;
    }

    const queryString = new URLSearchParams(queryParams).toString();
    const url = queryString ? `${this.baseUrl}/list?${queryString}` : `${this.baseUrl}/list`;

    return apiService.get<Document[]>(url);
  }

  async getById(id: string): Promise<Document> {
    return apiService.get<Document>(`${this.baseUrl}/list/${id}`);
  }

  async download(id: string): Promise<void> {
    const document = await this.getById(id);

    const response = await axios.get(
      `${API_BASE_URL}${this.baseUrl}/${id}/download`,
      {
        responseType: 'blob',
        headers: getAuthHeader(),
      }
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = window.document.createElement('a');
    link.href = url;
    link.setAttribute('download', document.fileName);
    window.document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  async delete(id: string): Promise<void> {
    await apiService.delete<void>(`${this.baseUrl}/${id}/delete`);
  }

  async getPreviewBlob(id: string): Promise<Blob> {
    const response = await axios.get(
      `${API_BASE_URL}${this.baseUrl}/${id}/download`,
      {
        responseType: 'blob',
        headers: getAuthHeader(),
      }
    );

    return response.data;
  }

  canPreview(fileType: string): boolean {
    const previewableTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'text/plain',
      'text/html',
      'text/csv',
    ];

    return previewableTypes.includes(fileType.toLowerCase());
  }

  getFileIcon(fileType: string): string {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('doc')) return '📝';
    if (fileType.includes('excel') || fileType.includes('sheet')) return '📊';
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return '📽️';
    if (fileType.includes('text')) return '📃';
    if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('tar')) return '🗜️';
    return '📎';
  }
}

export const documentService = new DocumentService();
