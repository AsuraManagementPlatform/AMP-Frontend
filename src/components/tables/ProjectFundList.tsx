import {ProjectFundStatus, TableAction, TableColumn} from '@/types/index.types';
import React, {useEffect, useState} from "react";
import Table from "@/components/ui/Table.tsx";
import IconEdit from "@/assets/icons/iconmonstr-edit.svg?react";
import IconDelete from "@/assets/icons/iconmonstr-delete.svg?react";
import IconWallet from "@/assets/icons/iconmonstr-wallet.svg?react";
import {ProjectFund} from '@/types/project-fund.types';
import {UpdateProjectFundModal} from '@/components/modals/project-fund/UpdateProjectFundModal';
import {PayProjectFundModal} from '@/components/modals/project-fund/PayProjectFundModal';
import {FundDetailsModal} from '@/components/modals/project-fund/FundDetailsModal';
import projectFundService from '@/services/project-fund.service';
import showToast from '@/components/ui/Toast';
import {useConfirmDialog} from "@/components/ui/ConfirmDialog";
import IconWarning from '@/assets/icons/iconmonstr-warning.svg?react';
import {t} from 'i18next';
import {Card} from '@/components/ui/Card';

interface ProjectFundListProps {
    project: string;
    projectBudget?: number;
    projectCurrency?: string;
    refreshTrigger?: number;
    pageSize?: number;
}

