import React from 'react';
import {UserCreateRequest} from "@/schemas/user.schema";
import {UserMeResponse} from "@/types/user.types";
import {Project} from "@/types/project.types";
import {ConfirmationModal} from "@/components/ui/Modal";
import {OrganizationCreationModal} from "@/components/organization/OrganizationCreationModal";
import {OrganizationDetailsModal} from "@/components/organization/OrganizationDetailsModal";
import {CreateUserModal} from "@/components/modals/user/CreateUserModal";
import {CreateProjectModal} from "@/components/modals/project/CreateProjectModal";

interface DashboardModalsProps {
    isCreateUserModalOpen: boolean;
    handleCloseCreateUser: () => void;
    handleCreateUser: (data: UserCreateRequest) => Promise<void>;
    isAdmin: boolean;
    isOrgAdmin: boolean;

    isCreateOrgModalOpen: boolean;
    handleSkipOrganization: () => void;
    handleCreateOrganization: () => Promise<void>;
    createdUserData: UserMeResponse | null;

    isCreateOrganizationModalOpen: boolean;
    setIsCreateOrganizationModalOpen: (open: boolean) => void;
    handleSubmitOrg: (data: any) => Promise<void>;
    isSubmittingOrg: boolean;
    pendingAdminUsers: any[];
    loadingPendingUsers: boolean;
    preselectedUser: any;

    isCreateProjectModalOpen: boolean;
    handleCloseCreateProject: () => void;
    handleProjectCreated: () => void;
    organizationId?: string;

    isCreateActivityModalOpen: boolean;
    handleCloseCreateActivity: () => void;
    handleActivityCreated: () => void;
    availableProjects: Project[];

    isOrgDetailsModalOpen: boolean;
    setIsOrgDetailsModalOpen: (open: boolean) => void;
    onOrganizationUpdate: () => void;
}

export const DashboardModals: React.FC<DashboardModalsProps> = ({
    isCreateUserModalOpen,
    handleCloseCreateUser,
    handleCreateUser,
    isAdmin,
    isOrgAdmin,
    isCreateOrgModalOpen,
    handleSkipOrganization,
    handleCreateOrganization,
    createdUserData,
    isCreateOrganizationModalOpen,
    setIsCreateOrganizationModalOpen,
    handleSubmitOrg,
    isSubmittingOrg,
    pendingAdminUsers,
    loadingPendingUsers,
    preselectedUser,
    isCreateProjectModalOpen,
    handleCloseCreateProject,
    handleProjectCreated,
    organizationId,
    isOrgDetailsModalOpen,
    setIsOrgDetailsModalOpen,
    onOrganizationUpdate
}) => (
    <>
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
            message={`Utilizatorul ${createdUserData?.fullName || ''} a fost creat cu succes! Doriți să creați o organizație pentru acest utilizator?`}
            confirmText="Da, creează organizație"
            cancelText="Nu, doar utilizator"
            variant="info"
        />

        <OrganizationCreationModal
            isOpen={isCreateOrganizationModalOpen}
            onClose={() => setIsCreateOrganizationModalOpen(false)}
            onSubmit={handleSubmitOrg}
            isSubmitting={isSubmittingOrg}
            pendingAdminUsers={pendingAdminUsers}
            loadingPendingUsers={loadingPendingUsers}
            preselectedUser={preselectedUser}
        />

        <CreateProjectModal
            isOpen={isCreateProjectModalOpen}
            onClose={handleCloseCreateProject}
            onSuccess={handleProjectCreated}
            organizationId={organizationId}
        />

        <OrganizationDetailsModal
            isOpen={isOrgDetailsModalOpen}
            onClose={() => setIsOrgDetailsModalOpen(false)}
            organizationId=""
            onUpdate={onOrganizationUpdate}
        />
    </>
);