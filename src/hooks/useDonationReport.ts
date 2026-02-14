import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import showToast from '@/components/ui/Toast';
import { donationReportService, DonationReportData, GenerateDonationReportRequest } from '@/services/donationReport.service.ts';

export const useDonationReport = () => {
  const { t } = useTranslation();
  const [reportData, setReportData] = useState<DonationReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);

  const generateReport = async (request: GenerateDonationReportRequest) => {
    setLoading(true);
    setReportGenerated(false);

    try {
      const data = await donationReportService.generateReport(request);
      setReportData(data);
      setReportGenerated(true);
    } catch (error: any) {
      const message = error?.message || t('toast.donation_report.download_error');
      const translatedMessage = message.includes('.') ? t(message) : message;
      showToast.error(translatedMessage);
    } finally {
      setLoading(false);
    }
  };

  const downloadExcel = async (request: GenerateDonationReportRequest, organizationName: string) => {
    try {
      const blob = await donationReportService.downloadExcel(request.yearFrom, request.yearTo);
      
      if (!(blob instanceof Blob) || blob.size === 0) {
        showToast.error(t('toast.donation_report.download_error'));
        return;
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Raport_Donatii_${organizationName.replace(/\s/g, '_')}_${request.yearFrom}-${request.yearTo}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      showToast.success(t('toast.donation_report.download_excel_success'));
    } catch (error: any) {
      const message = error?.message || t('toast.donation_report.download_error');
      const translatedMessage = message.includes('.') ? t(message) : message;
      showToast.error(translatedMessage);
    }
  };

  const downloadPDF = async (request: GenerateDonationReportRequest, organizationName: string) => {
    try {
      const blob = await donationReportService.downloadPDF(request.yearFrom, request.yearTo);
      
      if (!(blob instanceof Blob) || blob.size === 0) {
        showToast.error(t('toast.donation_report.download_error'));
        return;
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Raport_Donatii_${organizationName.replace(/\s/g, '_')}_${request.yearFrom}-${request.yearTo}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      showToast.success(t('toast.donation_report.download_pdf_success'));
    } catch (error: any) {
      const message = error?.message || t('toast.donation_report.download_error');
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
