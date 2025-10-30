import { PaginatedResponse, ListParams } from '@/types/index.types';
import {
    EntityDonation,
    EntityDonationCreateRequest,
    EntityDonationUpdateRequest,
    DonationFilters,
    DonationStats,
    SponsorshipTarget
} from '@/types/donation.types';
import { apiService } from '@/services/api.service';

export const donationService = {
    getList: async (params?: ListParams): Promise<PaginatedResponse<EntityDonation>> => {
        return apiService.getPaginatedList<EntityDonation>('entity-donation/list', params);
    },

    getById: async (id: string): Promise<EntityDonation> => {
        return apiService.get<EntityDonation>(`entity-donation/${id}`);
    },

    create: async (data: EntityDonationCreateRequest): Promise<EntityDonation> => {
        return apiService.post<EntityDonation>('entity-donation/create', data);
    },

    update: async (id: string, data: EntityDonationUpdateRequest): Promise<EntityDonation> => {
        return apiService.put<EntityDonation>(`entity-donation/update/${id}`, data);
    },

    delete: async (id: string): Promise<void> => {
        return apiService.delete(`entity-donation/delete/${id}`);
    },

    getStats: async (filters?: DonationFilters): Promise<DonationStats> => {
        const params = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== null && value !== undefined && value !== '') {
                    params.append(key, value.toString());
                }
            });
        }
        const queryString = params.toString();
        const url = queryString ? `entity-donation/stats?${queryString}` : 'entity-donation/stats';
        return apiService.get<DonationStats>(url);
    },

    getSponsorshipTargets: async (): Promise<SponsorshipTarget[]> => {
        return apiService.get<SponsorshipTarget[]>('entity-donation/sponsorship-targets');
    },

    createDirectSponsorship: async (data: {
        entityId: string;
        targetId: string;
        targetType: 'project' | 'activity';
        amount: number;
        currency: string;
        date: string;
        paymentMethod: string;
        notes?: string;
    }): Promise<EntityDonation> => {
        return apiService.post<EntityDonation>('entity-donation/direct-sponsorship', data);
    }
};

export default donationService;
