import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import {PrimaryActionButton} from '@/components/ui/PrimaryActionButton';
import showToast from '@/components/ui/Toast';
import {entityService} from '@/services/entity.service';
import {Activity, Entity, EntityDonationStats, SelectOption} from '@/types/index.types';
import {UpdateEntityModal} from '@/components/modals/entity/UpdateEntityModal';
import {EntityDetailsTab} from '@/components/entity-tabs/EntityDetailsTab';
import {EntityDonationsTab} from '@/components/entity-tabs/EntityDonationsTab';
import {EntityCommunicationsTab} from '@/components/entity-tabs/EntityCommunicationsTab';
import {ROUTES} from '@/utils/constants.utils';
import {t} from 'i18next';
import projectService from "@/services/project.service.ts";
import activityService from "@/services/activity.service.ts";
import organizationMemberService from "@/services/organization-member.service.ts";
import {OrganizationMemberWithDetails} from "@/types/organization-member.types.ts";
import entityDonationService from "@/services/entity-donation.service.ts";

type TabType = 'details' | 'donations' | 'communications';

const EntityPage: React.FC = () => {
    const { entityId } = useParams<{ entityId: string }>();
    const navigate = useNavigate();
    const [entity, setEntity] = useState<Entity | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('details');

    const [entities, setEntities] = useState<SelectOption[]>([]);
    const [projects, setProjects] = useState<SelectOption[]>([]);
    const [activities, setActivities] = useState<SelectOption[]>([]);
    const [organizationMembers, setOrganizationMembers] = useState<SelectOption[]>([]);
    const [entityDonationStats, setEntityDonationStats] = useState<EntityDonationStats>();

    useEffect(() => {
        loadData();
    }, [entityId]);

    const loadData = async () => {
        if (!entityId) {
            showToast.error(t('toast.entity.id_missing'));
            navigate(ROUTES.CRM_ENTITIES);
            return;
        }

        try {
            setLoading(true);

            const entity = await entityService.getById(entityId);
            setEntity(entity);

            const entitiesResponse = await entityService.getList({ pageSize: 1000 });
            const entityOptions: SelectOption[] = (entitiesResponse.results || []).map((e: Entity) => ({
                value: e.id,
                label: e.name
            }));
            setEntities(entityOptions);

            const projects = await projectService.getList({ pageSize: 1000 });
            setProjects(projects.results.map((project) =>  ({value: project.id, label: project.name})));
            const activities = await activityService.getList({ pageSize: 1000 });
            setActivities(activities.results.map((activity: Activity) => ({value: activity.id, label: activity.title})));
            const organizationMembers = await organizationMemberService.getList();
            const filtered = (organizationMembers.organizationMembersList || []).filter(
                m => m.organization === entity.organization
            );
            setOrganizationMembers(filtered.map((member: OrganizationMemberWithDetails) => ({value: member.id, label: member.memberDetails.fullName})));

            const entityOrganizationStats = await entityDonationService.getStats({entityId: entityId});
            setEntityDonationStats(entityOrganizationStats);

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : t('toast.entity.load_error');
            showToast.error(errorMessage);
            navigate(ROUTES.CRM_ENTITIES);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        setIsEditModalOpen(true);
    };

    const handleUpdateSuccess = async () => {
        if (!entityId) return;

        try {
            const updatedEntity = await entityService.getById(entityId);
            setEntity(updatedEntity);
            showToast.success(t('toast.entity.updated'));
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : t('toast.entity.load_error');
            showToast.error(errorMessage);
        }
    };

    if (loading) {
        return (
            <Layout showNavigation={true}>
                <div className="container mx-auto">
                    <div className="flex justify-center items-center py-12">
                        <div className="text-gray-600">{t('label.loading')}</div>
                    </div>
                </div>
            </Layout>
        );
    }

    if (!entity) {
        return (
            <Layout showNavigation={true}>
                <div className="container mx-auto">
                    <div className="text-center py-12">
                        <p className="text-red-600 mb-4">{t('toast.entity.not_found')}</p>
                        <PrimaryActionButton onClick={() => navigate(ROUTES.CRM_ENTITIES)}>
                            {t('action.back_to_list')}
                        </PrimaryActionButton>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout showNavigation={true}>
            <div className="container mx-auto">
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">{entity.name}</h1>
                        <button
                            onClick={() => navigate(ROUTES.CRM_ENTITIES)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                            ← {t('action.back_to_entities')}
                        </button>
                    </div>
                    {activeTab === 'details' && (
                        <PrimaryActionButton onClick={handleEdit}>
                            {t('action.edit_entity')}
                        </PrimaryActionButton>
                    )}
                </div>

                <div className="border-b border-gray-200 mb-6">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab('details')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'details'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            {t('tab.entity_details')}
                        </button>
                        <button
                            onClick={() => setActiveTab('donations')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'donations'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            {t('tab.entity_donations')}
                        </button>
                        <button
                            onClick={() => setActiveTab('communications')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'communications'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            {t('tab.entity_communications')}
                        </button>
                    </nav>
                </div>

                {activeTab === 'details' && <EntityDetailsTab entity={entity} />}
                {activeTab === 'donations' && (
                    <EntityDonationsTab
                        entityId={entity.id}
                        entityName={entity.name}
                        entities={entities}
                        projects={projects}
                        activities={activities}
                        stats={entityDonationStats}
                    />
                )}
                {activeTab === 'communications' && (
                    <EntityCommunicationsTab
                        entityId={entity.id}
                        entityName={entity.name}
                        entities={entities}
                        organizationMembers={organizationMembers}
                    />
                )}

                {isEditModalOpen && (
                    <UpdateEntityModal
                        isOpen={isEditModalOpen}
                        onClose={() => setIsEditModalOpen(false)}
                        onSuccess={handleUpdateSuccess}
                        entity={entity}
                    />
                )}
            </div>
        </Layout>
    );
};

export default EntityPage;