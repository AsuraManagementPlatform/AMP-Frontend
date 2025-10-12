import {ListParams, PaginatedResponse} from "@/types/index.types.ts";
import {
    ProjectExpense,
    ProjectIncome,
    ProjectExpenseCreateRequest,
    ProjectExpenseUpdateRequest,
    ProjectIncomeCreateRequest,
    ProjectIncomeUpdateRequest,
    FinancialSummary
} from "@/types/financial.types.ts";
import {apiService} from "@/services/api.service.ts";

export const financialService = {
    getExpenses: async (params?: ListParams): Promise<PaginatedResponse<ProjectExpense>> => {
        return apiService.getPaginatedList<ProjectExpense>('/api/expense/project/list', params);
    },

    getExpensesByProject: async (projectId: string, params?: ListParams): Promise<PaginatedResponse<ProjectExpense>> => {
        return apiService.getPaginatedList<ProjectExpense>('/api/expense/project/list', { ...params, filters: { ...params?.filters, project_id: projectId } });
    },

    getExpenseById: async (expenseId: string): Promise<ProjectExpense> => {
        return apiService.get<ProjectExpense>(`/api/expense/project/${expenseId}`);
    },

    createExpense: async (data: ProjectExpenseCreateRequest): Promise<ProjectExpense> => {
        return apiService.post<ProjectExpense>('/api/expense/project/create', data);
    },

    updateExpense: async (expenseId: string, data: ProjectExpenseUpdateRequest): Promise<ProjectExpense> => {
        return apiService.put<ProjectExpense>(`/api/expense/project/update/${expenseId}`, data);
    },

    deleteExpense: async (expenseId: string): Promise<void> => {
        return apiService.delete<void>(`/api/expense/project/delete/${expenseId}`);
    },

    getIncomes: async (params?: ListParams): Promise<PaginatedResponse<ProjectIncome>> => {
        return apiService.getPaginatedList<ProjectIncome>('/api/income/project/list', params);
    },

    getIncomesByProject: async (projectId: string, params?: ListParams): Promise<PaginatedResponse<ProjectIncome>> => {
        return apiService.getPaginatedList<ProjectIncome>('/api/income/project/list', { ...params, filters: { ...params?.filters, project_id: projectId } });
    },

    getIncomeById: async (incomeId: string): Promise<ProjectIncome> => {
        return apiService.get<ProjectIncome>(`/api/income/project/${incomeId}`);
    },

    createIncome: async (data: ProjectIncomeCreateRequest): Promise<ProjectIncome> => {
        return apiService.post<ProjectIncome>('/api/income/project/create', data);
    },

    updateIncome: async (incomeId: string, data: ProjectIncomeUpdateRequest): Promise<ProjectIncome> => {
        return apiService.put<ProjectIncome>(`/api/income/project/update/${incomeId}`, data);
    },

    deleteIncome: async (incomeId: string): Promise<void> => {
        return apiService.delete<void>(`/api/income/project/delete/${incomeId}`);
    },

    getFinancialSummary: async (projectId: string): Promise<FinancialSummary> => {
        return apiService.get<FinancialSummary>(`/api/financial/summary/project/${projectId}`);
    },

    getOrganizationFinancialSummary: async (organizationId: string): Promise<FinancialSummary[]> => {
        return apiService.get<FinancialSummary[]>(`/api/financial/summary/organization/${organizationId}`);
    },
};

export default financialService;