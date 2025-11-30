export type LeaveRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export const LeaveRequestStatusOptions: { value: LeaveRequestStatus; label: string; color: string }[] = [
    { value: 'PENDING', label: 'label.leave_request.status_pending', color: 'yellow' },
    { value: 'APPROVED', label: 'label.leave_request.status_approved', color: 'green' },
    { value: 'REJECTED', label: 'label.leave_request.status_rejected', color: 'red' },
    { value: 'CANCELLED', label: 'label.leave_request.status_cancelled', color: 'gray' }
];

export interface LeaveRequest {
    id: string;
    userId: string;
    userName?: string;
    date: string;
    endDate?: string;
    status: LeaveRequestStatus;
    aprovalDate?: string;
    approvedBy?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateLeaveRequestData {
    vacation_number: number;
    date: string;
    end_date?: string;
    notes?: string;
}

export interface UpdateLeaveRequestData extends Partial<CreateLeaveRequestData> {
    id: string;
    status?: LeaveRequestStatus;
}

export interface LeaveRequestFilters {
    startDate?: string;
    endDate?: string;
    status?: LeaveRequestStatus;
}
