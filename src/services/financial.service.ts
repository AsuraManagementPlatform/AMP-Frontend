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
    // Expense Management
    getExpenses: async (params?: ListParams): Promise<PaginatedResponse<ProjectExpense>> => {
        return apiService.getPaginatedList<ProjectExpense>('/api/expense/list', params);
    },

    getExpensesByProject: async (projectId: string, params?: ListParams): Promise<PaginatedResponse<ProjectExpense>> => {
        return apiService.getPaginatedList<ProjectExpense>(`/api/project/${projectId}/expenses`, params);
    },

    getExpenseById: async (expenseId: string): Promise<ProjectExpense> => {
        return apiService.get<ProjectExpense>(`/api/expense/${expenseId}`);
    },

    createExpense: async (data: ProjectExpenseCreateRequest): Promise<ProjectExpense> => {
        return apiService.post<ProjectExpense>('/api/expense/create', data);
    },

    updateExpense: async (expenseId: string, data: ProjectExpenseUpdateRequest): Promise<ProjectExpense> => {
        return apiService.put<ProjectExpense>(`/api/expense/update/${expenseId}`, data);
    },

    deleteExpense: async (expenseId: string): Promise<void> => {
        return apiService.delete<void>(`/api/expense/delete/${expenseId}`);
    },

    approveExpense: async (expenseId: string): Promise<ProjectExpense> => {
        return apiService.post<ProjectExpense>(`/api/expense/${expenseId}/approve`, {});
    },

    rejectExpense: async (expenseId: string, reason?: string): Promise<ProjectExpense> => {
        return apiService.post<ProjectExpense>(`/api/expense/${expenseId}/reject`, { reason });
    },

    markExpenseAsPaid: async (expenseId: string, paidDate?: string): Promise<ProjectExpense> => {
        return apiService.post<ProjectExpense>(`/api/expense/${expenseId}/mark-paid`, { paidDate });
    },

    // Income Management
    getIncomes: async (params?: ListParams): Promise<PaginatedResponse<ProjectIncome>> => {
        return apiService.getPaginatedList<ProjectIncome>('/api/income/list', params);
    },

    getIncomesByProject: async (projectId: string, params?: ListParams): Promise<PaginatedResponse<ProjectIncome>> => {
        return apiService.getPaginatedList<ProjectIncome>(`/api/project/${projectId}/incomes`, params);
    },

    getIncomeById: async (incomeId: string): Promise<ProjectIncome> => {
        return apiService.get<ProjectIncome>(`/api/income/${incomeId}`);
    },

    createIncome: async (data: ProjectIncomeCreateRequest): Promise<ProjectIncome> => {
        return apiService.post<ProjectIncome>('/api/income/create', data);
    },

    updateIncome: async (incomeId: string, data: ProjectIncomeUpdateRequest): Promise<ProjectIncome> => {
        return apiService.put<ProjectIncome>(`/api/income/update/${incomeId}`, data);
    },

    deleteIncome: async (incomeId: string): Promise<void> => {
        return apiService.delete<void>(`/api/income/delete/${incomeId}`);
    },

    markIncomeAsReceived: async (incomeId: string, receivedDate?: string): Promise<ProjectIncome> => {
        return apiService.post<ProjectIncome>(`/api/income/${incomeId}/mark-received`, { receivedDate });
    },

    // Financial Analytics
    getFinancialSummary: async (projectId: string): Promise<FinancialSummary> => {
        return apiService.get<FinancialSummary>(`/api/project/${projectId}/financial-summary`);
    },

    getOrganizationFinancialSummary: async (organizationId: string): Promise<FinancialSummary[]> => {
        return apiService.get<FinancialSummary[]>(`/api/organization/${organizationId}/financial-summary`);
    },

    // Reports
    generateExpenseReport: async (projectId: string, startDate?: string, endDate?: string): Promise<Blob> => {
        const params = new URLSearchParams();
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
        
        const url = `/api/project/${projectId}/expense-report${params.toString() ? '?' + params.toString() : ''}`;
        const response = await fetch(url);
        return response.blob();
    },

    generateIncomeReport: async (projectId: string, startDate?: string, endDate?: string): Promise<Blob> => {
        const params = new URLSearchParams();
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
        
        const url = `/api/project/${projectId}/income-report${params.toString() ? '?' + params.toString() : ''}`;
        const response = await fetch(url);
        return response.blob();
    },
};

export default financialService;