import { UserCreateRequest } from "@/schemas/user.schema";
import { organizationService } from "@/services/organization.service";
import { userService } from "@/services/user.service";
import showToast from "@/components/ui/Toast";

interface DashboardHandlersProps {
    setIsCreateUserModalOpen: (open: boolean) => void;
    setIsCreateOrgModalOpen: (open: boolean) => void;
    setCreatedUserData: (data: any) => void;
    setIsCreateProjectModalOpen: (open: boolean) => void;
    setIsCreateActivityModalOpen: (open: boolean) => void;
    setSelectedProject: (project: string | null) => void;
    selectedProject: string | null;
    openCreateOrganizationModal: () => void;
    refreshOrganizations?: () => void;
    refreshUsers?: () => void;
}

export const useDashboardHandlers = ({
    setIsCreateUserModalOpen,
    setIsCreateOrgModalOpen,
    setCreatedUserData,
    setIsCreateProjectModalOpen,
    setIsCreateActivityModalOpen,
    setSelectedProject,
    selectedProject,
    openCreateOrganizationModal,
    refreshOrganizations,
    refreshUsers
}: DashboardHandlersProps) => {

    const handleCreateUser = async (data: UserCreateRequest) => {
        try {
            await userService.create(data);
            showToast.success('Utilizatorul a fost creat cu succes!');
            setIsCreateUserModalOpen(false);
            if (refreshUsers) {
                refreshUsers();
            }
        } catch (error: any) {
            console.error('Error creating user:', error);
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
        openCreateOrganizationModal();
        setIsCreateOrgModalOpen(false);
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
            console.error('Error activating organization:', error);
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
            console.error('Error deactivating organization:', error);
            showToast.error('Eroare la dezactivarea organizației');
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
            console.error('Error deactivating user:', error);
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
            console.error('Error reactivating user:', error);
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
            console.error('Error resetting password:', error);
            showToast.error('Eroare la trimiterea emailului de resetare parolă');
        }
    };

    return {
        handleCreateUser,
        handleOpenCreateUser,
        handleCloseCreateUser,
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
        handleDeactivateUser,
        handleReactivateUser,
        handleResetPassword
    };
};