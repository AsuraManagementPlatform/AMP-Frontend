import { apiService } from '@/services/api.service';
import {
    GeneralAssemblyListItem,
    GeneralAssemblyDetail,
    GeneralAssemblyCreatePayload,
    MemberAssemblyView,
    VoteSubmissionPayload,
    GeneralAssemblyParticipant,
    GeneralAssemblyResults,
    EligibleMember,
    OrganizationMember,
    AgendaItemDocument,
    ArchivedAssemblyData,
} from '@/types/general-assembly.types';

class GeneralAssemblyService {
    async list(): Promise<GeneralAssemblyListItem[]> {
        const response = await apiService.get<{ generalAssemblies: GeneralAssemblyListItem[] }>('general-assembly/');
        return response.generalAssemblies || [];
    }

    async getMyAssemblies(): Promise<GeneralAssemblyListItem[]> {
        const response = await apiService.get<{ assemblies: GeneralAssemblyListItem[] }>('general-assembly/my-assemblies/');
        return response.assemblies || [];
    }

    async getById(id: string): Promise<GeneralAssemblyDetail> {
        return await apiService.get<GeneralAssemblyDetail>(`general-assembly/${id}/`);
    }

    async create(payload: GeneralAssemblyCreatePayload): Promise<GeneralAssemblyDetail> {
        return await apiService.post<GeneralAssemblyDetail>('general-assembly/create/', payload);
    }

    async getEligibleMembers(): Promise<EligibleMember[]> {
        const response = await apiService.get<{ eligibleMembers: EligibleMember[] }>('general-assembly/eligible-members/');
        return response.eligibleMembers || [];
    }

    async getAllMembers(): Promise<OrganizationMember[]> {
        const response = await apiService.get<{ allMembers: OrganizationMember[] }>('general-assembly/all-members/');
        return response.allMembers || [];
    }

    async close(id: string): Promise<GeneralAssemblyDetail> {
        return await apiService.post<GeneralAssemblyDetail>(`general-assembly/${id}/close/`);
    }

    async archive(id: string): Promise<{ message: string }> {
        return await apiService.post<{ message: string }>(`general-assembly/${id}/archive/`);
    }

    async deleteAssembly(id: string): Promise<{ message: string }> {
        return await apiService.delete<{ message: string }>(`general-assembly/${id}/`);
    }

    async updateAssembly(id: string, payload: Partial<GeneralAssemblyCreatePayload> & { notifyParticipants?: boolean }): Promise<GeneralAssemblyDetail> {
        return await apiService.put<GeneralAssemblyDetail>(`general-assembly/${id}/`, payload);
    }

    async getParticipants(id: string): Promise<GeneralAssemblyParticipant[]> {
        const response = await apiService.get<{ participants: GeneralAssemblyParticipant[] }>(`general-assembly/${id}/participants/`);
        return response.participants || [];
    }

    async addParticipants(id: string, userIds: string[]): Promise<GeneralAssemblyParticipant[]> {
        const response = await apiService.post<{ participants: GeneralAssemblyParticipant[] }>(`general-assembly/${id}/participants/`, { userIds });
        return response.participants || [];
    }

    async getResults(id: string): Promise<GeneralAssemblyResults> {
        return await apiService.get<GeneralAssemblyResults>(`general-assembly/${id}/results/`);
    }

    async getMemberView(id: string): Promise<MemberAssemblyView> {
        return await apiService.get<MemberAssemblyView>(`general-assembly/${id}/member-view/`);
    }

    async submitVotes(id: string, payload: VoteSubmissionPayload): Promise<{ message: string }> {
        return await apiService.post<{ message: string }>(`general-assembly/${id}/vote/`, payload);
    }

    async downloadReport(id: string, format: 'pdf' | 'excel'): Promise<Blob> {
        const endpoint = format === 'excel' ? 'export-excel' : 'export-pdf';
        return await apiService.getBlob(`general-assembly/${id}/${endpoint}/`);
    }

    async uploadAgendaItemDocument(agendaItemId: string, file: File, description?: string): Promise<AgendaItemDocument> {
        const formData = new FormData();
        formData.append('file', file);
        if (description) {
            formData.append('description', description);
        }
        return await apiService.postFormData<AgendaItemDocument>(
            `general-assembly/agenda-item/${agendaItemId}/documents/upload/`,
            formData
        );
    }

    async getAgendaItemDocuments(agendaItemId: string): Promise<AgendaItemDocument[]> {
        const response = await apiService.get<{ documents: AgendaItemDocument[] }>(
            `general-assembly/agenda-item/${agendaItemId}/documents/`
        );
        return response.documents || [];
    }

    async deleteAgendaItemDocument(agendaItemId: string, documentId: string): Promise<{ message: string }> {
        return await apiService.delete<{ message: string }>(
            `general-assembly/agenda-item/${agendaItemId}/documents/${documentId}/`
        );
    }

    async getArchivedData(id: string): Promise<ArchivedAssemblyData> {
        return await apiService.get<ArchivedAssemblyData>(`general-assembly/${id}/archived-data/`);
    }
}

export default new GeneralAssemblyService();
