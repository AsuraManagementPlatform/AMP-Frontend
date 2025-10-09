import {TableAction, TableColumn, TransactionStatus} from '@/types/index.types';
import React, { useState } from "react";
import Table from "@/components/ui/Table.tsx";
import IconEdit from "@/assets/icons/iconmonstr-edit.svg?react";
import IconDelete from "@/assets/icons/iconmonstr-delete.svg?react";
import { ProjectExpense, ExpenseCategory, UnitType } from '@/types/project-expense.types';
import { UpdateProjectExpenseModal } from '@/components/modals/project-expense/UpdateProjectExpenseModal';
import projectExpenseService from '@/services/project-expense.service';
import showToast from '@/components/ui/Toast';

interface ProjectExpenseListProps {
    projectId: string;
    refreshTrigger?: number;
    className?: string;
    pageSize?: number;
}

export const ProjectExpenseList: React.FC<ProjectExpenseListProps> = ({
                                                                          projectId,
                                                                          refreshTrigger = 0,
                                                                          className = '',
                                                                          pageSize = 10
                                                                      }) => {
    const [selectedExpense, setSelectedExpense] = useState<ProjectExpense | null>(null);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [localRefresh, setLocalRefresh] = useState(0);

    const handleEdit = (expense: ProjectExpense) => {
        setSelectedExpense(expense);
        setIsUpdateModalOpen(true);
    };

    const handleDelete = async (expense: ProjectExpense) => {
        if (!window.confirm(`Sigur doriți să ștergeți cheltuiala "${expense.name}"?`)) {
            return;
        }

        try {
            await projectExpenseService.delete(expense.id);
            showToast.success('Cheltuiala a fost ștearsă cu succes!');
            setLocalRefresh(prev => prev + 1);
        } catch (error: any) {
            const errorMessage = error?.message || 'Eroare la ștergerea cheltuielii';
            showToast.error(errorMessage);
        }
    };

    const handleUpdateSuccess = () => {
        setLocalRefresh(prev => prev + 1);
    };

    const getColumns = (): TableColumn<ProjectExpense>[] => [
        {
            key: 'name',
            label: 'Nume',
            sortable: true,
            width: '200px',
        },
        {
            key: 'activity_title',
            label: 'Activitate',
            sortable: false,
            width: '180px',
        },
        {
            key: 'category',
            label: 'Categorie',
            sortable: true,
            filterable: true,
            filterType: 'select',
            filterOptions: [
                { label: 'Personal', value: ExpenseCategory.PERSONNEL },
                { label: 'Echipamente', value: ExpenseCategory.EQUIPMENT },
                { label: 'Materiale', value: ExpenseCategory.MATERIALS },
                { label: 'Servicii', value: ExpenseCategory.SERVICES },
                { label: 'Deplasări', value: ExpenseCategory.TRAVEL },
                { label: 'Utilități', value: ExpenseCategory.UTILITIES },
                { label: 'Marketing', value: ExpenseCategory.MARKETING },
                { label: 'Administrative', value: ExpenseCategory.ADMINISTRATIVE },
                { label: 'Altele', value: ExpenseCategory.OTHER }
            ],
            width: '120px',
            render: (category: string) => {
                const categoryLabels = {
                    'PERSONNEL': 'Personal',
                    'EQUIPMENT': 'Echipamente',
                    'MATERIALS': 'Materiale',
                    'SERVICES': 'Servicii',
                    'TRAVEL': 'Deplasări',
                    'UTILITIES': 'Utilități',
                    'MARKETING': 'Marketing',
                    'ADMINISTRATIVE': 'Administrative',
                    'OTHER': 'Altele'
                };
                return categoryLabels[category as keyof typeof categoryLabels] || category;
            }
        },
        {
            key: 'quantity',
            label: 'Cantitate',
            sortable: true,
            width: '100px',
            render: (quantity: number, row: ProjectExpense) => {
                const unitLabels = {
                    'HOUR': 'ore',
                    'DAY': 'zile',
                    'NUMBER': 'buc',
                    'BATCH': 'loturi'
                };
                return `${quantity} ${unitLabels[row.unit_type as keyof typeof unitLabels] || ''}`;
            }
        },
        {
            key: 'unit_price',
            label: 'Preț unitar',
            sortable: true,
            width: '120px',
            render: (price: number, row: ProjectExpense) => {
                return `${price.toLocaleString('ro-RO', { minimumFractionDigits: 2 })} ${row.currency}`;
            }
        },
        {
            key: 'total_amount',
            label: 'Total',
            sortable: true,
            width: '120px',
            render: (amount: number, row: ProjectExpense) => {
                return `${amount.toLocaleString('ro-RO', { minimumFractionDigits: 2 })} ${row.currency}`;
            }
        },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
            filterable: true,
            filterType: 'select',
            filterOptions: [
                { label: 'Draft', value: TransactionStatus.DRAFT },
                { label: 'În aprobare', value: TransactionStatus.PENDING_APPROVAL },
                { label: 'Aprobat', value: TransactionStatus.APPROVED },
                { label: 'Plătit', value: TransactionStatus.PAID },
                { label: 'Respins', value: TransactionStatus.REJECTED },
                { label: 'Anulat', value: TransactionStatus.CANCELLED }
            ],
            width: '120px',
            render: (status: string) => {
                const statusColors = {
                    'DRAFT': 'bg-gray-100 text-gray-800',
                    'PENDING_APPROVAL': 'bg-yellow-100 text-yellow-800',
                    'APPROVED': 'bg-green-100 text-green-800',
                    'PAID': 'bg-blue-100 text-blue-800',
                    'REJECTED': 'bg-red-100 text-red-800',
                    'CANCELLED': 'bg-gray-100 text-gray-800'
                };

                const statusLabels = {
                    'DRAFT': 'Draft',
                    'PENDING_APPROVAL': 'În aprobare',
                    'APPROVED': 'Aprobat',
                    'PAID': 'Plătit',
                    'REJECTED': 'Respins',
                    'CANCELLED': 'Anulat'
                };

                return (
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
                        {statusLabels[status as keyof typeof statusLabels] || status}
                    </span>
                );
            }
        }
    ];

    const getActions = (): TableAction<ProjectExpense>[] => [
        {
            label: 'Edit',
            variant: 'primary',
            onClick: handleEdit,
            icon: <IconEdit />
        },
        {
            label: 'Delete',
            variant: 'danger',
            onClick: handleDelete,
            icon: <IconDelete />
        }
    ];

    return (
        <>
            <Table<ProjectExpense>
                endpoint={`project_expense/list?project_id=${projectId}`}
                columns={getColumns()}
                actions={getActions()}
                pageSize={pageSize}
                initialSort={{ field: 'created_at', direction: 'desc' }}
                showSearch={false}
                showFilters={true}
                showPagination={true}
                emptyMessage="Nu există cheltuieli pentru acest proiect."
                className={className}
                refreshTrigger={refreshTrigger + localRefresh}
            />

            {isUpdateModalOpen && selectedExpense && (
                <UpdateProjectExpenseModal
                    isOpen={isUpdateModalOpen}
                    onClose={() => {
                        setIsUpdateModalOpen(false);
                        setSelectedExpense(null);
                    }}
                    onSuccess={handleUpdateSuccess}
                    expense={selectedExpense}
                    projectId={projectId}
                />
            )}
        </>
    );
};

export default ProjectExpenseList;