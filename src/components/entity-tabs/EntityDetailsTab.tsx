import React from 'react';
import { Card } from '@/components/ui/Card';
import { Entity, LegalType, EntityType, EntityStatus, EngagementLevel } from '@/types/entity.types';
import { t } from 'i18next';

interface EntityDetailsTabProps {
    entity: Entity;
}

export const EntityDetailsTab: React.FC<EntityDetailsTabProps> = ({ entity }) => {
    const getStatusBadgeColor = (status: EntityStatus) => {
        const colors: Record<EntityStatus, string> = {
            [EntityStatus.ACTIV]: 'bg-green-100 text-green-800',
            [EntityStatus.INACTIV]: 'bg-gray-100 text-gray-800',
            [EntityStatus.POTENTIAL]: 'bg-blue-100 text-blue-800',
            [EntityStatus.BLOCAT]: 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusLabel = (status: EntityStatus) => {
        const labels: Record<EntityStatus, string> = {
            [EntityStatus.ACTIV]: t('label.entity.status_activ'),
            [EntityStatus.INACTIV]: t('label.entity.status_inactiv'),
            [EntityStatus.POTENTIAL]: t('label.entity.status_potential'),
            [EntityStatus.BLOCAT]: t('label.entity.status_blocat')
        };
        return labels[status] || status;
    };

    const getEntityTypeLabel = (type: EntityType) => {
        const types: Record<EntityType, string> = {
            [EntityType.DONOR]: t('label.entity.type_donor'),
            [EntityType.SPONSOR]: t('label.entity.type_sponsor'),
            [EntityType.PARTNER]: t('label.entity.type_partner'),
            [EntityType.VOLUNTEER]: t('label.entity.type_voluntar'),
            [EntityType.BENEFICIARY]: t('label.entity.type_beneficiar'),
            [EntityType.OTHER]: t('label.entity.type_altul')
        };
        return types[type] || type;
    };

    const getLegalTypeLabel = (type: LegalType) => {
        const labels: Record<LegalType, string> = {
            [LegalType.FIZICA]: t('label.entity.legal_type_fizica'),
            [LegalType.JURIDICA]: t('label.entity.legal_type_juridica')
        };
        return labels[type] || type;
    };

    const getEngagementLabel = (engagement?: EngagementLevel) => {
        if (!engagement) return 'N/A';
        const labels: Record<EngagementLevel, string> = {
            [EngagementLevel.TOTAL]: t('label.entity.engagement_total'),
            [EngagementLevel.PARTIAL]: t('label.entity.engagement_partial'),
            [EngagementLevel.DELOC]: t('label.entity.engagement_deloc')
        };
        return labels[engagement] || engagement;
    };

    const getEngagementBadgeColor = (engagement?: EngagementLevel) => {
        if (!engagement) return 'bg-gray-100 text-gray-800';
        const colors: Record<EngagementLevel, string> = {
            [EngagementLevel.TOTAL]: 'bg-green-100 text-green-800',
            [EngagementLevel.PARTIAL]: 'bg-yellow-100 text-yellow-800',
            [EngagementLevel.DELOC]: 'bg-red-100 text-red-800'
        };
        return colors[engagement] || 'bg-gray-100 text-gray-800';
    };

    return (
        <>
            <Card title={t('label.entity.basic_info')} className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            {t('label.entity.name')}
                        </label>
                        <p className="text-gray-900 font-semibold">{entity.name}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            {t('label.entity.identification_number')}
                        </label>
                        <p className="text-gray-900">{entity.identificationNumber || 'N/A'}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            {t('label.entity.legal_type')}
                        </label>
                        <p className="text-gray-900">{getLegalTypeLabel(entity.legalType)}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            {t('label.entity.entity_type')}
                        </label>
                        <p className="text-gray-900">{getEntityTypeLabel(entity.type)}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            {t('label.entity.status')}
                        </label>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(entity.status)}`}>
                            {getStatusLabel(entity.status)}
                        </span>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            {t('label.entity.engagement')}
                        </label>
                        {entity.engagementLevel ? (
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getEngagementBadgeColor(entity.engagementLevel)}`}>
                                {getEngagementLabel(entity.engagementLevel)}
                            </span>
                        ) : (
                            <span className="text-gray-400">N/A</span>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            {t('label.entity.organization')}
                        </label>
                        <p className="text-gray-900">{entity.organizationName || 'N/A'}</p>
                    </div>
                </div>
            </Card>

            <Card title={t('label.entity.contact_info')} className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Email
                        </label>
                        {entity.email ? (
                            <a
                                href={`mailto:${entity.email}`}
                                className="text-blue-600 hover:text-blue-800"
                            >
                                {entity.email}
                            </a>
                        ) : (
                            <p className="text-gray-400">N/A</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            {t('label.entity.phone')}
                        </label>
                        {entity.phone ? (
                            <a
                                href={`tel:${entity.phone}`}
                                className="text-blue-600 hover:text-blue-800"
                            >
                                {entity.phone}
                            </a>
                        ) : (
                            <p className="text-gray-400">N/A</p>
                        )}
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            {t('label.entity.address')}
                        </label>
                        <p className="text-gray-900">{entity.address || 'N/A'}</p>
                        {entity.address2 && (
                            <p className="text-gray-600 mt-1">{entity.address2}</p>
                        )}
                    </div>
                </div>
            </Card>

            {entity.observation && (
                <Card title={t('label.entity.observations')} className="mb-6">
                    <p className="text-gray-900 whitespace-pre-wrap">{entity.observation}</p>
                </Card>
            )}
        </>
    );
};