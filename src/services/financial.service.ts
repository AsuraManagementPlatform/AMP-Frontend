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
        return apiService.getPaginatedList<ProjectExpense>('expense/project/list', params);
    },

    getExpensesByProject: async (projectId: string, params?: ListParams): Promise<PaginatedResponse<ProjectExpense>> => {
        return apiService.getPaginatedList<ProjectExpense>('expense/project/list', { ...params, filters: { ...params?.filters, project_id: projectId } });
    },

    getExpenseById: async (expenseId: string): Promise<ProjectExpense> => {
        return apiService.get<ProjectExpense>(`expense/project/${expenseId}`);
    },

    createExpense: async (data: ProjectExpenseCreateRequest): Promise<ProjectExpense> => {
        return apiService.post<ProjectExpense>('expense/project/create', data);
    },

    updateExpense: async (expenseId: string, data: ProjectExpenseUpdateRequest): Promise<ProjectExpense> => {
        return apiService.put<ProjectExpense>(`expense/project/update/${expenseId}`, data);
    },

    deleteExpense: async (expenseId: string): Promise<void> => {
        return apiService.delete<void>(`expense/project/delete/${expenseId}`);
    },

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