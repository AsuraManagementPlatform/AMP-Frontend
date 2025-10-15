import {
    ProjectMember,
    ProjectMemberCreateRequest,
    ProjectMemberFilter,
    ProjectMemberUpdateRequest
} from '@/types/project-member.types';
import {ListParams, PaginatedResponse} from '@/types/index.types';
import {apiService} from "@/services/api.service.ts";

const projectMemberService = {
    getList: async (params?: ListParams & ProjectMemberFilter): Promise<PaginatedResponse<ProjectMember>> => {
        return apiService.getPaginatedList<ProjectMember>('project_member/list', params);
    },

    getById: async (id: string): Promise<ProjectMember> => {
        return apiService.get<ProjectMember>(`project_member/${id}`);
    },

    create: async (data: ProjectMemberCreateRequest): Promise<ProjectMember> => {
        return apiService.post<ProjectMember>('project_member/create', data);
    },

    update: async (id: string, data: ProjectMemberUpdateRequest): Promise<ProjectMember> => {
        return apiService.put<ProjectMember>(`project_member/${id}`, data);
    },

    delete: async (id: string): Promise<void> => {
        return apiService.delete(`project_member/delete/${id}`);
    },
};

export default projectMemberService;
