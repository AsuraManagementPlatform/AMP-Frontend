import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { PrimaryActionButton } from '@/components/ui/PrimaryActionButton';
import showToast from '@/components/ui/Toast';
import projectService from '@/services/project.service';
import { Project, ProjectStatus, ProjectDeletionPreview } from '@/types/project.types';
import { UpdateProjectModal } from '@/components/modals/project/UpdateProjectModal';
import { ROUTES } from '@/utils/constants.utils';
import { ProjectDetailsTab } from '@/components/project-tabs/ProjectDetailsTab';
import { ProjectActivitiesTab } from '@/components/project-tabs/ProjectActivitiesTab';
import { ProjectExpensesTab } from '@/components/project-tabs/ProjectExpensesTab';
import { ProjectFundsTab } from '@/components/project-tabs/ProjectFundsTab';
import { ProjectMembersTab } from '@/components/project-tabs/ProjectMembersTab';
import { t } from 'i18next';
import IconBack from "@/assets/icons/iconmonstr-back.svg?react";
import {useAuth} from "@/hooks/useAuth.ts";
import {UserGroup} from "@/types/auth.types.ts";
import {ProjectPartnersTab} from "@/components/project-tabs/ProjectPartnerTab.tsx";
import {ProjectReportsTab} from "@/components/project-tabs/ProjectReportsTab";
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

type TabType = 'details' | 'activities' | 'funds' | 'expenses' | 'members' | 'partners' | 'reports';

