import React, {useEffect, useState} from 'react';
import Layout from '@/components/layout/Layout';
import {Card} from '@/components/ui/Card';
import {Button} from '@/components/ui/Button';
import {entityService} from '@/services/entity.service';
import showToast from '@/components/ui/Toast';
import {Activity, EntityDonationStats, SelectOption} from "@/types/index.types.ts";
import entityDonationService from "@/services/entity-donation.service.ts";
import {CreateEntityDonationModal} from "@/components/modals/entity-donation/CreateEntityDonationModal.tsx";
import EntityDonationList from "@/components/tables/EntityDonationList.tsx";
import projectService from "@/services/project.service.ts";
import activityService from "@/services/activity.service.ts";

const OrganizationDonationsPage: React.FC = () => {
    const [entitiesSelectOptions, setEntitiesSelectOptions] = useState<SelectOption[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [organizationDonationStats, setOrganizationDonationStats] = useState<EntityDonationStats>();
    const [projects, setProjects] = useState<SelectOption[]>([]);
    const [activities, setActivities] = useState<SelectOption[]>([]);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const entitiesData = await entityService.getList();
            setEntitiesSelectOptions(entitiesData.results.map(e => ({ value: e.id, label: e.name })));

            const entityOrganizationStats = await entityDonationService.getStats();
            setOrganizationDonationStats(entityOrganizationStats);

            const projects = await projectService.getList({ pageSize: 100 });
            setProjects(projects.results.map((project) =>  ({value: project.id, label: project.name})));
            const activities = await activityService.getList({ pageSize: 100 });
            setActivities(activities.results.map((activity: Activity) => ({value: activity.id, label: activity.title})));
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Eroare la încărcarea datelor';
            showToast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateSuccess = () => {
        loadData();
        setIsCreateModalOpen(false);
        setRefreshTrigger(prev => prev + 1);
    };

    if (isLoading) {
        return (
            <Layout>
                <div className="container mx-auto">
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                        <span className="ml-3 text-gray-600">Se încarcă datele...</span>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="container mx-auto">
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-2xl font-bold text-gray-900">Gestiune Donații</h1>
                        <Button onClick={() => setIsCreateModalOpen(true)}>
                            Adaugă Donație
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <Card className="p-4">
                            <div className="text-2xl font-bold text-gray-900">{organizationDonationStats?.totalAmount} RON</div>
                            <div className="text-sm text-gray-600">Total Donații</div>
                        </Card>
                        <Card className="p-4">
                            <div className="text-2xl font-bold text-gray-900">{organizationDonationStats?.totalCount}</div>
                            <div className="text-sm text-gray-600">Număr Donații</div>
                        </Card>
                        <Card className="p-4">
                            <div className="text-2xl font-bold text-gray-900">
                                {organizationDonationStats?.uniqueEntities}
                            </div>
                            <div className="text-sm text-gray-600">Entități Unice</div>
                        </Card>
                        <Card className="p-4">
                            <div className="text-2xl font-bold text-gray-900">
                                {organizationDonationStats?.averageAmount} RON
                            </div>
                            <div className="text-sm text-gray-600">Medie Donație</div>
                        </Card>
                    </div>

                    <EntityDonationList
                        refreshTrigger={refreshTrigger}
                        pageSize={20}
                        entities={entitiesSelectOptions}
                    />
                </div>

                <CreateEntityDonationModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSuccess={handleCreateSuccess}
                    entities={entitiesSelectOptions}
                    projects={projects}
                    activities={activities}
                />
            </div>
        </Layout>
    );
};

export default OrganizationDonationsPage;