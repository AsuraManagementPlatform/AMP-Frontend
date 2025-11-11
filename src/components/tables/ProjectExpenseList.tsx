import {ProjectExpenseStatus, TableAction, TableColumn} from '@/types/index.types';
import React, {useEffect, useState} from "react";
import Table from "@/components/ui/Table.tsx";
import IconEdit from "@/assets/icons/iconmonstr-edit.svg?react";
import IconDelete from "@/assets/icons/iconmonstr-delete.svg?react";
import IconCheckList from "@/assets/icons/iconmonstr-ckeck-list.svg?react";
import {ProjectExpense} from '@/types/project-expense.types';
import {UpdateProjectExpenseModal} from '@/components/modals/project-expense/UpdateProjectExpenseModal';
import {ExecuteProjectExpenseModal} from '@/components/modals/project-expense/ExecuteProjectExpenseModal';
import {ProjectExpenseDetailsModal} from '@/components/modals/project-expense/ProjectExpenseDetailsModal.tsx';
import projectExpenseService from '@/services/project-expense.service';
import showToast from '@/components/ui/Toast';
import {useConfirmDialog} from "@/components/ui/ConfirmDialog";
import IconWarning from '@/assets/icons/iconmonstr-warning.svg?react';
import {t} from 'i18next';
import projectFundService from "@/services/project-fund.service.ts";
import {Card} from '@/components/ui/Card';

interface ProjectExpenseListProps {
    project: string;
    projectBudget?: number;
    projectCurrency?: string;
    refreshTrigger?: number;
    pageSize?: number;
}

