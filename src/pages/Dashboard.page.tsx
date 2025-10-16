import React from "react";
import Layout from "@/components/layout/Layout";
import { useOrganizationCreation } from "@/hooks/useOrganizationCreation";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { OrgAdminDashboard } from "@/components/dashboard/OrgAdminDashboard";
import { MemberDashboard } from "@/components/dashboard/MemberDashboard";
import { StatsSection } from "@/components/dashboard/SharedComponents";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardModals } from "@/components/dashboard/DashboardModals";
import { SortButton } from "@/components/ui/SortButton";
import { useDashboardState } from "@/hooks/useDashboardState";
import { useDashboardHandlers } from "@/hooks/useDashboardHandlers";
import { useDashboardData } from "@/hooks/useDashboardData";
import { getUserDisplayName, getProjectStatusColor, getActivityStatusColor, getProjectStatusText, getActivityStatusText } from "@/utils/dashboardUtils";

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
        setIsEditUserModalOpen: state.setIsEditUserModalOpen,
        setIsCreateOrgModalOpen: state.setIsCreateOrgModalOpen,
        setCreatedUserData: state.setCreatedUserData,
        setSelectedUser: state.setSelectedUser,
        selectedUser: state.selectedUser,
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
                        handleResetPassword={handlers.handleResetPassword}
                        handleEditUser={handlers.handleEditUser}
                        currentUserId={state.user?.id}
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

                {state.isOrgAdmin && !state.hasOrganization && !state.isAdmin && (
                    <div className="max-w-2xl mx-auto mt-12">
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg overflow-hidden border border-blue-100">
                            <div className="p-8 text-center">
                                <div className="mb-6">
                                    <svg 
                                        className="mx-auto h-24 w-24 text-blue-400" 
                                        fill="none" 
                                        viewBox="0 0 24 24" 
                                        stroke="currentColor"
                                    >
                                        <path 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round" 
                                            strokeWidth={1.5} 
                                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" 
                                        />
                                    </svg>
                                </div>
                                
                                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                                    Contul dumneavoastră este în curs de configurare
                                </h2>
                                
                                <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                                    Bine ați venit pe Platforma Asura! Contul dumneavoastră a fost creat cu succes, 
                                    dar este în așteptarea alocării unei organizații.
                                </p>
                                
                                <div className="bg-white rounded-lg p-6 mb-6 border border-blue-200">
                                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center justify-center">
                                        <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                        Ce urmează?
                                    </h3>
                                    <ul className="text-left text-gray-600 space-y-2">
                                        <li className="flex items-start">
                                            <span className="text-blue-600 mr-2">•</span>
                                            <span>Un administrator va asigna contul dumneavoastră unei organizații</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-blue-600 mr-2">•</span>
                                            <span>După alocarea organizației, veți avea acces complet la dashboard</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-blue-600 mr-2">•</span>
                                            <span>Veți putea gestiona proiecte, activități și membrii echipei</span>
                                        </li>
                                    </ul>
                                </div>
                                
                                <p className="text-sm text-gray-500">
                                    În cazul în care aveți întrebări, vă rugăm să contactați administratorul platformei.
                                </p>
                            </div>
                        </div>
                    </div>
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
                    isEditUserModalOpen={state.isEditUserModalOpen}
                    handleCloseEditUser={handlers.handleCloseEditUser}
                    handleUpdateUser={handlers.handleUpdateUser}
                    selectedUser={state.selectedUser}
                />
            </div>
        </Layout>
    );
};

export default DashboardPage;