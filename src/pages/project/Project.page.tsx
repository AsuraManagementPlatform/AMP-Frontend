import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import {Card} from '@/components/ui/Card';
import {PrimaryActionButton} from '@/components/ui/PrimaryActionButton';
import showToast from '@/components/ui/Toast';
import projectService from '@/services/project.service';
import {Project} from '@/types/project.types';
import {UpdateProjectModal} from '@/components/modals/project/UpdateProjectModal';
import {ROUTES} from '@/utils/constants.utils';
import ActivityList from "@/components/tables/ActivityList.tsx";
import {CreateActivityModal} from "@/components/modals/activity/CreateActivityModal.tsx";
import {ProjectExpenseList} from '@/components/tables/ProjectExpenseList';
import {CreateProjectExpenseModal} from "@/components/modals/project-expense/CreateProjectExpenseModal.tsx";
import {ProjectFundList} from '@/components/tables/ProjectFundList';
import {CreateProjectFundModal} from "@/components/modals/project-fund/CreateProjectFundModal.tsx";
import ProjectMemberList from "@/components/tables/ProjectMemberList.tsx";
import {CreateProjectMemberModal} from "@/components/modals/project-member/CreateProjectMemberModal.tsx";
import {t} from "i18next";

type TabType = 'details' | 'activities' | 'expenses' | 'funds' | 'members';


