import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/layout/Layout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CreateProjectModal } from "@/components/modals/project/CreateProjectModal";
import { CreateActivityModal } from "@/components/modals/activity/CreateActivityModal";
import ProjectList from "@/components/tables/ProjectList";
import showToast from "@/components/ui/Toast";
import { Project, UserGroup } from "@/types/index.types";

const ProjectsPage: React.FC = () => {
    const { user, hasAnyUserGroup } = useAuth();
    const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
    const [isCreateActivityModalOpen, setIsCreateActivityModalOpen] = useState(false);
    const [refreshProjectTable, setRefreshProjectTable] = useState(0);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    const isAdmin = hasAnyUserGroup([UserGroup.ADMIN]);
    const isOrgAdmin = hasAnyUserGroup([UserGroup.ORGANIZATION_ADMIN]);
    const hasOrganization = user?.organization_id;

    const canCreateProject = isAdmin || (isOrgAdmin && hasOrganization);
    const canDeleteProject = (project: Project): boolean => {
        return isAdmin || (isOrgAdmin && project.organizationId === user?.organization_id);
    };

    const handleOpenCreateProject = () => {
        setIsCreateProjectModalOpen(true);
    };

    const handleCloseCreateProject = () => {
        setIsCreateProjectModalOpen(false);
    };

    const handleProjectCreated = () => {
        setRefreshProjectTable(prev => prev + 1);
    };

    const handleOpenCreateActivity = (project?: Project) => {
        if (project) {
            setSelectedProject(project);
        }
        setIsCreateActivityModalOpen(true);
    };

    const handleCloseCreateActivity = () => {
        setIsCreateActivityModalOpen(false);
        setSelectedProject(null);
    };

    const handleActivityCreated = () => {
        // Activities might affect project stats, so refresh
        setRefreshProjectTable(prev => prev + 1);
    };

    const handleEditProject = (project: Project) => {
        // TODO: Open edit modal or navigate to edit page
        showToast.info(`Editează proiectul: ${project.name}`);
    };

    const handleViewProject = (project: Project) => {
        // TODO: Open view modal or navigate to project details page
        showToast.info(`Vizualizează proiectul: ${project.name}`);
    };

    const handleDeleteProject = async (project: Project) => {
        try {
            // TODO: Implement actual delete functionality
            showToast.success(`Proiectul ${project.name} a fost șters cu succes`);
            setRefreshProjectTable(prev => prev + 1);
        } catch (error) {
            console.error('Error deleting project:', error);
            showToast.error('Ștergerea proiectului a eșuat');
        }
    };

    const handleProjectRowClick = (project: Project) => {
        // Could navigate to project details page
        // router.push(`/projects/${project.id}`);
        console.log('Project clicked:', project);
    };

    return (
        <Layout showNavigation={true}>
            <div className="container mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Proiecte</h1>
                    <p className="text-gray-600">Gestionează proiectele și activitățile organizației</p>
                </div>

                {canCreateProject && (
                    <Card
                        title="Acțiuni rapide"
                        className="mb-6"
                        headerActions={
                            <div className="flex gap-4">
                                <Button
                                    size={'md'}
                                    className="bg-orange-500 hover:bg-orange-600 text-white"
                                    variant="primary"
                                    onClick={handleOpenCreateProject}
                                >
                                    Creează proiect nou
                                </Button>
                                <Button
                                    size={'md'}
                                    className="bg-blue-500 hover:bg-blue-600 text-white"
                                    variant="primary"
                                    onClick={() => handleOpenCreateActivity()}
                                >
                                    Creează activitate nouă
                                </Button>
                            </div>
                        }
                    >
                        <div className="text-sm text-gray-600">
                            Folosește butoanele de mai sus pentru a crea proiecte noi și activități asociate.
                        </div>
                    </Card>
                )}

                <Card title="Lista proiecte" className="mb-6">
                    <ProjectList
                        onEdit={handleEditProject}
                        onView={handleViewProject}
                        onDelete={handleDeleteProject}
                        onRowClick={handleProjectRowClick}
                        refreshTrigger={refreshProjectTable}
                        canDeleteProject={canDeleteProject}
                        className="flex gap-4 flex-col"
                        pageSize={20}
                    />
                </Card>

                <CreateProjectModal
                    isOpen={isCreateProjectModalOpen}
                    onClose={handleCloseCreateProject}
                    onSuccess={handleProjectCreated}
                    organizationId={user?.organization_id}
                />

                <CreateActivityModal
                    isOpen={isCreateActivityModalOpen}
                    onClose={handleCloseCreateActivity}
                    onSuccess={handleActivityCreated}
                    projectId={selectedProject?.id}
                    availableProjects={[]} // TODO: Load available projects
                />
            </div>
        </Layout>
    );
};

export default ProjectsPage;