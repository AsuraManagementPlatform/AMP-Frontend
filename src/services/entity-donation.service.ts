import {
    EntityDonation,
    EntityDonationCreateRequest,
    EntityDonationStats,
    EntityDonationUpdateRequest, EntityPartnershipProject,
    ListParams,
    PaginatedResponse
} from '@/types/index.types.ts';
import { apiService } from '@/services/api.service';

export interface EntityDonationStatsParams {
    entityId?: string;
}

export const entityDonationService = {
    getList: async (params?: ListParams): Promise<PaginatedResponse<EntityDonation>> => {
        return apiService.getPaginatedList<EntityDonation>('entity_donation/list', params);
    },

    getById: async (id: string): Promise<EntityDonation> => {
        return apiService.get<EntityDonation>(`entity_donation/${id}`);
    },

    create: async (data: EntityDonationCreateRequest): Promise<EntityDonation> => {
        return apiService.post<EntityDonation>('entity_donation/create', data);
    },

    update: async (data: EntityDonationUpdateRequest): Promise<EntityDonation> => {
        return apiService.put<EntityDonation>(`entity_donation/update/${data.id}`, data);
    },

    delete: async (id: string): Promise<void> => {
        return apiService.delete(`entity_donation/delete/${id}`);
    },

    getStats: async (params?: EntityDonationStatsParams): Promise<EntityDonationStats> => {
        const searchParams = new URLSearchParams();

        if (params?.entityId) {
            searchParams.append('entity_id', params.entityId);
        }

        const queryString = searchParams.toString();
        const url = queryString ? `entity_donation/stats?${queryString}` : 'entity_donation/stats';

        return apiService.get<EntityDonationStats>(url);
    },

    getPartnerships: async (entityId: string): Promise<EntityPartnershipProject[]> => {
        return apiService.get<EntityPartnershipProject[]>(`entity_donation/partnerships?entity_id=${entityId}`);
    },

    createDirectSponsorship: async (data: {
        amount: number;
        currency: string;
        scope: string;
        notes?: string;
        proofDocument?: string;
    }): Promise<{ message: string }> => {
        return apiService.post('entity-donation/direct-sponsorship', data);
    },

    getTypeSuggestions: async (): Promise<string[]> => {
        const response = await apiService.get<{ typeSuggestions: string[] }>('entity_donation/type-suggestions');
        return response.typeSuggestions;
    },
};

export default entityDonationService;