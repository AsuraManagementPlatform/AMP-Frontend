import {
    EntityDonation,
    EntityDonationCreateRequest,
    EntityDonationStats,
    EntityDonationUpdateRequest,
    ListParams,
    PaginatedResponse
} from '@/types/index.types.ts';
import { apiService } from '@/services/api.service';

export interface EntityDonationStatsParams {
    entityId?: string;
}

export const entityDonationService = {
    getList: async (params?: ListParams): Promise<PaginatedResponse<EntityDonation>> => {
        return apiService.getPaginatedList<EntityDonation>('entity-donation/list', params);
    },

    getById: async (id: string): Promise<EntityDonation> => {
        return apiService.get<EntityDonation>(`entity-donation/${id}`);
    },

    create: async (data: EntityDonationCreateRequest): Promise<EntityDonation> => {
        return apiService.post<EntityDonation>('entity-donation/create', data);
    },

    update: async (data: EntityDonationUpdateRequest): Promise<EntityDonation> => {
        return apiService.put<EntityDonation>(`entity-donation/update/${data.id}`, data);
    },

    delete: async (id: string): Promise<void> => {
        return apiService.delete(`entity-donation/delete/${id}`);
    },

    getStats: async (params?: EntityDonationStatsParams): Promise<EntityDonationStats> => {
        const searchParams = new URLSearchParams();

        if (params?.entityId) {
            searchParams.append('entity_id', params.entityId);
        }

        const queryString = searchParams.toString();
        const url = queryString ? `entity-donation/stats?${queryString}` : 'entity-donation/stats';

        return apiService.get<EntityDonationStats>(url);
    }
};

export default entityDonationService;