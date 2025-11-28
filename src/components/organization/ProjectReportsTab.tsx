import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PrimaryActionButton } from '@/components/ui/PrimaryActionButton';
import { useProjectReport } from '@/hooks/useProjectReport';

interface ProjectReportsTabProps {
  organizationId: string;
  organizationName: string;
}

export const ProjectReportsTab: React.FC<ProjectReportsTabProps> = ({
  organizationId,
  organizationName
}) => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  
  const [yearFrom, setYearFrom] = useState(currentYear);
  const [yearTo, setYearTo] = useState(currentYear);
  
  const { reportData, loading, reportGenerated, generateReport, downloadExcel, downloadPDF } = useProjectReport();

  const handleGenerateReport = async () => {
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
      style: 'currency',
      currency: 'RON',
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t('label.project_report.filters')}
          </h3>
          
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('label.project_report.year_from')}
              </label>
              <input
                type="number"
                min="2000"
                max="2100"
                value={yearFrom}
                onChange={(e) => setYearFrom(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('label.project_report.year_to')}
              </label>
              <input
                type="number"
                min="2000"
                max="2100"
                value={yearTo}
                onChange={(e) => setYearTo(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <PrimaryActionButton
              onClick={handleGenerateReport}
              disabled={loading}
            >
              {loading ? t('label.report.generating') : t('label.report.generate_report')}
            </PrimaryActionButton>
          </div>
          
          {reportGenerated && (
            <div className="flex gap-3 mt-4">
              <Button
                onClick={handleDownloadExcel}
                variant="primary"
                className="border-green-600 text-green-600 hover:bg-green-600"
              >
                {t('label.report.download_excel')}
              </Button>
              <Button
                onClick={handleDownloadPDF}
                variant="danger"
              >
                {t('label.report.download_pdf')}
              </Button>
            </div>
          )}
        </div>
      </Card>

      {reportGenerated && reportData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <div className="p-4">
                <div className="text-sm font-medium text-gray-600 mb-2">
                  {t('label.project_report.total_projects')}
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {reportData.summary.totalProjects}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {reportData.summary.totalActivities} {t('label.project_report.activities')}
                </p>
              </div>
            </Card>

            <Card>
              <div className="p-4">
                <div className="text-sm font-medium text-gray-600 mb-2">
                  {t('label.project_report.total_budget')}
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(reportData.summary.totalPlannedBudget)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {formatCurrency(reportData.summary.availableBudget)} {t('label.project_report.available')}
                </p>
              </div>
            </Card>

            <Card>
              <div className="p-4">
                <div className="text-sm font-medium text-gray-600 mb-2">
                  {t('label.project_report.execution_rate')}
                </div>
                <div className="text-2xl font-bold text-orange-600">
                  {formatPercentage(reportData.summary.budgetExecutionRate)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {formatCurrency(reportData.summary.totalExpenses)} {t('label.project_report.spent')}
                </p>
              </div>
            </Card>
          </div>

          <Card title={t('label.project_report.projects_list')}>
            <div className="p-4">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('label.project_report.project_name')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('label.project_report.status')}</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('label.project_report.budget')}</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('label.project_report.total_funds')}</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('label.project_report.expenses')}</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('label.project_report.available')}</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">{t('label.project_report.activities')}</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.projects.map((project) => (
                      <tr key={project.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{project.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            project.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                            project.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                            project.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {project.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">{formatCurrency(project.plannedBudget)}</td>
                        <td className="px-4 py-3 text-sm text-green-600 text-right font-medium">{formatCurrency(project.totalFunds)}</td>
                        <td className="px-4 py-3 text-sm text-red-600 text-right font-medium">{formatCurrency(project.totalExpenses)}</td>
                        <td className="px-4 py-3 text-sm text-blue-600 text-right font-medium">{formatCurrency(project.availableBudget)}</td>
                        <td className="px-4 py-3 text-sm text-gray-500 text-center">
                          <div className="flex flex-col items-center">
                            <span className="font-medium">{project.completedActivities}/{project.totalActivities}</span>
                            <span className="text-xs text-gray-400">
                              {project.totalActivities > 0 ? `${Math.round(project.completedActivities / project.totalActivities * 100)}%` : '0%'}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-100">
                    <tr className="font-bold">
                      <td className="px-4 py-3 text-sm text-gray-900" colSpan={2}>{t('label.project_report.total')}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">
                        {formatCurrency(reportData.projects.reduce((sum, p) => sum + p.plannedBudget, 0))}
                      </td>
                      <td className="px-4 py-3 text-sm text-green-600 text-right">
                        {formatCurrency(reportData.projects.reduce((sum, p) => sum + p.totalFunds, 0))}
                      </td>
                      <td className="px-4 py-3 text-sm text-red-600 text-right">
                        {formatCurrency(reportData.projects.reduce((sum, p) => sum + p.totalExpenses, 0))}
                      </td>
                      <td className="px-4 py-3 text-sm text-blue-600 text-right">
                        {formatCurrency(reportData.projects.reduce((sum, p) => sum + p.availableBudget, 0))}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 text-center">
                        {reportData.projects.reduce((sum, p) => sum + p.completedActivities, 0)}/{reportData.projects.reduce((sum, p) => sum + p.totalActivities, 0)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </Card>
        </>
      )}

      {!reportGenerated && (
        <Card>
          <div className="flex flex-col items-center justify-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('label.report.no_report_generated')}
            </h3>
            <p className="text-sm text-gray-600 text-center max-w-md">
              {t('label.project_report.select_years_and_generate')}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};
