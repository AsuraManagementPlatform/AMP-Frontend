import {ListParams, PaginatedResponse} from "@/types/index.types.ts";
import {
    Entity,
    EntityContribution,
    EntityRelationship,
    EntityCreateRequest,
    EntityUpdateRequest,
    EntityContributionCreateRequest,
    EntityContributionUpdateRequest,
    EntityRelationshipCreateRequest,
    EntityStats
} from "@/types/entity.types.ts";
import {apiService} from "@/services/api.service.ts";

export const entityService = {
    // Entity Management
    getList: async (params?: ListParams): Promise<PaginatedResponse<Entity>> => {
        return apiService.getPaginatedList<Entity>('/api/entity/list', params);
    },

    getById: async (id: string): Promise<Entity> => {
        return apiService.get<Entity>(`/api/entity/${id}`);
    },

    getByOrganization: async (organizationId: string, params?: ListParams): Promise<PaginatedResponse<Entity>> => {
        return apiService.getPaginatedList<Entity>(`/api/entity/organization/${organizationId}`, params);
    },

    create: async (data: EntityCreateRequest): Promise<Entity> => {
        return apiService.post<Entity>('/api/entity/create', data);
    },

    update: async (id: string, data: EntityUpdateRequest): Promise<Entity> => {
        return apiService.put<Entity>(`/api/entity/update/${id}`, data);
    },

    delete: async (id: string): Promise<void> => {
        return apiService.delete<void>(`/api/entity/delete/${id}`);
    },

    // Entity Contributions Management
    getContributions: async (entityId: string, params?: ListParams): Promise<PaginatedResponse<EntityContribution>> => {
        return apiService.getPaginatedList<EntityContribution>(`/api/entity/${entityId}/contributions`, params);
    },

    createContribution: async (data: EntityContributionCreateRequest): Promise<EntityContribution> => {
        return apiService.post<EntityContribution>('/api/entity/contribution/create', data);
    },

    updateContribution: async (contributionId: string, data: EntityContributionUpdateRequest): Promise<EntityContribution> => {
        return apiService.put<EntityContribution>(`/api/entity/contribution/update/${contributionId}`, data);
    },

    deleteContribution: async (contributionId: string): Promise<void> => {
        return apiService.delete<void>(`/api/entity/contribution/delete/${contributionId}`);
    },

    // Entity Relationships Management
    getRelationships: async (entityId: string, params?: ListParams): Promise<PaginatedResponse<EntityRelationship>> => {
        return apiService.getPaginatedList<EntityRelationship>(`/api/entity/${entityId}/relationships`, params);
    },

    createRelationship: async (data: EntityRelationshipCreateRequest): Promise<EntityRelationship> => {
        return apiService.post<EntityRelationship>('/api/entity/relationship/create', data);
    },

    updateRelationship: async (relationshipId: string, data: Partial<EntityRelationshipCreateRequest>): Promise<EntityRelationship> => {
        return apiService.put<EntityRelationship>(`/api/entity/relationship/update/${relationshipId}`, data);
    },

    deleteRelationship: async (relationshipId: string): Promise<void> => {
        return apiService.delete<void>(`/api/entity/relationship/delete/${relationshipId}`);
    },

    // Entity Statistics
    getEntityStats: async (organizationId?: string): Promise<EntityStats> => {
        const endpoint = organizationId ? `/api/entity/stats/${organizationId}` : '/api/entity/stats';
        return apiService.get<EntityStats>(endpoint);
    },

    // Associate entity with user account
    associateWithUser: async (entityId: string, userId: string): Promise<Entity> => {
        return apiService.post<Entity>(`/api/entity/${entityId}/associate-user`, { userId });
    },

    // Dissociate entity from user account
    dissociateFromUser: async (entityId: string): Promise<Entity> => {
        return apiService.post<Entity>(`/api/entity/${entityId}/dissociate-user`, {});
    },
};

export default entityService;