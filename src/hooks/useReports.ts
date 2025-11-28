import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { 
  FinancialReport, 
  ProgressReport, 
  ReportGenerateParams 
} from '@/types/report.types';
import { reportService } from '@/services/report.service';

export const useFinancialReport = (
  params: ReportGenerateParams,
  enabled: boolean = true
): UseQueryResult<FinancialReport, Error> => {
  return useQuery({
    queryKey: ['financialReport', params.projectId, params.startDate, params.endDate],
    queryFn: () => reportService.generateFinancialReport(params),
    enabled: enabled && !!params.projectId,
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
  });
};

export const useProgressReport = (
  params: ReportGenerateParams,
  enabled: boolean = true
): UseQueryResult<ProgressReport, Error> => {
  return useQuery({
    queryKey: ['progressReport', params.projectId, params.startDate, params.endDate],
    queryFn: () => reportService.generateProgressReport(params),
    enabled: enabled && !!params.projectId,
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
  });
};
