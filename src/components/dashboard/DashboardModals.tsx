import React from 'react';
import { UserCreateRequest } from "@/schemas/user.schema";
import { UserMeResponse } from "@/types/user.types";
import { Project } from "@/types/project.types";
import { ConfirmationModal } from "@/components/ui/Modal";
import { OrganizationCreationModal } from "@/components/organization/OrganizationCreationModal";
import { OrganizationDetailsModal } from "@/components/organization/OrganizationDetailsModal";
import { CreateUserModal } from "@/components/modals/user/CreateUserModal";
import { EditUserModal } from "@/components/modals/user/EditUserModal";

import { CreateProjectModal } from "@/components/modals/project/CreateProjectModal";
import { CreateActivityModal } from "@/components/modals/activity/CreateActivityModal";

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

    isEditUserModalOpen: boolean;
    handleCloseEditUser: () => void;
    handleUpdateUser: (data: UserCreateRequest) => Promise<void>;
    selectedUser: UserMeResponse | null;
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
    isCreateActivityModalOpen,
    handleCloseCreateActivity,
    handleActivityCreated,
    availableProjects,
    isOrgDetailsModalOpen,
    setIsOrgDetailsModalOpen,
    onOrganizationUpdate,
    isEditUserModalOpen,
    handleCloseEditUser,
    handleUpdateUser,
    selectedUser
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
            message={`Utilizatorul ${createdUserData?.full_name || ''} a fost creat cu succes! Doriți să creați o organizație pentru acest utilizator?`}
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

        <CreateActivityModal
            isOpen={isCreateActivityModalOpen}
            onClose={handleCloseCreateActivity}
            onSuccess={handleActivityCreated}
            availableProjects={availableProjects}
        />

        <OrganizationDetailsModal
            isOpen={isOrgDetailsModalOpen}
            onClose={() => setIsOrgDetailsModalOpen(false)}
            organizationId=""
            onUpdate={onOrganizationUpdate}
        />

        <EditUserModal
            isOpen={isEditUserModalOpen}
            onClose={handleCloseEditUser}
            onSubmit={handleUpdateUser}
            user={selectedUser}
            isAdmin={isAdmin}
            isOrgAdmin={isOrgAdmin}
        />
    </>
);