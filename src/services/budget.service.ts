import {ListParams, PaginatedResponse} from "@/types/index.types.ts";
import {
    ProjectBudget,
    BudgetProjectIncome,
    BudgetItem,
    ProjectBudgetCreateRequest,
    ProjectBudgetUpdateRequest,
    BudgetProjectIncomeCreateRequest,
    BudgetProjectIncomeUpdateRequest,
    BudgetSummary
} from "@/types/budget.types.ts";
import {apiService} from "@/services/api.service.ts";

export const budgetService = {
    // Project Budget Management
    getProjectBudget: async (projectId: string): Promise<ProjectBudget> => {
        return apiService.get<ProjectBudget>(`/api/project/${projectId}/budget`);
    },

    createProjectBudget: async (data: ProjectBudgetCreateRequest): Promise<ProjectBudget> => {
        return apiService.post<ProjectBudget>('/api/budget/create', data);
    },

    updateProjectBudget: async (projectId: string, data: ProjectBudgetUpdateRequest): Promise<ProjectBudget> => {
        return apiService.put<ProjectBudget>(`/api/project/${projectId}/budget/update`, data);
    },

    deleteProjectBudget: async (projectId: string): Promise<void> => {
        return apiService.delete<void>(`/api/project/${projectId}/budget/delete`);
    },

    // Budget Items Management
    getBudgetItems: async (projectId: string, params?: ListParams): Promise<PaginatedResponse<BudgetItem>> => {
        return apiService.getPaginatedList<BudgetItem>(`/api/project/${projectId}/budget/items`, params);
    },

    // Project Income Management
    getProjectIncomes: async (projectId: string, params?: ListParams): Promise<PaginatedResponse<BudgetProjectIncome>> => {
        return apiService.getPaginatedList<BudgetProjectIncome>(`/api/project/${projectId}/incomes`, params);
    },

    createProjectIncome: async (data: BudgetProjectIncomeCreateRequest): Promise<BudgetProjectIncome> => {
        return apiService.post<BudgetProjectIncome>('/api/project/income/create', data);
    },

    updateProjectIncome: async (incomeId: string, data: BudgetProjectIncomeUpdateRequest): Promise<BudgetProjectIncome> => {
        return apiService.put<BudgetProjectIncome>(`/api/project/income/update/${incomeId}`, data);
    },

    deleteProjectIncome: async (incomeId: string): Promise<void> => {
        return apiService.delete<void>(`/api/project/income/delete/${incomeId}`);
    },

    // Budget Summary and Analytics
    getBudgetSummary: async (projectId: string): Promise<BudgetSummary> => {
        return apiService.get<BudgetSummary>(`/api/project/${projectId}/budget/summary`);
    },

    approveBudget: async (projectId: string): Promise<ProjectBudget> => {
        return apiService.post<ProjectBudget>(`/api/project/${projectId}/budget/approve`, {});
    },
};

export default budgetService;