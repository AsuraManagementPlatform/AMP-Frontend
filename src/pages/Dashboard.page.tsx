import React, {useEffect, useState} from "react";
import {useAuth} from "@/hooks/useAuth";
import {useNavigate} from "react-router-dom";
import {UserCreateRequest} from "@/schemas/user.schema";
import { UserMeResponse } from "@/types/user.types";
import userService from "@/services/user.service";
import organizationService from "@/services/organization.service";
import projectService from "@/services/project.service";
import Layout from "@/components/layout/Layout";
import {Card} from "@/components/ui/Card";
import {PrimaryActionButton} from "@/components/ui/PrimaryActionButton";
import {SecondaryButton} from "@/components/ui/SecondaryButton";
import {ConfirmationModal} from "@/components/ui/Modal";
import showToast from "@/components/ui/Toast";
import {OrganizationCreationModal} from "@/components/organization/OrganizationCreationModal";
import {OrganizationDetailsModal} from "@/components/organization/OrganizationDetailsModal";
import {useOrganizationCreation} from "@/hooks/useOrganizationCreation";
import {CreateUserModal} from "@/components/modals/user/CreateUserModal.tsx";
import {CreateProjectModal} from "@/components/modals/project/CreateProjectModal.tsx";
import {CreateActivityModal} from "@/components/modals/activity/CreateActivityModal.tsx";
import {DashboardStats, User, UserGroup, UserStatus} from "@/types/index.types.ts";
import UserList from "@/components/tables/UserList.tsx";
import {useTranslation} from "react-i18next";
import {ROUTES} from "@/utils/constants.utils.ts";

