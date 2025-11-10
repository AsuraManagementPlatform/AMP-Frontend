import React from 'react';
import { ViewDataConfig, ViewDataModal } from "@/components/forms/ViewDataModal";
import {t} from "i18next";
import {EntityPartnershipProject} from "@/types/entity-donation.types.ts";

interface ViewEntityPartnerModalProps {
    isOpen: boolean;
    onClose: () => void;
    partnership: EntityPartnershipProject;
}

export const ViewEntityPartnerModal: React.FC<ViewEntityPartnerModalProps> = ({
                                                                                  isOpen,
                                                                                  onClose,
                                                                                  partnership,
                                                                              }) => {

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

    const hasDonations = partnership.donations && partnership.donations.length > 0;
    const defaultCurrency = partnership.donations?.[0]?.currency || 'RON';

    const viewConfig: ViewDataConfig = {
        sections: [
            {
                title: t('label.entity_partner.section_info'),
                columns: 2,
                fields: [
                    {
                        label: t('label.entity_partner.project'),
                        value: partnership.projectName
                    },
                    {
                        label: t('label.entity_partner.engagement_level'),
                        value: partnership.engagementLevel,
                        render: (level) => getEngagementLevelBadge(level),
                    }
                ]
            },
            {
                title: t('label.entity_partner.donations_summary'),
                columns: 2,
                fields: [
                    {
                        label: t('label.entity_partner.total_donations_count'),
                        value: partnership.donationsCount || 0
                    },
                    {
                        label: t('label.entity_partner.total_donations_amount'),
                        value: partnership.totalDonations
                            ? formatCurrency(partnership.totalDonations, defaultCurrency)
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
            title={t('label.entity_partner.view_partnership')}
            config={viewConfig}
            size="lg"
        >
            {hasDonations && (
                <div className="mt-6 pt-6">
                    <h3 className="text-lg font-semibold mb-4">
                        {t('label.entity_partner.donations_list')}
                    </h3>
                    <div className="space-y-3">
                        {partnership.donations!.map((donation) => (
                            <div
                                key={donation.id}
                                className="flex justify-between items-start p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex-1">
                                    <div className="font-medium text-gray-900 mb-1">
                                        {t('label.entity_donation.type')}: {t(`label.donation_type.${donation.type}`)}
                                    </div>
                                    <div className="text-sm text-gray-600 space-y-1">
                                        {donation.date && (
                                            <div>
                                                <span className="font-medium">{t('label.entity_donation.date')}:</span> {formatDate(donation.date)}
                                            </div>
                                        )}
                                        {donation.activityTitle && (
                                            <div>
                                                <span className="font-medium">{t('label.entity_donation.activity')}:</span> {donation.activityTitle}
                                            </div>
                                        )}
                                        {donation.scope && (
                                            <div>
                                                <span className="font-medium">{t('label.entity_donation.scope')}:</span> {t(`label.donation_scope.${donation.scope}`)}
                                            </div>
                                        )}
                                        {donation.paymentMethod && (
                                            <div>
                                                <span className="font-medium">{t('label.entity_donation.payment_method')}:</span> {t(`label.payment_method.${donation.paymentMethod}`)}
                                            </div>
                                        )}
                                        {donation.notes && (
                                            <div className="text-xs text-gray-500 italic mt-1">
                                                {donation.notes}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right ml-4">
                                    <div className="font-semibold text-green-600 text-lg">
                                        {formatCurrency(donation.amount, donation.currency)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {!hasDonations && (
                <div className="mt-6 border-t pt-6">
                    <div className="text-center py-8 text-gray-500">
                        {t('label.entity_partner.no_donations')}
                    </div>
                </div>
            )}
        </ViewDataModal>
    );
};