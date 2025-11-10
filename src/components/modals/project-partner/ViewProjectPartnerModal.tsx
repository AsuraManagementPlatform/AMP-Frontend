import React from 'react';
import { ProjectPartner } from '@/types/project-partner.types';
import { useTranslation } from "react-i18next";
import { ViewDataConfig, ViewDataModal } from "@/components/forms/ViewDataModal";

interface ViewProjectPartnerModalProps {
    isOpen: boolean;
    onClose: () => void;
    partner: ProjectPartner;
}

export const ViewProjectPartnerModal: React.FC<ViewProjectPartnerModalProps> = ({
                                                                                    isOpen,
                                                                                    onClose,
                                                                                    partner,
                                                                                }) => {
    const { t } = useTranslation();

    const getEngagementLevelBadge = (level: string | null) => {
        if (!level) {
            return (
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                    {t('label.project_partner.engagement_none')}
                </span>
            );
        }

        const badges = {
            none: 'bg-gray-100 text-gray-800',
            partial: 'bg-yellow-100 text-yellow-800',
            fully: 'bg-green-100 text-green-800'
        };

        const colorClass = badges[level as keyof typeof badges] || 'bg-gray-100 text-gray-800';

        return (
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${colorClass}`}>
                {t(`label.project_partner.engagement_${level}`)}
            </span>
        );
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return null;
        return new Date(dateString).toLocaleDateString('ro-RO');
    };

    const formatCurrency = (amount: number, currency: string) => {
        return `${amount.toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
    };

    const hasProjectFunds = partner.projectFunds && partner.projectFunds.length > 0;
    const defaultCurrency = partner.projectFunds?.[0]?.currency || 'RON';

    const viewConfig: ViewDataConfig = {
        sections: [
            {
                title: t('label.project_partner.section_info'),
                columns: 2,
                fields: [
                    {
                        label: t('label.project_partner.entity'),
                        value: partner.entityName
                    },
                    {
                        label: t('label.project_partner.engagement_level'),
                        value: partner.engagementLevel,
                        render: (level) => getEngagementLevelBadge(level),
                    }
                ]
            },
            {
                title: t('label.project_partner.donations_summary'),
                columns: 2,
                fields: [
                    {
                        label: t('label.project_partner.total_donations_count'),
                        value: partner.totalDonationsCount || 0
                    },
                    {
                        label: t('label.project_partner.total_donations_amount'),
                        value: partner.totalDonations
                            ? formatCurrency(partner.totalDonations, defaultCurrency)
                            : formatCurrency(0, defaultCurrency),
                        render: (value) => (
                            <span className="font-semibold text-green-600">{value}</span>
                        )
                    }
                ]
            }
        ]
    };

    return (
        <ViewDataModal
            isOpen={isOpen}
            onClose={onClose}
            title={t('label.project_partner.view_partner')}
            config={viewConfig}
            size="lg"
        >
            {hasProjectFunds && (
                <div className="mt-6 pt-6">
                    <h3 className="text-lg font-semibold mb-4">
                        {t('label.project_partner.donations_list')}
                    </h3>
                    <div className="space-y-3">
                        {partner.projectFunds!.map((projectFund) => (
                            <div
                                key={projectFund.id}
                                className="flex justify-between items-start p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex-1">
                                    <div className="font-medium text-gray-900 mb-1">
                                        {projectFund.sourceName}
                                    </div>
                                    <div className="text-sm text-gray-600 space-y-1">
                                        {projectFund.date && (
                                            <div>
                                                <span className="font-medium">{t('label.project_fund.date')}:</span> {formatDate(projectFund.date)}
                                            </div>
                                        )}
                                        {projectFund.activityTitle && (
                                            <div>
                                                <span className="font-medium">{t('label.project_fund.activity')}:</span> {projectFund.activityTitle}
                                            </div>
                                        )}
                                        {projectFund.scope && (
                                            <div>
                                                <span className="font-medium">{t('label.project_fund.scope')}:</span> {projectFund.scope}
                                            </div>
                                        )}
                                        {projectFund.remainingAmount !== undefined && projectFund.remainingAmount > 0 && (
                                            <div className="text-blue-600">
                                                <span className="font-medium">{t('label.project_fund.remaining_amount')}:</span> {formatCurrency(projectFund.remainingAmount, projectFund.currency)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right ml-4">
                                    <div className="font-semibold text-green-600 text-lg">
                                        {formatCurrency(projectFund.amount || 0, projectFund.currency)}
                                    </div>
                                    {projectFund.allocatedAmount !== undefined && projectFund.allocatedAmount > 0 && (
                                        <div className="text-xs text-gray-500 mt-1">
                                            {t('label.project_fund.allocated_amount')}: {formatCurrency(projectFund.allocatedAmount, projectFund.currency)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {!hasProjectFunds && (
                <div className="mt-6 border-t pt-6">
                    <div className="text-center py-8 text-gray-500">
                        {t('label.project_partner.no_donations')}
                    </div>
                </div>
            )}
        </ViewDataModal>
    );
};