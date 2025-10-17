import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { PrimaryActionButton } from '@/components/ui/PrimaryActionButton';
import { User } from '@/types/index.types';
import { Organization } from '@/types/organization.types';
import { useTranslation } from 'react-i18next';

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
    SortButton: React.ComponentType<{ field: string; label: string }>;
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
    currentUserId,
    SortButton
}) => {
    const { t } = useTranslation();
    const [activeAdminView, setActiveAdminView] = useState<'crm' | 'erp'>('crm');

    const getAdminName = (adminUserId: string): string => {
        const admin = filteredMembers.find(member => member.id === adminUserId);
        return admin?.full_name || admin?.email || 'N/A';
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
                    
                    {membersLoading ? (
                        <div className="text-center py-8">Se încarcă administratorii organizațiilor...</div>
                    ) : filteredMembers.length > 0 ? (
                        <div className="border rounded-lg overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <SortButton field="full_name" label="Name" />
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <SortButton field="email" label="Email" />
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <SortButton field="status" label="Status" />
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <SortButton field="role" label="Role" />
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Acțiuni
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredMembers.map((member, index) => (
                                        <tr key={member.id || index} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {member.full_name || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {member.email || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    member.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {member.status || 'Unknown'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                Administrator Organizație
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                {member.id === currentUserId ? (
                                                    <span className="text-gray-400 text-xs italic">Current user</span>
                                                ) : (
                                                    <>
                                                        {handleEditUser && (
                                                            <button 
                                                                className="text-blue-600 hover:text-blue-900 px-3 py-1 rounded border border-blue-600 hover:bg-blue-50 transition-colors"
                                                                onClick={() => handleEditUser(member)}
                                                            >
                                                                Edit
                                                            </button>
                                                        )}
                                                        {handleResetPassword && (
                                                            <button 
                                                                className="text-green-600 hover:text-green-900 px-3 py-1 rounded border border-green-600 hover:bg-green-50 transition-colors"
                                                                onClick={() => handleResetPassword(member.id)}
                                                            >
                                                                Resetare Parolă
                                                            </button>
                                                        )}
                                                        {member.status === 'ACTIVE' && handleDeactivateUser && (
                                                            <button 
                                                                className="text-yellow-600 hover:text-yellow-900 px-3 py-1 rounded border border-yellow-600 hover:bg-yellow-50 transition-colors"
                                                                onClick={() => handleDeactivateUser(member.id)}
                                                            >
                                                                Dezactivează
                                                            </button>
                                                        )}
                                                        {member.status === 'INACTIVE' && handleReactivateUser && (
                                                            <button 
                                                                className="text-purple-600 hover:text-purple-900 px-3 py-1 rounded border border-purple-600 hover:bg-purple-50 transition-colors"
                                                                onClick={() => handleReactivateUser(member.id)}
                                                            >
                                                                Reactivează
                                                            </button>
                                                        )}
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="border rounded-lg p-6 text-center">
                            <div className="text-gray-500 mb-4">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-2.239"/>
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Nu există utilizatori</h3>
                            <p className="text-gray-500 mb-4">
                                Nu au fost găsiți administratori de organizații în sistem. Folosește butonul de mai sus pentru a crea primul utilizator.
                            </p>
                        </div>
                    )}
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
                    
                    {organizationsLoading ? (
                        <div className="text-center py-8">Loading organizations...</div>
                    ) : filteredOrganizations.length > 0 ? (
                        <div className="border rounded-lg overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <SortButton field="name" label="Organizație" />
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <SortButton field="email" label="Email" />
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <SortButton field="status" label="Status" />
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <SortButton field="organization_type" label="Tip" />
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <SortButton field="member_count" label="Membri" />
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Administrator
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Module
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Acțiuni
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredOrganizations.map((org, index) => (
                                        <tr key={org.id || index} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {org.name || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {org.email || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    org.status === 'active' ? 'bg-green-100 text-green-800' : 
                                                    org.status === 'inactive' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {org.status === 'active' ? 'Activ' : 
                                                     org.status === 'inactive' ? 'Inactiv' : 
                                                     org.status === 'pending' ? 'În așteptare' : 'Necunoscut'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {org.organization_type || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {org.member_statistics?.total_people || org.member_count || 0}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {getAdminName(org.admin_user)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleToggleModule(org.id, 'ERP', org.active_modules?.includes('ERP') || false)}
                                                        className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                                                            org.active_modules?.includes('ERP')
                                                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                        }`}
                                                        title={org.active_modules?.includes('ERP') ? 'Click to disable ERP' : 'Click to enable ERP'}
                                                    >
                                                        ERP {org.active_modules?.includes('ERP') ? '✓' : '✗'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleModule(org.id, 'CRM', org.active_modules?.includes('CRM') || false)}
                                                        className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                                                            org.active_modules?.includes('CRM')
                                                                ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                        }`}
                                                        title={org.active_modules?.includes('CRM') ? 'Click to disable CRM' : 'Click to enable CRM'}
                                                    >
                                                        CRM {org.active_modules?.includes('CRM') ? '✓' : '✗'}
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                {org.status !== 'active' && (
                                                    <button 
                                                        className="text-blue-600 hover:text-blue-900 px-3 py-1 rounded border border-blue-600 hover:bg-blue-50 transition-colors"
                                                        onClick={() => handleActivateOrganization(org.id)}
                                                    >
                                                        Activează
                                                    </button>
                                                )}
                                                {org.status === 'active' && (
                                                    <button 
                                                        className="text-yellow-600 hover:text-yellow-900 px-3 py-1 rounded border border-yellow-600 hover:bg-yellow-50 transition-colors"
                                                        onClick={() => handleDeactivateOrganization(org.id)}
                                                    >
                                                        Dezactivează
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="border rounded-lg p-6 text-center">
                            <div className="text-gray-500 mb-4">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Nu există organizații</h3>
                            <p className="text-gray-500 mb-4">
                                Nu au fost găsite organizații în sistem. Folosește butonul de mai sus pentru a crea prima organizație.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
};