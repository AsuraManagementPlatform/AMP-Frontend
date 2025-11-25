import { TableColumn } from '@/types/index.types';
import React, { useState } from "react";
import Table from "@/components/ui/Table.tsx";
import { ActionIcons } from '@/components/ui/ActionIcons';
import IconMoneyBag from "@/assets/icons/iconmonstr-money-bag.svg?react";
import IconDone from "@/assets/icons/iconmonstr-done.svg?react";
import { MembershipFee, MembershipFeeStatus, MembershipFeePayment, RenewPeriod } from '@/types/membershipFee.types';
import { UpdateMembershipFeeModal } from '@/components/modals/membershipFee/UpdateMembershipFeeModal';
import { ProcessPaymentModal } from '@/components/modals/membershipFee/ProcessPaymentModal';
import { ApprovePaymentModal } from '@/components/modals/membershipFee/ApprovePaymentModal';
import { membershipFeeService } from '@/services/membershipFee.service';
import showToast from '@/components/ui/Toast';
import { useConfirmDialog } from "@/components/ui/ConfirmDialog.tsx";
import IconWarning from '@/assets/icons/iconmonstr-warning.svg?react';
import { useAuth } from '@/hooks/useAuth';
import { UserGroup } from '@/types/index.types';

interface MembershipFeeListProps {
    organizationId?: string;
    memberId?: string;
    refreshTrigger?: number;
    pageSize?: number;
}

