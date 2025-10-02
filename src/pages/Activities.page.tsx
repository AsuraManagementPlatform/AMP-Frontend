import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/layout/Layout";
import { Card } from "@/components/ui/Card";
import { PrimaryActionButton } from "@/components/ui/PrimaryActionButton";
import { CreateActivityModal } from "@/components/modals/activity/CreateActivityModal";
import ActivityList from "@/components/tables/ActivityList";
import showToast from "@/components/ui/Toast";
import { Activity, UserGroup } from "@/types/index.types";

const ActivitiesPage: React.FC = () => {
    const { user, hasAnyUserGroup } = useAuth();
    const [isCreateActivityModalOpen, setIsCreateActivityModalOpen] = useState(false);

    const isAdmin = hasAnyUserGroup([UserGroup.ADMIN]);
    const canCreateActivity = isAdmin || hasAnyUserGroup([UserGroup.ORGANIZATION_ADMIN]);

    const handleOpenCreateActivity = () => {
        setIsCreateActivityModalOpen(true);
    };

    const handleCloseCreateActivity = () => {
        setIsCreateActivityModalOpen(false);
    };

    const handleActivityCreated = () => {
        setIsCreateActivityModalOpen(false);
        showToast.success("Activitatea a fost creată cu succes!");
    };

    const handleEditActivity = (activity: Activity) => {
        showToast.info(`Editarea activității ${activity.title} - în curs de implementare`);
    };

    const handleViewActivity = (activity: Activity) => {
        showToast.info(`Vizualizarea activității ${activity.title} - în curs de implementare`);
    };

    const handleDeleteActivity = (activity: Activity) => {
        if (confirm(`Ești sigur că vrei să ștergi activitatea "${activity.title}"?`)) {
            showToast.success(`Activitatea "${activity.title}" a fost ștearsă cu succes!`);
        }
    };

    const handleActivityRowClick = (activity: Activity) => {
        handleViewActivity(activity);
    };

    const canDeleteActivity = (activity: Activity): boolean => {
        return isAdmin || (canCreateActivity && activity.projectId === user?.organization_id);
    };

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <Layout>
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Management Activități</h1>
                    <p className="text-gray-600">
                        Gestionarea completă a activităților organizației - participanți, progres și raportare
                    </p>
                </div>

                {canCreateActivity && (
                    <Card
                        title="Acțiuni rapide"
                        className="mb-6"
                        headerActions={
                            <div className="flex gap-4">
                                <PrimaryActionButton
                                    variant="create"
                                    onClick={handleOpenCreateActivity}
                                    title="Creează o activitate nouă pentru proiectele organizației"
                                >
                                    Creează activitate nouă
                                </PrimaryActionButton>
                            </div>
                        }
                    >
                        <div className="text-sm text-gray-600">
                            Folosește butonul de mai sus pentru a crea activități noi pentru proiectele organizației.
                        </div>
                    </Card>
                )}

                <Card title="Lista activități" className="mb-6">
                    <ActivityList
                        onEdit={handleEditActivity}
                        onView={handleViewActivity}
                        onDelete={handleDeleteActivity}
                        onRowClick={handleActivityRowClick}
                        canDeleteActivity={canDeleteActivity}
                        className="flex gap-4 flex-col"
                        pageSize={20}
                    />
                </Card>
            </div>

            {isCreateActivityModalOpen && (
                <CreateActivityModal
                    isOpen={isCreateActivityModalOpen}
                    onClose={handleCloseCreateActivity}
                    onSuccess={handleActivityCreated}
                    projectId={undefined}
                    availableProjects={[]}
                />
            )}
        </Layout>
    );
};

export default ActivitiesPage;