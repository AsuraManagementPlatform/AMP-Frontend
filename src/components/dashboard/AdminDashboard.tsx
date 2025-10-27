import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { PrimaryActionButton } from '@/components/ui/PrimaryActionButton';
import { User, TableColumn, TableAction } from '@/types/index.types';
import { Organization } from '@/types/organization.types';
import { useTranslation } from 'react-i18next';
import DataTable from "@/components/ui/DataTable.tsx";

interface AdminDashboardProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    filteredMembers: User[];
    membersLoading: boolean;
    filteredOrganizations: Organization[];
    organizationsLoading: boolean;
    handleOpenCreateUser: () => void;
    openCreateOrganizationModal: () => void;
    handleActivateOrganization: (organizationId: string) => void;
    handleDeactivateOrganization: (organizationId: string) => void;
    handleToggleModule: (organizationId: string, module: 'ERP' | 'CRM', currentlyEnabled: boolean) => void;
    handleDeactivateUser?: (userId: string) => void;
    handleReactivateUser?: (userId: string) => void;
    handleResetPassword?: (userId: string) => void;
    handleEditUser?: (user: User) => void;
    currentUserId?: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
    searchTerm,
    setSearchTerm,
    filteredMembers,
    membersLoading,
    filteredOrganizations,
    organizationsLoading,
    handleOpenCreateUser,
    openCreateOrganizationModal,
    handleActivateOrganization,
    handleDeactivateOrganization,
    handleToggleModule,
    handleDeactivateUser,
    handleReactivateUser,
    handleResetPassword,
    handleEditUser,
    currentUserId
}) => {
    const { t } = useTranslation();
    const [activeAdminView, setActiveAdminView] = useState<'crm' | 'erp'>('crm');

    const getAdminName = (adminUserId: string): string => {
        const admin = filteredMembers.find(member => member.id === adminUserId);
        return admin?.fullName || admin?.email || 'N/A';
    };

    const getUserColumns = (): TableColumn<User>[] => [
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
            render: () => <div className="text-sm text-gray-600 font-medium">Administrator Organizație</div>
        }
    ];

    const getUserActions = (): TableAction<User>[] => {
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

    const getOrganizationColumns = (): TableColumn<Organization>[] => [
        {
            key: 'name',
            label: 'Nume Organizație',
            sortable: false,
            render: (name: string) => (
                <div className="font-medium text-gray-900">{name}</div>
            )
        },
        {
            key: 'adminUser',
            label: 'Administrator',
            sortable: false,
            render: (adminUserId: string) => (
                <div className="text-sm text-gray-600">{getAdminName(adminUserId)}</div>
            )
        },
        {
            key: 'status',
            label: 'Status',
            sortable: false,
            render: (status: string) => (
                <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full shadow-sm ${
                    status === 'active' 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                    {status === 'active' ? 'Activ' : status === 'inactive' ? 'Inactiv' : status}
                </span>
            )
        },
        {
            key: 'activeModules',
            label: 'Module Active',
            sortable: false,
            render: (activeModules: string[] | undefined, row: Organization) => {
                const modules = activeModules || [];
                return (
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleToggleModule(row.id, 'ERP', modules.includes('ERP'))}
                            className={`px-3 py-1.5 text-xs font-semibold rounded transition-all shadow-sm ${
                                modules.includes('ERP')
                                    ? 'bg-green-100 text-green-800 border border-green-300 hover:bg-green-200'
                                    : 'bg-red-100 text-red-800 border border-red-300 hover:bg-red-200'
                            }`}
                            title={modules.includes('ERP') ? 'Click pentru a dezactiva ERP' : 'Click pentru a activa ERP'}
                        >
                            ERP {modules.includes('ERP') ? '✓' : '✗'}
                        </button>
                        <button
                            onClick={() => handleToggleModule(row.id, 'CRM', modules.includes('CRM'))}
                            className={`px-3 py-1.5 text-xs font-semibold rounded transition-all shadow-sm ${
                                modules.includes('CRM')
                                    ? 'bg-green-100 text-green-800 border border-green-300 hover:bg-green-200'
                                    : 'bg-red-100 text-red-800 border border-red-300 hover:bg-red-200'
                            }`}
                            title={modules.includes('CRM') ? 'Click pentru a dezactiva CRM' : 'Click pentru a activa CRM'}
                        >
                            CRM {modules.includes('CRM') ? '✓' : '✗'}
                        </button>
                    </div>
                );
            }
        }
    ];

    const getOrganizationActions = (): TableAction<Organization>[] => {
        const actions: TableAction<Organization>[] = [];

        actions.push({
            label: 'Activează',
            variant: 'primary',
            onClick: (org) => handleActivateOrganization(org.id),
            show: (org) => org.status !== 'active'
        });

        actions.push({
            label: 'Dezactivează',
            variant: 'danger',
            onClick: (org) => handleDeactivateOrganization(org.id),
            show: (org) => org.status === 'active'
        });

        return actions;
    };

    return (
        <Card
            title="Management administrativ - Sistem Global"
            className="mb-6 space-y-4"
            headerActions={
                <>
                    <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setActiveAdminView('crm')}
                            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                activeAdminView === 'crm'
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            Management Utilizatori (CRM)
                        </button>
                        <button
                            onClick={() => setActiveAdminView('erp')}
                            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                activeAdminView === 'erp'
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            Management Organizații (ERP)
                        </button>
                    </div>
                </>
            }
        >
            {activeAdminView === 'crm' ? (
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-4">
                        <div className="flex-1 max-w-md">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Caută administratori organizații..."
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
                        <div className="flex gap-2">
                            <PrimaryActionButton 
                                onClick={handleOpenCreateUser}
                                size="sm"
                            >
                                {t('label.user_create')}
                            </PrimaryActionButton>
                        </div>
                    </div>
                    
                    <DataTable<User>
                        data={filteredMembers}
                        columns={getUserColumns()}
                        actions={getUserActions()}
                        loading={membersLoading}
                        emptyMessage="Nu au fost găsiți administratori de organizații în sistem. Folosește butonul de mai sus pentru a crea primul utilizator."
                        showFilters={false}
                        showPagination={false}
                    />
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-4">
                        <div className="flex-1 max-w-md">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search organizations..."
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
                        <div className="flex gap-2">
                            <PrimaryActionButton 
                                onClick={openCreateOrganizationModal}
                                size="sm"
                            >
                                {t('label.organisation_create')}
                            </PrimaryActionButton>
                        </div>
                    </div>
                    
                    <DataTable<Organization>
                        data={filteredOrganizations}
                        columns={getOrganizationColumns()}
                        actions={getOrganizationActions()}
                        loading={organizationsLoading}
                        emptyMessage="Nu au fost găsite organizații. Folosește butonul de mai sus pentru a crea prima organizație."
                        showFilters={false}
                        showPagination={false}
                        className=""
                    />
                </div>
            )}
        </Card>
    );
};