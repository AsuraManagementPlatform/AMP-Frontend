import React from 'react';
import { Card } from '@/components/ui/Card';
import { Project } from '@/types/project.types';
import { t } from 'i18next';

interface ProjectDetailsTabProps {
    project: Project;
}

export const ProjectDetailsTab: React.FC<ProjectDetailsTabProps> = ({ project }) => {
    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'bg-green-100 text-green-800';
            case 'COMPLETED': return 'bg-blue-100 text-blue-800';
            case 'ON_HOLD': return 'bg-yellow-100 text-yellow-800';
            case 'CANCELLED': return 'bg-red-100 text-red-800';
            case 'DRAFT': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'Activ';
            case 'COMPLETED': return 'Finalizat';
            case 'ON_HOLD': return 'Suspendat';
            case 'CANCELLED': return 'Anulat';
            case 'DRAFT': return 'Draft';
            default: return status;
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('ro-RO', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    return (
        <>
            <Card title="Informații generale" className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Nume proiect
                        </label>
                        <p className="text-gray-900">{project.name}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Categorie
                        </label>
                        <p className="text-gray-900">{project.category || 'N/A'}</p>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Descriere
                        </label>
                        <p className="text-gray-900">{project.description || 'Fără descriere'}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Locație
                        </label>
                        <p className="text-gray-900">{project.location || 'N/A'}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Status
                        </label>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(project.status)}`}>
                            {getStatusLabel(project.status)}
                        </span>
                    </div>
                </div>
            </Card>

            <Card title="Planificare" className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Data de început
                        </label>
                        <p className="text-gray-900">{formatDate(project.startingDate)}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Data de sfârșit
                        </label>
                        <p className="text-gray-900">{formatDate(project.endingDate)}</p>
                    </div>
                </div>
            </Card>

            <Card title="Buget" className="mb-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            {t('label.project.planned_budget')}
                        </label>
                        <p className="text-gray-900 text-2xl font-semibold">
                            {project.budget?.toLocaleString('ro-RO')}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Moneda
                        </label>
                        <p className="text-gray-900">{project.currency || 'RON'}</p>
                    </div>

                    {project.budgetNotes && (
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Note buget
                            </label>
                            <p className="text-gray-900">{project.budgetNotes}</p>
                        </div>
                    )}
                </div>

                {project.activeFunds !== 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                {t('label.project.active_funds')}
                            </label>
                            <p className="text-gray-900 text-2xl font-semibold">
                                {project.activeFunds?.toLocaleString('ro-RO')} {project.currency || 'RON'}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                {t('label.project.active_funds_on_planned_budget')}
                            </label>
                            {(() => {
                                const percentage = project.budget ? (project.activeFunds / project.budget * 100).toFixed(1) : 0;
                                const isAdequate = project.activeFunds >= project.budget;
                                return (
                                    <p className={`text-2xl font-semibold ${isAdequate ? 'text-green-600' : 'text-red-600'}`}>
                                        {percentage}%
                                    </p>
                                );
                            })()}
                        </div>
                    </div>
                )}

                {project.activeExpenses !== 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                {t('label.project.active_expenses')}
                            </label>
                            <p className="text-gray-900 text-2xl font-semibold">
                                {project.activeExpenses?.toLocaleString('ro-RO')} {project.currency || 'RON'}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                {t('label.project.active_expenses_on_active_funds')}
                            </label>
                            {(() => {
                                const percentage = project.activeFunds ? (project.activeExpenses / project.activeFunds * 100).toFixed(1) : 0;
                                const isWithinBudget = project.activeExpenses < project.activeFunds;
                                return (
                                    <p className={`text-2xl font-semibold ${isWithinBudget ? 'text-green-600' : 'text-red-600'}`}>
                                        {percentage}%
                                    </p>
                                );
                            })()}
                        </div>
                        <div></div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                {t('label.project.active_expenses_on_planned_budget')}
                            </label>
                            {(() => {
                                const percentage = project.budget ? (project.activeExpenses / project.budget * 100).toFixed(1) : '0';
                                const percentageNum = parseFloat(percentage);
                                let colorClass = 'text-blue-600';

                                if (percentageNum >= 90) {
                                    colorClass = 'text-orange-600';
                                } else if (percentageNum >= 75) {
                                    colorClass = 'text-amber-600';
                                } else if (percentageNum >= 50) {
                                    colorClass = 'text-yellow-600';
                                }

                                return (
                                    <p className={`text-2xl font-semibold ${colorClass}`}>
                                        {percentage}%
                                    </p>
                                );
                            })()}
                        </div>
                    </div>
                )}
            </Card>
        </>
    );
};