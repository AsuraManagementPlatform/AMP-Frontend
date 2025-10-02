import {
    ProjectBudget,
    ProjectBudgetCreateRequest,
    ProjectBudgetUpdateRequest,
    BudgetSummary
} from "@/types/budget.types.ts";
import {apiService} from "@/services/api.service.ts";

export const budgetService = {
    getProjectBudget: async (projectId: string): Promise<ProjectBudget> => {
        return apiService.get<ProjectBudget>(`/api/budget/project/${projectId}`);
    },

    createProjectBudget: async (data: ProjectBudgetCreateRequest): Promise<ProjectBudget> => {
        return apiService.post<ProjectBudget>('/api/budget/project', data);
    },

    updateProjectBudget: async (projectId: string, data: ProjectBudgetUpdateRequest): Promise<ProjectBudget> => {
        return apiService.put<ProjectBudget>(`/api/budget/project/${projectId}/update`, data);
    },

    getBudgetSummary: async (projectId?: string): Promise<BudgetSummary> => {
        const endpoint = projectId ? `/api/budget/summary?project_id=${projectId}` : '/api/budget/summary';
        return apiService.get<BudgetSummary>(endpoint);
    },
};

export default budgetService;