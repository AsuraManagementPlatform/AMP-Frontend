import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CreateEntityModal } from '@/components/modals/entity/CreateEntityModal';
import { ROUTES } from '@/utils/constants.utils';
import {EngagementLevel, Entity, EntityStatus, LegalType, UserGroup} from '@/types/index.types';
import { useTableData } from '@/hooks/useTableData';
import { t } from 'i18next';
import { useAuth } from "@/hooks/useAuth.ts";
import showToast from "@/components/ui/Toast.tsx";
import EntityList from "@/components/tables/EntityList.tsx";

const EntitiesPage: React.FC = () => {
    const { user, hasAnyUserGroup } = useAuth();
    const navigate = useNavigate();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [localRefresh, setLocalRefresh] = useState(0);

    const isOrgAdmin = hasAnyUserGroup([UserGroup.ORGANIZATION_ADMIN]);
    const hasOrganization = user?.organizationId;

    if (!(isOrgAdmin && hasOrganization)) {
        navigate(-1);
        showToast.accessForbidden();
    }

    const {
        data: entities,
        totalCount,
    } = useTableData<Entity>({
        endpoint: 'entity/list',
        initialPageSize: 1000,
        autoFetch: true,
        refreshTrigger: localRefresh
    });

    const handleCreateSuccess = () => {
        setLocalRefresh(prev => prev + 1);
    };

    const handleRowClick = (entity: Entity) => {
        navigate(ROUTES.CRM_ENTITY_DETAILS.replace(':entityId', entity.id));
    };

    return (
        <Layout showNavigation={true}>
            <div className="container mx-auto">
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">{t('label.entity.page_title')}</h1>
                        <p className="text-gray-600 mt-1">{t('label.entity.page_subtitle')}</p>
                    </div>
                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                    >
                        {t('label.entity.add_entity')}
                    </Button>
                </div>

                <Card className="mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-600">{t('label.entity.total_entities')}</div>
                            <div className="text-2xl font-bold text-blue-600">{totalCount}</div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-600">{t('label.entity.active_entities')}</div>
                            <div className="text-2xl font-bold text-green-600">
                                {entities.filter(e => e.status === EntityStatus.ACTIV).length}
                            </div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-600">{t('label.entity.juridical_entities')}</div>
                            <div className="text-2xl font-bold text-purple-600">
                                {entities.filter(e => e.legalType === LegalType.JURIDICA).length}
                            </div>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-600">{t('label.entity.total_engagement')}</div>
                            <div className="text-2xl font-bold text-orange-600">
                                {entities.filter(e => e.engagementLevel === EngagementLevel.TOTAL).length}
                            </div>
                        </div>
                    </div>
                </Card>

                {user && user.organizationId && (
                    <EntityList
                        organizationId={user.organizationId}
                        refreshTrigger={localRefresh}
                        onRowClick={handleRowClick}
                    />
                )}
            </div>

            {user && user.organizationId && (
                <CreateEntityModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSuccess={handleCreateSuccess}
                    organization={user.organizationId}
                />
            )}
        </Layout>
    );
};

export default EntitiesPage;