const ProjectPage: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('details');
    const [isCreateActivityModalOpen, setIsCreateActivityModalOpen] = useState(false);
    const [refreshActivities, setRefreshActivities] = useState(0);
    const [isCreateExpenseModalOpen, setIsCreateExpenseModalOpen] = useState(false);
    const [refreshExpenses, setRefreshExpenses] = useState(0);
    const [isCreateFundModalOpen, setIsCreateFundModalOpen] = useState(false);
    const [refreshFunds, setRefreshFunds] = useState(0);
    const [isCreateMemberModalOpen, setIsCreateMemberModalOpen] = useState(false);
    const [refreshMembers, setRefreshMembers] = useState(0);

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

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'bg-green-100 text-green-800';
            case 'COMPLETED': return 'bg-blue-100 text-blue-800';
            case 'ON_HOLD': return 'bg-yellow-100 text-yellow-800';
            case 'CANCELLED': return 'bg-red-100 text-red-800';
            case 'DRAFT': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'Activ';
            case 'COMPLETED': return 'Finalizat';
            case 'ON_HOLD': return 'Suspendat';
            case 'CANCELLED': return 'Anulat';
            case 'DRAFT': return 'Draft';
            default: return status;
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('ro-RO', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
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

    const renderDetailsTab = () => (
        <>
            <Card title="Informații generale" className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Nume proiect
                        </label>
                        <p className="text-gray-900">{project.name}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Categorie
                        </label>
                        <p className="text-gray-900">{project.category || 'N/A'}</p>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Descriere
                        </label>
                        <p className="text-gray-900">{project.description || 'Fără descriere'}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Locație
                        </label>
                        <p className="text-gray-900">{project.location || 'N/A'}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Status
                        </label>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(project.status)}`}>
                            {getStatusLabel(project.status)}
                        </span>
                    </div>
                </div>
            </Card>

            <Card title="Planificare" className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Data de început
                        </label>
                        <p className="text-gray-900">{formatDate(project.startingDate)}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Data de sfârșit
                        </label>
                        <p className="text-gray-900">{formatDate(project.endingDate)}</p>
                    </div>
                </div>
            </Card>

            <Card title="Buget" className="mb-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            {t('label.project.planned_budget')}
                        </label>
                        <p className="text-gray-900 text-2xl font-semibold">
                            {project.budget?.toLocaleString('ro-RO')}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Moneda
                        </label>
                        <p className="text-gray-900">{project.currency || 'RON'}</p>
                    </div>

                    {project.budgetNotes && (
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Note buget
                            </label>
                            <p className="text-gray-900">{project.budgetNotes}</p>
                        </div>
                    )}
                </div>
                {project.activeFunds !== 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                {t('label.project.active_funds')}
                            </label>
                            <p className="text-gray-900 text-2xl font-semibold">
                                {project.activeFunds?.toLocaleString('ro-RO')} {project.currency || 'RON'}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                {t('label.project.active_funds_on_planned_budget')}
                            </label>
                            {(() => {
                                const percentage = project.budget ? (project.activeFunds / project.budget * 100).toFixed(1) : 0;
                                const isAdequate = project.activeFunds >= project.budget;
                                return (
                                    <p className={`text-2xl font-semibold ${isAdequate ? 'text-green-600' : 'text-red-600'}`}>
                                        {percentage}%
                                    </p>
                                );
                            })()}
                        </div>
                    </div>
                )}
                {project.activeExpenses !== 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                {t('label.project.active_expenses')}
                            </label>
                            <p className="text-gray-900 text-2xl font-semibold">
                                {project.activeExpenses?.toLocaleString('ro-RO')} {project.currency || 'RON'}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                {t('label.project.active_expenses_on_active_funds')}
                            </label>
                            {(() => {
                                const percentage = project.activeFunds ? (project.activeExpenses / project.activeFunds * 100).toFixed(1) : 0;
                                const isWithinBudget = project.activeExpenses < project.activeFunds;
                                return (
                                    <p className={`text-2xl font-semibold ${isWithinBudget ? 'text-green-600' : 'text-red-600'}`}>
                                        {percentage}%
                                    </p>
                                );
                            })()}
                        </div>
                        <div></div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                {t('label.project.active_expenses_on_planned_budget')}
                            </label>
                            {(() => {
                                const percentage = project.budget ? (project.activeExpenses / project.budget * 100).toFixed(1) : '0';
                                const percentageNum = parseFloat(percentage);
                                let colorClass = 'text-blue-600';

                                if (percentageNum >= 90) {
                                    colorClass = 'text-orange-600';
                                } else if (percentageNum >= 75) {
                                    colorClass = 'text-amber-600';
                                } else if (percentageNum >= 50) {
                                    colorClass = 'text-yellow-600';
                                }

                                return (
                                    <p className={`text-2xl font-semibold ${colorClass}`}>
                                        {percentage}%
                                    </p>
                                );
                            })()}
                        </div>
                    </div>
                )}
            </Card>
        </>
    );

    const renderActivitiesTab = () => (
        <Card
            title="Activități proiect"
            className="mb-6"
            headerActions={
                <PrimaryActionButton
                    onClick={() => setIsCreateActivityModalOpen(true)}
                    size="sm"
                >
                    Adaugă activitate
                </PrimaryActionButton>
            }
        >
            <ActivityList
                project={project.id}
                refreshTrigger={refreshActivities}
            />

            {isCreateActivityModalOpen && (
                <CreateActivityModal
                    isOpen={isCreateActivityModalOpen}
                    onClose={() => setIsCreateActivityModalOpen(false)}
                    onSuccess={() => setRefreshActivities(prev => prev + 1)}
                    project={project.id}
                />
            )}
        </Card>
    );

    const renderExpensesTab = () => (
        <Card
            title={t('tab.project_expenses')}
            className="mb-6"
            headerActions={
                <PrimaryActionButton
                    onClick={() => setIsCreateExpenseModalOpen(true)}
                    size="sm"
                >
                    Adaugă cheltuială
                </PrimaryActionButton>
            }
        >
            <ProjectExpenseList
                project={project.id}
                projectBudget={project.budget || 0}
                projectCurrency={project.currency || 'RON'}
                refreshTrigger={refreshExpenses}
            />

            {isCreateExpenseModalOpen && (
                <CreateProjectExpenseModal
                    isOpen={isCreateExpenseModalOpen}
                    onClose={() => setIsCreateExpenseModalOpen(false)}
                    onSuccess={() => setRefreshExpenses(prev => prev + 1)}
                    project={project.id}
                />
            )}
        </Card>
    );

    const renderFundsTab = () => (
        <Card
            title={t('tab.project_funds')}
            className="mb-6"
            headerActions={
                <PrimaryActionButton
                    onClick={() => setIsCreateFundModalOpen(true)}
                    size="sm"
                >
                    Adaugă finanțare
                </PrimaryActionButton>
            }
        >
            <ProjectFundList
                project={project.id}
                projectBudget={project.budget || 0}
                projectCurrency={project.currency || 'RON'}
                refreshTrigger={refreshFunds}
            />

            {isCreateFundModalOpen && (
                <CreateProjectFundModal
                    isOpen={isCreateFundModalOpen}
                    onClose={() => setIsCreateFundModalOpen(false)}
                    onSuccess={() => setRefreshFunds(prev => prev + 1)}
                    project={project.id}
                />
            )}
        </Card>
    );

    const renderMembersTab = () => (
        <Card
            title="Membri proiect"
            className="mb-6"
            headerActions={
                <PrimaryActionButton
                    onClick={() => setIsCreateMemberModalOpen(true)}
                    size="sm"
                >
                    Adaugă membru
                </PrimaryActionButton>
            }
        >
            <ProjectMemberList
                project={project.id}
                organizationId={project.organization}
                refreshTrigger={refreshMembers}
            />

            {isCreateMemberModalOpen && (
                <CreateProjectMemberModal
                    isOpen={isCreateMemberModalOpen}
                    onClose={() => setIsCreateMemberModalOpen(false)}
                    onSuccess={() => setRefreshMembers(prev => prev + 1)}
                    project={project.id}
                    organizationId={project.organization}
                />
            )}
        </Card>
    );

    return (
        <Layout showNavigation={true}>
            <div className="container mx-auto">
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
                        <button
                            onClick={() => navigate(ROUTES.ERP_PROJECTS)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                            ← Înapoi la lista de proiecte
                        </button>

                    </div>
                    {activeTab === 'details' && (
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
                        <button
                            onClick={() => setActiveTab('funds')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'funds'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            {t('tab.project_funds')}
                        </button>
                        <button
                            onClick={() => setActiveTab('members')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'members'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Membri
                        </button>
                    </nav>
                </div>

                {activeTab === 'details' && renderDetailsTab()}
                {activeTab === 'activities' && renderActivitiesTab()}
                {activeTab === 'expenses' && renderExpensesTab()}
                {activeTab === 'funds' && renderFundsTab()}
                {activeTab === 'members' && renderMembersTab()}

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