import { RenewPeriod } from '@/types/membershipFee.types';

/**
 * Calculate end date based on start date and renew period
 */
export const calculateEndDate = (startDate: string, renewPeriod: RenewPeriod): string => {
    const start = new Date(startDate);
    let end = new Date(start);

    switch (renewPeriod) {
        case RenewPeriod.MONTHLY:
            end.setMonth(end.getMonth() + 1);
            break;
        case RenewPeriod.QUARTERLY:
            end.setMonth(end.getMonth() + 3);
            break;
        case RenewPeriod.SEMI_ANNUAL:
            end.setMonth(end.getMonth() + 6);
            break;
        case RenewPeriod.ANNUAL:
            end.setFullYear(end.getFullYear() + 1);
            break;
        case RenewPeriod.ONE_TIME:
            end.setFullYear(end.getFullYear() + 1);
            break;
        default:
            end.setFullYear(end.getFullYear() + 1);
    }

    end.setDate(end.getDate() - 1);

    return end.toISOString().split('T')[0];
};

/**
 * Get period label in Romanian
 */
export const getPeriodLabel = (period: RenewPeriod): string => {
    const labels: Record<RenewPeriod, string> = {
        [RenewPeriod.MONTHLY]: 'Lunar',
        [RenewPeriod.QUARTERLY]: 'Trimestrial',
        [RenewPeriod.SEMI_ANNUAL]: 'Semestrial',
        [RenewPeriod.ANNUAL]: 'Anual',
        [RenewPeriod.ONE_TIME]: 'O singură dată'
    };
    return labels[period] || period;
};

/**
 * Calculate days between two dates
 */
export const calculateDaysBetween = (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};
