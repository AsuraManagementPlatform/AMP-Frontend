import {
    PaginatedResponse,
    ListParams
} from '@/types/index.types';
import {
    Communication,
    CommunicationCreateRequest,
    CommunicationReplyRequest,
    CommunicationUpdateStatusRequest,
    UnreadCountResponse
} from '@/types/communication.types';
import { apiService } from '@/services/api.service';

export const communicationService = {
    getList: async (params?: ListParams): Promise<PaginatedResponse<Communication>> => {
        return apiService.getPaginatedList<Communication>('communication/list', params);
    },

    getById: async (id: string): Promise<Communication> => {
        return apiService.get<Communication>(`communication/${id}`);
    },

    create: async (data: CommunicationCreateRequest): Promise<Communication> => {
        const backendData = {
            type: data.type,
            recipient: data.recipient,
            organization: data.organization,
            subject: data.subject,
            initial_message: data.initialMessage,
            priority: data.priority,
            related_project: data.relatedProject,
            related_activity: data.relatedActivity
        };
        return apiService.post<Communication>('communication/create', backendData);
    },

    reply: async (id: string, data: CommunicationReplyRequest): Promise<Communication> => {
        return apiService.post<Communication>(`communication/${id}/reply`, data);
    },

    updateStatus: async (id: string, data: CommunicationUpdateStatusRequest): Promise<Communication> => {
        return apiService.patch<Communication>(`communication/${id}/update-status`, data);
    },

    markAsRead: async (id: string): Promise<Communication> => {
        return apiService.patch<Communication>(`communication/${id}/mark-read`, {});
    },

    getUnreadCount: async (): Promise<UnreadCountResponse> => {
        return apiService.get<UnreadCountResponse>('communication/unread-count');
    },

    delete: async (id: string): Promise<void> => {
        return apiService.delete<void>(`communication/${id}/delete`);
    },

    sendGlobalBroadcast: async (data: { subject: string; initialMessage: string; priority: string }): Promise<{ message: string; recipients_count: number }> => {
        const backendData = {
            subject: data.subject,
            initial_message: data.initialMessage,
            priority: data.priority
        };
        return apiService.post<{ message: string; recipients_count: number }>('communication/global-broadcast', backendData);
    }
};

export default communicationService;