export const MembershipFeeList: React.FC<MembershipFeeListProps> = ({
    organizationId,
    memberId,
    refreshTrigger = 0,
    pageSize = 10
}) => {
    const confirm = useConfirmDialog();
    const { user, hasAnyUserGroup } = useAuth();
    const [selectedFee, setSelectedFee] = useState<MembershipFee | null>(null);
    const [selectedPayments, setSelectedPayments] = useState<MembershipFeePayment[]>([]);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
    const [localRefresh, setLocalRefresh] = useState(0);
    
    const isOrgAdmin = hasAnyUserGroup([UserGroup.ORGANIZATION_ADMIN]);

    const handleEdit = (fee: MembershipFee) => {
        setSelectedFee(fee);
        setIsUpdateModalOpen(true);
    };

    const handleProcessPayment = (fee: MembershipFee) => {
        setSelectedFee(fee);
        setIsPaymentModalOpen(true);
    };

    const handleApprovePayment = (fee: MembershipFee) => {
        const pendingPayments = fee.payments?.filter(p => p.status === 'PENDING_APPROVAL') || [];
        if (pendingPayments.length > 0) {
            setSelectedPayments(pendingPayments);
            setSelectedFee(fee);
            setIsApproveModalOpen(true);
        }
    };

    const handleDelete = async (fee: MembershipFee) => {
        const isConfirmed = await confirm({
            title: 'Șterge cotizație',
            message: `Sigur doriți să ștergeți această cotizație?`,
            confirmText: 'Confirmă',
            cancelText: 'Renunță',
            confirmButtonVariant: 'primary',
            icon: (<IconWarning></IconWarning>)
        });

        if (!isConfirmed) {
            return;
        }

        try {
            await membershipFeeService.delete(fee.id);
            showToast.success('Cotizația a fost ștearsă cu succes!');
            setLocalRefresh(prev => prev + 1);
        } catch (error: any) {
            const errorMessage = error?.message || 'Eroare la ștergerea cotizației';
            showToast.error(errorMessage);
        }
    };

    const handleUpdateSuccess = () => {
        setLocalRefresh(prev => prev + 1);
    };

    const handlePaymentSuccess = () => {
        setLocalRefresh(prev => prev + 1);
    };

    const getColumns = (): TableColumn<MembershipFee>[] => [
        {
            key: 'memberName',
            label: 'Membru',
            sortable: true,
            render: (memberName: string) => {
                return memberName || '-';
            },
            size: 'lg',
        },
        {
            key: 'amount',
            label: 'Sumă',
            sortable: true,
            render: (amount: number, row: MembershipFee) => {
                return `${amount.toLocaleString('ro-RO', { minimumFractionDigits: 2 })} ${row.currency}`;
            },
            size: 'md',
        },
        {
            key: 'renewPeriod',
            label: 'Perioadă',
            sortable: true,
            filterable: true,
            filterType: 'select',
            filterOptions: [
                { label: 'Lunar', value: RenewPeriod.MONTHLY },
                { label: 'Trimestrial', value: RenewPeriod.QUARTERLY },
                { label: 'Semestrial', value: RenewPeriod.SEMI_ANNUAL },
                { label: 'Anual', value: RenewPeriod.ANNUAL },
                { label: 'O singură dată', value: RenewPeriod.ONE_TIME }
            ],
            render: (period: string) => {
                const periodLabels = {
                    'MONTHLY': 'Lunar',
                    'QUARTERLY': 'Trimestrial',
                    'SEMI_ANNUAL': 'Semestrial',
                    'ANNUAL': 'Anual',
                    'ONE_TIME': 'O singură dată'
                };
                return periodLabels[period as keyof typeof periodLabels] || period;
            },
            size: 'sm',
        },
        {
            key: 'startedFrom',
            label: 'Data început',
            sortable: true,
            render: (date: string) => {
                if (!date) return '-';
                return new Date(date).toLocaleDateString('ro-RO');
            },
            size: 'sm',
        },
        {
            key: 'endedAt',
            label: 'Data sfârșit',
            sortable: true,
            render: (date: string) => {
                if (!date) return '-';
                return new Date(date).toLocaleDateString('ro-RO');
            },
            size: 'sm',
        },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
            filterable: true,
            filterType: 'select',
            filterOptions: [
                { label: 'În așteptare', value: MembershipFeeStatus.PENDING },
                { label: 'Plătit', value: MembershipFeeStatus.PAID },
                { label: 'Întârziat', value: MembershipFeeStatus.OVERDUE },
                { label: 'Anulat', value: MembershipFeeStatus.CANCELLED }
            ],
            render: (status: string) => {
                const statusConfig = {
                    'PENDING': { label: 'În așteptare', className: 'bg-yellow-100 text-yellow-800' },
                    'PAID': { label: 'Plătit', className: 'bg-green-100 text-green-800' },
                    'OVERDUE': { label: 'Întârziat', className: 'bg-red-100 text-red-800' },
                    'CANCELLED': { label: 'Anulat', className: 'bg-gray-100 text-gray-800' },
                    'REFUNDED': { label: 'Returnat', className: 'bg-blue-100 text-blue-800' }
                };
                const config = statusConfig[status as keyof typeof statusConfig] || { label: status, className: 'bg-gray-100 text-gray-800' };
                return (
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.className}`}>
                        {config.label}
                    </span>
                );
            },
            size: 'md',
        },
        {
            key: 'daysUntilDue',
            label: 'Zile până la scadență',
            sortable: false,
            render: (days: number, row: MembershipFee) => {
                if (row.status === MembershipFeeStatus.CANCELLED) {
                    return '-';
                }
                
                if (row.status === MembershipFeeStatus.PAID && !row.autoRenew) {
                    return '-';
                }
                
                if (days < 0) {
                    return <span className="text-red-600 font-semibold">Întârziat {Math.abs(days)} zile</span>;
                } else if (days === 0) {
                    return <span className="text-orange-600 font-semibold">Astăzi</span>;
                } else if (days <= 7) {
                    return <span className="text-orange-600 font-semibold">{days} zile</span>;
                } else if (days <= 30) {
                    return <span className="text-yellow-600">{days} zile</span>;
                } else {
                    return <span className="text-gray-600">{days} zile</span>;
                }
            },
            size: 'sm',
        },
        {
            key: 'paymentMethod',
            label: 'Metodă plată',
            sortable: false,
            render: (method: string | undefined) => {
                if (!method) return '-';
                const methodLabels = {
                    'BANK_TRANSFER': 'Transfer bancar',
                    'CREDIT_CARD': 'Card',
                    'CASH': 'Numerar',
                    'STRIPE': 'Stripe',
                    'PAYPAL': 'PayPal',
                    'OTHER': 'Altă metodă'
                };
                return methodLabels[method as keyof typeof methodLabels] || method;
            },
            size: 'sm',
        }
    ];

    const getActions = () => {
        return [
            {
                label: 'Confirmă plata',
                icon: <IconDone className="w-4 h-4" />,
                onClick: handleApprovePayment,
                className: 'text-gray-600 hover:bg-gray-100',
                show: (fee: MembershipFee) => {
                    const hasPendingPayments = fee.payments?.some(p => p.status === 'PENDING_APPROVAL');
                    const isOwnFee = user?.id === fee.memberId;
                    return isOrgAdmin && hasPendingPayments && !isOwnFee || false;
                }
            },
            {
                label: 'Plătește',
                icon: <IconMoneyBag className="w-4 h-4" />,
                onClick: handleProcessPayment,
                className: 'text-gray-600 hover:bg-gray-100',
                show: (fee: MembershipFee) => {
                    const hasPendingPayments = fee.payments?.some(p => p.status === 'PENDING_APPROVAL');
                    const isOwnFee = user?.id === fee.memberId;
                    const canPay = (fee.status === MembershipFeeStatus.PENDING || fee.status === MembershipFeeStatus.PARTIALLY_PAID);
                    return isOwnFee && canPay && !hasPendingPayments || false;
                }
            },
            {
                label: 'Editează',
                icon: <ActionIcons.Edit className="w-4 h-4" />,
                onClick: handleEdit,
                className: 'text-gray-600 hover:bg-gray-100'
            },
            {
                label: 'Șterge',
                icon: <ActionIcons.Delete className="w-4 h-4" />,
                onClick: handleDelete,
                className: 'text-gray-600 hover:bg-gray-100'
            }
        ];
    };

    const buildEndpoint = () => {
        const params = new URLSearchParams();
        
        if (organizationId) {
            params.append('organization_id', organizationId);
        }
        
        if (memberId) {
            params.append('member_id', memberId);
        }
        
        return `membership_fee/list${params.toString() ? '?' + params.toString() : ''}`;
    };

    return (
        <>
            <Table<MembershipFee>
                endpoint={buildEndpoint()}
                columns={getColumns()}
                actions={getActions()}
                initialPageSize={pageSize}
                initialSort={{ field: 'created_at', direction: 'desc' }}
                showFilters={true}
                showPagination={true}
                emptyMessage="Nu există cotizații pentru această organizație."
                refreshTrigger={refreshTrigger + localRefresh}
            />

            {selectedFee && (
                <>
                    <UpdateMembershipFeeModal
                        isOpen={isUpdateModalOpen}
                        onClose={() => setIsUpdateModalOpen(false)}
                        onSuccess={handleUpdateSuccess}
                        membershipFeeId={selectedFee.id}
                    />
                    
                    <ProcessPaymentModal
                        isOpen={isPaymentModalOpen}
                        onClose={() => setIsPaymentModalOpen(false)}
                        onSuccess={handlePaymentSuccess}
                        membershipFeeId={selectedFee.id}
                        memberId={selectedFee.memberId}
                        memberName={selectedFee.memberName || selectedFee.memberId}
                        amount={selectedFee.amount}
                        remainingAmount={selectedFee.remainingAmount}
                        currency={selectedFee.currency}
                    />
                </>
            )}

            {selectedFee && selectedPayments.length > 0 && (
                <ApprovePaymentModal
                    isOpen={isApproveModalOpen}
                    onClose={() => {
                        setIsApproveModalOpen(false);
                        setSelectedPayments([]);
                        setSelectedFee(null);
                    }}
                    onSuccess={handlePaymentSuccess}
                    payments={selectedPayments}
                    memberName={selectedFee.memberName || selectedFee.memberId}
                />
            )}
        </>
    );
};
