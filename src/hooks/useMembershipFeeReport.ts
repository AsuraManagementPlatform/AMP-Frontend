import { useState } from 'react';
import { 
  membershipFeeReportService, 
  type MembershipFeeReportData,
  type GenerateMembershipFeeReportRequest 
} from '../services/membershipFeeReport.service';
import { showToast } from '../components/ui/Toast';
import { useTranslation } from 'react-i18next';

export const useMembershipFeeReport = () => {
  const { t } = useTranslation();
  const [reportData, setReportData] = useState<MembershipFeeReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateReport = async (params: GenerateMembershipFeeReportRequest) => {
    setLoading(true);
    setError(null);

    try {
      const data = await membershipFeeReportService.generateReport(params);
      setReportData(data);
      return data;
    } catch (err: any) {
      const errorMessage = err?.message || 'toast.membership_fee.generate_error';
      const translatedMessage = errorMessage.includes('.') ? t(errorMessage) : errorMessage;
      setError(translatedMessage);
      showToast.error(translatedMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async (params: GenerateMembershipFeeReportRequest) => {
    try {
      const blob = await membershipFeeReportService.downloadPDF(params);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `raport_cotizatii_${params.startDate}_${params.endDate}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      showToast.success(t('toast.membership_fee.download_success'));
    } catch (err: any) {
      const errorMessage = err?.message || 'toast.membership_fee.download_error';
      const translatedMessage = errorMessage.includes('.') ? t(errorMessage) : errorMessage;
      showToast.error(translatedMessage);
      throw err;
    }
  };

  const downloadExcel = async (params: GenerateMembershipFeeReportRequest) => {
    try {
      const blob = await membershipFeeReportService.downloadExcel(params);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `raport_cotizatii_${params.startDate}_${params.endDate}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      showToast.success(t('toast.membership_fee.download_success'));
    } catch (err: any) {
      const errorMessage = err?.message || 'toast.membership_fee.download_error';
      const translatedMessage = errorMessage.includes('.') ? t(errorMessage) : errorMessage;
      showToast.error(translatedMessage);
      throw err;
    }
  };

  return {
    reportData,
    loading,
    error,
    generateReport,
    downloadPDF,
    downloadExcel,
  };
};
