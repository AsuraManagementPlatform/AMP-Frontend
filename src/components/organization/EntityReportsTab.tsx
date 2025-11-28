import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useEntityReport } from '@/hooks/useEntityReport';

interface EntityReportsTabProps {
  organizationId: string;
  organizationName: string;
}

export const EntityReportsTab: React.FC<EntityReportsTabProps> = ({
  organizationName
}) => {
  const { t } = useTranslation();
  
  const { reportData, loading, reportGenerated, generateReport, downloadExcel, downloadPDF } = useEntityReport();

  useEffect(() => {
    generateReport();
  }, []);

  const handleDownloadExcel = async () => {
    await downloadExcel(organizationName);
  };

  const handleDownloadPDF = async () => {
    await downloadPDF(organizationName);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ro-RO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {t('label.reports.entity_report_title')}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {t('label.reports.entity_report_description')}
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleDownloadExcel}
                disabled={loading || !reportGenerated}
                variant="outline"
                className="border-green-600 text-green-600 hover:bg-green-50"
              >
                {t('label.reports.download_excel')}
              </Button>
              <Button
                onClick={handleDownloadPDF}
                disabled={loading || !reportGenerated}
                variant="outline"
                className="border-red-600 text-red-600 hover:bg-red-50"
              >
                {t('label.reports.download_pdf')}
              </Button>
            </div>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">{t('label.loading')}</span>
            </div>
          )}

          {reportGenerated && reportData && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-700">
                    {reportData.summary.totalEntities}
                  </div>
                  <div className="text-sm text-blue-600">{t('label.entity_report.total_entities')}</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-700">
                    {reportData.summary.activeEntities}
                  </div>
                  <div className="text-sm text-green-600">{t('label.entity_report.active_entities')}</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-700">
                    {reportData.summary.entitiesWithProjects}
                  </div>
                  <div className="text-sm text-purple-600">{t('label.entity_report.with_projects')}</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-orange-700">
                    {formatCurrency(reportData.summary.totalDonationsAmount)} RON
                  </div>
                  <div className="text-sm text-orange-600">{t('label.entity_report.total_donations')}</div>
                </div>
              </div>

              {/* Entity Type Distribution */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-md font-semibold text-gray-800 mb-3">
                    {t('label.entity_report.by_type')}
                  </h4>
                  <div className="bg-white border rounded-lg overflow-hidden">
                    <table className="min-w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            {t('label.entity_report.type')}
                          </th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                            {t('label.entity_report.count')}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {reportData.entitiesByType.map((item, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-2 text-sm text-gray-900">{item.type}</td>
                            <td className="px-4 py-2 text-sm text-gray-900 text-right">{item.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-semibold text-gray-800 mb-3">
                    {t('label.entity_report.by_status')}
                  </h4>
                  <div className="bg-white border rounded-lg overflow-hidden">
                    <table className="min-w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            {t('label.entity_report.status')}
                          </th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                            {t('label.entity_report.count')}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {reportData.entitiesByStatus.map((item, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-2 text-sm text-gray-900">{item.status}</td>
                            <td className="px-4 py-2 text-sm text-gray-900 text-right">{item.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Entities with Projects */}
              {reportData.entitiesWithProjects.length > 0 && (
                <div>
                  <h4 className="text-md font-semibold text-gray-800 mb-3">
                    {t('label.entity_report.entities_with_projects')}
                  </h4>
                  <div className="bg-white border rounded-lg overflow-hidden">
                    <table className="min-w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            {t('label.entity_report.entity_name')}
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            {t('label.entity_report.legal_type')}
                          </th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                            {t('label.entity_report.projects_count')}
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            {t('label.entity_report.projects')}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {reportData.entitiesWithProjects.slice(0, 10).map((item, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-2 text-sm text-gray-900 font-medium">{item.entityName}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{item.legalType}</td>
                            <td className="px-4 py-2 text-sm text-gray-900 text-center">{item.projectsCount}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">
                              {item.projects.slice(0, 3).map(p => p.projectName).join(', ')}
                              {item.projects.length > 3 && ` (+${item.projects.length - 3})`}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {reportData.entitiesWithProjects.length > 10 && (
                      <div className="px-4 py-2 text-sm text-gray-500 bg-gray-50 text-center">
                        {t('label.entity_report.and_more', { count: reportData.entitiesWithProjects.length - 10 })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Entities with Donations */}
              {reportData.entitiesWithDonations.length > 0 && (
                <div>
                  <h4 className="text-md font-semibold text-gray-800 mb-3">
                    {t('label.entity_report.entities_with_donations')}
                  </h4>
                  <div className="bg-white border rounded-lg overflow-hidden">
                    <table className="min-w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            {t('label.entity_report.entity_name')}
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            {t('label.entity_report.legal_type')}
                          </th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                            {t('label.entity_report.donations_count')}
                          </th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                            {t('label.entity_report.total_amount')}
                          </th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                            {t('label.entity_report.confirmed_amount')}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {reportData.entitiesWithDonations.slice(0, 10).map((item, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-2 text-sm text-gray-900 font-medium">{item.entityName}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{item.legalType}</td>
                            <td className="px-4 py-2 text-sm text-gray-900 text-center">{item.donationsCount}</td>
                            <td className="px-4 py-2 text-sm text-gray-900 text-right">{formatCurrency(item.totalAmount)}</td>
                            <td className="px-4 py-2 text-sm text-green-600 text-right">{formatCurrency(item.confirmedAmount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {reportData.entitiesWithDonations.length > 10 && (
                      <div className="px-4 py-2 text-sm text-gray-500 bg-gray-50 text-center">
                        {t('label.entity_report.and_more', { count: reportData.entitiesWithDonations.length - 10 })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Quick Stats */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-md font-semibold text-gray-800 mb-3">
                  {t('label.entity_report.engagement_summary')}
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">{t('label.entity_report.juridical')}: </span>
                    <span className="font-medium">{reportData.summary.juridicalEntities}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">{t('label.entity_report.physical')}: </span>
                    <span className="font-medium">{reportData.summary.physicalEntities}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">{t('label.entity_report.with_donations')}: </span>
                    <span className="font-medium">{reportData.summary.entitiesWithDonations}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">{t('label.entity_report.projects_involved')}: </span>
                    <span className="font-medium">{reportData.summary.totalProjectsInvolved}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!loading && !reportGenerated && (
            <div className="text-center py-8 text-gray-500">
              {t('label.reports.no_data')}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default EntityReportsTab;
