import { TableAction, TableColumn } from '@/types/index.types';
import React from "react";
import Table from "@/components/ui/Table.tsx";
import IconEdit from "@/assets/icons/iconmonstr-edit.svg?react";
import IconDelete from "@/assets/icons/iconmonstr-delete.svg?react";
import { ProjectFund } from '@/types/project-finance.types';

interface ProjectFundListProps {
    projectId: string;
    onEdit?: (fund: ProjectFund) => void;
    onDelete?: (fund: ProjectFund) => void;
    onRowClick?: (fund: ProjectFund) => void;
    refreshTrigger?: number;
    className?: string;
    pageSize?: number;
}

export const ProjectFundList: React.FC<ProjectFundListProps> = ({
                                                                    projectId,
                                                                    onEdit,
                                                                    onDelete,
                                                                    onRowClick,
                                                                    refreshTrigger = 0,
                                                                    className = '',
                                                                    pageSize = 10
                                                                }) => {

    const getColumns = (): TableColumn<ProjectFund>[] => [
        {
            key: 'source_name',
            label: 'Surs─â',
            sortable: true,
            filterable: false,
            width: '200px',
        },
        {
            key: 'category',
            label: 'Categorie',
            sortable: true,
            filterable: true,
            filterType: 'text',
            width: '150px',
        },
        {
            key: 'amount',
            label: 'Sum─â',
            sortable: true,
            width: '120px',
            render: (amount: number, row: ProjectFund) => {
                return `${amount.toLocaleString('ro-RO')} ${row.currency}`;
            }
        },
        {
            key: 'estimated_amount',
            label: 'Sum─â estimat─â',
            sortable: true,
            width: '120px',
            render: (amount: number, row: ProjectFund) => {
                return `${amount.toLocaleString('ro-RO')} ${row.currency}`;
            }
        },
        {
            key: 'date',
            label: 'Data',
            sortable: true,
            width: '120px',
            render: (date: string) => {
                return new Date(date).toLocaleDateString('ro-RO');
            }
        }
    ];

    const getActions = (): TableAction<ProjectFund>[] => {
        const actions: TableAction<ProjectFund>[] = [];

        if (onEdit) {
            actions.push({
                label: 'Edit',
                variant: 'primary',
                onClick: onEdit,
                icon: <IconEdit />
            });
        }

        if (onDelete) {
            actions.push({
                label: 'Delete',
                variant: 'danger',
                onClick: onDelete,
                icon: <IconDelete />
            });
        }

        return actions;
    };

    return (
        <Table<ProjectFund>
            endpoint={`project_fund/list?project_id=${projectId}`}
            columns={getColumns()}
            actions={getActions()}
            onRowClick={onRowClick}
            pageSize={pageSize}
            initialSort={{ field: 'date', direction: 'desc' }}
            showSearch={true}
            showFilters={true}
            showPagination={true}
            emptyMessage="Nu exist─â surse de finan╚¢are pentru acest proiect."
            className={className}
            refreshTrigger={refreshTrigger}
        />
    );
};

export default ProjectFundList;
