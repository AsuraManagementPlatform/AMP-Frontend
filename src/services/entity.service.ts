import {ListParams, PaginatedResponse} from "@/types/index.types.ts";
import {Entity, EntityCreateRequest, EntityUpdateRequest} from "@/types/entity.types.ts";
import {apiService} from "@/services/api.service.ts";

export const entityService = {
    getList: async (params?: ListParams): Promise<PaginatedResponse<Entity>> => {
        return apiService.getPaginatedList<Entity>('entity/list', params);
    },

    getById: async (id: string): Promise<Entity> => {
        return apiService.get<Entity>(`entity/${id}`);
    },

    create: async (data: EntityCreateRequest): Promise<Entity> => {
        return apiService.post<Entity>('entity/create', data);
    },

    update: async (data: EntityUpdateRequest): Promise<Entity> => {
        return apiService.put<Entity>(`entity/update/${data.id}`, data);
    },

    delete: async (id: string): Promise<void> => {
        return apiService.delete<void>(`entity/delete/${id}`);
    },
};

export default entityService;
