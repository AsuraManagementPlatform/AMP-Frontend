import {
    ListParams,
    PaginatedResponse,
    ProjectFund,
    ProjectFundCreateRequest,
    ProjectFundPayRequest,
    ProjectFundUpdateRequest,
    AvailableFundsResponse
} from "@/types/index.types.ts";
import {apiService} from "@/services/api.service.ts";

export const projectFundService = {
    getList: async (params?: ListParams): Promise<PaginatedResponse<ProjectFund>> => {
        return apiService.getPaginatedList<ProjectFund>('project_fund/list', params);
    },

    getById: async (id: string): Promise<ProjectFund> => {
        return apiService.get<ProjectFund>(`project_fund/${id}`);
    },

    getAvailableForExpense: async (expenseId: string): Promise<AvailableFundsResponse> => {
        return apiService.get<AvailableFundsResponse>(`project_fund/available_for_expense/${expenseId}`);
    },

    create: async (data: ProjectFundCreateRequest): Promise<ProjectFund> => {
        return apiService.post<ProjectFund>('project_fund/create', data);
    },

    update: async (id: string, data: ProjectFundUpdateRequest): Promise<ProjectFund> => {
        return apiService.put<ProjectFund>(`project_fund/update/${id}`, data);
    },

    pay: async (data: ProjectFundPayRequest): Promise<ProjectFund> => {
        return apiService.put<ProjectFund>(`project_fund/pay/${data.id}`, data);
    },

    cancel: async (id: string): Promise<ProjectFund> => {
        return apiService.put<ProjectFund>(`project_fund/cancel/${id}`, {});
    },

    delete: async (id: string): Promise<void> => {
        return apiService.delete<void>(`project_fund/delete/${id}`);
    },
};

export default projectFundService;