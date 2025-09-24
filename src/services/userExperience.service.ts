import {ListParams, PaginatedResponse} from "@/types/index.types.ts";
import {
    UserCv,
    UserSkill,
    UserExperience,
    UserEducation,
    UserCertification,
    UserSkillCreateRequest,
    UserExperienceCreateRequest,
    UserEducationCreateRequest,
    UserCertificationCreateRequest,
    UserCvUpdateRequest
} from "@/types/userExperience.types.ts";
import {apiService} from "@/services/api.service.ts";

export const userExperienceService = {
    // CV Management
    getCv: async (userId: string): Promise<UserCv> => {
        return apiService.get<UserCv>(`/api/user/${userId}/cv`);
    },

    updateCv: async (userId: string, data: UserCvUpdateRequest): Promise<UserCv> => {
        return apiService.put<UserCv>(`/api/user/${userId}/cv`, data);
    },

    // Skills Management
    getSkills: async (userId: string, params?: ListParams): Promise<PaginatedResponse<UserSkill>> => {
        return apiService.getPaginatedList<UserSkill>(`/api/user/${userId}/skills`, params);
    },

    createSkill: async (userId: string, data: UserSkillCreateRequest): Promise<UserSkill> => {
        return apiService.post<UserSkill>(`/api/user/${userId}/skills/create`, data);
    },

    updateSkill: async (userId: string, skillId: string, data: Partial<UserSkillCreateRequest>): Promise<UserSkill> => {
        return apiService.put<UserSkill>(`/api/user/${userId}/skills/update/${skillId}`, data);
    },

    deleteSkill: async (userId: string, skillId: string): Promise<void> => {
        return apiService.delete<void>(`/api/user/${userId}/skills/delete/${skillId}`);
    },

    // Experience Management
    getExperiences: async (userId: string, params?: ListParams): Promise<PaginatedResponse<UserExperience>> => {
        return apiService.getPaginatedList<UserExperience>(`/api/user/${userId}/experiences`, params);
    },

    createExperience: async (userId: string, data: UserExperienceCreateRequest): Promise<UserExperience> => {
        return apiService.post<UserExperience>(`/api/user/${userId}/experiences/create`, data);
    },

    updateExperience: async (userId: string, experienceId: string, data: Partial<UserExperienceCreateRequest>): Promise<UserExperience> => {
        return apiService.put<UserExperience>(`/api/user/${userId}/experiences/update/${experienceId}`, data);
    },

    deleteExperience: async (userId: string, experienceId: string): Promise<void> => {
        return apiService.delete<void>(`/api/user/${userId}/experiences/delete/${experienceId}`);
    },

    // Education Management
    getEducation: async (userId: string, params?: ListParams): Promise<PaginatedResponse<UserEducation>> => {
        return apiService.getPaginatedList<UserEducation>(`/api/user/${userId}/education`, params);
    },

    createEducation: async (userId: string, data: UserEducationCreateRequest): Promise<UserEducation> => {
        return apiService.post<UserEducation>(`/api/user/${userId}/education/create`, data);
    },

    updateEducation: async (userId: string, educationId: string, data: Partial<UserEducationCreateRequest>): Promise<UserEducation> => {
        return apiService.put<UserEducation>(`/api/user/${userId}/education/update/${educationId}`, data);
    },

    deleteEducation: async (userId: string, educationId: string): Promise<void> => {
        return apiService.delete<void>(`/api/user/${userId}/education/delete/${educationId}`);
    },

    // Certifications Management
    getCertifications: async (userId: string, params?: ListParams): Promise<PaginatedResponse<UserCertification>> => {
        return apiService.getPaginatedList<UserCertification>(`/api/user/${userId}/certifications`, params);
    },

    createCertification: async (userId: string, data: UserCertificationCreateRequest): Promise<UserCertification> => {
        return apiService.post<UserCertification>(`/api/user/${userId}/certifications/create`, data);
    },

    updateCertification: async (userId: string, certificationId: string, data: Partial<UserCertificationCreateRequest>): Promise<UserCertification> => {
        return apiService.put<UserCertification>(`/api/user/${userId}/certifications/update/${certificationId}`, data);
    },

    deleteCertification: async (userId: string, certificationId: string): Promise<void> => {
        return apiService.delete<void>(`/api/user/${userId}/certifications/delete/${certificationId}`);
    },
};

export default userExperienceService;