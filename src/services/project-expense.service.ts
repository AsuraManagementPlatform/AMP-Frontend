import {
    ListParams,
    PaginatedResponse,
    ProjectExpense,
    ProjectExpenseCreateRequest,
    ProjectExpenseUpdateRequest,
    ProjectExpenseExecuteRequest,
} from "@/types/index.types.ts";
import {apiService} from "@/services/api.service.ts";

export const projectExpenseService = {
    getList: async (params?: ListParams): Promise<PaginatedResponse<ProjectExpense>> => {
        return apiService.getPaginatedList<ProjectExpense>('project_expense/list', params);
    },

    getById: async (id: string): Promise<ProjectExpense> => {
        return apiService.get<ProjectExpense>(`project_expense/${id}`);
    },

    create: async (data: Partial<ProjectExpenseCreateRequest>): Promise<ProjectExpense> => {
        return apiService.post<ProjectExpense>('project_expense/create', data);
    },

    update: async (id: string, data: Partial<ProjectExpenseUpdateRequest>): Promise<ProjectExpense> => {
        return apiService.put<ProjectExpense>(`project_expense/update/${id}`, data);
    },

    execute: async (id: string, data: ProjectExpenseExecuteRequest): Promise<ProjectExpense> => {
        return apiService.put<ProjectExpense>(`project_expense/execute/${id}`, data);
    },

    cancel: async (id: string): Promise<ProjectExpense> => {
        return apiService.put<ProjectExpense>(`project_expense/cancel/${id}`, {});
    },

    delete: async (id: string): Promise<void> => {
        return apiService.delete<void>(`project_expense/delete/${id}`);
    },
};

export default projectExpenseService;