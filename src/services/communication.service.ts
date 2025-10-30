import { PaginatedResponse, ListParams } from '@/types/index.types';
import {
    EntityCommunication,
    EntityCommunicationCreateRequest,
    EntityCommunicationUpdateRequest,
    CommunicationFilters,
    CommunicationStats
} from '@/types/communication.types';
import { apiService } from '@/services/api.service';

export const communicationService = {
    getList: async (params?: ListParams): Promise<PaginatedResponse<EntityCommunication>> => {
        return apiService.getPaginatedList<EntityCommunication>('entity-communication/list', params);
    },

    getById: async (id: string): Promise<EntityCommunication> => {
        return apiService.get<EntityCommunication>(`entity-communication/${id}`);
    },

    create: async (data: EntityCommunicationCreateRequest): Promise<EntityCommunication> => {
        return apiService.post<EntityCommunication>('entity-communication/create', data);
    },

    update: async (id: string, data: EntityCommunicationUpdateRequest): Promise<EntityCommunication> => {
        return apiService.put<EntityCommunication>(`entity-communication/update/${id}`, data);
    },

    delete: async (id: string): Promise<void> => {
        return apiService.delete(`entity-communication/delete/${id}`);
    },

    getStats: async (filters?: CommunicationFilters): Promise<CommunicationStats> => {
        const params = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== null && value !== undefined && value !== '') {
                    params.append(key, value.toString());
                }
            });
        }
        const queryString = params.toString();
        const url = queryString ? `entity-communication/stats?${queryString}` : 'entity-communication/stats';
        return apiService.get<CommunicationStats>(url);
    }
};

export default communicationService;