import React, {useEffect, useState} from 'react';
import {Card} from '@/components/ui/Card';
import {t} from 'i18next';
import {EntityPartnerList} from '@/components/tables/EntityPartnerList';
import showToast from '@/components/ui/Toast';
import {EntityPartnershipProject} from "@/types/entity-donation.types.ts";
import entityDonationService from "@/services/entity-donation.service.ts";

interface EntityPartnersTabProps {
    entityId: string;
}

export const EntityPartnersTab: React.FC<EntityPartnersTabProps> = ({
                                                                        entityId
                                                                    }) => {
    const [partners, setPartners] = useState<EntityPartnershipProject[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPartnerships();
    }, [entityId]);

    const loadPartnerships = async () => {
        try {
            setLoading(true);
            const data = await entityDonationService.getPartnerships(entityId);
            setPartners(data);
        } catch (error: any) {
            const errorMessage = error?.message || t('toast.entity_partner.load_error');
            showToast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const totalDonations = partners.reduce((sum, p) => sum + (p.totalDonations || 0), 0);
    const totalProjects = partners.length;
    const activePartnerships = partners.filter(p => p.engagementLevel === 'fully' || p.engagementLevel === 'partial').length;

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="text-gray-600">{t('label.loading')}</div>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="p-4">
                    <div className="text-2xl font-bold text-gray-900">{totalProjects}</div>
                    <div className="text-sm text-gray-600">{t('label.entity_partner.total_projects')}</div>
                </Card>
                <Card className="p-4">
                    <div className="text-2xl font-bold text-gray-900">{activePartnerships}</div>
                    <div className="text-sm text-gray-600">{t('label.entity_partner.active_partnerships')}</div>
                </Card>
                <Card className="p-4">
                    <div className="text-2xl font-bold text-green-600">
                        {totalDonations.toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} RON
                    </div>
                    <div className="text-sm text-gray-600">{t('label.entity_partner.total_contributed')}</div>
                </Card>
            </div>

            <Card
                title={t('label.entity_partner.partnerships_title')}
                className="mb-6"
            >
                <EntityPartnerList
                    partners={partners}
                />
            </Card>
        </>
    );
};