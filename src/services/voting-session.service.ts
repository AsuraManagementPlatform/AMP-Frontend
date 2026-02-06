import { apiService } from '@/services/api.service';
import {
    VotingSessionListItem,
    VotingSessionDetail,
    VotingSessionCreatePayload,
    VotingSessionVotePayload
} from '@/types/voting-session.types';

class VotingSessionService {
    async list(): Promise<VotingSessionListItem[]> {
        const response = await apiService.get<{ votingSessions: VotingSessionListItem[] }>('voting-session/');
        return response.votingSessions || [];
    }

    async getById(id: string): Promise<VotingSessionDetail> {
        return await apiService.get<VotingSessionDetail>(`voting-session/${id}`);
    }

    async create(payload: VotingSessionCreatePayload): Promise<VotingSessionDetail> {
        return await apiService.post<VotingSessionDetail>('voting-session/create', payload);
    }

    async join(id: string): Promise<VotingSessionDetail> {
        return await apiService.post<VotingSessionDetail>(`voting-session/${id}/join`);
    }

    async vote(id: string, payload: VotingSessionVotePayload): Promise<VotingSessionDetail> {
        return await apiService.post<VotingSessionDetail>(`voting-session/${id}/vote`, payload);
    }

    async close(id: string): Promise<VotingSessionDetail> {
        return await apiService.post<VotingSessionDetail>(`voting-session/${id}/close`);
    }

    async archive(id: string): Promise<VotingSessionDetail> {
        return await apiService.post<VotingSessionDetail>(`voting-session/${id}/archive`);
    }

    async downloadReportPdf(id: string): Promise<Blob> {
        return await apiService.getBlob(`voting-session/${id}/report-pdf`);
    }

    async downloadReportCsv(id: string): Promise<Blob> {
        return await apiService.getBlob(`voting-session/${id}/report-csv`);
    }

    async delete(id: string): Promise<void> {
        await apiService.delete(`voting-session/${id}/delete`);
    }
}

export default new VotingSessionService();
