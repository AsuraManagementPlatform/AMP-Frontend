import React from "react";
import Layout from "@/components/layout/Layout";
import {useOrganizationCreation} from "@/hooks/useOrganizationCreation";
import {AdminDashboard} from "@/components/dashboard/AdminDashboard";
import {OrgAdminDashboard} from "@/components/dashboard/OrgAdminDashboard";
import {MemberDashboard} from "@/components/dashboard/MemberDashboard";
import {StatsSection} from "@/components/dashboard/SharedComponents";
import {DashboardHeader} from "@/components/dashboard/DashboardHeader";
import {DashboardModals} from "@/components/dashboard/DashboardModals";
import {SortButton} from "@/components/ui/SortButton";
import {useDashboardState} from "@/hooks/useDashboardState";
import {useDashboardHandlers} from "@/hooks/useDashboardHandlers";
import {useDashboardData} from "@/hooks/useDashboardData";
import {
    getActivityStatusColor,
    getActivityStatusText,
    getProjectStatusColor,
    getProjectStatusText,
    getUserDisplayName
} from "@/utils/dashboardUtils";

const DashboardPage: React.FC = () => {
    const organization = useOrganizationCreation();
    const state = useDashboardState();

    const dataHooks = useDashboardData({
        isAdmin: state.isAdmin,
        isOrgAdmin: state.isOrgAdmin,
        isMember: state.isMember,
        organizationId: state.user?.organization_id,
        setStats: state.setStats,
        setLoading: state.setLoading,
        setProjectsLoading: state.setProjectsLoading,
        setActivitiesLoading: state.setActivitiesLoading,
        setMembersLoading: state.setMembersLoading,
        setProjects: state.setProjects,
        setActivities: state.setActivities,
        setMembers: state.setMembers,
        setOrganizations: state.setOrganizations,
        setOrganizationsLoading: state.setOrganizationsLoading
    });

    const handlers = useDashboardHandlers({
        setIsCreateUserModalOpen: state.setIsCreateUserModalOpen,
        setIsCreateOrgModalOpen: state.setIsCreateOrgModalOpen,
        setCreatedUserData: state.setCreatedUserData,
        setIsCreateProjectModalOpen: state.setIsCreateProjectModalOpen,
        setIsCreateActivityModalOpen: state.setIsCreateActivityModalOpen,
        setSelectedProject: state.setSelectedProject,
        selectedProject: state.selectedProject,
        openCreateOrganizationModal: organization.openCreateOrganizationModal,
        refreshOrganizations: dataHooks.refreshOrganizations,
        refreshUsers: dataHooks.refreshUsers
    });

    return (
        <Layout showNavigation={true}>
            <div className="container mx-auto">
                <DashboardHeader userName={getUserDisplayName(state.user)} />

                {state.isAdmin && (
                    <AdminDashboard
                        searchTerm={state.searchTerm}
                        setSearchTerm={state.setSearchTerm}
                        filteredMembers={state.filteredMembers}
                        membersLoading={state.membersLoading}
                        filteredOrganizations={state.filteredOrganizations}
                        organizationsLoading={state.organizationsLoading}
                        handleOpenCreateUser={handlers.handleOpenCreateUser}
                        openCreateOrganizationModal={organization.openCreateOrganizationModal}
                        handleActivateOrganization={handlers.handleActivateOrganization}
                        handleDeactivateOrganization={handlers.handleDeactivateOrganization}
                        handleDeactivateUser={handlers.handleDeactivateUser}
                        handleReactivateUser={handlers.handleReactivateUser}
                        SortButton={SortButton}
                    />
                )}

                {state.isOrgAdmin && state.hasOrganization && !state.isAdmin && (
                    <OrgAdminDashboard
                        searchTerm={state.searchTerm}
                        setSearchTerm={state.setSearchTerm}
                        filteredMembers={state.filteredMembers}
                        membersLoading={state.membersLoading}
                        projects={state.projects}
                        activities={state.activities}
                        projectsLoading={state.projectsLoading}
                        activitiesLoading={state.activitiesLoading}
                        selectedProject={state.selectedProject}
                        handleProjectClick={handlers.handleProjectClick}
                        getProjectStatusColor={getProjectStatusColor}
                        getActivityStatusColor={getActivityStatusColor}
                        getProjectStatusText={getProjectStatusText}
                        getActivityStatusText={getActivityStatusText}
                        SortButton={SortButton}
                        handleOpenCreateUser={handlers.handleOpenCreateUser}
                        handleOpenCreateProject={() => state.setIsCreateProjectModalOpen(true)}
                        handleOpenCreateActivity={() => state.setIsCreateActivityModalOpen(true)}
                    />
                )}

                {state.isMember && !state.isOrgAdmin && !state.isAdmin && (
                    <MemberDashboard
                        user={state.user}
                        projects={state.projects}
                        activities={state.activities}
                        projectsLoading={state.projectsLoading}
                        activitiesLoading={state.activitiesLoading}
                    />
                )}

                {(state.isAdmin || (state.isOrgAdmin && state.hasOrganization)) && (
                    <StatsSection
                        stats={state.stats}
                        loading={state.loading}
                        isAdmin={state.isAdmin}
                    />
                )}

                <DashboardModals
                    isCreateUserModalOpen={state.isCreateUserModalOpen}
                    handleCloseCreateUser={handlers.handleCloseCreateUser}
                    handleCreateUser={handlers.handleCreateUser}
                    isAdmin={state.isAdmin}
                    isOrgAdmin={state.isOrgAdmin}
                    isCreateOrgModalOpen={state.isCreateOrgModalOpen}
                    handleSkipOrganization={handlers.handleSkipOrganization}
                    handleCreateOrganization={handlers.handleCreateOrganization}
                    createdUserData={state.createdUserData}
                    isCreateOrganizationModalOpen={organization.isCreateOrganizationModalOpen}
                    setIsCreateOrganizationModalOpen={organization.setIsCreateOrganizationModalOpen}
                    handleSubmitOrg={organization.handleSubmitOrg}
                    isSubmittingOrg={organization.isSubmittingOrg}
                    pendingAdminUsers={organization.pendingAdminUsers}
                    loadingPendingUsers={organization.loadingPendingUsers}
                    preselectedUser={organization.preselectedUser}
                    isCreateProjectModalOpen={state.isCreateProjectModalOpen}
                    handleCloseCreateProject={handlers.handleCloseCreateProject}
                    handleProjectCreated={handlers.handleProjectCreated}
                    organizationId={state.user?.organization_id}
                    isCreateActivityModalOpen={state.isCreateActivityModalOpen}
                    handleCloseCreateActivity={handlers.handleCloseCreateActivity}
                    handleActivityCreated={handlers.handleActivityCreated}
                    availableProjects={state.availableProjects}
                    isOrgDetailsModalOpen={state.isOrgDetailsModalOpen}
                    setIsOrgDetailsModalOpen={state.setIsOrgDetailsModalOpen}
                    onOrganizationUpdate={handlers.handleOrganizationUpdate}
                />
            </div>
        </Layout>
    );
};

export default DashboardPage;