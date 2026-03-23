import React from 'react';
import { Card } from '@/components/ui/Card';
import { GlobalDashboardStats } from '@/services/dashboard.service';

interface StatsSectionProps {
    stats: GlobalDashboardStats;
    loading: boolean;
    isAdmin: boolean;
}

export const StatsSection: React.FC<StatsSectionProps> = ({ stats, loading, isAdmin }) => {
    return (
    <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
        <Card 
            title={isAdmin ? "Activități globale" : "Activități recente"} 
            subtitle={isAdmin ? "Total activități din toate organizațiile" : "Ultimele noutăți din proiectele tale"}
        >
            {loading ? (
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                </div>
            ) : stats.totalActivities > 0 ? (
                <div className="text-2xl font-semibold text-orange-600">
                    {stats.totalActivities}
                </div>
            ) : (
                <p className="text-gray-500">
                    {isAdmin ? "Nu există activități în sistem." : "Nicio activitate recentă."}
                </p>
            )}
        </Card>

        <Card 
            title={isAdmin ? "Proiecte globale" : "Proiecte active"} 
            subtitle={isAdmin ? "Total proiecte din toate organizațiile" : "Proiecte la care lucrezi în prezent"}
        >
            {loading ? (
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                </div>
            ) : stats.totalProjects > 0 ? (
                <div className="text-2xl font-semibold text-blue-600">
                    {stats.totalProjects}
                </div>
            ) : (
                <p className="text-gray-500">
                    {isAdmin ? "Nu există proiecte în sistem." : "Niciun proiect activ."}
                </p>
            )}
        </Card>

        <Card 
            title={isAdmin ? "Organizații" : "Membri organizație"} 
            subtitle={isAdmin ? "Total organizații înregistrate" : "Prezentare generală a membrilor"}
        >
            {loading ? (
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                </div>
            ) : isAdmin ? (
                stats.totalOrganizations > 0 ? (
                    <div className="text-2xl font-semibold text-green-600">
                        {stats.totalOrganizations}
                    </div>
                ) : (
                    <p className="text-gray-500">Nu există organizații înregistrate.</p>
                )
            ) : (
                <div className="space-y-2">
                    <div className="flex justify-between items-center border-b pb-2">
                        <span className="text-sm font-medium text-gray-700">Total membri:</span>
                        <span className="text-lg font-bold text-green-600">{stats.totalMembers || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Administratori organizație:</span>
                        <span className="text-sm font-semibold text-blue-600">{stats.organizationAdmins || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Angajați:</span>
                        <span className="text-sm font-semibold text-purple-600">{stats.employees || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Membri:</span>
                        <span className="text-sm font-semibold text-indigo-600">{stats.members || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Voluntari:</span>
                        <span className="text-sm font-semibold text-orange-600">{stats.volunteers || 0}</span>
                    </div>
                </div>
            )}
        </Card>

    </div>
    );
};