export const ProjectExpenseList: React.FC<ProjectExpenseListProps> = ({
                                                                          project,
                                                                          projectBudget = 0,
                                                                          projectCurrency = 'RON',
                                                                          refreshTrigger = 0,
                                                                          pageSize = 10
                                                                      }) => {
    const confirm = useConfirmDialog();
    const [selectedExpense, setSelectedExpense] = useState<ProjectExpense | null>(null);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isExecuteModalOpen, setIsExecuteModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [localRefresh, setLocalRefresh] = useState(0);
    const [hasPaidFunds, setHasPaidFunds] = useState<boolean>(true);

    const [totalPlannedExpenses, setTotalPlannedExpenses] = useState<number>(0);
    const [totalPaidExpenses, setTotalPaidExpenses] = useState<number>(0);
    const [loadingStats, setLoadingStats] = useState(true);

    const handleRowClick = async (expense: ProjectExpense) => {
        try {
            const fullExpense = await projectExpenseService.getById(expense.id);
            setSelectedExpense(fullExpense);
            setIsDetailsModalOpen(true);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : t('toast.project_expense.load_error');
            showToast.error(errorMessage);
        }
    };

    const handleEdit = (expense: ProjectExpense) => {
        setSelectedExpense(expense);
        setIsUpdateModalOpen(true);
    };

    const handleExecute = (expense: ProjectExpense) => {
        setSelectedExpense(expense);
        setIsExecuteModalOpen(true);
    };

    const handleCancel = async (expense: ProjectExpense) => {
        setIsDetailsModalOpen(false);
        const isConfirmed = await confirm({
            title: t('label.project_expense.cancel_expense_title'),
            message: `${t('label.project_expense.cancel_expense_message')} "${expense.name}"?\n\n${t('label.project_expense.cancel_expense_warning')}`,
            confirmText: t('action.confirm'),
            cancelText: t('action.cancel'),
            confirmButtonVariant: 'primary',
            icon: (<IconWarning />)
        });

        if (!isConfirmed) {
            return;
        }

        try {
            await projectExpenseService.cancel(expense.id);
            showToast.success(t('toast.project_expense.cancelled'));
            setLocalRefresh(prev => prev + 1);
        } catch (error: any) {
            const errorMessage = error?.message || t('toast.project_expense.cancel_error');
            showToast.error(errorMessage);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoadingStats(true);

                const fundsResponse = await projectFundService.getList({
                    pageSize: 100,
                    filters: {
                        project_id: project,
                        status: 'PAID'
                    }
                });

                const fundsWithRemaining = (fundsResponse.results || []).filter(
                    fund => fund.remainingAmount && fund.remainingAmount > 0
                );

                setHasPaidFunds(fundsWithRemaining.length > 0);

                const expensesResponse = await projectExpenseService.getList({
                    pageSize: 1000,
                    filters: {
                        project_id: project
                    }
                });

                const expenses = expensesResponse.results || [];

                const plannedTotal = expenses
                    .filter(exp => exp.status === ProjectExpenseStatus.PLANNED)
                    .reduce((sum, exp) => sum + (exp.totalAmount || 0), 0);

                const paidTotal = expenses
                    .filter(exp => exp.status === ProjectExpenseStatus.PAID)
                    .reduce((sum, exp) => sum + (exp.totalAmount || 0), 0);

                setTotalPlannedExpenses(plannedTotal);
                setTotalPaidExpenses(paidTotal);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Error fetching expense stats';
                console.error(errorMessage);
            } finally {
                setLoadingStats(false);
            }
        };

        fetchData();
    }, [project, localRefresh]);

    const handleDelete = async (expense: ProjectExpense) => {
        const isConfirmed = await confirm({
            title: t('label.project_expense.delete_expense_title'),
            message: `${t('label.project_expense.delete_expense_message')} "${expense.name}"?`,
            confirmText: t('action.confirm'),
            cancelText: t('action.cancel'),
            confirmButtonVariant: 'primary',
            icon: (<IconWarning />)
        });

        if (!isConfirmed) {
            return;
        }

        try {
            await projectExpenseService.delete(expense.id);
            showToast.success(t('toast.project_expense.deleted'));
            setLocalRefresh(prev => prev + 1);
        } catch (error: any) {
            const errorMessage = error?.message || t('toast.project_expense.delete_error');
            showToast.error(errorMessage);
        }
    };

    const handleUpdateSuccess = () => {
        setLocalRefresh(prev => prev + 1);
    };

    const handleExecuteSuccess = () => {
        setLocalRefresh(prev => prev + 1);
    };

    const getColumns = (): TableColumn<ProjectExpense>[] => [
        {
            key: 'name',
            label: t('label.project_expense.name'),
            sortable: true,
            filterable: true,
            filterType: 'text',
            size: 'lg',
        },
        {
            key: 'activityTitle',
            label: t('label.project_expense.activity'),
            size: 'sm',
        },
        {
            key: 'totalAmount',
            label: t('label.project_expense.total_amount'),
            sortable: true,
            size: 'sm',
            render: (totalAmount: number, row: ProjectExpense) => {
                return `${totalAmount.toLocaleString('ro-RO', { minimumFractionDigits: 2 })} ${row.currency}`;
            }
        },
        {
            key: 'status',
            label: t('label.project_expense.status'),
            sortable: true,
            filterable: true,
            filterType: 'select',
            filterOptions: [
                { label: t('label.project_expense.planned'), value: ProjectExpenseStatus.PLANNED},
                { label: t('label.project_expense.paid'), value: ProjectExpenseStatus.PAID},
                { label: t('label.project_expense.cancelled'), value: ProjectExpenseStatus.CANCELLED},
            ],
            size: 'sm',
            render: (status: string) => {
                const statusColors: Record<string, string> = {
                    'PLANNED': 'bg-yellow-100 text-yellow-800',
                    'PAID': 'bg-green-100 text-green-800',
                    'CANCELLED': 'bg-red-100 text-red-800'
                };
                const statusLabels: Record<string, string> = {
                    'PLANNED': t('label.project_expense.planned'),
                    'PAID': t('label.project_expense.paid'),
                    'CANCELLED': t('label.project_expense.cancelled')
                };
                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || ''}`}>
                        {statusLabels[status] || status}
                    </span>
                );
            }
        },
    ];

    const getActions = (): TableAction<ProjectExpense>[] => [
        {
            label: t('action.execute_expense'),
            variant: 'secondary',
            onClick: handleExecute,
            icon: <IconCheckList />,
            show: (expense: ProjectExpense) =>
                expense.status === ProjectExpenseStatus.PLANNED && hasPaidFunds
        },
        {
            label: t('action.edit'),
            variant: 'primary',
            onClick: handleEdit,
            icon: <IconEdit />,
            show: (expense: ProjectExpense) => expense.status === ProjectExpenseStatus.PLANNED
        },
        {
            label: t('action.delete'),
            variant: 'danger',
            onClick: handleDelete,
            icon: <IconDelete />,
            show: (expense: ProjectExpense) => expense.status === ProjectExpenseStatus.PLANNED
        }
    ];

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="text-center">
                    <div className="text-sm text-gray-600 mb-2">
                        {t('label.project_expense.total_planned_expenses')}
                    </div>
                    <div className="text-2xl font-bold text-yellow-600">
                        {loadingStats ? '...' : `${totalPlannedExpenses.toLocaleString('ro-RO', { minimumFractionDigits: 2 })} ${projectCurrency}`}
                    </div>
                </Card>

                <Card className="text-center">
                    <div className="text-sm text-gray-600 mb-2">
                        {t('label.project_expense.total_paid_expenses')}
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                        {loadingStats ? '...' : `${totalPaidExpenses.toLocaleString('ro-RO', { minimumFractionDigits: 2 })} ${projectCurrency}`}
                    </div>
                </Card>

                <Card className="text-center">
                    <div className="text-sm text-gray-600 mb-2">
                        {t('label.project.planned_budget')}
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                        {projectBudget.toLocaleString('ro-RO', { minimumFractionDigits: 2 })} {projectCurrency}
                    </div>
                </Card>
            </div>

            <Table<ProjectExpense>
                endpoint={`project_expense/list?project_id=${project}`}
                columns={getColumns()}
                actions={getActions()}
                initialPageSize={pageSize}
                initialSort={{ field: 'created_at', direction: 'desc' }}
                showFilters={true}
                showPagination={true}
                emptyMessage={t('label.project_expense.empty_list')}
                refreshTrigger={refreshTrigger + localRefresh}
                onRowClick={handleRowClick}
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

            {isExecuteModalOpen && selectedExpense && (
                <ExecuteProjectExpenseModal
                    isOpen={isExecuteModalOpen}
                    onClose={() => {
                        setIsExecuteModalOpen(false);
                        setSelectedExpense(null);
                    }}
                    onSuccess={handleExecuteSuccess}
                    expense={selectedExpense}
                    project={project}
                />
            )}

            {isDetailsModalOpen && selectedExpense && (
                <ProjectExpenseDetailsModal
                    isOpen={isDetailsModalOpen}
                    onClose={() => {
                        setIsDetailsModalOpen(false);
                        setSelectedExpense(null);
                    }}
                    onCancel={handleCancel}
                    expense={selectedExpense}
                />
            )}
        </>
    );
};

export default ProjectExpenseList;