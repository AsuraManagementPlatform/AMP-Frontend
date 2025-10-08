import {ListParams, PaginatedResponse, ProjectExpense} from "@/types/index.types.ts";
import {apiService} from "@/services/api.service.ts";

export const projectExpenseService = {
    getList: async (params?: ListParams): Promise<PaginatedResponse<ProjectExpense>> => {
        return apiService.getPaginatedList<ProjectExpense>('project_expense/list', params);
    },

    getById: async (id: string): Promise<ProjectExpense> => {
        return apiService.get<ProjectExpense>(`project_expense/${id}`);
    },

    create: async (data: Partial<ProjectExpense>): Promise<ProjectExpense> => {
        return apiService.post<ProjectExpense>('project_expense/create', data);
    },

    update: async (id: string, data: Partial<ProjectExpense>): Promise<ProjectExpense> => {
        return apiService.put<ProjectExpense>(`project_expense/update/${id}`, data);
    },

    delete: async (id: string): Promise<void> => {
        return apiService.delete<void>(`project_expense/delete/${id}`);
    },
};

export default projectExpenseService;