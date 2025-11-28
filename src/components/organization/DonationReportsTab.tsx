import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useDonationReport } from '@/hooks/useDonationReport.ts';
import showToast from '@/components/ui/Toast';

interface DonationReportsTabProps {
  organizationId: string;
  organizationName: string;
}

export const DonationReportsTab: React.FC<DonationReportsTabProps> = ({
  organizationName
}) => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  
  const [yearFrom, setYearFrom] = useState<number>(currentYear);
  const [yearTo, setYearTo] = useState<number>(currentYear);
  
  const { reportData, loading, reportGenerated, generateReport, downloadExcel, downloadPDF } = useDonationReport();

  console.log('DEBUG DonationReportsTab - reportGenerated:', reportGenerated);
  console.log('DEBUG DonationReportsTab - reportData:', reportData);
  console.log('DEBUG DonationReportsTab - loading:', loading);

  const handleGenerateReport = async () => {
    if (yearFrom > yearTo) {
      showToast.error(t('toast.donation_report.invalid_years'));
      return;
    }

    await generateReport({ yearFrom, yearTo });
  };

  const handleDownloadExcel = async () => {
    await downloadExcel({ yearFrom, yearTo }, organizationName);
  };

  const handleDownloadPDF = async () => {
    await downloadPDF({ yearFrom, yearTo }, organizationName);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ro-RO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('ro-RO');
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t('label.reports.donation_report_title')}
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            {t('label.reports.donation_report_description')}
          </p>
          
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('label.reports.year_from')}
              </label>
              <input
                type="number"
                min="2020"
                max={currentYear + 5}
                value={yearFrom}
                onChange={(e) => setYearFrom(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('label.reports.year_to')}
              </label>
              <input
                type="number"
                min="2020"
                max={currentYear + 5}
                value={yearTo}
                onChange={(e) => setYearTo(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <Button
              onClick={handleGenerateReport}
              disabled={loading || yearFrom > yearTo}
              variant="primary"
            >
              {loading ? t('label.reports.downloading') : t('label.reports.generate_report')}
            </Button>
          </div>
          
          {yearFrom > yearTo && (
            <p className="mt-3 text-sm text-red-600">
              {t('label.reports.invalid_year_range')}
            </p>
          )}

          {reportGenerated && reportData && (
            <div className="flex gap-3 mt-4">
              <Button
                onClick={handleDownloadExcel}
                variant="outline"
                className="border-green-600 text-green-600 hover:bg-green-600"
              >
                {t('label.reports.download_excel')}
              </Button>
              
              <Button
                onClick={handleDownloadPDF}
                variant="danger"
              >
                {t('label.reports.download_pdf')}
              </Button>
            </div>
          )}
        </div>
      </Card>

      {reportGenerated && reportData && (
        <>
          {reportData.summary.totalDonations === 0 ? (
            <Card>
              <div className="p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('label.reports.donations.no_data')}
                </h3>
                <p className="text-sm text-gray-500">
                  Nu există donații înregistrate în perioada {yearFrom} - {yearTo}
                </p>
              </div>
            </Card>
          ) : (
          <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <div className="p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  {t('label.reports.donations.total_donations')}
                </h3>
                <p className="text-3xl font-bold text-blue-600">
                  {reportData.summary.totalDonations}
                </p>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  {t('label.reports.donations.total_amount')}
                </h3>
                <p className="text-3xl font-bold text-green-600">
                  {formatCurrency(reportData.summary.totalAmount)} LEI
                </p>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  {t('label.reports.donations.unique_entities')}
                </h3>
                <p className="text-3xl font-bold text-purple-600">
                  {reportData.summary.uniqueEntities}
                </p>
              </div>
            </Card>
          </div>

          <Card>
            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold">
                  {t('label.reports.donations.top_donors')}
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('label.reports.donations.entity_name')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('label.reports.donations.entity_type')}
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('label.reports.donations.donations_count')}
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('label.reports.donations.total_amount')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('label.reports.donations.last_donation')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.donationsByEntity.length > 0 ? (
                      reportData.donationsByEntity.map((donor: any, index: number) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {donor.entityName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {donor.entityType}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                            {donor.totalDonations}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                            {formatCurrency(donor.totalAmount)} LEI
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(donor.lastDonationDate)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                          {t('label.reports.donations.no_data')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
          </>
          )}
        </>
      )}
    </div>
  );
};

