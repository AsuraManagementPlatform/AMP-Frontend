import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { PrimaryActionButton } from '@/components/ui/PrimaryActionButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { MembershipFee, MembershipFeeStatus, MembershipFeePayment } from '@/types/membershipFee.types';
import { membershipFeeService } from '@/services/membershipFee.service';
import showToast from '@/components/ui/Toast';
import toast from 'react-hot-toast';
import { CreateMembershipFeeModal } from './CreateMembershipFeeModal';
import { UpdateMembershipFeeModal } from './UpdateMembershipFeeModal';
import { ProcessPaymentModal } from './ProcessPaymentModal';
import { ApprovePaymentModal } from './ApprovePaymentModal';
import { useAuth } from '@/hooks/useAuth';
import { UserGroup } from '@/types/index.types';
import IconEdit from "@/assets/icons/iconmonstr-edit.svg?react";
import IconDelete from "@/assets/icons/iconmonstr-delete.svg?react";
import IconWallet from "@/assets/icons/iconmonstr-wallet.svg?react";
import IconDone from "@/assets/icons/iconmonstr-done.svg?react";

interface MemberFeesDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    memberId: string;
    memberName: string;
    fees: MembershipFee[];
    onRefresh: () => void;
}

export const MemberFeesDetailModal: React.FC<MemberFeesDetailModalProps> = ({
    isOpen,
    onClose,
    memberId,
    memberName,
    fees,
    onRefresh
}) => {
    const { hasAnyUserGroup, user } = useAuth();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isProcessPaymentModalOpen, setIsProcessPaymentModalOpen] = useState(false);
    const [isApprovePaymentModalOpen, setIsApprovePaymentModalOpen] = useState(false);
    const [selectedFeeId, setSelectedFeeId] = useState<string>('');
    const [selectedFee, setSelectedFee] = useState<MembershipFee | null>(null);
    const [selectedPayments, setSelectedPayments] = useState<MembershipFeePayment[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);

    const isOrgAdmin = hasAnyUserGroup([UserGroup.ORGANIZATION_ADMIN]);
    const isViewingOwnFees = memberId === user?.id;

    const sortedFees = [...fees].sort((a, b) => 
        new Date(b.startedFrom).getTime() - new Date(a.startedFrom).getTime()
    );

    const latestFee = sortedFees.length > 0 ? sortedFees[0] : null;

    const totalPaid = fees.reduce((sum, f) => {
        const paidAmount = Number(f.paidAmount) || 0;
        return sum + paidAmount;
    }, 0);

    const totalPending = fees
        .filter(f => f.status === MembershipFeeStatus.PENDING || f.status === MembershipFeeStatus.PARTIALLY_PAID)
        .reduce((sum, f) => {
            const amount = Number(f.amount) || 0;
            const paidAmount = Number(f.paidAmount) || 0;
            const remainingAmount = amount - paidAmount;
            return sum + remainingAmount;
        }, 0);

    const totalPendingVerification = fees.reduce((sum, f) => {
        const pendingPayments = f.payments?.filter(p => p.status === 'PENDING_APPROVAL') || [];
        const pendingAmount = pendingPayments.reduce((psum, p) => psum + Number(p.amount || 0), 0);
        return sum + pendingAmount;
    }, 0);

    const totalOverdue = fees
        .filter(f => f.status === MembershipFeeStatus.OVERDUE)
        .reduce((sum, f) => {
            const amount = Number(f.amount) || 0;
            const paidAmount = Number(f.paidAmount) || 0;
            const remainingAmount = amount - paidAmount;
            return sum + remainingAmount;
        }, 0);

    const getStatusBadge = (status: MembershipFeeStatus) => {
        const config = {
            [MembershipFeeStatus.PENDING]: { text: 'În așteptare', className: 'bg-yellow-100 text-yellow-800' },
            [MembershipFeeStatus.PENDING_VERIFICATION]: { text: 'În curs de validare', className: 'bg-blue-100 text-blue-800' },
            [MembershipFeeStatus.PAID]: { text: 'Plătit', className: 'bg-green-100 text-green-800' },
            [MembershipFeeStatus.PARTIALLY_PAID]: { text: 'Plătită parțial', className: 'bg-teal-100 text-teal-800' },
            [MembershipFeeStatus.OVERDUE]: { text: 'Restant', className: 'bg-red-100 text-red-800' },
            [MembershipFeeStatus.CANCELLED]: { text: 'Anulat', className: 'bg-gray-100 text-gray-800' },
            [MembershipFeeStatus.REFUNDED]: { text: 'Rambursat', className: 'bg-purple-100 text-purple-800' }
        };

        const statusConfig = config[status] || { text: status, className: 'bg-gray-100 text-gray-800' };

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.className}`}>
                {statusConfig.text}
            </span>
        );
    };

    const getPeriodLabel = (period: string) => {
        const labels: Record<string, string> = {
            'MONTHLY': 'Lunar',
            'QUARTERLY': 'Trimestrial',
            'SEMI_ANNUAL': 'Semestrial',
            'ANNUAL': 'Anual',
            'ONE_TIME': 'Unică'
        };
        return labels[period] || period;
    };

    const getLastPaymentDate = (fee: MembershipFee): string | null => {
        const approvedPayments = fee.payments?.filter(p => p.status === 'APPROVED') || [];
        
        if (approvedPayments.length > 0) {
            const latestPayment = approvedPayments.sort((a, b) => 
                new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
            )[0];
            return latestPayment.paymentDate;
        }
        
        return fee.paymentDate || null;
    };

    const handleEdit = (fee: MembershipFee) => {
        setSelectedFeeId(fee.id);
        setSelectedFee(fee);
        setIsUpdateModalOpen(true);
    };

    const handleProcessPayment = (fee: MembershipFee) => {
        setSelectedFeeId(fee.id);
        setSelectedFee(fee);
        setIsProcessPaymentModalOpen(true);
    };

    const handleApprovePayment = (fee: MembershipFee) => {
        const pendingPayments = fee.payments?.filter(p => p.status === 'PENDING_APPROVAL') || [];
        if (pendingPayments.length > 0) {
            setSelectedPayments(pendingPayments);
            setSelectedFee(fee);
            setIsApprovePaymentModalOpen(true);
        }
    };

    const handleDelete = async (feeId: string) => {
        const confirmed = await showToast.confirm(
            'Sigur dorești să ștergi această cotizație? Această acțiune nu poate fi anulată.'
        );

        if (!confirmed) return;

        try {
            await membershipFeeService.delete(feeId);
            showToast.success('Cotizația a fost ștearsă cu succes');
            onRefresh();
        } catch (error: any) {
            const errorMessage = error?.message || 'Eroare la ștergerea cotizației';
            showToast.error(errorMessage);
        }
    };

    const handleModalSuccess = () => {
        setIsCreateModalOpen(false);
        setIsUpdateModalOpen(false);
        setIsProcessPaymentModalOpen(false);
        setIsApprovePaymentModalOpen(false);
        setSelectedPayments([]);
        onRefresh();
    };

    const handleCreateModalSuccess = async () => {
        setIsCreateModalOpen(false);
        await onRefresh();
    };

    const handleGenerateNext = async () => {
        if (fees.length === 0) {
            showToast.error('Nu există cotizații. Închide acest dialog și folosește butonul "Adaugă cotizație" din pagina principală pentru a crea prima cotizație.');
            return;
        }

        setIsGenerating(true);
        const toastId = showToast.loading('Se generează cotizația...');

        try {
            await membershipFeeService.generateNext(memberId);
            toast.remove(toastId);
            showToast.success('Cotizația următoare a fost generată automat');
            onRefresh();
        } catch (error: any) {
            toast.remove(toastId);
            const errorMessage = error?.message || 'Eroare la generarea cotizației';
            showToast.error(errorMessage);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                title={`Cotizații pentru ${memberName}`}
                size="xl"
            >
                <div className="space-y-6">
                    <div className={`grid gap-4 ${isOrgAdmin && isViewingOwnFees ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2 md:grid-cols-4'}`}>
                        <div className="bg-green-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-600 mb-1">Total plătit</div>
                            <div className="text-2xl font-bold text-green-900">
                                {totalPaid.toFixed(2)} RON
                            </div>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-600 mb-1">În așteptare</div>
                            <div className="text-2xl font-bold text-yellow-900">
                                {totalPending.toFixed(2)} RON
                            </div>
                        </div>
                        {!(isOrgAdmin && isViewingOwnFees) && (
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <div className="text-sm text-gray-600 mb-1">În curs de validare</div>
                                <div className="text-2xl font-bold text-blue-900">
                                    {totalPendingVerification.toFixed(2)} RON
                                </div>
                            </div>
                        )}
                        <div className="bg-red-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-600 mb-1">Restanță</div>
                            <div className="text-2xl font-bold text-red-900">
                                {totalOverdue.toFixed(2)} RON
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Lista cotizațiilor ({sortedFees.length})
                        </h3>
                        {isOrgAdmin && (
                            <PrimaryActionButton
                                variant="create"
                                onClick={handleGenerateNext}
                                disabled={isGenerating}
                                className="!border-0"
                            >
                                {isGenerating ? 'Se generează...' : 'Plătește în avans'}
                            </PrimaryActionButton>
                        )}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                        Perioadă
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                        Sumă
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                        Rest Plată
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                        Tip
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                        Data plății
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                        Scadență maximă
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                                        Acțiuni
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {sortedFees.length > 0 ? (
                                    sortedFees.map((fee) => (
                                        <tr key={fee.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3">
                                                <div className="text-sm text-gray-900">
                                                    {new Date(fee.startedFrom).toLocaleDateString('ro-RO')}
                                                    {' - '}
                                                    {new Date(fee.endedAt).toLocaleDateString('ro-RO')}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {Number(fee.amount || 0).toFixed(2)} {fee.currency}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {fee.paymentProgress || `0/${Number(fee.amount || 0).toFixed(2)}`} {fee.currency}
                                                </div>
                                                {fee.paidAmount && fee.paidAmount > 0 && (
                                                    <div className="text-xs text-gray-500 mt-0.5">
                                                        Plătit: {Number(fee.paidAmount).toFixed(2)} {fee.currency}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {getPeriodLabel(fee.renewPeriod)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {getStatusBadge(fee.status)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="text-sm text-gray-700">
                                                    {(() => {
                                                        const lastPaymentDate = getLastPaymentDate(fee);
                                                        return lastPaymentDate 
                                                            ? new Date(lastPaymentDate).toLocaleDateString('ro-RO')
                                                            : '-';
                                                    })()}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="text-sm text-gray-700">
                                                    {fee.actualDeadline 
                                                        ? new Date(fee.actualDeadline).toLocaleDateString('ro-RO')
                                                        : new Date(fee.endedAt).toLocaleDateString('ro-RO')
                                                    }
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-center gap-2">
                                                    {isOrgAdmin && fee.id === latestFee?.id && fee.status !== MembershipFeeStatus.PENDING_VERIFICATION && fee.status !== MembershipFeeStatus.PAID && (
                                                        <button
                                                            onClick={() => handleEdit(fee)}
                                                            className="p-1.5 text-orange-500 hover:text-orange-700 hover:bg-orange-50 rounded transition-colors"
                                                            title="Editează"
                                                        >
                                                            <IconEdit className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                    {(() => {
                                                        const hasPendingPayments = fee.payments?.some(p => p.status === 'PENDING_APPROVAL');
                                                        const canPay = (fee.status === MembershipFeeStatus.PENDING || fee.status === MembershipFeeStatus.PARTIALLY_PAID);
                                                        
                                                        if (isOrgAdmin && hasPendingPayments && !isViewingOwnFees) {
                                                            return (
                                                                <button
                                                                    onClick={() => handleApprovePayment(fee)}
                                                                    className="p-1.5 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors"
                                                                    title="Confirmă plata"
                                                                >
                                                                    <IconDone className="w-5 h-5" />
                                                                </button>
                                                            );
                                                        }
                                                        
                                                        if (isViewingOwnFees && canPay) {
                                                            return (
                                                                <button
                                                                    onClick={() => handleProcessPayment(fee)}
                                                                    className="p-1.5 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors"
                                                                    title="Plătește"
                                                                >
                                                                    <IconWallet className="w-5 h-5" />
                                                                </button>
                                                            );
                                                        }
                                                        
                                                        return null;
                                                    })()}
                                                    {isOrgAdmin && fee.status === MembershipFeeStatus.PENDING_VERIFICATION && (
                                                        <button
                                                            onClick={() => handleProcessPayment(fee)}
                                                            className="p-1.5 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors"
                                                            title="Validează plată"
                                                        >
                                                            <IconDone className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                    {isOrgAdmin && (
                                                        <button
                                                            onClick={() => handleDelete(fee.id)}
                                                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors"
                                                            title="Șterge"
                                                        >
                                                            <IconDelete className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                                            Nu există cotizații înregistrate pentru acest membru.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <SecondaryButton onClick={onClose}>
                            Închide
                        </SecondaryButton>
                    </div>
                </div>
            </Modal>

            <CreateMembershipFeeModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={handleCreateModalSuccess}
                memberId={memberId}
            />

            {selectedFeeId && selectedFee && (
                <>
                    <UpdateMembershipFeeModal
                        isOpen={isUpdateModalOpen}
                        onClose={() => setIsUpdateModalOpen(false)}
                        onSuccess={handleModalSuccess}
                        membershipFeeId={selectedFeeId}
                    />

                    <ProcessPaymentModal
                        isOpen={isProcessPaymentModalOpen}
                        onClose={() => setIsProcessPaymentModalOpen(false)}
                        onSuccess={handleModalSuccess}
                        membershipFeeId={selectedFeeId}
                        memberId={memberId}
                        memberName={memberName}
                        amount={selectedFee.amount}
                        remainingAmount={selectedFee.remainingAmount}
                        currency={selectedFee.currency}
                    />
                </>
            )}

            {selectedFee && selectedPayments.length > 0 && (
                <ApprovePaymentModal
                    isOpen={isApprovePaymentModalOpen}
                    onClose={() => {
                        setIsApprovePaymentModalOpen(false);
                        setSelectedPayments([]);
                        setSelectedFee(null);
                    }}
                    onSuccess={handleModalSuccess}
                    payments={selectedPayments}
                    memberName={memberName}
                />
            )}
        </>
    );
};
