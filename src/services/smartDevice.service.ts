import { apiService } from '@/services/api.service';
import { SmartDevice, SmartDeviceAction } from '@/types/smart-device.types';

const smartDeviceService = {
    getList: (): Promise<SmartDevice[]> => {
        return apiService.get<SmartDevice[]>('smart-device/');
    },

    control: (id: string, action: SmartDeviceAction): Promise<{ action: SmartDeviceAction; scheduleCleared: boolean }> => {
        return apiService.post(`smart-device/${id}/control`, { action });
    },

    setSchedule: (id: string, data: { onTime: string; offTime: string; days: string[]; inverted?: boolean }): Promise<void> => {
        return apiService.put(`smart-device/${id}/schedule`, data);
    },

    deleteSchedule: (id: string): Promise<void> => {
        return apiService.delete(`smart-device/${id}/schedule`);
    },
};

export default smartDeviceService;
