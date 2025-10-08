import {ListParams, PaginatedResponse} from "@/types/index.types.ts";
import {
    FinancialSummary,
    ProjectIncome,
    ProjectIncomeCreateRequest,
    ProjectIncomeUpdateRequest
} from "@/types/transaction.types.ts";
import {apiService} from "@/services/api.service.ts";

export const financialService = {
    getIncomes: async (params?: ListParams): Promise<PaginatedResponse<ProjectIncome>> => {
        return apiService.getPaginatedList<ProjectIncome>('income/project/list', params);
    },

    getIncomesByProject: async (projectId: string, params?: ListParams): Promise<PaginatedResponse<ProjectIncome>> => {
        return apiService.getPaginatedList<ProjectIncome>('income/project/list', { ...params, filters: { ...params?.filters, project_id: projectId } });
    },

    getIncomeById: async (incomeId: string): Promise<ProjectIncome> => {
        return apiService.get<ProjectIncome>(`income/project/${incomeId}`);
    },

    createIncome: async (data: ProjectIncomeCreateRequest): Promise<ProjectIncome> => {
        return apiService.post<ProjectIncome>('income/project/create', data);
    },

    updateIncome: async (incomeId: string, data: ProjectIncomeUpdateRequest): Promise<ProjectIncome> => {
        return apiService.put<ProjectIncome>(`income/project/update/${incomeId}`, data);
    },

    deleteIncome: async (incomeId: string): Promise<void> => {
        return apiService.delete<void>(`income/project/delete/${incomeId}`);
    },

    getFinancialSummary: async (projectId: string): Promise<FinancialSummary> => {
        return apiService.get<FinancialSummary>(`financial/summary/project/${projectId}`);
    },

    getOrganizationFinancialSummary: async (organizationId: string): Promise<FinancialSummary[]> => {
        return apiService.get<FinancialSummary[]>(`financial/summary/organization/${organizationId}`);
    },
};

export default financialService;