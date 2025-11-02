import {
    PaginatedResponse,
    ListParams,
    EntityCommunication,
    EntityCommunicationCreateRequest, EntityCommunicationUpdateRequest
} from '@/types/index.types';
import { apiService } from '@/services/api.service';

export const entityCommunicationService = {
    getList: async (params?: ListParams): Promise<PaginatedResponse<EntityCommunication>> => {
        return apiService.getPaginatedList<EntityCommunication>('entity-communication/list', params);
    },

    getById: async (id: string): Promise<EntityCommunication> => {
        return apiService.get<EntityCommunication>(`entity-communication/${id}`);
    },

    create: async (data: EntityCommunicationCreateRequest): Promise<EntityCommunication> => {
        return apiService.post<EntityCommunication>('entity-communication/create', data);
    },

    update: async (data: EntityCommunicationUpdateRequest): Promise<EntityCommunication> => {
        return apiService.put<EntityCommunication>(`entity-communication/update/${data.id}`, data);
    },

    delete: async (id: string): Promise<void> => {
        return apiService.delete(`entity-communication/delete/${id}`);
    },
};

export default entityCommunicationService;