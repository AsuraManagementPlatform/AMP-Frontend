import {TableAction, TableColumn, Project, ProjectStatus, ProjectPriority} from '@/types/index.types';
import React from "react";
import Table from "@/components/ui/Table.tsx";
import IconView from "@/assets/icons/iconmonstr-view.svg?react";
import IconEdit from "@/assets/icons/iconmonstr-edit.svg?react";
import IconDelete from "@/assets/icons/iconmonstr-delete.svg?react";

interface ProjectListProps {
    onEdit?: (project: Project) => void;
    onView?: (project: Project) => void;
    onDelete?: (project: Project) => void;
    onRowClick?: (project: Project) => void;
    refreshTrigger?: number;
    showActions?: {
        edit?: boolean;
        delete?: boolean;
        view?: boolean;
    };
    canDeleteProject?: (project: Project) => boolean;
    className?: string;
    pageSize?: number;
    showSearch?: boolean;
    showFilters?: boolean;
    showPagination?: boolean;
}

export const ProjectList: React.FC<ProjectListProps> = ({
                                                          onEdit,
                                                          onView,
                                                          onDelete,
                                                          onRowClick,
                                                          refreshTrigger = 0,
                                                          showActions = { edit: true, delete: true, view: true },
                                                          canDeleteProject,
                                                          className = '',
                                                          pageSize = 20,
                                                          showSearch = true,
                                                          showFilters = true,
                                                          showPagination = true
                                                      }) => {

    const getColumns = (): TableColumn<Project>[] => [
        {
            key: 'name',
            label: 'Nume Proiect',
            sortable: true,
            filterable: true,
            filterType: 'text',
            width: '200px',
        },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
            filterable: true,
            filterType: 'select',
            filterOptions: [
                { value: ProjectStatus.DRAFT, label: 'Draft' },
                { value: ProjectStatus.ACTIVE, label: 'Activ' },
                { value: ProjectStatus.COMPLETED, label: 'Finalizat' },
                { value: ProjectStatus.CANCELLED, label: 'Anulat' },
                { value: ProjectStatus.ON_HOLD, label: 'Suspendat' }
            ],
            width: '120px',
            render: (value: string) => {
                const statusLabels = {
                    [ProjectStatus.DRAFT]: 'Draft',
                    [ProjectStatus.ACTIVE]: 'Activ',
                    [ProjectStatus.COMPLETED]: 'Finalizat',
                    [ProjectStatus.CANCELLED]: 'Anulat',
                    [ProjectStatus.ON_HOLD]: 'Suspendat'
                };
                
                const statusColors = {
                    [ProjectStatus.DRAFT]: 'bg-gray-100 text-gray-800',
                    [ProjectStatus.ACTIVE]: 'bg-green-100 text-green-800',
                    [ProjectStatus.COMPLETED]: 'bg-blue-100 text-blue-800',
                    [ProjectStatus.CANCELLED]: 'bg-red-100 text-red-800',
                    [ProjectStatus.ON_HOLD]: 'bg-yellow-100 text-yellow-800'
                };
                
                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[value as ProjectStatus]}`}>
                        {statusLabels[value as ProjectStatus] || value}
                    </span>
                );
            }
        },
        {
            key: 'priority',
            label: 'Prioritate',
            sortable: true,
            filterable: true,
            filterType: 'select',
            filterOptions: [
                { value: ProjectPriority.LOW, label: 'Scăzută' },
                { value: ProjectPriority.MEDIUM, label: 'Medie' },
                { value: ProjectPriority.HIGH, label: 'Înaltă' },
                { value: ProjectPriority.URGENT, label: 'Urgentă' }
            ],
            width: '100px',
            render: (value: string) => {
                const priorityLabels = {
                    [ProjectPriority.LOW]: 'Scăzută',
                    [ProjectPriority.MEDIUM]: 'Medie',
                    [ProjectPriority.HIGH]: 'Înaltă',
                    [ProjectPriority.URGENT]: 'Urgentă'
                };
                
                const priorityColors = {
                    [ProjectPriority.LOW]: 'text-gray-600',
                    [ProjectPriority.MEDIUM]: 'text-blue-600',
                    [ProjectPriority.HIGH]: 'text-orange-600',
                    [ProjectPriority.URGENT]: 'text-red-600'
                };
                
                return (
                    <span className={`font-medium ${priorityColors[value as ProjectPriority]}`}>
                        {priorityLabels[value as ProjectPriority] || value}
                    </span>
                );
            }
        },
        {
            key: 'budget',
            label: 'Buget (RON)',
            sortable: true,
            width: '120px',
            render: (value: number) => {
                if (!value) return '-';
                return new Intl.NumberFormat('ro-RO', {
                    style: 'currency',
                    currency: 'RON',
                    maximumFractionDigits: 0
                }).format(value);
            }
        },
        {
            key: 'startDate',
            label: 'Data început',
            sortable: true,
            width: '120px',
            render: (value: string) => {
                if (!value) return '-';
                return new Date(value).toLocaleDateString('ro-RO');
            }
        },
        {
            key: 'endDate',
            label: 'Data sfârșit',
            sortable: true,
            width: '120px',
            render: (value: string) => {
                if (!value) return '-';
                return new Date(value).toLocaleDateString('ro-RO');
            }
        },
        {
            key: 'createdAt',
            label: 'Creat la',
            sortable: true,
            width: '120px',
            render: (value: string) => new Date(value).toLocaleDateString('ro-RO')
        }
    ];

    const getActions = (): TableAction<Project>[] => {
        const actions: TableAction<Project>[] = [];

        if (showActions.view && onView) {
            actions.push({
                label: 'Vizualizează',
                icon: <IconView className="w-4 h-4" />,
                onClick: onView,
                variant: 'secondary'
            });
        }

        if (showActions.edit && onEdit) {
            actions.push({
                label: 'Editează',
                icon: <IconEdit className="w-4 h-4" />,
                onClick: onEdit,
                variant: 'primary'
            });
        }

        if (showActions.delete && onDelete) {
            actions.push({
                label: 'Șterge',
                icon: <IconDelete className="w-4 h-4" />,
                onClick: onDelete,
                variant: 'danger',
                show: canDeleteProject
            });
        }

        return actions;
    };

    return (
        <Table<Project>
            endpoint="/api/project/list"
            columns={getColumns()}
            actions={getActions()}
            onRowClick={onRowClick}
            refreshTrigger={refreshTrigger}
            className={className}
            pageSize={pageSize}
            showSearch={showSearch}
            showFilters={showFilters}
            showPagination={showPagination}
            initialSort={{ field: 'createdAt', direction: 'desc' }}
        />
    );
};

export default ProjectList;