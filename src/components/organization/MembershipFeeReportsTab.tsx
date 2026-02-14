import React, { useState } from 'react';
import { useMembershipFeeReport } from '@/hooks/useMembershipFeeReport';
import { Button } from '@/components/ui/Button';
import { PrimaryActionButton } from '@/components/ui/PrimaryActionButton';
import { Card } from '@/components/ui/Card';
import { t } from 'i18next';

interface OrganizationReportsTabProps {
  organizationId: string;
  organizationName: string;
}

export const MembershipFeeReportsTab: React.FC<OrganizationReportsTabProps> = () => {
  const [startDate, setStartDate] = useState<string>(
    new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [reportGenerated, setReportGenerated] = useState(false);

  const {
    reportData,
    loading,
    generateReport,
    downloadPDF,
    downloadExcel,
  } = useMembershipFeeReport();

  const handleGenerateReport = async () => {
    await generateReport({
      startDate,
      endDate,
      forceRefresh: true,
    });
    setReportGenerated(true);
  };

  const handleDownloadPDF = async () => {
    await downloadPDF({ startDate, endDate });
  };

  const handleDownloadExcel = async () => {
    await downloadExcel({ startDate, endDate });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON',
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {t('label.organization.membership_fee_reports')}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {t('label.organization.membership_fee_reports_description')}
          </p>
        </div>

        {/* Date Range Selection */}
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('label.report.start_date')}
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('label.report.end_date')}
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <PrimaryActionButton
            onClick={handleGenerateReport}
            disabled={loading || !startDate || !endDate}
          >
            {loading ? t('label.report.generating') : t('label.report.generate_report')}
          </PrimaryActionButton>
        </div>

        {/* Download Buttons */}
        {reportGenerated && reportData && (
          <div className="flex gap-3">
            <Button
              onClick={handleDownloadExcel}
              variant="outline"
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

      {/* Report Dashboard */}
      {reportGenerated && reportData && (
        <>
          <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <Card>
              <div className="p-4">
                <div className="text-sm font-medium text-gray-600 mb-2">
                  {t('label.membership_fee.total_members')}
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {reportData.summary.totalMembers}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {reportData.summary.contributorMembers} {t('label.membership_fee.contributors')}
                </p>
              </div>
            </Card>

            <Card>
              <div className="p-4">
                <div className="text-sm font-medium text-gray-600 mb-2">
                  {t('label.membership_fee.total_fees_collected')}
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(reportData.summary.totalFeesCollected)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {t('label.membership_fee.from')} {formatCurrency(reportData.summary.totalFeesDue)}
                </p>
              </div>
            </Card>

            <Card>
              <div className="p-4">
                <div className="text-sm font-medium text-gray-600 mb-2">
                  {t('label.membership_fee.pending_fees')}
                </div>
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(reportData.summary.totalPending || 0)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {t('label.membership_fee.in_waiting')}
                </p>
              </div>
            </Card>

            <Card>
              <div className="p-4">
                <div className="text-sm font-medium text-gray-600 mb-2">
                  {t('label.membership_fee.overdue_fees')}
                </div>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(reportData.summary.totalOverdue || 0)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {reportData.arrearsAnalysis.totalMembersWithArrears} {t('label.membership_fee.members_with_arrears')}
                </p>
              </div>
            </Card>

            <Card>
              <div className="p-4">
                <div className="text-sm font-medium text-gray-600 mb-2">
                  {t('label.membership_fee.collection_rate')}
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {formatPercentage(reportData.summary.collectionRate)}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <span className={reportData.summary.collectionRate >= 90 ? "text-green-500" : "text-red-500"}>
                    {reportData.summary.collectionRate >= 90 ? "↑" : "↓"}
                  </span>
                  <p className="text-xs text-gray-500">
                    {reportData.summary.onTimeRate.toFixed(0)}% {t('label.membership_fee.on_time')}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Alerts */}
          {reportData.observations.alerts.length > 0 && (
            <Card title="⚠️ Alerte">
              <div className="p-4">
                <ul className="space-y-2">
                  {reportData.observations.alerts.map((alert, index) => (
                    <li key={index} className="flex items-start gap-2 text-orange-900">
                      <span className="text-orange-600 mt-1">•</span>
                      <span className="text-sm">
                        {t(alert.message)}: {alert.value}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          )}

          {/* Payment Methods Breakdown */}
          <Card title={t('label.membership_fee.payment_methods_breakdown')}>
            <div className="p-4">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('label.membership_fee.payment_method')}</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('label.membership_fee.count')}</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('label.membership_fee.amount')}</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('label.membership_fee.percentage')}</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Object.entries(reportData.paymentMethodsBreakdown)
                      .filter(([_, data]) => data.count > 0)
                      .map(([method, data]) => (
                        <tr key={method}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {t(`label.payment_method.${method.toLowerCase()}`)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{data.count}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{formatCurrency(data.totalAmount)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{formatPercentage(data.percentage)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>

          {/* Members with Arrears */}
          {reportData.arrearsAnalysis.totalMembersWithArrears > 0 && (
            <Card title={`🔴 ${t('label.membership_fee.members_with_arrears')} (Top 10)`}>
              <div className="p-4">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('label.membership_fee.member_name')}</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('label.membership_fee.outstanding_amount')}</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('label.membership_fee.days_overdue')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('label.membership_fee.email')}</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reportData.arrearsAnalysis.membersWithArrears.slice(0, 10).map((member) => (
                        <tr key={member.memberId}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{member.fullName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold text-right">
                            {formatCurrency(member.outstandingAmount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{member.oldestUnpaidFee.daysOverdue}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{member.contact.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          )}

          {/* Payment Timeline Summary */}
          <Card title={t('label.membership_fee.payment_timeline')}>
            <div className="p-4">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('label.membership_fee.month')}</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('label.membership_fee.monthly_fees_due')}</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('label.membership_fee.monthly_collected')}</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('label.membership_fee.collection_rate')}</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.paymentTimeline.map((timeline) => (
                      <tr key={timeline.date}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{timeline.periodLabel}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{formatCurrency(timeline.monthlyFeesDue)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{formatCurrency(timeline.monthlyCollected)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{formatPercentage(timeline.monthlyCollectionRate)}</td>
                      </tr>
                    ))}
                    {/* TOTAL Row */}
                    <tr className="bg-blue-50 font-bold">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">TOTAL</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {formatCurrency(reportData.paymentTimeline.reduce((sum, t) => sum + (t.monthlyFeesDue || 0), 0))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {formatCurrency(reportData.paymentTimeline.reduce((sum, t) => sum + (t.monthlyCollected || 0), 0))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {formatPercentage(
                          reportData.paymentTimeline.reduce((sum, t) => sum + (t.monthlyFeesDue || 0), 0) > 0
                            ? (reportData.paymentTimeline.reduce((sum, t) => sum + (t.monthlyCollected || 0), 0) / 
                               reportData.paymentTimeline.reduce((sum, t) => sum + (t.monthlyFeesDue || 0), 0)) * 100
                            : 0
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </div>
        </>
      )}

      {/* Empty State */}
      {!reportGenerated && (
        <Card>
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('label.report.no_report_generated')}
            </h3>
            <p className="text-sm text-gray-600 text-center max-w-md">
              {t('label.report.select_date_range_and_generate')}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};
