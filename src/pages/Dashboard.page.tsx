import React, {useEffect, useState} from "react";
import {useAuth} from "@/hooks/useAuth";
import {UserCreateRequest} from "@/schemas/user.schema";
import { UserMeResponse } from "@/types/user.types";
import userService from "@/services/user.service";
import organizationService from "@/services/organization.service";
import Layout from "@/components/layout/Layout";
import {Card} from "@/components/ui/Card";
import {Button} from "@/components/ui/Button";
import {ConfirmationModal} from "@/components/ui/Modal";
import showToast from "@/components/ui/Toast";
import {OrganizationCreationModal} from "@/components/organization/OrganizationCreationModal";
import {useOrganizationCreation} from "@/hooks/useOrganizationCreation";
import {CreateUserModal} from "@/components/modals/user/CreateUserModal.tsx";
import {DashboardStats, User, UserGroup, UserStatus} from "@/types/index.types.ts";
import UserList from "@/components/tables/UserList.tsx";
import {useTranslation} from "react-i18next";

const DashboardPage: React.FC = () => {
    const { t } = useTranslation();
    const { user,hasAnyUserGroup, hasAllUserGroups } = useAuth();
    const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
    const [isCreateOrgModalOpen, setIsCreateOrgModalOpen] = useState(false);
    const [createdUserData, setCreatedUserData] = useState<User | null>(null);

    const [refreshUserTable, setRefreshUserTable] = useState(0);
    //const [setSelectedUser] = useState<User | null>(null);

    const [stats, setStats] = useState<DashboardStats>({
        recentActivities: 0,
        activeProjects: 0,
        totalStats: 0
    });
    const [loading, setLoading] = useState(true);

    const organization = useOrganizationCreation();

    const isAdmin = hasAnyUserGroup([UserGroup.ADMIN]);
    const isOrgAdmin = hasAnyUserGroup([UserGroup.ORGANIZATION_ADMIN]);
    const hasOrganization = user?.organization_id;

    useEffect(() => {
        const loadStats = async () => {
            if (isOrgAdmin && hasOrganization) {
                try {
                    const orgStats = await organizationService.getOrganizationStats(user!.organization_id!);
                    setStats({
                        activeProjects: orgStats.active_projects,
                        recentActivities: orgStats.ongoing_activities,
                        totalStats: orgStats.active_projects + orgStats.ongoing_activities + orgStats.active_members
                    });
                } catch (error) {
                    console.error('Error loading organization stats:', error);
                }
            }
            setLoading(false);
        };

        loadStats();
    }, [isOrgAdmin, hasOrganization, user?.organization_id]);

    const getUserDisplayName = (): string => {
        if (!user) return 'Utilizator';
        return user.full_name || user.email;
    };

    const handleCreateUser = async (data: UserCreateRequest) => {
        try {
            const createdUser = await userService.create(data);
            setIsCreateUserModalOpen(false);
            
            setCreatedUserData(createdUser);

            // Always show success toast first
            showToast.success('Utilizator creat cu succes!');

            setRefreshUserTable(prev => prev + 1);

            if (isAdmin && data.group === UserGroup.ORGANIZATION_ADMIN) {
                setIsCreateOrgModalOpen(true);
            } else {
                setCreatedUserData(null);
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
            const userForOrg: UserMeResponse = {
                isLegalEntity: createdUserData.company_number ? true : false,
                personal_numerical_number: createdUserData.personal_numerical_number,
                status: createdUserData.status,
                id: createdUserData.id,
                email: createdUserData.email,
                full_name: createdUserData.full_name,
                groups: createdUserData.groups || [],
                organization_id: undefined
            };

            const companyData = createdUserData.company_number && createdUserData.company_name ? {
                company_name: createdUserData.company_name,
                company_number: createdUserData.company_number
            } : undefined;

            organization.openCreateOrganizationModalWithUser(userForOrg, companyData);
        } else {
            organization.openCreateOrganizationModal();
        }

        setCreatedUserData(null);
    };

    const handleSkipOrganization = () => {
        setIsCreateOrgModalOpen(false);
        setCreatedUserData(null);
    };

    const handleEditUser = (user: User) => {
        //setSelectedUser(user);
        // TODO: Open edit modal or navigate to edit page
        showToast.info(`Edit user: ${user.full_name}`);
    };

    const handleViewUser = (user: User) => {
        //setSelectedUser(user);
        // TODO: Open view modal or navigate to view page
        showToast.info(`View user: ${user.full_name}`);
    };

    const handleDeleteUser = async (user: User) => {
        try {
            await userService.delete(user.id);
            showToast.success(`User ${user.full_name} deleted successfully`);
            setRefreshUserTable(prev => prev + 1);
        } catch (error) {
            console.error('Error deleting user:', error);
            showToast.error('Failed to delete user');
        }
    };

    const handleUserRowClick = (/*user: User*/) => {
        // Could navigate to user details page
        // router.push(`/users/${user.id}`);
    };

    const canDeleteUser = (user: User): boolean => {
        return hasAllUserGroups([UserGroup.ADMIN]) && user.status === UserStatus.INACTIVE && !user.groups.includes(UserGroup.ORGANIZATION_ADMIN);
    };

    const handleOpenCreateUser = () => {
        setIsCreateUserModalOpen(true);
    };

    const handleCloseCreateUser = () => {
        setIsCreateUserModalOpen(false);
    };

    return (
        <Layout showNavigation={true}>
            <div className="container mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Bine ai revenit, {getUserDisplayName()}!</h1>
                    <p className="text-gray-600">Iată ce se întâmplă cu proiectele și activitățile tale.</p>
                </div>

                {(isAdmin || isOrgAdmin) && (
                    <Card
                        title="Acțiuni administrator"
                        className="mb-6 space-y-4"
                        headerActions={
                            <>
                                <div className="flex gap-4">
                                    <Button className="bg-orange-500 text-white" onClick={handleOpenCreateUser} size={'sm'} variant={'primary'} px={3} py={1.5}>
                                        {t('label.user_create')}
                                    </Button>
                                    {isAdmin && (
                                        <Button
                                            variant="outline"
                                            onClick={organization.openCreateOrganizationModal}
                                        >
                                            {t('label.organisation_create')}
                                        </Button>
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card title="Activități recente" subtitle="Ultimele noutăți din proiectele tale">
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
                            <p className="text-gray-500">Nicio activitate recentă.</p>
                        )}
                    </Card>

                    <Card title="Proiecte active" subtitle="Proiecte la care lucrezi în prezent">
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
                            <p className="text-gray-500">Niciun proiect activ.</p>
                        )}
                    </Card>

                    <Card title="Statistici" subtitle="Prezentare generală a performanței tale">
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
                            <p className="text-gray-500">Nu există date statistice disponibile.</p>
                        )}
                    </Card>
                </div>

                <Card title="Acțiuni rapide" className="mt-8">
                    <div className="flex flex-wrap gap-4">
                        <Button
                            variant="outline"
                            onClick={() => showToast.info("Funcționalitate în dezvoltare")}
                        >
                            Creează proiect nou
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => showToast.info("Funcționalitate în dezvoltare")}
                        >
                            Vezi calendarul
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => showToast.info("Funcționalitate în dezvoltare")}
                        >
                            Generează raport
                        </Button>
                    </div>
                </Card>

                <CreateUserModal
                    isOpen={isCreateUserModalOpen}
                    onClose={handleCloseCreateUser}
                    onSubmit={handleCreateUser}
                    isAdmin={isAdmin}
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
                    onReset={organization.resetOrgForm}
                    register={organization.registerOrg}
                    control={organization.controlOrg}
                    errors={organization.errorsOrg}
                    isSubmitting={organization.isSubmittingOrg}
                    pendingAdminUsers={organization.pendingAdminUsers}
                    loadingPendingUsers={organization.loadingPendingUsers}
                    preselectedUser={organization.preselectedUser}
                />
            </div>
        </Layout>
    );
};

export default DashboardPage;