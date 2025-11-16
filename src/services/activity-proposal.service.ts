import {
    PaginatedResponse,
    ListParams
} from '@/types/index.types';
import {
    ActivityProposal,
    ActivityProposalCreateRequest,
    ActivityProposalApproveRequest,
    ActivityProposalRejectRequest
} from '@/types/activity-proposal.types';
import { apiService } from '@/services/api.service';

export const activityProposalService = {
    getList: async (params?: ListParams): Promise<PaginatedResponse<ActivityProposal>> => {
        return apiService.getPaginatedList<ActivityProposal>('activity-proposal/list', params);
    },

    getById: async (id: string): Promise<ActivityProposal> => {
        return apiService.get<ActivityProposal>(`activity-proposal/${id}`);
    },

    create: async (data: ActivityProposalCreateRequest): Promise<ActivityProposal> => {
        return apiService.post<ActivityProposal>('activity-proposal/create', data);
    },

    approve: async (id: string, data?: ActivityProposalApproveRequest): Promise<ActivityProposal> => {
        return apiService.post<ActivityProposal>(`activity-proposal/${id}/approve`, data);
    },

    reject: async (id: string, data: ActivityProposalRejectRequest): Promise<ActivityProposal> => {
        return apiService.post<ActivityProposal>(`activity-proposal/${id}/reject`, data);
    }
};

export default activityProposalService;
