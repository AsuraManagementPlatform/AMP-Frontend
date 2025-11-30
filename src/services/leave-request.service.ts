import { apiService } from './api.service';
import {
    LeaveRequest,
    CreateLeaveRequestData,
    UpdateLeaveRequestData,
    LeaveRequestFilters
} from '@/types/leave-request.types';

interface ApproveRejectResponse {
    message: string;
    leaveRequest: LeaveRequest;
}

class LeaveRequestService {
    async getList(filters?: LeaveRequestFilters): Promise<LeaveRequest[]> {
        const params = new URLSearchParams();
        
        if (filters?.startDate) params.append('start_date', filters.startDate);
        if (filters?.endDate) params.append('end_date', filters.endDate);
        if (filters?.status) params.append('status', filters.status);

        const queryString = params.toString();
        const url = `leave-request/list${queryString ? `?${queryString}` : ''}`;
        
        const response = await apiService.get<{ userLeaveRequests: LeaveRequest[] }>(url);
        return response.userLeaveRequests || [];
    }

    async getById(id: string): Promise<LeaveRequest> {
        const response = await apiService.get<{ userLeaveRequest: LeaveRequest }>(`leave-request/${id}`);
        return response.userLeaveRequest;
    }

    async create(data: CreateLeaveRequestData): Promise<LeaveRequest> {
        const response = await apiService.post<{ userLeaveRequest: LeaveRequest }>('leave-request/create', data);
        return response.userLeaveRequest;
    }

    async update(data: UpdateLeaveRequestData): Promise<LeaveRequest> {
        const { id, ...updateData } = data;
        const response = await apiService.put<{ userLeaveRequest: LeaveRequest }>(`leave-request/update/${id}`, updateData);
        return response.userLeaveRequest;
    }

    async delete(id: string): Promise<void> {
        return await apiService.delete(`leave-request/delete/${id}`);
    }

    async approve(id: string, response?: string): Promise<ApproveRejectResponse> {
        return await apiService.post<ApproveRejectResponse>(`leave-request/${id}/approve`, { response });
    }

    async reject(id: string, response?: string): Promise<ApproveRejectResponse> {
        return await apiService.post<ApproveRejectResponse>(`leave-request/${id}/reject`, { response });
    }

    async getForCalendar(filters?: LeaveRequestFilters): Promise<LeaveRequest[]> {
        return await this.getList(filters);
    }
}

export default new LeaveRequestService();
