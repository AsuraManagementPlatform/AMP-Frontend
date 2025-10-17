import React from 'react';
import { Card } from '@/components/ui/Card';
import { Project, Activity, User } from '@/types/index.types';

interface MemberDashboardProps {
    user: User | null;
    projects: Project[];
    activities: Activity[];
    projectsLoading: boolean;
    activitiesLoading: boolean;
}

export const MemberDashboard: React.FC<MemberDashboardProps> = ({
    user,
    projects,
    activities,
    projectsLoading,
    activitiesLoading
}) => {
    return (
        <>
            <div className="mb-6">
                <Card title="Tablou informativ - Proiectele și activitățile mele" className="mb-6">
                    <div className="space-y-4">
                        <div className="text-sm text-gray-600 mb-4">
                            Vezi aici toate proiectele și activitățile la care participi
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-3">Proiectele mele</h4>
                                <div className="border rounded-lg overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left">Proiect</th>
                                                <th className="px-4 py-2 text-left">Status</th>
                                                <th className="px-4 py-2 text-left">Progres</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {projectsLoading ? (
                                                <tr>
                                                    <td colSpan={3} className="px-4 py-6 text-center text-gray-500">
                                                        <div className="animate-pulse">Încărcare proiecte...</div>
                                                    </td>
                                                </tr>
                                            ) : projects.length > 0 ? (
                                                projects.map((project, index) => (
                                                    <tr key={project.id || index} className="hover:bg-gray-50">
                                                        <td className="px-4 py-3 font-medium">{project.name}</td>
                                                        <td className="px-4 py-3">
                                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                                project.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                            }`}>
                                                                {project.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={3} className="px-4 py-6 text-center text-gray-500">
                                                        Nu participi la niciun proiect în acest moment
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-3">Activitățile mele</h4>
                                <div className="border rounded-lg overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left">Activitate</th>
                                                <th className="px-4 py-2 text-left">Status</th>
                                                <th className="px-4 py-2 text-left">Deadline</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {activitiesLoading ? (
                                                <tr>
                                                    <td colSpan={3} className="px-4 py-6 text-center text-gray-500">
                                                        <div className="animate-pulse">Încărcare activități...</div>
                                                    </td>
                                                </tr>
                                            ) : activities.length > 0 ? (
                                                activities.map((activity, index) => (
                                                    <tr key={activity.id || index} className="hover:bg-gray-50">
                                                        <td className="px-4 py-3 font-medium">{activity.title}</td>
                                                        <td className="px-4 py-3">
                                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                                activity.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                            }`}>
                                                                {activity.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-600">
                                                            {activity.endingDate || activity.startingDate || 'N/A'}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={3} className="px-4 py-6 text-center text-gray-500">
                                                        Nu ai activități asignate în acest moment
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-semibold text-blue-800 mb-2">Informații despre mine</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-600">Nume:</span> 
                                    <span className="ml-2 font-medium">{user?.fullName || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Email:</span> 
                                    <span className="ml-2 font-medium">{user?.email || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Organizație:</span> 
                                    <span className="ml-2 font-medium">N/A</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Status:</span> 
                                    <span className="ml-2 font-medium">{user?.status || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </>
    );
};