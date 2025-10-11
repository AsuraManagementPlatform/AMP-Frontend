import {ListParams, PaginatedResponse} from "@/types/index.types.ts";
import {
    UserCv,
    UserSkill,
    UserSkillCreateRequest,
    UserCvUpdateRequest
} from "@/types/userExperience.types.ts";
import {apiService} from "@/services/api.service.ts";

export const userExperienceService = {
    getCv: async (userId: string): Promise<UserCv> => {
        return apiService.get<UserCv>(`/api/user/profile/${userId}/cv`);
    },

    updateCv: async (userId: string, data: UserCvUpdateRequest): Promise<UserCv> => {
        return apiService.put<UserCv>(`/api/user/profile/${userId}/cv`, data);
    },

    getSkills: async (userId: string, params?: ListParams): Promise<PaginatedResponse<UserSkill>> => {
        return apiService.getPaginatedList<UserSkill>(`/api/user/profile/${userId}/skills`, params);
    },

    createSkill: async (userId: string, data: UserSkillCreateRequest): Promise<UserSkill> => {
        return apiService.post<UserSkill>('/api/user/skills/professional/create', { ...data, user_id: userId });
    },

    updateSkill: async (_userId: string, skillId: string, data: Partial<UserSkillCreateRequest>): Promise<UserSkill> => {
        return apiService.put<UserSkill>(`/api/user/skills/professional/update/${skillId}`, data);
    },

    deleteSkill: async (_userId: string, skillId: string): Promise<void> => {
        return apiService.delete<void>(`/api/user/skills/professional/delete/${skillId}`);
    },
};

export default userExperienceService;