import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Project, Activity, User } from '@/types/index.types';

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
    SortButton: React.ComponentType<{ field: string; label: string }>;
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
    SortButton
}) => {
    const [activeManagementView, setActiveManagementView] = useState<'membri' | 'proiecte'>('membri');

    return (
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
                    </div>
                    
                    {membersLoading ? (
                        <div className="text-center py-8">Se încarcă membrii...</div>
                    ) : (
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
                                                {(member.groups && member.groups.length > 0) ? member.groups[0] : 'Member'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Proiecte</h3>
                        <div className="border rounded-lg overflow-hidden">
                            <div className="bg-gray-50 px-4 py-3 border-b">
                                <div className="grid grid-cols-3 gap-4 text-sm font-medium text-gray-600">
                                    <div>Nume Proiect</div>
                                    <div>Status</div>
                                    <div>Progres</div>
                                </div>
                            </div>
                            <div className="divide-y divide-gray-200 max-h-64 overflow-y-auto">
                                {projectsLoading ? (
                                    <div className="px-4 py-8 text-center">
                                        <div className="animate-pulse">Încărcare proiecte...</div>
                                    </div>
                                ) : projects.length > 0 ? (
                                    projects.map((project) => (
                                        <div
                                            key={project.id}
                                            className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${
                                                selectedProject === project.id ? 'bg-blue-50' : ''
                                            }`}
                                            onClick={() => handleProjectClick(project.id)}
                                        >
                                            <div className="grid grid-cols-3 gap-4 text-sm">
                                                <div className="font-medium">{project.name}</div>
                                                <div>
                                                    <span className={`px-2 py-1 rounded text-xs ${
                                                        getProjectStatusColor(project.status) === 'green' ? 'bg-green-100 text-green-800' :
                                                        getProjectStatusColor(project.status) === 'blue' ? 'bg-blue-100 text-blue-800' :
                                                        getProjectStatusColor(project.status) === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                                                        getProjectStatusColor(project.status) === 'red' ? 'bg-red-100 text-red-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {getProjectStatusText(project.status)}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {project.endDate ? new Date(project.endDate).toLocaleDateString('ro-RO') : 'N/A'}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="px-4 py-8 text-center text-gray-500">
                                        Nu există proiecte disponibile
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {selectedProject ? `Activități - ${projects.find(p => p.id === selectedProject)?.name}` : 'Activități Recente'}
                        </h3>
                        <div className="border rounded-lg overflow-hidden">
                            <div className="bg-gray-50 px-4 py-3 border-b">
                                <div className="grid grid-cols-4 gap-4 text-sm font-medium text-gray-600">
                                    <div>Nume Activitate</div>
                                    <div>Proiect</div>
                                    <div>Status</div>
                                    <div>Data</div>
                                </div>
                            </div>
                            <div className="divide-y divide-gray-200 max-h-64 overflow-y-auto">
                                {activitiesLoading ? (
                                    <div className="px-4 py-8 text-center">
                                        <div className="animate-pulse">Încărcare activități...</div>
                                    </div>
                                ) : activities.length > 0 ? (
                                    activities.map((activity) => (
                                        <div key={activity.id} className="px-4 py-3 hover:bg-gray-50">
                                            <div className="grid grid-cols-4 gap-4 text-sm">
                                                <div className="font-medium">{activity.title}</div>
                                                <div className="text-gray-600">
                                                    {projects.find(p => p.id === activity.projectId)?.name || 'Necunoscut'}
                                                </div>
                                                <div>
                                                    <span className={`px-2 py-1 rounded text-xs ${
                                                        getActivityStatusColor(activity.status) === 'green' ? 'bg-green-100 text-green-800' :
                                                        getActivityStatusColor(activity.status) === 'blue' ? 'bg-blue-100 text-blue-800' :
                                                        getActivityStatusColor(activity.status) === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                                                        getActivityStatusColor(activity.status) === 'red' ? 'bg-red-100 text-red-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {getActivityStatusText(activity.status)}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {activity.endDate ? new Date(activity.endDate).toLocaleDateString('ro-RO') : 
                                                     activity.startDate ? new Date(activity.startDate).toLocaleDateString('ro-RO') : 'N/A'}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="px-4 py-8 text-center text-gray-500">
                                        Nu există activități disponibile
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
};