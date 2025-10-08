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
        return apiService.get<UserCv>(`user/profile/${userId}/cv`);
    },

    updateCv: async (userId: string, data: UserCvUpdateRequest): Promise<UserCv> => {
        return apiService.put<UserCv>(`user/profile/${userId}/cv`, data);
    },

    getSkills: async (userId: string, params?: ListParams): Promise<PaginatedResponse<UserSkill>> => {
        return apiService.getPaginatedList<UserSkill>(`user/profile/${userId}/skills`, params);
    },

    createSkill: async (userId: string, data: UserSkillCreateRequest): Promise<UserSkill> => {
        return apiService.post<UserSkill>('user/skills/professional/create', { ...data, user_id: userId });
    },

    updateSkill: async (_userId: string, skillId: string, data: Partial<UserSkillCreateRequest>): Promise<UserSkill> => {
        return apiService.put<UserSkill>(`user/skills/professional/update/${skillId}`, data);
    },

    deleteSkill: async (_userId: string, skillId: string): Promise<void> => {
        return apiService.delete<void>(`user/skills/professional/delete/${skillId}`);
    },
};

export default userExperienceService;