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
    getList: async (params?: ListParams): Promise<PaginatedResponse<Entity>> => {
        return apiService.getPaginatedList<Entity>('entity/list', params);
    },

    getById: async (id: string): Promise<Entity> => {
        return apiService.get<Entity>(`entity/${id}`);
    },

    getByOrganization: async (organizationId: string, params?: ListParams): Promise<PaginatedResponse<Entity>> => {
        return apiService.getPaginatedList<Entity>(`entity/organization/${organizationId}`, params);
    },

    create: async (data: EntityCreateRequest): Promise<Entity> => {
        return apiService.post<Entity>('entity/create', data);
    },

    update: async (id: string, data: EntityUpdateRequest): Promise<Entity> => {
        return apiService.put<Entity>(`entity/update/${id}`, data);
    },

    delete: async (id: string): Promise<void> => {
        return apiService.delete<void>(`entity/delete/${id}`);
    },
    getContributions: async (entityId: string, params?: ListParams): Promise<PaginatedResponse<EntityContribution>> => {
        return apiService.getPaginatedList<EntityContribution>(`entity/${entityId}/contributions`, params);
    },

    createContribution: async (data: EntityContributionCreateRequest): Promise<EntityContribution> => {
        return apiService.post<EntityContribution>('entity/contribution/create', data);
    },

    updateContribution: async (contributionId: string, data: EntityContributionUpdateRequest): Promise<EntityContribution> => {
        return apiService.put<EntityContribution>(`entity/contribution/update/${contributionId}`, data);
    },

    deleteContribution: async (contributionId: string): Promise<void> => {
        return apiService.delete<void>(`entity/contribution/delete/${contributionId}`);
    },
    getRelationships: async (entityId: string, params?: ListParams): Promise<PaginatedResponse<EntityRelationship>> => {
        return apiService.getPaginatedList<EntityRelationship>(`entity/${entityId}/relationships`, params);
    },

    createRelationship: async (data: EntityRelationshipCreateRequest): Promise<EntityRelationship> => {
        return apiService.post<EntityRelationship>('entity/relationship/create', data);
    },

    updateRelationship: async (relationshipId: string, data: Partial<EntityRelationshipCreateRequest>): Promise<EntityRelationship> => {
        return apiService.put<EntityRelationship>(`entity/relationship/update/${relationshipId}`, data);
    },

    deleteRelationship: async (relationshipId: string): Promise<void> => {
        return apiService.delete<void>(`entity/relationship/delete/${relationshipId}`);
    },
    getEntityStats: async (organizationId?: string): Promise<EntityStats> => {
        const endpoint = organizationId ? `entity/stats/${organizationId}` : 'entity/stats';
        return apiService.get<EntityStats>(endpoint);
    },
    associateWithUser: async (entityId: string, userId: string): Promise<Entity> => {
        return apiService.post<Entity>(`entity/${entityId}/associate-user`, { userId });
    },
    dissociateFromUser: async (entityId: string): Promise<Entity> => {
        return apiService.post<Entity>(`entity/${entityId}/dissociate-user`, {});
    },
};

export default entityService;