const ProjectPage: React.FC = () => {
    const authContext = useAuth();
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletionPreview, setDeletionPreview] = useState<ProjectDeletionPreview | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>(() => {
        const tabFromUrl = searchParams.get('tab') as TabType;
        return tabFromUrl && ['details', 'activities', 'funds', 'expenses', 'members', 'partners', 'reports'].includes(tabFromUrl) 
            ? tabFromUrl 
            : 'details';
    });
    const [isProjectResponsible, setIsProjectResponsible] = useState<boolean>(false);

    const canDeleteProject = project?.status === ProjectStatus.DRAFT && 
        (authContext.hasAllUserGroups([UserGroup.ORGANIZATION_ADMIN]) || isProjectResponsible);

    useEffect(() => {
        const loadProject = async () => {
            if (!projectId) {
                showToast.error(t('toast.project.missing_id'));
                navigate(ROUTES.ERP_PROJECTS);
                return;
            }

            try {
                setLoading(true);
                const data = await projectService.getById(projectId);
                setProject(data);

                if (data.budgetResponsible === authContext.user?.id) {
                    setIsProjectResponsible(true);
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Eroare la încărcarea proiectului';
                showToast.error(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        loadProject();
    }, [projectId, navigate]);

    const handleEdit = () => {
        setIsEditModalOpen(true);
    };

    const handleDeleteClick = async () => {
        if (!projectId) return;
        
        try {
            const preview = await projectService.getDeletionPreview(projectId);
            setDeletionPreview(preview);
            setIsDeleteModalOpen(true);
        } catch (error: any) {
            const message = error?.message || t('toast.project.preview_error');
            showToast.error(message.includes('.') ? t(message) : message);
        }
    };

    const handleConfirmDelete = async () => {
        if (!projectId) return;
        
        setIsDeleting(true);
        try {
            await projectService.delete(projectId);
            showToast.success(t('toast.project.deleted_successfully'));
            navigate(ROUTES.ERP_PROJECTS);
        } catch (error: any) {
            const message = error?.message || t('toast.project.delete_failed');
            showToast.error(message.includes('.') ? t(message) : message);
        } finally {
            setIsDeleting(false);
            setIsDeleteModalOpen(false);
        }
    };

    const handleTabChange = (tab: TabType) => {
        setActiveTab(tab);
        setSearchParams({ tab });
    };

    const handleUpdateSuccess = async () => {
        if (!projectId) return;

        try {
            const updatedProject = await projectService.getById(projectId);
            setProject(updatedProject);
            showToast.success(t('toast.project.updated'));
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : t('toast.project.reload_error');
            showToast.error(errorMessage.includes('.') ? t(errorMessage) : errorMessage);
        }
    };

    const buildDeleteMessage = () => {
        if (!deletionPreview) return t('label.project.confirm_delete_message');
        
        const items = deletionPreview.itemsToDelete;
        const parts: string[] = [];
        
        if (items.activities > 0) parts.push(`${items.activities} ${t('label.project.activities')}`);
        if (items.projectExpenses > 0) parts.push(`${items.projectExpenses} ${t('label.project.expenses')}`);
        if (items.projectFunds > 0) parts.push(`${items.projectFunds} ${t('label.project.funds')}`);
        if (items.projectMembers > 0) parts.push(`${items.projectMembers} ${t('label.project.members')}`);
        if (items.projectPartners > 0) parts.push(`${items.projectPartners} ${t('label.project.partners')}`);
        if (items.projectDocuments + items.activityDocuments > 0) {
            parts.push(`${items.projectDocuments + items.activityDocuments} ${t('label.project.documents')}`);
        }
        
        if (parts.length === 0) {
            return t('label.project.confirm_delete_empty');
        }
        
        return `${t('label.project.confirm_delete_with_items')}: ${parts.join(', ')}`;
    };

    if (loading) {
        return (
            <Layout showNavigation={true}>
                <div className="container mx-auto">
                    <div className="flex justify-center items-center py-12">
                        <div className="text-gray-600">Se încarcă proiectul...</div>
                    </div>
                </div>
            </Layout>
        );
    }

    if (!project) {
        return (
            <Layout showNavigation={true}>
                <div className="container mx-auto">
                    <div className="text-center py-12">
                        <p className="text-red-600 mb-4">Proiectul nu a fost găsit</p>
                        <PrimaryActionButton onClick={() => navigate(ROUTES.ERP_PROJECTS)}>
                            Înapoi la listă
                        </PrimaryActionButton>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout showNavigation={true}>
            <div className="container mx-auto">
                <div className="mb-6 flex gap-2">
                    <button
                        onClick={() => navigate(ROUTES.ERP_PROJECTS)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                        <IconBack/>
                    </button>
                    <p>Înapoi</p>
                </div>
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
                    </div>
                    {activeTab === 'details' && (authContext.hasAllUserGroups([UserGroup.ORGANIZATION_ADMIN]) || isProjectResponsible) && (
                        <div className="flex gap-2">
                            {canDeleteProject && (
                                <PrimaryActionButton 
                                    variant="danger" 
                                    onClick={handleDeleteClick}
                                    title={t('label.project.delete_draft_tooltip')}
                                >
                                    {t('label.project.delete')}
                                </PrimaryActionButton>
                            )}
                            <PrimaryActionButton onClick={handleEdit}>
                                Editează proiect
                            </PrimaryActionButton>
                        </div>
                    )}
                </div>

                <div className="border-b border-gray-200 mb-6">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => handleTabChange('details')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'details'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Detalii Proiect
                        </button>
                        <button
                            onClick={() => handleTabChange('activities')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'activities'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Activități
                        </button>
                        {(isProjectResponsible || authContext.hasAllUserGroups([UserGroup.ORGANIZATION_ADMIN])) && (
                            <>
                                <button
                                    onClick={() => handleTabChange('expenses')}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                        activeTab === 'expenses'
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    {t('tab.project_expenses')}
                                </button>
                                <button
                                    onClick={() => handleTabChange('funds')}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'funds'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                                >
                                    {t('tab.project_funds')}
                                </button>
                                <button
                                    onClick={() => handleTabChange('members')}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'members'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                                >
                                    {t('tab.project_members')}
                                </button>
                                <button
                                    onClick={() => handleTabChange('partners')}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'partners'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                                >
                                    {t('tab.project_partners')}
                                </button>
                                <button
                                    onClick={() => handleTabChange('reports')}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'reports'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                                >
                                    Statistici și Rapoarte
                                </button>
                            </>
                        )}
                    </nav>
                </div>

                {activeTab === 'details' && <ProjectDetailsTab project={project} />}
                {activeTab === 'activities' && <ProjectActivitiesTab projectId={project.id} />}
                {activeTab === 'funds' && (
                    <ProjectFundsTab
                        projectId={project.id}
                        projectBudget={project.budget || 0}
                        projectCurrency={project.currency || 'RON'}
                    />
                )}
                {activeTab === 'expenses' && (
                    <ProjectExpensesTab
                        projectId={project.id}
                        projectBudget={project.budget || 0}
                        projectCurrency={project.currency || 'RON'}
                    />
                )}
                {activeTab === 'members' && (
                    <ProjectMembersTab
                        projectId={project.id}
                        organizationId={project.organization}
                    />
                )}
                {activeTab === 'partners' && (
                    <ProjectPartnersTab
                        projectId={project.id}
                        project={project}
                    />
                )}
                {activeTab === 'reports' && (
                    <ProjectReportsTab
                        projectId={project.id}
                        projectName={project.name}
                        projectStatus={project.status}
                        projectStartDate={project.startingDate}
                        projectEndDate={project.endingDate}
                    />
                )}

                {isEditModalOpen && (
                    <UpdateProjectModal
                        isOpen={isEditModalOpen}
                        onClose={() => setIsEditModalOpen(false)}
                        onSuccess={handleUpdateSuccess}
                        project={project}
                        organizationId={project.organization}
                    />
                )}

                <ConfirmDialog
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleConfirmDelete}
                    title={t('label.project.delete_confirm_title')}
                    message={buildDeleteMessage()}
                    confirmText={isDeleting ? t('label.common.deleting') : t('label.common.delete')}
                    cancelText={t('label.common.cancel')}
                    confirmButtonVariant="danger"
                    isLoading={isDeleting}
                />
            </div>
        </Layout>
    );
};

export default ProjectPage;