import { UserCreateRequest } from "@/schemas/user.schema";
import { organizationService } from "@/services/organization.service";
import { userService } from "@/services/user.service";
import showToast from "@/components/ui/Toast";
import { cacheInvalidation, CACHE_KEYS } from "@/utils/cacheInvalidation";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";

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
    const { t } = useTranslation();

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
                showToast.success(t('toast.user.created'));
            }
            
            if (refreshUsers) {
                refreshUsers();
            }
        } catch (error: any) {
            showToast.error(t('toast.user.create_error'));
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
        showToast.success(t('toast.user.created'));
    };

    const handleProjectClick = (projectId: string) => {
        const newSelection = selectedProject === projectId ? null : projectId;
        setSelectedProject(newSelection);
    };

    const handleProjectCreated = () => {
        showToast.success(t('toast.project.created'));
        setIsCreateProjectModalOpen(false);
    };

    const handleActivityCreated = () => {
        showToast.success(t('toast.activity.created'));
        setIsCreateActivityModalOpen(false);
    };

    const handleOrganizationUpdate = () => {
        showToast.success(t('toast.organization.updated'));
    };

    const handleActivateOrganization = async (organizationId: string) => {
        try {
            await organizationService.update(organizationId, { status: 'active' });
            showToast.success(t('toast.organization.activated'));
            if (refreshOrganizations) {
                refreshOrganizations();
            }
            if (refreshUsers) {
                refreshUsers();
            }
        } catch (error) {
            showToast.error(t('toast.organization.activate_error'));
        }
    };

    const handleDeactivateOrganization = async (organizationId: string) => {
        try {
            await organizationService.update(organizationId, { status: 'inactive' });
            showToast.success(t('toast.organization.deactivated'));
            if (refreshOrganizations) {
                refreshOrganizations();
            }
            if (refreshUsers) {
                refreshUsers();
            }
        } catch (error) {
            showToast.error(t('toast.organization.deactivate_error'));
        }
    };

    const handleToggleModule = async (organizationId: string, module: 'ERP' | 'CRM', currentlyEnabled: boolean) => {
        try {
            await organizationService.toggleModule(organizationId, module, !currentlyEnabled);
            
            showToast.success(currentlyEnabled 
                ? t('toast.organization.module_disabled', { module }) 
                : t('toast.organization.module_enabled', { module }));
            
            await refreshOrganizationModules();
            cacheInvalidation.invalidate(CACHE_KEYS.ORGANIZATIONS);
            
            if (refreshOrganizations) {
                await refreshOrganizations();
            }
        } catch (error) {
            showToast.error(t('toast.organization.module_toggle_error', { module }));
        }
    };

    const handleDeactivateUser = async (userId: string) => {
        try {
            await userService.deactivateUser(userId);
            showToast.success(t('toast.user.deactivated'));
            if (refreshUsers) {
                refreshUsers();
            }
        } catch (error) {
            showToast.error(t('toast.user.deactivate_error'));
        }
    };

    const handleReactivateUser = async (userId: string) => {
        try {
            await userService.reactivateUser(userId);
            showToast.success(t('toast.user.reactivated'));
            if (refreshUsers) {
                refreshUsers();
            }
        } catch (error) {
            showToast.error(t('toast.user.reactivate_error'));
        }
    };

    const handleResetPassword = async (userId: string) => {
        if (!window.confirm(t('toast.user.password_reset_confirm'))) {
            return;
        }

        try {
            const result = await userService.resetPassword(userId);
            showToast.success(t('toast.user.password_reset_sent', { email: result.email }));
        } catch (error) {
            showToast.error(t('toast.user.password_reset_error'));
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
            
            showToast.success(t('toast.user.updated'));
            
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