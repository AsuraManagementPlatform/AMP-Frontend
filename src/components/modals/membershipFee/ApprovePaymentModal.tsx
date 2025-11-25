import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { membershipFeeService } from '@/services/membershipFee.service';
import showToast from '@/components/ui/Toast';
import { MembershipFeePayment } from '@/types/membershipFee.types';
import { useTranslation } from 'react-i18next';

interface ApprovePaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    payments: MembershipFeePayment[];
    memberName: string;
}

export const ApprovePaymentModal: React.FC<ApprovePaymentModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    payments,
    memberName
}) => {
    const { t } = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const totalAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0);

    const handleApproveAll = async () => {
        try {
            setIsSubmitting(true);
            
            for (const payment of payments) {
                await membershipFeeService.approvePayment(payment.id);
            }
            
            showToast.success(t('toast.membership_fee.payment_approved'));
            onSuccess();
            onClose();
        } catch (error: any) {
            const message = error?.message && error.message.includes('.') 
                ? t(error.message) 
                : error?.message || t('toast.membership_fee.approval_error');
            showToast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRejectAll = async () => {
        try {
            setIsSubmitting(true);
            
            for (const payment of payments) {
                await membershipFeeService.rejectPayment(payment.id, { rejectionReason: 'Respinsă de administrator' });
            }
            
            showToast.success(t('toast.membership_fee.payment_rejected'));
            onSuccess();
            onClose();
        } catch (error: any) {
            const message = error?.message && error.message.includes('.') 
                ? t(error.message) 
                : error?.message || t('toast.membership_fee.rejection_error');
            showToast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ro-RO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getPaymentMethodLabel = (method: string) => {
        const labels: Record<string, string> = {
            'BANK_TRANSFER': 'Transfer bancar',
            'CASH': 'Numerar',
            'CARD': 'Card',
            'PAYPAL': 'PayPal',
            'STRIPE': 'Stripe',
            'OTHER': 'Altele'
        };
        return labels[method] || method;
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Confirmă plata - ${memberName}`}
            size="lg"
        >
            <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                        Verifică informațiile plății efectuate de {memberName} și decide dacă o aprobi sau o respingi.
                    </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div>
                        <div className="text-sm text-gray-600">Membru</div>
                        <div className="text-lg font-semibold text-gray-900">{memberName}</div>
                    </div>

                    <div>
                        <div className="text-sm text-gray-600">Total plăți în așteptare</div>
                        <div className="text-2xl font-bold text-primary-600">
                            {totalAmount.toFixed(2)} RON
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                            {payments.length} plată/plăți
                        </div>
                    </div>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                    {payments.map((payment, index) => (
                        <div key={payment.id} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                            <div className="flex justify-between items-start">
                                <div className="text-sm font-medium text-gray-700">
                                    Plata #{index + 1}
                                </div>
                                <div className="text-lg font-bold text-gray-900">
                                    {Number(payment.amount).toFixed(2)} RON
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-xs text-gray-600">Data plății</div>
                                    <div className="text-sm font-medium text-gray-900">
                                        {formatDate(payment.paymentDate)}
                                    </div>
                                </div>

                                <div>
                                    <div className="text-xs text-gray-600">Metodă de plată</div>
                                    <div className="text-sm font-medium text-gray-900">
                                        {getPaymentMethodLabel(payment.paymentMethod || 'OTHER')}
                                    </div>
                                </div>
                            </div>

                            {payment.notes && (
                                <div>
                                    <div className="text-xs text-gray-600">Note suplimentare</div>
                                    <div className="text-sm text-gray-900 whitespace-pre-wrap bg-gray-50 p-2 rounded border border-gray-200">
                                        {payment.notes}
                                    </div>
                                </div>
                            )}

                            {payment.paymentProofUrl && (
                                <div>
                                    <div className="text-xs text-gray-600">Dovadă plată</div>
                                    <a 
                                        href={payment.paymentProofUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-sm text-primary-600 hover:underline break-all"
                                    >
                                        {payment.paymentProofUrl}
                                    </a>
                                </div>
                            )}

                            <div className="pt-2 border-t border-gray-200">
                                <div className="text-xs text-gray-600">Trimisă de</div>
                                <div className="text-sm font-medium text-gray-900">
                                    {payment.processedByName || 'Necunoscut'}
                                </div>
                                <div className="text-xs text-gray-500">
                                    la {formatDate(payment.createdAt || payment.paymentDate)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                        Anulează
                    </button>
                    <button
                        onClick={handleRejectAll}
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Se procesează...' : 'Respinge'}
                    </button>
                    <button
                        onClick={handleApproveAll}
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Se procesează...' : 'Confirmă plata'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};
