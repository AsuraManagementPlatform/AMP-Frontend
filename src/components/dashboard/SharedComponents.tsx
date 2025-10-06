import React from 'react';
import { Card } from '@/components/ui/Card';
import { GlobalDashboardStats } from '@/services/dashboard.service';

interface StatsSectionProps {
    stats: GlobalDashboardStats;
    loading: boolean;
    isAdmin: boolean;
}

export const StatsSection: React.FC<StatsSectionProps> = ({ stats, loading, isAdmin }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
            title={isAdmin ? "Organizații" : "Statistici"} 
            subtitle={isAdmin ? "Total organizații înregistrate" : "Prezentare generală a performanței tale"}
        >
            {loading ? (
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                </div>
            ) : stats.totalOrganizations > 0 ? (
                <div className="text-2xl font-semibold text-green-600">
                    {stats.totalOrganizations}
                </div>
            ) : (
                <p className="text-gray-500">
                    {isAdmin ? "Nu există organizații înregistrate." : "Nu există date statistice disponibile."}
                </p>
            )}
        </Card>
    </div>
);