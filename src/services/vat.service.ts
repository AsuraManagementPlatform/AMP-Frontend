import {ListParams, PaginatedResponse, Vat, VatCreateRequest, VatUpdateRequest} from "@/types/index.types.ts";
import {apiService} from "@/services/api.service.ts";

export const vatService = {
    getList: async (params?: ListParams): Promise<PaginatedResponse<Vat>> => {
        return apiService.getPaginatedList<Vat>('vat/list', params);
    },

    getById: async (id: string): Promise<Vat> => {
        return apiService.get<Vat>(`vat/${id}`);
    },

    create: async (data: Partial<VatCreateRequest>): Promise<Vat> => {
        return apiService.post<Vat>('vat/create', data);
    },

    update: async (data: Partial<VatUpdateRequest>): Promise<Vat> => {
        return apiService.put<Vat>(`vat/update/${data.id}`, data);
    },

    delete: async (id: string): Promise<void> => {
        return apiService.delete<void>(`vat/delete/${id}`);
    },
}

export default vatService;