export const ProjectFundList: React.FC<ProjectFundListProps> = ({
                                                                    project,
                                                                    projectBudget = 0,
                                                                    projectCurrency = 'RON',
                                                                    refreshTrigger = 0,
                                                                    pageSize = 10
                                                                }) => {
    const confirm = useConfirmDialog();
    const [selectedFund, setSelectedFund] = useState<ProjectFund | null>(null);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isPayModalOpen, setIsPayModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [localRefresh, setLocalRefresh] = useState(0);

    const [totalPlannedFunds, setTotalPlannedFunds] = useState<number>(0);
    const [totalPaidFunds, setTotalPaidFunds] = useState<number>(0);
    const [totalRemainingFunds, setTotalRemainingFunds] = useState<number>(0);
    const [loadingStats, setLoadingStats] = useState(true);

    const handleRowClick = async (fund: ProjectFund) => {
        try {
            const fullFund = await projectFundService.getById(fund.id);
            setSelectedFund(fullFund);
            setIsDetailsModalOpen(true);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : t('toast.project_fund.load_error');
            showToast.error(errorMessage);
        }
    };

    const handleEdit = (fund: ProjectFund) => {
        setSelectedFund(fund);
        setIsUpdateModalOpen(true);
    };

    const handlePay = (fund: ProjectFund) => {
        setSelectedFund(fund);
        setIsPayModalOpen(true);
    };

    const handleCancel = async (fund: ProjectFund) => {
        setIsDetailsModalOpen(false);
        const isConfirmed = await confirm({
            title: t('label.project_fund.cancel_fund_title'),
            message: `${t('label.project_fund.cancel_fund_message')} "${fund.sourceName}"?\n\n${t('label.project_fund.cancel_fund_warning')}`,
            confirmText: t('action.confirm'),
            cancelText: t('action.cancel'),
            confirmButtonVariant: 'primary',
            icon: (<IconWarning />)
        });

        if (!isConfirmed) {
            return;
        }

        try {
            await projectFundService.cancel(fund.id);
            showToast.success(t('toast.project_fund.cancelled'));
            setLocalRefresh(prev => prev + 1);
        } catch (error: any) {
            const errorMessage = error?.message || t('toast.project_fund.cancel_error');
            showToast.error(errorMessage);
        }
    };

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoadingStats(true);

                const fundsResponse = await projectFundService.getList({
                    pageSize: 1000,
                    filters: {
                        project_id: project
                    }
                });

                const funds = fundsResponse.results || [];

                const plannedTotal = funds
                    .filter(fund => fund.status === ProjectFundStatus.PLANNED)
                    .reduce((sum, fund) => sum + (fund.estimatedAmount || 0), 0);

                const paidTotal = funds
                    .filter(fund => fund.status === ProjectFundStatus.PAID)
                    .reduce((sum, fund) => sum + (fund.amount || 0), 0);

                const remainingTotal = funds
                    .filter(fund => fund.status === ProjectFundStatus.PAID)
                    .reduce((sum, fund) => sum + (fund.remainingAmount || 0), 0);

                setTotalPlannedFunds(plannedTotal);
                setTotalPaidFunds(paidTotal);
                setTotalRemainingFunds(remainingTotal);
            } catch (error) {
                console.error('Error fetching fund stats:', error);
            } finally {
                setLoadingStats(false);
            }
        };

        fetchStats();
    }, [project, localRefresh]);

    const handleDelete = async (fund: ProjectFund) => {
        const isConfirmed = await confirm({
            title: t('label.project_fund.delete_fund_title'),
            message: `${t('label.project_fund.delete_fund_message')} "${fund.sourceName}"?`,
            confirmText: t('action.confirm'),
            cancelText: t('action.cancel'),
            confirmButtonVariant: 'primary',
            icon: (<IconWarning />)
        });

        if (!isConfirmed) {
            return;
        }

        try {
            await projectFundService.delete(fund.id);
            showToast.success(t('toast.project_fund.deleted'));
            setLocalRefresh(prev => prev + 1);
        } catch (error: any) {
            const errorMessage = error?.message || t('toast.project_fund.delete_error');
            showToast.error(errorMessage);
        }
    };

    const handleUpdateSuccess = () => {
        setLocalRefresh(prev => prev + 1);
    };

    const handlePaySuccess = () => {
        setLocalRefresh(prev => prev + 1);
    };

    const getColumns = (): TableColumn<ProjectFund>[] => [
        {
            key: 'source',
            label: t('label.project_fund.source'),
            sortable: true,
            filterable: true,
            filterType: 'text',
            size: 'md',
        },
        {
            key: 'category',
            label: t('label.project_fund.category'),
            sortable: true,
            filterable: true,
            filterType: 'text',
            size: 'sm',
        },
        {
            key: 'estimatedAmount',
            label: t('label.project_fund.estimated_amount'),
            sortable: true,
            filterable: true,
            filterType: 'number',
            size: 'sm',
            render: (estimatedAmount: number, row: ProjectFund) => {
                return `${estimatedAmount.toLocaleString('ro-RO', { minimumFractionDigits: 2 })} ${row.currency}`;
            }
        },
        {
            key: 'amount',
            label: t('label.project_fund.received_amount'),
            sortable: true,
            filterable: true,
            filterType: 'number',
            size: 'sm',
            render: (amount: number | null, row: ProjectFund) => {
                if (!amount) return '-';
                return `${amount.toLocaleString('ro-RO', { minimumFractionDigits: 2 })} ${row.currency}`;
            }
        },
        {
            key: 'status',
            label: t('label.project_fund.status'),
            sortable: true,
            filterable: true,
            filterType: 'select',
            filterOptions: [
                {label: t('label.project_fund.planned'), value: ProjectFundStatus.PLANNED},
                {label: t('label.project_fund.paid'), value: ProjectFundStatus.PAID},
                {label: t('label.project_fund.cancelled'), value: ProjectFundStatus.CANCELLED},
            ],
            size: 'sm',
            render: (status: string) => {
                const statusColors: Record<string, string> = {
                    'PLANNED': 'bg-yellow-100 text-yellow-800',
                    'PAID': 'bg-green-100 text-green-800',
                    'CANCELLED': 'bg-red-100 text-red-800'
                };
                const statusLabels: Record<string, string> = {
                    'PLANNED': t('label.project_fund.planned'),
                    'PAID': t('label.project_fund.paid'),
                    'CANCELLED': t('label.project_fund.cancelled')
                };
                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || ''}`}>
                        {statusLabels[status] || status}
                    </span>
                );
            }
        },
    ];

    const getActions = (): TableAction<ProjectFund>[] => [
        {
            label: t('action.confirm_payment'),
            variant: 'secondary',
            onClick: handlePay,
            icon: <IconWallet />,
            show: (fund: ProjectFund) => fund.status === ProjectFundStatus.PLANNED
        },
        {
            label: t('action.edit'),
            variant: 'primary',
            onClick: handleEdit,
            icon: <IconEdit />,
            show: (fund: ProjectFund) => fund.status === ProjectFundStatus.PLANNED
        },
        {
            label: t('action.delete'),
            variant: 'danger',
            onClick: handleDelete,
            icon: <IconDelete />,
            show: (fund: ProjectFund) => fund.status === ProjectFundStatus.PLANNED
        }
    ];

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="text-center">
                    <div className="text-sm text-gray-600 mb-2">
                        {t('label.project_fund.total_planned_funds')}
                    </div>
                    <div className="text-2xl font-bold text-yellow-600">
                        {loadingStats ? '...' : `${totalPlannedFunds.toLocaleString('ro-RO', { minimumFractionDigits: 2 })} ${projectCurrency}`}
                    </div>
                </Card>

                <Card className="text-center">
                    <div className="text-sm text-gray-600 mb-2">
                        {t('label.project_fund.total_paid_remaining')}
                    </div>
                    <div className="text-lg font-bold text-green-600">
                        {loadingStats ? '...' : (
                            <>
                                <div>{totalPaidFunds.toLocaleString('ro-RO', { minimumFractionDigits: 2 })} {projectCurrency}</div>
                                <div className="text-sm text-gray-600 font-normal mt-1">
                                    {t('label.project_fund.remaining')}: {totalRemainingFunds.toLocaleString('ro-RO', { minimumFractionDigits: 2 })} {projectCurrency}
                                </div>
                            </>
                        )}
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

            <Table<ProjectFund>
                endpoint={`project_fund/list?project_id=${project}`}
                columns={getColumns()}
                actions={getActions()}
                initialPageSize={pageSize}
                initialSort={{ field: 'date', direction: 'desc' }}
                showFilters={true}
                showPagination={true}
                emptyMessage={t('label.project_fund.empty_list')}
                refreshTrigger={refreshTrigger + localRefresh}
                onRowClick={handleRowClick}
            />

            {isUpdateModalOpen && selectedFund && (
                <UpdateProjectFundModal
                    isOpen={isUpdateModalOpen}
                    onClose={() => {
                        setIsUpdateModalOpen(false);
                        setSelectedFund(null);
                    }}
                    onSuccess={handleUpdateSuccess}
                    fund={selectedFund}
                    project={project}
                />
            )}

            {isPayModalOpen && selectedFund && (
                <PayProjectFundModal
                    isOpen={isPayModalOpen}
                    onClose={() => {
                        setIsPayModalOpen(false);
                        setSelectedFund(null);
                    }}
                    onSuccess={handlePaySuccess}
                    fund={selectedFund}
                />
            )}

            {isDetailsModalOpen && selectedFund && (
                <FundDetailsModal
                    isOpen={isDetailsModalOpen}
                    onClose={() => {
                        setIsDetailsModalOpen(false);
                        setSelectedFund(null);
                    }}
                    onCancel={handleCancel}
                    fund={selectedFund}
                />
            )}
        </>
    );
};

export default ProjectFundList;