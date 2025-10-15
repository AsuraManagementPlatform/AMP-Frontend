import { TableAction, TableColumn } from '@/types/index.types';
import React from "react";
import Table from "@/components/ui/Table.tsx";
import IconEdit from "@/assets/icons/iconmonstr-edit.svg?react";
import IconDelete from "@/assets/icons/iconmonstr-delete.svg?react";
import { ProjectFund } from '@/types/project-fund.types.ts';

interface ProjectFundListProps {
    project: string;
    onEdit?: (fund: ProjectFund) => void;
    onDelete?: (fund: ProjectFund) => void;
    onRowClick?: (fund: ProjectFund) => void;
    refreshTrigger?: number;
    className?: string;
    pageSize?: number;
}

export const ProjectFundList: React.FC<ProjectFundListProps> = ({
                                                                    project,
                                                                    onEdit,
                                                                    onDelete,
                                                                    onRowClick,
                                                                    refreshTrigger = 0,
                                                                    className = '',
                                                                    pageSize = 10
                                                                }) => {

    const getColumns = (): TableColumn<ProjectFund>[] => [
        {
            key: 'sourceName',
            label: 'Sursă',
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
            label: 'Sumă',
            sortable: true,
            width: '120px',
            render: (amount: number, row: ProjectFund) => {
                return `${amount.toLocaleString('ro-RO')} ${row.currency}`;
            }
        },
        {
            key: 'estimatedAmount',
            label: 'Sumă estimată',
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
            endpoint={`project_fund/list?project_id=${project}`}
            columns={getColumns()}
            actions={getActions()}
            onRowClick={onRowClick}
            pageSize={pageSize}
            initialSort={{ field: 'date', direction: 'desc' }}
            showSearch={true}
            showFilters={true}
            showPagination={true}
            emptyMessage="Nu există surse de finanțare pentru acest proiect."
            className={className}
            refreshTrigger={refreshTrigger}
        />
    );
};

export default ProjectFundList;
