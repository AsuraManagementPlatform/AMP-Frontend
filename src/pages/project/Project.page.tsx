import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { PrimaryActionButton } from '@/components/ui/PrimaryActionButton';
import showToast from '@/components/ui/Toast';
import projectService from '@/services/project.service';
import { Project } from '@/types/project.types';
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

type TabType = 'details' | 'activities' | 'funds' | 'expenses' | 'members' | 'partners';

const ProjectPage: React.FC = () => {
    const authContext = useAuth();
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('details');
    const [isProjectResponsible, setIsProjectResponsible] = useState<boolean>(false);

    useEffect(() => {
        const loadProject = async () => {
            if (!projectId) {
                showToast.error('ID proiect lipsă');
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

    const handleUpdateSuccess = async () => {
        if (!projectId) return;

        try {
            const updatedProject = await projectService.getById(projectId);
            setProject(updatedProject);
            showToast.success('Proiectul a fost actualizat cu succes!');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Eroare la reîncărcarea proiectului';
            showToast.error(errorMessage);
        }
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
                    {activeTab === 'details' && authContext.hasAllUserGroups([UserGroup.ORGANIZATION_ADMIN]) && (
                        <PrimaryActionButton onClick={handleEdit}>
                            Editează proiect
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
                            Detalii Proiect
                        </button>
                        <button
                            onClick={() => setActiveTab('activities')}
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
                                    onClick={() => setActiveTab('expenses')}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                        activeTab === 'expenses'
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    {t('tab.project_expenses')}
                                </button>
                            </>
                        )}
                        {authContext.hasAnyUserGroup([UserGroup.ADMIN, UserGroup.ORGANIZATION_ADMIN]) && (
                            <>
                                <button
                                    onClick={() => setActiveTab('funds')}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'funds'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                                >
                                    {t('tab.project_funds')}
                                </button>
                                <button
                                    onClick={() => setActiveTab('members')}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'members'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                                >
                                    {t('tab.project_members')}
                                </button>
                                <button
                                    onClick={() => setActiveTab('partners')}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'partners'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                                >
                                    {t('tab.project_partners')}
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
            </div>
        </Layout>
    );
};

export default ProjectPage;