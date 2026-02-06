import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';
import { membershipFeeService } from '@/services/membershipFee.service';
import { MembershipFee, MembershipFeeStatus } from '@/types/membershipFee.types';
import showToast from '@/components/ui/Toast';
import { ProcessPaymentModal } from '@/components/modals/membershipFee/ProcessPaymentModal';
import { useAuth } from '@/hooks/useAuth';
import { UserGroup } from '@/types/index.types';

export const MyCotizatii: React.FC = () => {
    const { t } = useTranslation();
    const { user, hasAnyUserGroup } = useAuth();
    const [fees, setFees] = useState<MembershipFee[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedFee, setSelectedFee] = useState<MembershipFee | null>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isGeneratingAdvance, setIsGeneratingAdvance] = useState(false);

    const isOrgAdmin = hasAnyUserGroup([UserGroup.ORGANIZATION_ADMIN]);

    if (!user?.isContributor) {
        return null;
    }

    useEffect(() => {
        loadMyFees();
    }, [user]);

    const loadMyFees = async () => {
        if (!user?.id) return;
        
        try {
            setLoading(true);
            const response = await membershipFeeService.getByMember(user.id);
            const myFees = (response.results || []).sort((a: MembershipFee, b: MembershipFee) => 
                new Date(b.startedFrom).getTime() - new Date(a.startedFrom).getTime()
            );
            setFees(myFees);
        } catch (error) {
            showToast.error(t('toast.membership_fee.load_error'));
        } finally {
            setLoading(false);
        }
    };

    const handlePayFee = (fee: MembershipFee) => {
        setSelectedFee(fee);
        setIsPaymentModalOpen(true);
    };

    const handlePaymentSuccess = () => {
        setIsPaymentModalOpen(false);
        setSelectedFee(null);
        loadMyFees();
    };

    const handlePayInAdvance = async () => {
        if (!user?.id) return;
        
        try {
            setIsGeneratingAdvance(true);
            await membershipFeeService.generateNext(user.id);
            showToast.success(t('toast.membership_fee.advance_generated'));
            loadMyFees();
        } catch (error: any) {
            if (error.status === 400) {
                showToast.info(t('toast.membership_fee.advance_no_fees'));
            } else {
                showToast.error(t('toast.membership_fee.advance_error'));
            }
        } finally {
            setIsGeneratingAdvance(false);
        }
    };

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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ro-RO');
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

    return (
        <>
            <Card title="Cotizațiile mele">
                <div className="space-y-6">
                    <div className={`grid grid-cols-2 ${isOrgAdmin ? 'md:grid-cols-3' : 'md:grid-cols-4'} gap-4`}>
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
                        {!isOrgAdmin && (
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <div className="text-sm text-gray-600 mb-1">În validare</div>
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

                    <div className="flex justify-end">
                        <button
                            onClick={handlePayInAdvance}
                            disabled={isGeneratingAdvance}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isGeneratingAdvance ? 'Se procesează...' : 'Plătește în avans'}
                        </button>
                    </div>

                    {loading ? (
                        <div className="text-center py-8 text-gray-500">
                            Se încarcă cotizațiile...
                        </div>
                    ) : fees.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            Nu ai cotizații înregistrate momentan.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Perioadă
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tip
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Sumă
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Progress plată
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Dată plată
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Scadență maximă
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Acțiuni
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {fees.map((fee) => (
                                        <tr key={fee.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                {formatDate(fee.startedFrom)} - {formatDate(fee.endedAt)}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {getPeriodLabel(fee.renewPeriod)}
                                            </td>
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                {Number(fee.amount || 0).toFixed(2)} {fee.currency}
                                            </td>
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                {fee.paymentProgress || `0/${Number(fee.amount || 0).toFixed(2)}`} {fee.currency}
                                            </td>
                                            <td className="px-4 py-3">
                                                {getStatusBadge(fee.status)}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {(() => {
                                                    const lastPaymentDate = getLastPaymentDate(fee);
                                                    return lastPaymentDate ? formatDate(lastPaymentDate) : '-';
                                                })()}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {fee.actualDeadline 
                                                    ? formatDate(fee.actualDeadline)
                                                    : (fee.nextDueDate ? formatDate(fee.nextDueDate) : '-')
                                                }
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-center gap-2">
                                                    {(fee.status === MembershipFeeStatus.PENDING || 
                                                      fee.status === MembershipFeeStatus.PARTIALLY_PAID ||
                                                      fee.status === MembershipFeeStatus.OVERDUE) && (
                                                        <button
                                                            onClick={() => handlePayFee(fee)}
                                                            className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
                                                        >
                                                            Plătește
                                                        </button>
                                                    )}
                                                    {fee.status === MembershipFeeStatus.PAID && (
                                                        <span className="text-xs text-gray-400">Plătită</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </Card>

            {selectedFee && (
                <ProcessPaymentModal
                    isOpen={isPaymentModalOpen}
                    onClose={() => {
                        setIsPaymentModalOpen(false);
                        setSelectedFee(null);
                    }}
                    onSuccess={handlePaymentSuccess}
                    membershipFeeId={selectedFee.id}
                    memberId={user?.id || ''}
                    memberName={user?.fullName || ''}
                    amount={selectedFee.amount}
                    remainingAmount={selectedFee.remainingAmount}
                    currency={selectedFee.currency}
                />
            )}
        </>
    );
};
