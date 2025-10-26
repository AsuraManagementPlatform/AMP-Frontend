import {TableAction, TableColumn, ProjectExpenseStatus, ProjectExpense, ExpenseCategory} from '@/types/index.types';
import React, {useState} from "react";
import Table from "@/components/ui/Table.tsx";
import IconEdit from "@/assets/icons/iconmonstr-edit.svg?react";
import IconDelete from "@/assets/icons/iconmonstr-delete.svg?react";
import {UpdateProjectExpenseModal} from '@/components/modals/project-expense/UpdateProjectExpenseModal';
import projectExpenseService from '@/services/project-expense.service';
import showToast from '@/components/ui/Toast';
import {useConfirmDialog} from "@/components/ui/ConfirmDialog.tsx";
import IconWarning from '@/assets/icons/iconmonstr-warning.svg?react'

interface ProjectExpenseListProps {
    project: string;
    refreshTrigger?: number;
    pageSize?: number;
}

export const ProjectExpenseList: React.FC<ProjectExpenseListProps> = ({
                                                                          project,
                                                                          refreshTrigger = 0,
                                                                          pageSize = 10
                                                                      }) => {
    const confirm = useConfirmDialog();
    const [selectedExpense, setSelectedExpense] = useState<ProjectExpense | null>(null);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [localRefresh, setLocalRefresh] = useState(0);

    const handleEdit = (expense: ProjectExpense) => {
        setSelectedExpense(expense);
        setIsUpdateModalOpen(true);
    };

    const handleDelete = async (expense: ProjectExpense) => {
      const isConfirmed = await confirm({
        title: 'Șterge cheltuiala proiectului',
        message: `Sigur doriți să ștergeți cheltuiala "${expense.name}"?`,
        confirmText: 'Confirmă',
        cancelText: 'Renunță',
        confirmButtonVariant: 'primary',
        icon: (<IconWarning></IconWarning>)
      });

      if (!isConfirmed) {
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
            size: 'lg',
        },
        {
            key: 'activityTitle',
            label: 'Activitate',
            sortable: false,
            size: 'sm',
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
            size: 'sm',
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
            key: 'vatAmount',
            label: 'TVA',
            sortable: true,
            size: 'sm',
            render: (vatAmount: number, row: ProjectExpense) => {
                return `${vatAmount.toLocaleString('ro-RO', { minimumFractionDigits: 2 })} ${row.currency}`;
            }
        },
        {
            key: 'totalAmount',
            label: 'Total',
            sortable: true,
            size: 'md',
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
                { label: 'Planificat', value: ProjectExpenseStatus.PLANNED },
                { label: 'Plătit', value: ProjectExpenseStatus.PAID },
                { label: 'Anulat', value: ProjectExpenseStatus.CANCELLED }
            ],
        size: 'md',
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
                endpoint={`project_expense/list?project_id=${project}`}
                columns={getColumns()}
                actions={getActions()}
                initialPageSize={pageSize}
                initialSort={{ field: 'created_at', direction: 'desc' }}
                showFilters={true}
                showPagination={true}
                emptyMessage="Nu există cheltuieli pentru acest proiect."
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
                    project={project}
                />
            )}
        </>
    );
};

export default ProjectExpenseList;