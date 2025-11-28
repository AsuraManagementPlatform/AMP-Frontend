import React, { useState } from 'react';
import { useFinancialReport, useProgressReport } from '@/hooks/useReports';
import { Button } from '@/components/ui/Button';
import { PrimaryActionButton } from '@/components/ui/PrimaryActionButton';
import { BudgetTimelineChart } from '@/components/charts/BudgetTimelineChart';
import { t } from 'i18next';
import reportService from '@/services/report.service';
import showToast from '@/components/ui/Toast';

interface ProjectReportsTabProps {
    projectId: string;
    projectName: string;
    projectStatus: string;
    projectStartDate: string;
    projectEndDate: string;
}

type ReportType = 'financial' | 'progress' | null;

export const ProjectReportsTab: React.FC<ProjectReportsTabProps> = ({
    projectId,
    projectName,
    projectStartDate,
    projectEndDate,
}) => {
    const [activeReport, setActiveReport] = useState<ReportType>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    const financialReportQuery = useFinancialReport(
        {
            projectId,
            startDate: projectStartDate,
            endDate: projectEndDate,
        },
        activeReport === 'financial'
    );

    const progressReportQuery = useProgressReport(
        {
            projectId,
            startDate: projectStartDate,
            endDate: projectEndDate,
        },
        activeReport === 'progress'
    );

    const handleGenerateReport = (type: ReportType) => {
        setActiveReport(type);
    };

    const handleDownloadPDF = async (reportType: 'financial' | 'progress') => {
        try {
            setIsDownloading(true);
            const params = {
                projectId,
                startDate: projectStartDate,
                endDate: projectEndDate,
            };

            const blob = reportType === 'financial'
                ? await reportService.downloadFinancialReportPDF(params)
                : await reportService.downloadProgressReportPDF(params);

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const romanianType = reportType === 'financial' ? 'raport_financiar' : 'raport_progres';
            link.setAttribute('download', `${romanianType}_${projectName}_${projectStartDate}_${projectEndDate}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            showToast.success(t('toast.report.download_success'));
        } catch (error: any) {
            const message = error?.message || t('toast.report.download_error');
            showToast.error(message);
        } finally {
            setIsDownloading(false);
        }
    };

    const handleDownloadExcel = async (reportType: 'financial' | 'progress') => {
        try {
            setIsDownloading(true);
            const params = {
                projectId,
                startDate: projectStartDate,
                endDate: projectEndDate,
            };

            const blob = reportType === 'financial'
                ? await reportService.downloadFinancialReportExcel(params)
                : await reportService.downloadProgressReportExcel(params);

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const romanianType = reportType === 'financial' ? 'raport_financiar' : 'raport_progres';
            link.setAttribute('download', `${romanianType}_${projectName}_${projectStartDate}_${projectEndDate}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            showToast.success(t('toast.report.download_success'));
        } catch (error: any) {
            const message = error?.message || t('toast.report.download_error');
            showToast.error(message);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Rapoarte Proiect: {projectName}</h2>
                
                <p className="text-sm text-gray-600 mb-6">
                    Perioada raportului: {new Date(projectStartDate).toLocaleDateString('ro-RO')} - {new Date(projectEndDate).toLocaleDateString('ro-RO')}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <button
                        onClick={() => handleGenerateReport('financial')}
                        className={`p-6 rounded-lg border-2 transition-all ${
                            activeReport === 'financial'
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-blue-300'
                        }`}
                    >
                        <div className="text-left">
                            <h3 className="text-lg font-semibold mb-2">Raport Financiar</h3>
                            <p className="text-sm text-gray-600">
                                Venituri, cheltuieli, balanță bugetară și indicatori financiari
                            </p>
                        </div>
                    </button>

                    <button
                        onClick={() => handleGenerateReport('progress')}
                        className={`p-6 rounded-lg border-2 transition-all ${
                            activeReport === 'progress'
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-blue-300'
                        }`}
                    >
                        <div className="text-left">
                            <h3 className="text-lg font-semibold mb-2">Raport Progres</h3>
                            <p className="text-sm text-gray-600">
                                Activități, obiective, probleme și recomandări
                            </p>
                        </div>
                    </button>
                </div>
            </div>

            {activeReport === 'financial' && (
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Raport Financiar</h2>
                        <div className="flex gap-2">
                            <Button
                                onClick={() => handleDownloadPDF('financial')}
                                disabled={isDownloading || financialReportQuery.isLoading}
                                className="border-red-600 text-red-600 hover:bg-red-600 shadow-sm hover:shadow-md"
                                size="sm"
                            >
                                Download PDF
                            </Button>
                            <Button
                                onClick={() => handleDownloadExcel('financial')}
                                disabled={isDownloading || financialReportQuery.isLoading}
                                className="border-green-600 text-green-600 hover:bg-green-600 shadow-sm hover:shadow-md"
                                size="sm"
                            >
                                Download Excel
                            </Button>
                            <PrimaryActionButton onClick={() => financialReportQuery.refetch()}>
                                Actualizează
                            </PrimaryActionButton>
                        </div>
                    </div>

                    {financialReportQuery.isLoading && (
                        <div className="text-center py-12">
                            <div className="text-gray-600">Se generează raportul...</div>
                        </div>
                    )}

                    {financialReportQuery.error && (
                        <div className="text-center py-12">
                            <p className="text-red-600">
                                {t(financialReportQuery.error.message) || 'Eroare la generarea raportului'}
                            </p>
                        </div>
                    )}

                    {financialReportQuery.data && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Venituri Totale</p>
                                    <p className="text-2xl font-bold text-green-700">
                                        {financialReportQuery.data.summary.totalRevenue.toFixed(2)} {financialReportQuery.data.summary.currency}
                                    </p>
                                </div>
                                <div className="bg-red-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Cheltuieli Totale</p>
                                    <p className="text-2xl font-bold text-red-700">
                                        {financialReportQuery.data.summary.totalExpenses.toFixed(2)} {financialReportQuery.data.summary.currency}
                                    </p>
                                </div>
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Balanță</p>
                                    <p className={`text-2xl font-bold ${
                                        financialReportQuery.data.summary.currentBalance >= 0 
                                            ? 'text-blue-700' 
                                            : 'text-red-700'
                                    }`}>
                                        {financialReportQuery.data.summary.currentBalance.toFixed(2)} {financialReportQuery.data.summary.currency}
                                    </p>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <h3 className="font-semibold mb-3">Utilizare Buget</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Buget Total</span>
                                        <span className="font-medium">
                                            {financialReportQuery.data.summary.projectBudget.toFixed(2)} {financialReportQuery.data.summary.currency}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-4">
                                        <div
                                            className={`h-4 rounded-full ${
                                                financialReportQuery.data.summary.budgetConsumed > 90
                                                    ? 'bg-red-600'
                                                    : financialReportQuery.data.summary.budgetConsumed > 75
                                                    ? 'bg-yellow-500'
                                                    : 'bg-green-500'
                                            }`}
                                            style={{ width: `${Math.min(financialReportQuery.data.summary.budgetConsumed, 100)}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Consum Buget</span>
                                        <span className="font-medium">
                                            {financialReportQuery.data.summary.budgetConsumed.toFixed(2)}%
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {financialReportQuery.data.budgetTimeline && financialReportQuery.data.budgetTimeline.length > 0 && (
                                <div className="border-t pt-4">
                                    <h3 className="font-semibold mb-3">Evoluție Buget</h3>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <BudgetTimelineChart 
                                            data={financialReportQuery.data.budgetTimeline}
                                            currency={financialReportQuery.data.summary.currency}
                                        />
                                    </div>
                                </div>
                            )}

                            {financialReportQuery.data.observations.alerts.length > 0 && (
                                <div className="border-t pt-4">
                                    <h3 className="font-semibold mb-3">Alerte</h3>
                                    <div className="space-y-2">
                                        {financialReportQuery.data.observations.alerts.map((alert, idx) => (
                                            <div
                                                key={idx}
                                                className={`p-3 rounded-lg ${
                                                    alert.type === 'CRITICAL'
                                                        ? 'bg-red-50 text-red-800'
                                                        : 'bg-yellow-50 text-yellow-800'
                                                }`}
                                            >
                                                {t(alert.message, { value: alert.value })}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {activeReport === 'progress' && (
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Raport Progres</h2>
                        <div className="flex gap-2">
                            <Button
                                onClick={() => handleDownloadPDF('progress')}
                                disabled={isDownloading || progressReportQuery.isLoading}
                                className="border-red-600 text-red-600 hover:bg-red-600 shadow-sm hover:shadow-md"
                                size="sm"
                            >
                                Download PDF
                            </Button>
                            <Button
                                onClick={() => handleDownloadExcel('progress')}
                                disabled={isDownloading || progressReportQuery.isLoading}
                                className="border-green-600 text-green-600 hover:bg-green-600 shadow-sm hover:shadow-md"
                                size="sm"
                            >
                                Download Excel
                            </Button>
                            <PrimaryActionButton onClick={() => progressReportQuery.refetch()}>
                                Actualizează
                            </PrimaryActionButton>
                        </div>
                    </div>

                    {progressReportQuery.isLoading && (
                        <div className="text-center py-12">
                            <div className="text-gray-600">Se generează raportul...</div>
                        </div>
                    )}

                    {progressReportQuery.error && (
                        <div className="text-center py-12">
                            <p className="text-red-600">
                                {t(progressReportQuery.error.message) || 'Eroare la generarea raportului'}
                            </p>
                        </div>
                    )}

                    {progressReportQuery.data && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-3 gap-4">
                                <div className={`p-4 rounded-lg ${
                                    progressReportQuery.data.projectStatus.overallHealth === 'ON_TRACK'
                                        ? 'bg-green-50'
                                        : progressReportQuery.data.projectStatus.overallHealth === 'AT_RISK'
                                        ? 'bg-yellow-50'
                                        : 'bg-red-50'
                                }`}>
                                    <p className="text-sm text-gray-600 mb-1">Stare Proiect</p>
                                    <p className={`text-lg font-bold ${
                                        progressReportQuery.data.projectStatus.overallHealth === 'ON_TRACK'
                                            ? 'text-green-700'
                                            : progressReportQuery.data.projectStatus.overallHealth === 'AT_RISK'
                                            ? 'text-yellow-700'
                                            : 'text-red-700'
                                    }`}>
                                        {progressReportQuery.data.projectStatus.overallHealth === 'ON_TRACK' && 'Pe Drumul Cel Bun'}
                                        {progressReportQuery.data.projectStatus.overallHealth === 'AT_RISK' && 'Risc'}
                                        {progressReportQuery.data.projectStatus.overallHealth === 'CRITICAL' && 'Critic'}
                                    </p>
                                </div>
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Progres Timp</p>
                                    <p className="text-2xl font-bold text-blue-700">
                                        {progressReportQuery.data.projectStatus.timeProgress.toFixed(1)}%
                                    </p>
                                </div>
                                <div className="bg-purple-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Progres Muncă</p>
                                    <p className="text-2xl font-bold text-purple-700">
                                        {progressReportQuery.data.projectStatus.workProgress.toFixed(1)}%
                                    </p>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <h3 className="font-semibold mb-3">Activități</h3>
                                <div className="grid grid-cols-4 gap-4">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-gray-800">
                                            {progressReportQuery.data.activities.totalActivities}
                                        </p>
                                        <p className="text-sm text-gray-600">Total</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-green-600">
                                            {progressReportQuery.data.activities.completed}
                                        </p>
                                        <p className="text-sm text-gray-600">Finalizate</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-blue-600">
                                            {progressReportQuery.data.activities.inProgress}
                                        </p>
                                        <p className="text-sm text-gray-600">În Progres</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-red-600">
                                            {progressReportQuery.data.activities.overdue.length}
                                        </p>
                                        <p className="text-sm text-gray-600">Întârziate</p>
                                    </div>
                                </div>
                            </div>

                            {progressReportQuery.data.issues.identifiedIssues.length > 0 && (
                                <div className="border-t pt-4">
                                    <h3 className="font-semibold mb-3">Probleme Identificate</h3>
                                    <div className="space-y-2">
                                        {progressReportQuery.data.issues.identifiedIssues.map((issue, idx) => (
                                            <div
                                                key={idx}
                                                className={`p-3 rounded-lg ${
                                                    issue.severity === 'HIGH'
                                                        ? 'bg-red-50 text-red-800'
                                                        : 'bg-yellow-50 text-yellow-800'
                                                }`}
                                            >
                                                <div className="flex justify-between">
                                                    <span>{t(issue.description)}</span>
                                                    <span className="font-medium">{issue.count} activități</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {progressReportQuery.data.recommendations.recommendations.length > 0 && (
                                <div className="border-t pt-4">
                                    <h3 className="font-semibold mb-3">Recomandări</h3>
                                    <div className="space-y-2">
                                        {progressReportQuery.data.recommendations.recommendations.map((rec, idx) => (
                                            <div key={idx} className="p-3 bg-blue-50 rounded-lg">
                                                <div className="flex items-start gap-2">
                                                    <span className={`px-2 py-1 text-xs rounded ${
                                                        rec.priority === 'HIGH'
                                                            ? 'bg-red-100 text-red-800'
                                                            : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                        {rec.priority}
                                                    </span>
                                                    <span className="text-sm text-gray-700">
                                                        {t(rec.recommendation)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
