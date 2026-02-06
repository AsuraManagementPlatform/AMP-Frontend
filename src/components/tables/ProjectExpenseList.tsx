import {ProjectExpenseStatus, TableAction, TableColumn, UserGroup} from '@/types/index.types';
import React, {useEffect, useState} from "react";
import Table from "@/components/ui/Table.tsx";
import { ActionIcons } from '@/components/ui/ActionIcons';
import IconCheckList from "@/assets/icons/iconmonstr-ckeck-list.svg?react";
import {ProjectExpense} from '@/types/project-expense.types';
import {UpdateProjectExpenseModal} from '@/components/modals/project-expense/UpdateProjectExpenseModal';
import {ExecuteProjectExpenseModal} from '@/components/modals/project-expense/ExecuteProjectExpenseModal';
import {ProjectExpenseDetailsModal} from '@/components/modals/project-expense/ProjectExpenseDetailsModal.tsx';
import {ProjectExpenseDocumentsModal} from '@/components/modals/project-expense/ProjectExpenseDocumentsModal.tsx';
import projectExpenseService from '@/services/project-expense.service';
import showToast from '@/components/ui/Toast';
import {useConfirmDialog} from "@/components/ui/ConfirmDialog";
import IconWarning from '@/assets/icons/iconmonstr-warning.svg?react';
import {t} from 'i18next';
import projectFundService from "@/services/project-fund.service.ts";
import {Card} from '@/components/ui/Card';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';

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
                                                                          pageSize = 20
                                                                      }) => {
    const confirm = useConfirmDialog();
    const { hasAnyUserGroup } = useAuth();
    const [selectedExpense, setSelectedExpense] = useState<ProjectExpense | null>(null);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isExecuteModalOpen, setIsExecuteModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isDocumentsModalOpen, setIsDocumentsModalOpen] = useState(false);
    const [selectedExpenseForDocuments, setSelectedExpenseForDocuments] = useState<ProjectExpense | null>(null);
    const [localRefresh, setLocalRefresh] = useState(0);
    const [hasPaidFunds, setHasPaidFunds] = useState<boolean>(true);
    
    const isOrgAdmin = hasAnyUserGroup([UserGroup.ORGANIZATION_ADMIN]);

    const [totalPlannedExpenses, setTotalPlannedExpenses] = useState<number>(0);
    const [totalPaidExpenses, setTotalPaidExpenses] = useState<number>(0);
    const [totalReceivedFunds, setTotalReceivedFunds] = useState<number>(0);
    const [loadingStats, setLoadingStats] = useState(true);
    
    const [executedSummary, setExecutedSummary] = useState<{
        totalWithoutVat: number;
        totalVat: number;
        totalWithVat: number;
        vatBreakdown: { rate: number; amount: number; vatAmount: number }[];
    }>({
        totalWithoutVat: 0,
        totalVat: 0,
        totalWithVat: 0,
        vatBreakdown: []
    });

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

    const handleDocuments = (expense: ProjectExpense) => {
        setSelectedExpenseForDocuments(expense);
        setIsDocumentsModalOpen(true);
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

                const totalReceived = (fundsResponse.results || [])
                    .reduce((sum, fund) => sum + (fund.amount || 0), 0);

                setTotalReceivedFunds(totalReceived);

                const expensesResponse = await projectExpenseService.getList({
                    pageSize: 1000,
                    filters: {
                        project_id: project
                    }
                });

                const expenses = expensesResponse.results || [];

                const plannedTotal = expenses
                    .reduce((sum, exp) => sum + (exp.totalAmount || 0), 0);

                const paidTotal = expenses
                    .filter(exp => 
                        exp.status === ProjectExpenseStatus.PAID || 
                        exp.status === ProjectExpenseStatus.PARTIALLY_PAID
                    )
                    .reduce((sum, exp) => {
                        const executedAmount = exp.executedAmount || 0;
                        const vatAmount = exp.vatValue ? (executedAmount * exp.vatValue) / 100 : 0;
                        return sum + executedAmount + vatAmount;
                    }, 0);

                const executedExpenses = expenses.filter(exp => 
                    exp.status === ProjectExpenseStatus.PAID || 
                    exp.status === ProjectExpenseStatus.PARTIALLY_PAID
                );

                const vatBreakdownMap = new Map<number, { amount: number; vatAmount: number }>();
                let totalWithoutVat = 0;
                let totalVat = 0;

                executedExpenses.forEach(exp => {
                    const executedAmount = exp.executedAmount || 0;
                    const vatRate = exp.vatValue || 0;
                    const vatAmount = vatRate > 0 ? (executedAmount * vatRate) / 100 : 0;

                    totalWithoutVat += executedAmount;
                    totalVat += vatAmount;

                    if (!vatBreakdownMap.has(vatRate)) {
                        vatBreakdownMap.set(vatRate, { amount: 0, vatAmount: 0 });
                    }
                    const current = vatBreakdownMap.get(vatRate)!;
                    current.amount += executedAmount;
                    current.vatAmount += vatAmount;
                });

                const vatBreakdown = Array.from(vatBreakdownMap.entries())
                    .map(([rate, data]) => ({ rate, ...data }))
                    .sort((a, b) => b.rate - a.rate);

                setExecutedSummary({
                    totalWithoutVat,
                    totalVat,
                    totalWithVat: totalWithoutVat + totalVat,
                    vatBreakdown
                });

                setTotalPlannedExpenses(plannedTotal);
                setTotalPaidExpenses(paidTotal);
            } catch (error) {
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
        setSelectedExpense(null);
        setIsExecuteModalOpen(false);
    };

    const getColumns = (): TableColumn<ProjectExpense>[] => [
        {
            key: 'name',
            label: t('label.project_expense.name'),
            sortable: true,
            filterable: true,
            filterType: 'text',
            size: 'lg',
            sticky: 'left',
        },
        {
            key: 'activityTitle',
            label: t('label.project_expense.activity'),
            size: 'sm',
        },
        {
            key: 'unitType',
            label: t('label.project_expense.unit_type'),
            size: 'sm',
            render: (unitType: string) => {
                return t(`label.unit_type.${unitType.toLowerCase()}`);
            }
        },
        {
            key: 'quantity',
            label: t('label.project_expense.quantity'),
            sortable: true,
            size: 'sm',
            render: (quantity: number, row: ProjectExpense) => {
                if (row.status === ProjectExpenseStatus.PARTIALLY_PAID || row.status === ProjectExpenseStatus.PAID) {
                    const executed = row.executedQuantity || 0;
                    return (
                        <span>
                            <span className="text-blue-600 font-semibold">{executed}</span>
                            <span className="text-gray-500"> / </span>
                            <span>{quantity}</span>
                        </span>
                    );
                }
                return quantity;
            }
        },
        {
            key: 'unitPrice',
            label: t('label.project_expense.unit_price'),
            sortable: true,
            size: 'sm',
            render: (unitPrice: number, row: ProjectExpense) => {
                return `${unitPrice.toLocaleString('ro-RO', { minimumFractionDigits: 2 })} ${row.currency}`;
            }
        },
        {
            key: 'amount',
            label: t('label.project_expense.amount'),
            sortable: true,
            size: 'sm',
            render: (_amount: number, row: ProjectExpense) => {
                if (row.status === ProjectExpenseStatus.PARTIALLY_PAID || row.status === ProjectExpenseStatus.PAID) {
                    const executedAmount = row.executedAmount || 0;
                    return `${executedAmount.toLocaleString('ro-RO', { minimumFractionDigits: 2 })} ${row.currency}`;
                }
                const plannedAmount = row.amount || 0;
                return `${plannedAmount.toLocaleString('ro-RO', { minimumFractionDigits: 2 })} ${row.currency}`;
            }
        },
        {
            key: 'vatValue',
            label: t('label.project_expense.vat_rate'),
            size: 'sm',
            render: (vatValue: number) => {
                return `${vatValue}%`;
            }
        },
        {
            key: 'vatAmount',
            label: t('label.project_expense.vat_amount'),
            sortable: true,
            size: 'sm',
            render: (_vatAmount: number, row: ProjectExpense) => {
                if (row.status === ProjectExpenseStatus.PARTIALLY_PAID || row.status === ProjectExpenseStatus.PAID) {
                    const executedAmount = row.executedAmount || 0;
                    const executedVat = (executedAmount * row.vatValue) / 100;
                    return `${executedVat.toLocaleString('ro-RO', { minimumFractionDigits: 2 })} ${row.currency}`;
                }
                const plannedVat = row.vatAmount || 0;
                return `${plannedVat.toLocaleString('ro-RO', { minimumFractionDigits: 2 })} ${row.currency}`;
            }
        },
        {
            key: 'totalAmount',
            label: t('label.project_expense.total'),
            sortable: true,
            size: 'sm',
            render: (_totalAmount: number, row: ProjectExpense) => {
                if (row.status === ProjectExpenseStatus.PARTIALLY_PAID || row.status === ProjectExpenseStatus.PAID) {
                    const executedAmount = row.executedAmount || 0;
                    const executedVat = (executedAmount * row.vatValue) / 100;
                    const executedTotal = executedAmount + executedVat;
                    return (
                        <span className="font-semibold text-green-700">
                            {executedTotal.toLocaleString('ro-RO', { minimumFractionDigits: 2 })} {row.currency}
                        </span>
                    );
                }
                const plannedTotal = row.totalAmount || 0;
                return (
                    <span className="font-semibold text-gray-700">
                        {plannedTotal.toLocaleString('ro-RO', { minimumFractionDigits: 2 })} {row.currency}
                    </span>
                );
            }
        },
        {
            key: 'documentsCount',
            label: t('label.project_expense.documents'),
            sortable: false,
            size: 'sm',
            render: (_: unknown, row: ProjectExpense) => {
                const count = row.documentsCount || 0;
                return (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDocuments(row);
                        }}
                        className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                            count > 0
                                ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        title={t('label.project_expense.view_documents')}
                    >
                        <DocumentTextIcon className="w-4 h-4" />
                        <span>{count}</span>
                    </button>
                );
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
                { label: t('label.project_expense.partially_paid'), value: ProjectExpenseStatus.PARTIALLY_PAID},
                { label: t('label.project_expense.paid'), value: ProjectExpenseStatus.PAID},
                { label: t('label.project_expense.cancelled'), value: ProjectExpenseStatus.CANCELLED},
            ],
            size: 'sm',
            render: (status: string) => {
                const statusColors: Record<string, string> = {
                    'PLANNED': 'bg-blue-100 text-blue-800',
                    'PARTIALLY_PAID': 'bg-yellow-100 text-yellow-800',
                    'PAID': 'bg-green-100 text-green-800',
                    'CANCELLED': 'bg-red-100 text-red-800'
                };
                const statusLabels: Record<string, string> = {
                    'PLANNED': t('label.project_expense.planned'),
                    'PARTIALLY_PAID': t('label.project_expense.partially_paid'),
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
                (expense.status === ProjectExpenseStatus.PLANNED || expense.status === ProjectExpenseStatus.PARTIALLY_PAID) && hasPaidFunds
        },
        {
            label: t('action.edit'),
            variant: 'primary',
            onClick: handleEdit,
            icon: <ActionIcons.Edit />,
            show: (expense: ProjectExpense) => expense.status === ProjectExpenseStatus.PLANNED
        },
        {
            label: t('action.delete'),
            variant: 'danger',
            onClick: handleDelete,
            icon: <ActionIcons.Delete />,
            show: () => isOrgAdmin
        }
    ];

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
                        {t('label.project_expense.total_remaining_funds')}
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                        {loadingStats ? '...' : `${(totalReceivedFunds - totalPaidExpenses).toLocaleString('ro-RO', { minimumFractionDigits: 2 })} ${projectCurrency}`}
                    </div>
                </Card>

                <Card className="text-center">
                    <div className="text-sm text-gray-600 mb-2">
                        {t('label.project.planned_budget')}
                    </div>
                    <div className="text-2xl font-bold text-purple-600">
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

            {!loadingStats && executedSummary.totalWithVat > 0 && (
                <div className="mt-6">
                    <Card>
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">
                            {t('label.project_expense.executed_summary')}
                        </h3>
                        
                        {executedSummary.vatBreakdown.length > 0 && (
                            <div className="overflow-x-auto mb-4">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                {t('label.project_expense.vat_rate')}
                                            </th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                {t('label.project_expense.amount_without_vat')}
                                            </th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                {t('label.project_expense.vat_amount')}
                                            </th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                {t('label.project_expense.total_with_vat')}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {executedSummary.vatBreakdown.map((item) => (
                                            <tr key={item.rate} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    TVA {item.rate}%
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-700">
                                                    {item.amount.toLocaleString('ro-RO', { minimumFractionDigits: 2 })} {projectCurrency}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-700">
                                                    {item.vatAmount.toLocaleString('ro-RO', { minimumFractionDigits: 2 })} {projectCurrency}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                                                    {(item.amount + item.vatAmount).toLocaleString('ro-RO', { minimumFractionDigits: 2 })} {projectCurrency}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-blue-50 border-t-2 border-blue-200">
                                        <tr>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-900">
                                                {t('label.project_expense.total')}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-bold text-blue-700">
                                                {executedSummary.totalWithoutVat.toLocaleString('ro-RO', { minimumFractionDigits: 2 })} {projectCurrency}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-bold text-blue-700">
                                                {executedSummary.totalVat.toLocaleString('ro-RO', { minimumFractionDigits: 2 })} {projectCurrency}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-bold text-blue-900 text-lg">
                                                {executedSummary.totalWithVat.toLocaleString('ro-RO', { minimumFractionDigits: 2 })} {projectCurrency}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        )}
                    </Card>
                </div>
            )}

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

            {isDocumentsModalOpen && selectedExpenseForDocuments && (
                <ProjectExpenseDocumentsModal
                    isOpen={isDocumentsModalOpen}
                    onClose={() => {
                        setIsDocumentsModalOpen(false);
                        setSelectedExpenseForDocuments(null);
                    }}
                    projectExpenseId={selectedExpenseForDocuments.id}
                    projectId={project}
                    expenseName={selectedExpenseForDocuments.name}
                    onDocumentsChange={() => setLocalRefresh(prev => prev + 1)}
                />
            )}
        </>
    );
};

export default ProjectExpenseList;