import { UserCreateRequest } from "@/schemas/user.schema";
import { organizationService } from "@/services/organization.service";
import { userService } from "@/services/user.service";
import showToast from "@/components/ui/Toast";
import { cacheInvalidation, CACHE_KEYS } from "@/utils/cacheInvalidation";
import { useAuth } from "@/hooks/useAuth";

interface DashboardHandlersProps {
    setIsCreateUserModalOpen: (open: boolean) => void;
    setIsEditUserModalOpen: (open: boolean) => void;
    setIsCreateOrgModalOpen: (open: boolean) => void;
    setCreatedUserData: (data: any) => void;
    createdUserData: any;
    setSelectedUser: (user: any) => void;
    selectedUser: any;
    setIsCreateProjectModalOpen: (open: boolean) => void;
    setIsCreateActivityModalOpen: (open: boolean) => void;
    setSelectedProject: (project: string | null) => void;
    selectedProject: string | null;
    openCreateOrganizationModal: () => void;
    openCreateOrganizationModalWithUser: (user: any, companyData?: { company_name: string; company_number: string }) => Promise<void>;
    refreshOrganizations?: () => void;
    refreshUsers?: () => void;
}

export const useDashboardHandlers = ({
    setIsCreateUserModalOpen,
    setIsEditUserModalOpen,
    setIsCreateOrgModalOpen,
    setCreatedUserData,
    createdUserData,
    setSelectedUser,
    selectedUser,
    setIsCreateProjectModalOpen,
    setIsCreateActivityModalOpen,
    setSelectedProject,
    selectedProject,
    openCreateOrganizationModal,
    openCreateOrganizationModalWithUser,
    refreshOrganizations,
    refreshUsers
}: DashboardHandlersProps) => {
    const { refreshOrganizationModules } = useAuth();

    const handleCreateUser = async (data: UserCreateRequest) => {
        try {
            const createdUser = await userService.create(data);
            setIsCreateUserModalOpen(false);
            
            const isOrgAdmin = data.group?.toUpperCase() === 'ORGANIZATION_ADMIN' || data.group === 'organization_admin';
            
            if (createdUser && isOrgAdmin) {
                const userData = (createdUser as any).user || createdUser;
                setCreatedUserData(userData);
                setIsCreateOrgModalOpen(true);
            } else {
                showToast.success('Utilizatorul a fost creat cu succes!');
            }
            
            if (refreshUsers) {
                refreshUsers();
            }
        } catch (error: any) {
            showToast.error('Eroare la crearea utilizatorului');
        }
    };

    const handleOpenCreateUser = () => {
        setIsCreateUserModalOpen(true);
    };

    const handleCloseCreateUser = () => {
        setIsCreateUserModalOpen(false);
    };

    const handleCloseCreateProject = () => {
        setIsCreateProjectModalOpen(false);
    };

    const handleCloseCreateActivity = () => {
        setIsCreateActivityModalOpen(false);
    };

    const handleCreateOrganization = async () => {
        setIsCreateOrgModalOpen(false);
        if (createdUserData) {
            await openCreateOrganizationModalWithUser(createdUserData);
        } else {
            openCreateOrganizationModal();
        }
    };

    const handleSkipOrganization = () => {
        setIsCreateOrgModalOpen(false);
        setCreatedUserData(null);
        showToast.success('Utilizatorul a fost creat cu succes!');
    };

    const handleProjectClick = (projectId: string) => {
        const newSelection = selectedProject === projectId ? null : projectId;
        setSelectedProject(newSelection);
    };

    const handleProjectCreated = () => {
        showToast.success('Proiectul a fost creat cu succes!');
        setIsCreateProjectModalOpen(false);
    };

    const handleActivityCreated = () => {
        showToast.success('Activitatea a fost creată cu succes!');
        setIsCreateActivityModalOpen(false);
    };

    const handleOrganizationUpdate = () => {
        showToast.success('Organizația a fost actualizată cu succes!');
    };

    const handleActivateOrganization = async (organizationId: string) => {
        try {
            await organizationService.update(organizationId, { status: 'active' });
            showToast.success('Organizația și toți utilizatorii au fost activați cu succes!');
            if (refreshOrganizations) {
                refreshOrganizations();
            }
            if (refreshUsers) {
                refreshUsers();
            }
        } catch (error) {
            showToast.error('Eroare la activarea organizației');
        }
    };

    const handleDeactivateOrganization = async (organizationId: string) => {
        try {
            await organizationService.update(organizationId, { status: 'inactive' });
            showToast.success('Organizația și toți utilizatorii au fost dezactivați cu succes!');
            if (refreshOrganizations) {
                refreshOrganizations();
            }
            if (refreshUsers) {
                refreshUsers();
            }
        } catch (error) {
            showToast.error('Eroare la dezactivarea organizației');
        }
    };

    const handleToggleModule = async (organizationId: string, module: 'ERP' | 'CRM', currentlyEnabled: boolean) => {
        try {
            await organizationService.toggleModule(organizationId, module, !currentlyEnabled);
            
            showToast.success(`Modulul ${module} a fost ${currentlyEnabled ? 'dezactivat' : 'activat'} cu succes!`);
            
            await refreshOrganizationModules();
            cacheInvalidation.invalidate(CACHE_KEYS.ORGANIZATIONS);
            
            if (refreshOrganizations) {
                await refreshOrganizations();
            }
        } catch (error) {
            showToast.error(`Eroare la ${module === 'ERP' ? 'activarea/dezactivarea' : 'activarea/dezactivarea'} modulului ${module}`);
        }
    };

    const handleDeactivateUser = async (userId: string) => {
        try {
            await userService.deactivateUser(userId);
            showToast.success('Utilizatorul a fost dezactivat cu succes!');
            if (refreshUsers) {
                refreshUsers();
            }
        } catch (error) {
            showToast.error('Eroare la dezactivarea utilizatorului');
        }
    };

    const handleReactivateUser = async (userId: string) => {
        try {
            await userService.reactivateUser(userId);
            showToast.success('Utilizatorul a fost reactivat cu succes!');
            if (refreshUsers) {
                refreshUsers();
            }
        } catch (error) {
            showToast.error('Eroare la reactivarea utilizatorului');
        }
    };

    const handleResetPassword = async (userId: string) => {
        if (!window.confirm('Sigur doriți să resetați parola acestui utilizator? Va primi un email cu o parolă temporară.')) {
            return;
        }

        try {
            const result = await userService.resetPassword(userId);
            showToast.success(`Email de resetare parolă trimis cu succes la ${result.email}!`);
        } catch (error) {
            showToast.error('Eroare la trimiterea emailului de resetare parolă');
        }
    };

    const handleEditUser = (user: any) => {
        setSelectedUser(user);
        setIsEditUserModalOpen(true);
    };

    const handleCloseEditUser = () => {
        setIsEditUserModalOpen(false);
        setSelectedUser(null);
    };

    const handleUpdateUser = async (data: UserCreateRequest) => {
        if (!selectedUser) return;

        try {
            await userService.update(selectedUser.id, data);
            
            showToast.success('Utilizator actualizat cu succes!');
            
            if (refreshUsers) {
                refreshUsers();
            }
            setIsEditUserModalOpen(false);
            setSelectedUser(null);
        } catch (error) {
            throw error;
        }
    };

    return {
        handleCreateUser,
        handleOpenCreateUser,
        handleCloseCreateUser,
        handleEditUser,
        handleCloseEditUser,
        handleUpdateUser,
        handleCloseCreateProject,
        handleCloseCreateActivity,
        handleCreateOrganization,
        handleSkipOrganization,
        handleProjectClick,
        handleProjectCreated,
        handleActivityCreated,
        handleOrganizationUpdate,
        handleActivateOrganization,
        handleDeactivateOrganization,
        handleToggleModule,
        handleDeactivateUser,
        handleReactivateUser,
        handleResetPassword
    };
};