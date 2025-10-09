import {AppStatistics} from '@/types/app-statistics.types';
import {apiService} from "@/services/api.service.ts";

const appStatisticsService = {
    getStatistics: async (): Promise<AppStatistics> => {
        return apiService.get<AppStatistics>('app_statistics/retrieve');
    }
};

export default appStatisticsService;