import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { PrimaryActionButton } from '@/components/ui/PrimaryActionButton';
import { Project, Activity, User, TableColumn, TableAction } from '@/types/index.types';
import { getUserRoleLabel } from '@/utils/dashboardUtils';
import { MyCotizatii } from './MyCotizatii';
import DataTable from "@/components/ui/DataTable.tsx";

interface OrgAdminDashboardProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    filteredMembers: User[];
    membersLoading: boolean;
    projects: Project[];
    activities: Activity[];
    projectsLoading: boolean;
    activitiesLoading: boolean;
    selectedProject: string | null;
    handleProjectClick: (projectId: string) => void;
    getProjectStatusColor: (status: string) => string;
    getActivityStatusColor: (status: string) => string;
    getProjectStatusText: (status: string) => string;
    getActivityStatusText: (status: string) => string;
    handleOpenCreateUser?: () => void;
    handleOpenCreateProject?: () => void;
    handleOpenCreateActivity?: () => void;
    handleEditUser?: (user: User) => void;
    handleResetPassword?: (userId: string) => void;
    handleDeactivateUser?: (userId: string) => void;
    handleReactivateUser?: (userId: string) => void;
    currentUserId?: string;
}

export const OrgAdminDashboard: React.FC<OrgAdminDashboardProps> = ({
    searchTerm,
    setSearchTerm,
    filteredMembers,
    membersLoading,
    projects,
    activities,
    projectsLoading,
    activitiesLoading,
    selectedProject,
    handleProjectClick,
    getProjectStatusColor,
    getActivityStatusColor,
    getProjectStatusText,
    getActivityStatusText,
    handleOpenCreateUser,
    handleOpenCreateProject,
    handleOpenCreateActivity,
    handleEditUser,
    handleResetPassword,
    handleDeactivateUser,
    handleReactivateUser,
    currentUserId
}) => {
    const [activeManagementView, setActiveManagementView] = useState<'membri' | 'proiecte'>('membri');

    const getMemberColumns = (): TableColumn<User>[] => [
        {
            key: 'fullName',
            label: 'Name',
            sortable: false,
            render: (fullName: string) => (
                <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                            {(fullName || 'N').charAt(0).toUpperCase()}
                        </div>
                    </div>
                    <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                            {fullName || 'N/A'}
                        </div>
                    </div>
                </div>
            )
        },
        {
            key: 'email',
            label: 'Email',
            sortable: false,
        },
        {
            key: 'status',
            label: 'Status',
            sortable: false,
            render: (status: string) => (
                <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full shadow-sm ${
                    status === 'ACTIVE' 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : status === 'INACTIVE'
                        ? 'bg-red-100 text-red-800 border border-red-200'
                        : 'bg-gray-100 text-gray-800 border border-gray-200'
                }`}>
                    {status || 'Unknown'}
                </span>
            )
        },
        {
            key: 'groups',
            label: 'Role',
            sortable: false,
            render: (groups: string[]) => (
                <div className="text-sm text-gray-600 font-medium">
                    {getUserRoleLabel(groups)}
                </div>
            )
        }
    ];

    const getMemberActions = (): TableAction<User>[] => {
        const actions: TableAction<User>[] = [];

        if (handleEditUser) {
            actions.push({
                label: 'Edit',
                variant: 'primary',
                onClick: handleEditUser,
                show: (member) => member.id !== currentUserId
            });
        }

        if (handleResetPassword) {
            actions.push({
                label: 'Resetare Parolă',
                variant: 'secondary',
                onClick: (member) => handleResetPassword(member.id),
                show: (member) => member.id !== currentUserId
            });
        }

        if (handleDeactivateUser) {
            actions.push({
                label: 'Dezactivează',
                variant: 'danger',
                onClick: (member) => handleDeactivateUser(member.id),
                show: (member) => member.id !== currentUserId && member.status === 'ACTIVE'
            });
        }

        if (handleReactivateUser) {
            actions.push({
                label: 'Reactivează',
                variant: 'secondary',
                onClick: (member) => handleReactivateUser(member.id),
                show: (member) => member.id !== currentUserId && member.status === 'INACTIVE'
            });
        }

        return actions;
    };

    const getProjectColumns = (): TableColumn<Project>[] => [
        {
            key: 'name',
            label: 'Nume Proiect',
            sortable: false,
            render: (name: string) => (
                <div className="font-medium text-gray-900">{name}</div>
            )
        },
        {
            key: 'status',
            label: 'Status',
            sortable: false,
            render: (status: string) => (
                <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full shadow-sm ${
                    getProjectStatusColor(status) === 'green' ? 'bg-green-100 text-green-800 border border-green-200' :
                    getProjectStatusColor(status) === 'blue' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                    getProjectStatusColor(status) === 'yellow' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                    getProjectStatusColor(status) === 'red' ? 'bg-red-100 text-red-800 border border-red-200' :
                    'bg-gray-100 text-gray-800 border border-gray-200'
                }`}>
                    {getProjectStatusText(status)}
                </span>
            )
        },
        {
            key: 'endingDate',
            label: 'Data Finalizare',
            sortable: false,
            render: (endingDate: string) => (
                <div className="text-sm text-gray-600">
                    {endingDate ? new Date(endingDate).toLocaleDateString('ro-RO') : 'N/A'}
                </div>
            )
        }
    ];

    const getActivityColumns = (): TableColumn<Activity>[] => [
        {
            key: 'title',
            label: 'Nume Activitate',
            sortable: false,
            render: (title: string) => (
                <div className="font-medium text-gray-900">{title}</div>
            )
        },
        {
            key: 'project',
            label: 'Proiect',
            sortable: false,
            render: (projectId: string) => (
                <div className="text-sm text-gray-600">
                    {projects.find(p => p.id === projectId)?.name || 'Necunoscut'}
                </div>
            )
        },
        {
            key: 'status',
            label: 'Status',
            sortable: false,
            render: (status: string) => (
                <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full shadow-sm ${
                    getActivityStatusColor(status) === 'green' ? 'bg-green-100 text-green-800 border border-green-200' :
                    getActivityStatusColor(status) === 'blue' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                    getActivityStatusColor(status) === 'yellow' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                    getActivityStatusColor(status) === 'red' ? 'bg-red-100 text-red-800 border border-red-200' :
                    'bg-gray-100 text-gray-800 border border-gray-200'
                }`}>
                    {getActivityStatusText(status)}
                </span>
            )
        },
        {
            key: 'endingDate',
            label: 'Data',
            sortable: false,
            render: (endingDate: string, activity: Activity) => (
                <div className="text-sm text-gray-600">
                    {endingDate ? new Date(endingDate).toLocaleDateString('ro-RO') :
                     activity.startingDate ? new Date(activity.startingDate).toLocaleDateString('ro-RO') : 'N/A'}
                </div>
            )
        }
    ];

    return (
        <>
            <div className="mb-6">
                <MyCotizatii />
            </div>

            <Card
                title="Management administrativ"
                className="mb-6 space-y-4"
            headerActions={
                <>
                    <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setActiveManagementView('membri')}
                            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                activeManagementView === 'membri'
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            Sumar Membri (CRM)
                        </button>
                        <button
                            onClick={() => setActiveManagementView('proiecte')}
                            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                activeManagementView === 'proiecte'
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            Sumar Proiecte (ERP)
                        </button>
                    </div>
                </>
            }
        >
            {activeManagementView === 'membri' ? (
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-4">
                        <div className="flex-1 max-w-md">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Caută membri..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                                />
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        {handleOpenCreateUser && (
                            <div className="flex gap-2">
                                <PrimaryActionButton 
                                    onClick={handleOpenCreateUser}
                                    size="sm"
                                >
                                    Creează utilizator
                                </PrimaryActionButton>
                            </div>
                        )}
                    </div>
                    
                    <DataTable<User>
                        data={filteredMembers}
                        columns={getMemberColumns()}
                        actions={getMemberActions()}
                        loading={membersLoading}
                        emptyMessage="Nu au fost găsiți utilizatori în sistem. Creează primul utilizator pentru a începe."
                        showFilters={false}
                        showPagination={false}
                    />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900">Proiecte</h3>
                            {handleOpenCreateProject && (
                                <PrimaryActionButton 
                                    onClick={handleOpenCreateProject}
                                    size="sm"
                                >
                                    Creează proiect
                                </PrimaryActionButton>
                            )}
                        </div>
                        <DataTable<Project>
                            data={projects}
                            columns={getProjectColumns()}
                            loading={projectsLoading}
                            onRowClick={(project: Project) => handleProjectClick(project.id)}
                            emptyMessage="Nu există proiecte disponibile"
                            showFilters={false}
                            showPagination={false}
                        />
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {selectedProject ? `Activități - ${projects.find(p => p.id === selectedProject)?.name}` : 'Activități Recente'}
                            </h3>
                            {handleOpenCreateActivity && (
                                <PrimaryActionButton 
                                    onClick={handleOpenCreateActivity}
                                    size="sm"
                                >
                                    Creează activitate
                                </PrimaryActionButton>
                            )}
                        </div>
                        <DataTable<Activity>
                            data={activities}
                            columns={getActivityColumns()}
                            loading={activitiesLoading}
                            emptyMessage="Nu există activități disponibile"
                            showFilters={false}
                            showPagination={false}
                        />
                    </div>
                </div>
            )}
        </Card>
        </>
    );
};