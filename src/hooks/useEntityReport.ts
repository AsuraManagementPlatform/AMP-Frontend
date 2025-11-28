import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import showToast from '@/components/ui/Toast';
import { entityReportService, EntityReportData } from '@/services/entityReport.service';

export const useEntityReport = () => {
  const { t } = useTranslation();
  const [reportData, setReportData] = useState<EntityReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    setReportGenerated(false);

    try {
      const data = await entityReportService.generateReport();
      setReportData(data);
      setReportGenerated(true);
    } catch (error: any) {
      const message = error?.message || 'toast.entity_report.generate_error';
      const translatedMessage = message.includes('.') ? t(message) : message;
      showToast.error(translatedMessage);
    } finally {
      setLoading(false);
    }
  };

  const downloadExcel = async (organizationName: string) => {
    try {
      const blob = await entityReportService.downloadExcel();
      
      if (!(blob instanceof Blob) || blob.size === 0) {
        showToast.error(t('toast.entity_report.download_error'));
        return;
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Raport_Entitati_${organizationName.replace(/\s/g, '_')}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      showToast.success(t('toast.entity_report.download_excel_success'));
    } catch (error: any) {
      const message = error?.message || 'toast.entity_report.download_error';
      const translatedMessage = message.includes('.') ? t(message) : message;
      showToast.error(translatedMessage);
    }
  };

  const downloadPDF = async (organizationName: string) => {
    try {
      const blob = await entityReportService.downloadPDF();
      
      if (!(blob instanceof Blob) || blob.size === 0) {
        showToast.error(t('toast.entity_report.download_error'));
        return;
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Raport_Entitati_${organizationName.replace(/\s/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      showToast.success(t('toast.entity_report.download_pdf_success'));
    } catch (error: any) {
      const message = error?.message || 'toast.entity_report.download_error';
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
    downloadPDF,
  };
};
