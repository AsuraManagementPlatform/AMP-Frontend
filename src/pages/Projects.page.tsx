import React, {useState} from "react";
import {useAuth} from "@/hooks/useAuth";
import Layout from "@/components/layout/Layout";
import {Card} from "@/components/ui/Card";
import {PrimaryActionButton} from "@/components/ui/PrimaryActionButton";
import {CreateProjectModal} from "@/components/modals/project/CreateProjectModal";
import ProjectList from "@/components/tables/ProjectList";
import {Project, UserGroup} from "@/types/index.types";
import {useNavigate} from "react-router-dom";
import {ROUTES} from "@/utils/constants.utils.ts";
import projectService from "@/services/project.service.ts";
import showToast from "@/components/ui/Toast.tsx";

const ProjectsPage: React.FC = () => {
    const { user, hasAnyUserGroup } = useAuth();
    const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
    const [refreshProjects, setRefreshProjectTable] = useState(0);

    const isOrgAdmin = hasAnyUserGroup([UserGroup.ORGANIZATION_ADMIN]);
    const hasOrganization = user?.organizationId;

    const canCreateProject = isOrgAdmin && hasOrganization;

    const navigate = useNavigate();

    const handleOpenCreateProject = () => {
        setIsCreateProjectModalOpen(true);
    };

    const handleCloseCreateProject = () => {
        setIsCreateProjectModalOpen(false);
    };

    const handleDeleteProject = async (project: Project) => {
        await projectService.delete(project.id);
        showToast.projectDeleted()
        setRefreshProjectTable(prev => prev + 1);
    }

    const handleProjectCreated = () => {
        setRefreshProjectTable(prev => prev + 1);
    };

    const handleProjectRowClick = (project: Project) => {
        console.log(ROUTES.ERP_PROJECT_DETAILS.replace(':project_id', project.id));
        navigate(ROUTES.ERP_PROJECT_DETAILS.replace(':project_id', project.id));
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
                                <PrimaryActionButton
                                    variant="create"
                                    onClick={handleOpenCreateProject}
                                    title="Creează un nou proiect pentru organizația ta"
                                >
                                    Creează proiect nou
                                </PrimaryActionButton>
                            </div>
                        }
                    >
                    </Card>
                )}

                <Card title="Lista proiecte" className="mb-6">
                    <ProjectList
                        refreshTrigger={refreshProjects}
                        onDelete={handleDeleteProject}
                        onRowClick={handleProjectRowClick}
                        className="flex gap-4 flex-col"
                    />
                </Card>

                <CreateProjectModal
                    isOpen={isCreateProjectModalOpen}
                    onClose={handleCloseCreateProject}
                    onSuccess={handleProjectCreated}
                    organizationId={user?.organizationId}
                />
            </div>
        </Layout>
    );
};

export default ProjectsPage;