const DashboardPage: React.FC = () => {
    const { t } = useTranslation();
    const { user,hasAnyUserGroup, hasAllUserGroups } = useAuth();
    const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
    const [isCreateOrgModalOpen, setIsCreateOrgModalOpen] = useState(false);
    const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
    const [isCreateActivityModalOpen, setIsCreateActivityModalOpen] = useState(false);
    const [isOrgDetailsModalOpen, setIsOrgDetailsModalOpen] = useState(false);
    const [testOrgId, setTestOrgId] = useState<string>('');
    const [availableProjects, setAvailableProjects] = useState<{ id: string; name: string }[]>([]);
    const [createdUserData, setCreatedUserData] = useState<User | null>(null);
    const [tempCompanyData, setTempCompanyData] = useState<{ company_name: string; company_number: string } | null>(null);

    const [refreshUserTable, setRefreshUserTable] = useState(0);

    const [stats, setStats] = useState<DashboardStats>({
        recentActivities: 0,
        activeProjects: 0,
        totalStats: 0
    });
    const [loading, setLoading] = useState(true);

    const handleOrganizationCreated = () => {
        setRefreshUserTable(prev => prev + 1);
    };

    const organization = useOrganizationCreation(handleOrganizationCreated);
    const navigate = useNavigate();

    const isAdmin = hasAnyUserGroup([UserGroup.ADMIN]);
    const isOrgAdmin = hasAnyUserGroup([UserGroup.ORGANIZATION_ADMIN]);
    const isMember = !isAdmin && !isOrgAdmin;
    const hasOrganization = user?.organization_id;

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('password_reset') === 'success') {
            showToast.success('Parola a fost actualizată cu succes!');
            const newUrl = window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);
        }
    }, []);

    useEffect(() => {
        const loadStats = async () => {
            setLoading(true);
            try {
                if (isAdmin) {
                    setTimeout(() => {
                        setStats({
                            activeProjects: 47,
                            recentActivities: 23,
                            totalStats: 12
                        });
                        setLoading(false);
                    }, 800);
                    return;
                }
                else if (isOrgAdmin && hasOrganization) {
                    const orgStats = await organizationService.getOrganizationStats(user!.organization_id!);
                    setStats({
                        activeProjects: orgStats.active_projects,
                        recentActivities: orgStats.ongoing_activities,
                        totalStats: orgStats.active_projects + orgStats.ongoing_activities + orgStats.active_members
                    });
                }
                else {
                    setTimeout(() => {
                        setStats({
                            activeProjects: 3,
                            recentActivities: 8,
                            totalStats: 0
                        });
                        setLoading(false);
                    }, 600);
                    return;
                }
            } catch (error) {
                setStats({
                    activeProjects: 0,
                    recentActivities: 0, 
                    totalStats: 0
                });
            }
            setLoading(false);
        };

        loadStats();
    }, [isAdmin, isOrgAdmin, hasOrganization, user?.organization_id]);

    const getUserDisplayName = (): string => {
        if (!user) return 'Utilizator';
        return user.full_name || user.email;
    };

    const handleCreateUser = async (data: UserCreateRequest) => {
        const companyDataFromForm = data.company_name && data.company_number ? {
            company_name: data.company_name,
            company_number: data.company_number
        } : null;
        setTempCompanyData(companyDataFromForm);
        
        try {
            const createdUser = await userService.create(data);
            setIsCreateUserModalOpen(false);
            setCreatedUserData(createdUser);
            showToast.userCreated();
            setRefreshUserTable(prev => prev + 1);

            if (isAdmin && data.group === UserGroup.ORGANIZATION_ADMIN) {
                setIsCreateOrgModalOpen(true);
            } else {
                setCreatedUserData(null);
                setTempCompanyData(null);
            }
        } catch (error) {
            let errorMessage = 'A apărut o eroare necunoscută.';

            if (error instanceof Error) {
                errorMessage = `Eroare la crearea utilizatorului: ${error.message}`;
            } else if (typeof error === 'object' && error !== null) {
                const apiError = error as any;
                if (apiError.message) {
                    errorMessage = `Eroare la crearea utilizatorului: ${apiError.message}`;
                }
                if (apiError.details && Array.isArray(apiError.details) && apiError.details.length > 0) {
                    const detailMessages = apiError.details.map((detail: any) =>
                        typeof detail === 'string' ? detail : detail.message || JSON.stringify(detail)
                    ).join(', ');
                    errorMessage += ` Detalii: ${detailMessages}`;
                }
                if (apiError.status) {
                    errorMessage += ` (Status: ${apiError.status})`;
                }
            }

            showToast.error(errorMessage);
        }
    };

    const handleCreateOrganization = () => {
        setIsCreateOrgModalOpen(false);

        if (createdUserData) {
            const actualUser = (createdUserData as any).user || createdUserData;
            
            const userForOrg: UserMeResponse = {
                isLegalEntity: tempCompanyData ? true : false,
                personal_numerical_number: actualUser.personal_numerical_number,
                status: actualUser.status,
                id: actualUser.id,
                email: actualUser.email,
                full_name: actualUser.full_name,
                groups: actualUser.groups || [],
                organization_id: undefined,
                is_active: actualUser.is_active || true
            };

            const companyData = tempCompanyData;
            organization.openCreateOrganizationModalWithUser(userForOrg, companyData || undefined);
        } else {
            organization.openCreateOrganizationModal();
        }

        setCreatedUserData(null);
        setTempCompanyData(null);
    };

    const handleSkipOrganization = () => {
        setIsCreateOrgModalOpen(false);
        setCreatedUserData(null);
        setTempCompanyData(null);
    };

    const handleEditUser = (user: User) => {
        showToast.info(`Edit user: ${user.full_name}`);
    };

    const handleViewUser = (user: User) => {
        showToast.info(`View user: ${user.full_name}`);
    };

    const handleDeleteUser = async (user: User) => {
        try {
            await userService.delete(user.id);
            showToast.success(`User ${user.full_name} deleted successfully`);
            setRefreshUserTable(prev => prev + 1);
        } catch (error) {
            showToast.error('Failed to delete user');
        }
    };

    const handleUserRowClick = () => {
    };

    const canDeleteUser = (user: User): boolean => {
        return hasAllUserGroups([UserGroup.ADMIN]) && user.status === UserStatus.INACTIVE && user.groups.includes(UserGroup.ORGANIZATION_ADMIN);
    };

    const handleOpenCreateUser = () => {
        setIsCreateUserModalOpen(true);
    };

    const handleCloseCreateUser = () => {
        setIsCreateUserModalOpen(false);
    };

    const handleOpenCreateProject = () => {
        setIsCreateProjectModalOpen(true);
    };

    const handleCloseCreateProject = () => {
        setIsCreateProjectModalOpen(false);
    };

    const handleProjectCreated = () => {
        setRefreshUserTable(prev => prev + 1);
    };

    const handleOpenCreateActivity = () => {
        loadAvailableProjects();
        setIsCreateActivityModalOpen(true);
    };

    const handleCloseCreateActivity = () => {
        setIsCreateActivityModalOpen(false);
    };

    const handleActivityCreated = () => {
        setRefreshUserTable(prev => prev + 1);
    };

    const loadAvailableProjects = async () => {
        try {
            if (isOrgAdmin && hasOrganization) {
                const response = await projectService.getList({ 
                    pageSize: 100
                });
                
                setAvailableProjects(
                    response.results?.map(project => ({
                        id: project.id,
                        name: project.name
                    })) || []
                );
            }
        } catch (error) {
            showToast.error('Eroare la încărcarea proiectelor');
            setAvailableProjects([]);
        }
    };

    return (
        <Layout showNavigation={true}>
            <div className="container mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Bine ai revenit, {getUserDisplayName()}!</h1>
                    <p className="text-gray-600">Iată ce se întâmplă cu proiectele și activitățile tale.</p>
                </div>

                {(isAdmin || (isOrgAdmin && hasOrganization)) && (
                    <Card
                        title="Acțiuni administrator"
                        className="mb-6 space-y-4"
                        headerActions={
                            <>
                                <div className="flex gap-4">
                                    <PrimaryActionButton onClick={handleOpenCreateUser} variant="create">
                                        {t('label.user_create')}
                                    </PrimaryActionButton>
                                    {isAdmin && (
                                        <PrimaryActionButton
                                            variant="create"
                                            onClick={organization.openCreateOrganizationModal}
                                        >
                                            {t('label.organisation_create')}
                                        </PrimaryActionButton>
                                    )}
                                    {isOrgAdmin && hasOrganization && (
                                        <>
                                            <PrimaryActionButton
                                                variant="create"
                                                onClick={handleOpenCreateProject}
                                            >
                                                Creează proiect
                                            </PrimaryActionButton>
                                            <PrimaryActionButton
                                                variant="create"
                                                onClick={handleOpenCreateActivity}
                                            >
                                                Creează activitate
                                            </PrimaryActionButton>
                                        </>
                                    )}
                                </div>
                            </>
                        }
                    >

                        <UserList
                            onEdit={handleEditUser}
                            onView={handleViewUser}
                            onDelete={handleDeleteUser}
                            onRowClick={handleUserRowClick}
                            refreshTrigger={refreshUserTable}
                            canDeleteUser={canDeleteUser}
                            showActions={{
                                edit: true,
                                delete: true,
                                view: true
                            }}
                            showSearch={false}
                            showFilters={false}
                            className="flex gap-4 flex-col"
                            pageSize={20}
                        />
                    </Card>
                )}

                {isMember && (
                    <>
                        <Card
                            title="Proiectele mele"
                            className="mb-6"
                            headerActions={
                                <div className="text-sm text-gray-600">
                                    {stats.activeProjects || 0} proiecte active
                                </div>
                            }
                        >
                            <div className="space-y-3">
                                <div className="text-sm text-gray-600 mb-4">
                                    Proiectele la care participi și progresul tău
                                </div>
                                
                                <div className="space-y-3">
                                    <div className="border rounded-lg p-3 bg-white">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-medium text-gray-900">Modernizare Școala Verde</h4>
                                                <p className="text-sm text-gray-600">Responsabil pentru dezvoltarea aplicației</p>
                                                <div className="mt-2 flex items-center gap-2">
                                                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">În progres</span>
                                                    <span className="text-xs text-gray-500">Deadline: 15 Oct 2025</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-medium">75%</div>
                                                <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                                                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="border rounded-lg p-3 bg-white">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-medium text-gray-900">Program Ajutor Alimentar</h4>
                                                <p className="text-sm text-gray-600">Designer UI/UX pentru interfața web</p>
                                                <div className="mt-2 flex items-center gap-2">
                                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">În așteptare</span>
                                                    <span className="text-xs text-gray-500">Deadline: 30 Nov 2025</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-medium">45%</div>
                                                <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                                                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card
                            title="Activitățile mele recente"
                            className="mb-6"
                            headerActions={
                                <div className="text-sm text-gray-600">
                                    {stats.recentActivities || 0} activități
                                </div>
                            }
                        >
                            <div className="space-y-3">
                                <div className="text-sm text-gray-600 mb-4">
                                    Activitățile la care participi și progresul tău
                                </div>
                                
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center py-2 border-b">
                                        <div>
                                            <div className="font-medium text-sm">Implementare modul de autentificare</div>
                                            <div className="text-xs text-gray-500">Proiect: Modernizare Școala Verde</div>
                                        </div>
                                        <div className="text-right">
                                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Finalizat</span>
                                            <div className="text-xs text-gray-500 mt-1">25 Sep</div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex justify-between items-center py-2 border-b">
                                        <div>
                                            <div className="font-medium text-sm">Design interfața utilizator</div>
                                            <div className="text-xs text-gray-500">Proiect: Program Ajutor Alimentar</div>
                                        </div>
                                        <div className="text-right">
                                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">În progres</span>
                                            <div className="text-xs text-gray-500 mt-1">În lucru</div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex justify-between items-center py-2">
                                        <div>
                                            <div className="font-medium text-sm">Testare funcționalități</div>
                                            <div className="text-xs text-gray-500">Proiect: Modernizare Școala Verde</div>
                                        </div>
                                        <div className="text-right">
                                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Planificat</span>
                                            <div className="text-xs text-gray-500 mt-1">10 Oct</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card
                            title="Progresul meu personal"
                            className="mb-6"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-blue-50 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600">{stats.activeProjects || 3}</div>
                                    <div className="text-sm text-gray-600">Proiecte active</div>
                                </div>
                                <div className="text-center p-4 bg-green-50 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600">{stats.recentActivities || 8}</div>
                                    <div className="text-sm text-gray-600">Activități finalizate</div>
                                </div>
                                <div className="text-center p-4 bg-orange-50 rounded-lg">
                                    <div className="text-2xl font-bold text-orange-600">2</div>
                                    <div className="text-sm text-gray-600">În așteptare</div>
                                </div>
                            </div>
                        </Card>
                    </>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <Card title="Calendar - Luna curentă" className="bg-blue-50 border-blue-200">
                        <div className="space-y-3">
                            <div className="text-center mb-4">
                                <div className="text-lg font-semibold text-blue-700">
                                    Septembrie 2025
                                </div>
                                <div className="text-sm text-gray-600">
                                    {new Date().toLocaleDateString('ro-RO', { 
                                        weekday: 'long', 
                                        day: 'numeric', 
                                        month: 'long' 
                                    })}
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <div className="flex items-center justify-between p-2 bg-white rounded border-l-4 border-green-500">
                                    <div>
                                        <div className="font-medium text-sm">Ședință echipă</div>
                                        <div className="text-xs text-gray-500">30 Sep, 10:00</div>
                                    </div>
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                </div>
                                
                                <div className="flex items-center justify-between p-2 bg-white rounded border-l-4 border-orange-500">
                                    <div>
                                        <div className="font-medium text-sm">Prezentare proiect</div>
                                        <div className="text-xs text-gray-500">2 Oct, 14:30</div>
                                    </div>
                                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                </div>
                                
                                <div className="flex items-center justify-between p-2 bg-white rounded border-l-4 border-blue-500">
                                    <div>
                                        <div className="font-medium text-sm">Workshop</div>
                                        <div className="text-xs text-gray-500">5 Oct, 16:00</div>
                                    </div>
                                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                </div>
                            </div>
                            
                            <div className="mt-4">
                                <button 
                                    className="w-full bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors font-medium"
                                    onClick={() => navigate(ROUTES.CALENDAR)}
                                >
                                    📅 Vezi calendarul
                                </button>
                            </div>

                            <div className="text-xs text-gray-500 text-center mt-3 border-t pt-2">
                                📅 {isAdmin ? "3 evenimente globale" : isMember ? "3 evenimente personale" : "3 evenimente organizație"}
                            </div>
                        </div>
                    </Card>

                    {(isAdmin || (isOrgAdmin && hasOrganization)) && (
                        <Card title="Rapoarte - Sumar executiv" className="bg-green-50 border-green-200">
                            <div className="space-y-3">
                                <div className="text-center mb-4">
                                    <div className="text-lg font-semibold text-green-700">
                                        Raport lunar
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Septembrie 2025
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white p-3 rounded text-center">
                                        <div className="text-2xl font-bold text-blue-600">
                                            {isAdmin ? "47" : "8"}
                                        </div>
                                        <div className="text-xs text-gray-600">Proiecte</div>
                                    </div>
                                    
                                    <div className="bg-white p-3 rounded text-center">
                                        <div className="text-2xl font-bold text-green-600">
                                            {isAdmin ? "284" : "45"}
                                        </div>
                                        <div className="text-xs text-gray-600">Membri</div>
                                    </div>
                                    
                                    <div className="bg-white p-3 rounded text-center">
                                        <div className="text-2xl font-bold text-orange-600">
                                            {isAdmin ? "156" : "23"}
                                        </div>
                                        <div className="text-xs text-gray-600">Activități</div>
                                    </div>
                                    
                                    <div className="bg-white p-3 rounded text-center">
                                        <div className="text-2xl font-bold text-purple-600">
                                            {isAdmin ? "12" : "1"}
                                        </div>
                                        <div className="text-xs text-gray-600">
                                            {isAdmin ? "Organizații" : "Organizație"}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex gap-2">

                                    <button 
                                        className="flex-1 bg-white text-green-700 border border-green-300 px-3 py-2 rounded text-sm hover:bg-green-100 transition-colors"
                                        onClick={() => {
                                        }}
                                    >
                                        📊 Excel
                                    </button>
                                    <button 
                                        className="flex-1 bg-white text-green-700 border border-green-300 px-3 py-2 rounded text-sm hover:bg-green-100 transition-colors"
                                        onClick={() => {
                                        }}
                                    >
                                        📄 PDF
                                    </button>
                                </div>

                                <div className="text-xs text-gray-500 text-center mt-3 border-t pt-2">
                                    📈 Generat automat în {new Date().toLocaleDateString('ro-RO')}
                                </div>
                            </div>
                        </Card>
                    )}

                    {isMember && (
                        <Card title="Progres personal" className="bg-green-50 border-green-200">
                            <div className="space-y-3">
                                <div className="text-center mb-4">
                                    <div className="text-lg font-semibold text-green-700">
                                        Luna aceasta
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Progresul tău în proiecte
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 gap-3">
                                    <div className="bg-white p-3 rounded">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Activități finalizate:</span>
                                            <span className="text-lg font-bold text-green-600">8</span>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-white p-3 rounded">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Proiecte active:</span>
                                            <span className="text-lg font-bold text-blue-600">3</span>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-white p-3 rounded">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Ore lucrate:</span>
                                            <span className="text-lg font-bold text-orange-600">52</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-xs text-gray-500 text-center mt-3 border-t pt-2">
                                    🎯 Continui munca excelentă!
                                </div>
                            </div>
                        </Card>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {isOrgAdmin && !hasOrganization ? (
                        <div className="col-span-full">
                            <Card title="Informații organizație" className="bg-yellow-50 border-yellow-200">
                                <div className="text-center py-8">
                                    <div className="text-yellow-600 text-lg font-medium mb-2">
                                        Nu sunteți asignat la nicio organizație
                                    </div>
                                    <p className="text-gray-600">
                                        Pentru moment nu puteți vizualiza detaliile organizației deoarece nu aveți nicio organizație în administrare. 
                                        Contactați administratorul pentru a fi asignat la o organizație.
                                    </p>
                                </div>
                            </Card>
                        </div>
                    ) : (
                        <>
                            <Card 
                                title={isAdmin ? "Activități globale" : "Activități recente"} 
                                subtitle={isAdmin ? "Total activități din toate organizațiile" : "Ultimele noutăți din proiectele tale"}
                            >
                                {loading ? (
                                    <div className="animate-pulse">
                                        <div className="h-8 bg-gray-200 rounded mb-2"></div>
                                        <div className="h-4 bg-gray-200 rounded"></div>
                                    </div>
                                ) : stats.recentActivities > 0 ? (
                                    <div className="text-2xl font-semibold text-orange-600">
                                        {stats.recentActivities}
                                    </div>
                                ) : (
                                    <p className="text-gray-500">
                                        {isAdmin ? "Nu există activități în sistem." : "Nicio activitate recentă."}
                                    </p>
                                )}
                            </Card>

                            <Card 
                                title={isAdmin ? "Proiecte globale" : "Proiecte active"} 
                                subtitle={isAdmin ? "Total proiecte din toate organizațiile" : "Proiecte la care lucrezi în prezent"}
                            >
                                {loading ? (
                                    <div className="animate-pulse">
                                        <div className="h-8 bg-gray-200 rounded mb-2"></div>
                                        <div className="h-4 bg-gray-200 rounded"></div>
                                    </div>
                                ) : stats.activeProjects > 0 ? (
                                    <div className="text-2xl font-semibold text-blue-600">
                                        {stats.activeProjects}
                                    </div>
                                ) : (
                                    <p className="text-gray-500">
                                        {isAdmin ? "Nu există proiecte în sistem." : "Niciun proiect activ."}
                                    </p>
                                )}
                            </Card>

                            <Card 
                                title={isAdmin ? "Organizații" : "Statistici"} 
                                subtitle={isAdmin ? "Total organizații înregistrate" : "Prezentare generală a performanței tale"}
                            >
                                {loading ? (
                                    <div className="animate-pulse">
                                        <div className="h-8 bg-gray-200 rounded mb-2"></div>
                                        <div className="h-4 bg-gray-200 rounded"></div>
                                    </div>
                                ) : stats.totalStats > 0 ? (
                                    <div className="text-2xl font-semibold text-green-600">
                                        {stats.totalStats}
                                    </div>
                                ) : (
                                    <p className="text-gray-500">
                                        {isAdmin ? "Nu există organizații înregistrate." : "Nu există date statistice disponibile."}
                                    </p>
                                )}
                            </Card>
                        </>
                    )}
                </div>

                <Card title="Acțiuni rapide" className="mt-8">
                    <div className="flex flex-wrap gap-4">
                        <SecondaryButton
                            variant="outline"
                            onClick={() => navigate(ROUTES.CALENDAR)}
                        >
                            Vezi calendarul
                        </SecondaryButton>
                        <SecondaryButton
                            variant="outline"
                            onClick={() => showToast.featureInDevelopment()}
                        >
                            Generează raport
                        </SecondaryButton>
                        {(isAdmin || isOrgAdmin) && user?.organization_id && (
                            <SecondaryButton
                                variant="outline"
                                onClick={() => {
                                    setTestOrgId(user.organization_id!);
                                    setIsOrgDetailsModalOpen(true);
                                }}
                            >
                                Test Detalii Organizație
                            </SecondaryButton>
                        )}
                    </div>
                </Card>

                <CreateUserModal
                    isOpen={isCreateUserModalOpen}
                    onClose={handleCloseCreateUser}
                    onSubmit={handleCreateUser}
                    isAdmin={isAdmin}
                    isOrgAdmin={isOrgAdmin}
                />

                <ConfirmationModal
                    isOpen={isCreateOrgModalOpen}
                    onClose={handleSkipOrganization}
                    onConfirm={handleCreateOrganization}
                    title="Creează organizație"
                    message={`Utilizatorul ${createdUserData?.full_name || ''} a fost creat cu succes! Doriți să creați o organizație pentru acest utilizator?`}
                    confirmText="Da, creează organizație"
                    cancelText="Nu, doar utilizator"
                    variant="info"
                />

                <OrganizationCreationModal
                    isOpen={organization.isCreateOrganizationModalOpen}
                    onClose={() => organization.setIsCreateOrganizationModalOpen(false)}
                    onSubmit={organization.handleSubmitOrg}
                    isSubmitting={organization.isSubmittingOrg}
                    pendingAdminUsers={organization.pendingAdminUsers}
                    loadingPendingUsers={organization.loadingPendingUsers}
                    preselectedUser={organization.preselectedUser}
                />

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
                    availableProjects={availableProjects}
                />

                <OrganizationDetailsModal
                    isOpen={isOrgDetailsModalOpen}
                    onClose={() => setIsOrgDetailsModalOpen(false)}
                    organizationId={testOrgId}
                    onUpdate={() => {
                        showToast.success('Organizația a fost actualizată cu succes!');
                    }}
                />
            </div>
        </Layout>
    );
};

export default DashboardPage;
