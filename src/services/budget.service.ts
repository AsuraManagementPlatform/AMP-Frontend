import {
    ProjectBudget,
    ProjectBudgetCreateRequest,
    ProjectBudgetUpdateRequest,
    BudgetSummary
} from "@/types/budget.types.ts";
import {apiService} from "@/services/api.service.ts";

export const budgetService = {
    getProjectBudget: async (projectId: string): Promise<ProjectBudget> => {
        return apiService.get<ProjectBudget>(`budget/project/${projectId}`);
    },

    createProjectBudget: async (data: ProjectBudgetCreateRequest): Promise<ProjectBudget> => {
        return apiService.post<ProjectBudget>('budget/project', data);
    },

    updateProjectBudget: async (projectId: string, data: ProjectBudgetUpdateRequest): Promise<ProjectBudget> => {
        return apiService.put<ProjectBudget>(`budget/project/${projectId}/update`, data);
    },

    getBudgetSummary: async (projectId?: string): Promise<BudgetSummary> => {
        const endpoint = projectId ? `budget/summary?project_id=${projectId}` : 'budget/summary';
        return apiService.get<BudgetSummary>(endpoint);
    },
};

export default budgetService;