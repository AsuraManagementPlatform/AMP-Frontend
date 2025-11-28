import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import showToast from '@/components/ui/Toast';
import { projectReportService, ProjectReportData, GenerateProjectReportRequest } from '@/services/projectReport.service';

export const useProjectReport = () => {
  const { t } = useTranslation();
  const [reportData, setReportData] = useState<ProjectReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);

  const generateReport = async (request: GenerateProjectReportRequest) => {
    setLoading(true);
    setReportGenerated(false);

    try {
      const data = await projectReportService.generateReport(request);
      setReportData(data);
      setReportGenerated(true);
    } catch (error: any) {
      const message = error?.message || t('toast.report.generate_error');
      const translatedMessage = message.includes('.') ? t(message) : message;
      showToast.error(translatedMessage);
    } finally {
      setLoading(false);
    }
  };

  const downloadExcel = async (request: GenerateProjectReportRequest, organizationName: string) => {
    try {
      const blob = await projectReportService.downloadExcel(request);
      
      if (!(blob instanceof Blob)) {
        console.error('Response is not a Blob:', blob);
        showToast.error('Format răspuns invalid');
        return;
      }
      
      if (blob.size === 0) {
        console.error('Blob size is 0');
        showToast.error('Fișier gol primit de la server');
        return;
      }
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Raport_Proiecte_${organizationName.replace(/\s/g, '_')}_${request.yearFrom}-${request.yearTo}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      showToast.success(t('toast.report.download_excel_success'));
    } catch (error: any) {
      console.error('Download Excel error:', error);
      const message = error?.message || t('toast.report.download_error');
      const translatedMessage = message.includes('.') ? t(message) : message;
      showToast.error(translatedMessage);
    }
  };

  const downloadPDF = async (request: GenerateProjectReportRequest, organizationName: string) => {
    try {
      const blob = await projectReportService.downloadPDF(request);
      
      if (!(blob instanceof Blob)) {
        console.error('Response is not a Blob:', blob);
        showToast.error('Format răspuns invalid');
        return;
      }
      
      if (blob.size === 0) {
        console.error('Blob size is 0');
        showToast.error('Fișier gol primit de la server');
        return;
      }
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Raport_Proiecte_${organizationName.replace(/\s/g, '_')}_${request.yearFrom}-${request.yearTo}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      showToast.success(t('toast.report.download_pdf_success'));
    } catch (error: any) {
      console.error('Download PDF error:', error);
      const message = error?.message || t('toast.report.download_error');
      const translatedMessage = message.includes('.') ? t(message) : message;
      showToast.error(translatedMessage);
    }
  };

  return {
    reportData,
    loading,
    reportGenerated,
    generateReport,
    downloadExcel,
    downloadPDF
  };
};
