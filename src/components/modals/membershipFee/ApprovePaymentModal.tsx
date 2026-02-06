import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { membershipFeeService } from '@/services/membershipFee.service';
import showToast from '@/components/ui/Toast';
import { MembershipFeePayment } from '@/types/membershipFee.types';
import { useTranslation } from 'react-i18next';
import { DocumentTextIcon, CheckIcon, XMarkIcon, ArrowDownTrayIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

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
    const [viewingPayment, setViewingPayment] = useState<MembershipFeePayment | null>(null);
    const [viewingDocumentUrls, setViewingDocumentUrls] = useState<string[]>([]);
    const [currentDocumentIndex, setCurrentDocumentIndex] = useState(0);

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

    const extractAllDocumentUrls = (notes: string | undefined): string[] => {
        if (!notes) return [];
        
        const singleMatch = notes.match(/Dovadă plată:\s*(https?:\/\/[^\s]+)/i);
        if (singleMatch) return [singleMatch[1]];
        
        const multiMatches = notes.match(/\d+\.\s*(https?:\/\/[^\s\n]+)/gi);
        if (multiMatches) {
            return multiMatches.map(match => {
                const urlMatch = match.match(/https?:\/\/[^\s\n]+/i);
                return urlMatch ? urlMatch[0] : '';
            }).filter(url => url);
        }
        
        return [];
    };

    const removeDocumentUrlFromNotes = (notes: string | undefined): string => {
        if (!notes) return '';
        
        return notes
            .replace(/\n*Dovadă plată:\s*https?:\/\/[^\s]+/gi, '')
            .replace(/\n*Dovezi plată:\s*\n(?:\d+\.\s*https?:\/\/[^\s\n]+\n?)*/gi, '')
            .trim();
    };

    const handleApprovePayment = async (payment: MembershipFeePayment) => {
        try {
            setIsSubmitting(true);
            await membershipFeeService.approvePayment(payment.id);
            showToast.success(t('toast.membership_fee.payment_approved'));
            setViewingPayment(null);
            setViewingDocumentUrls([]);
            setCurrentDocumentIndex(0);
            onSuccess();
            
            if (payments.length === 1) {
                onClose();
            }
        } catch (error: any) {
            const message = error?.message && error.message.includes('.') 
                ? t(error.message) 
                : error?.message || t('toast.membership_fee.approval_error');
            showToast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRejectPayment = async (payment: MembershipFeePayment) => {
        try {
            setIsSubmitting(true);
            await membershipFeeService.rejectPayment(payment.id, { rejectionReason: 'Respinsă de administrator' });
            showToast.success(t('toast.membership_fee.payment_rejected'));
            setViewingPayment(null);
            setViewingDocumentUrls([]);
            setCurrentDocumentIndex(0);
            onSuccess();
            
            if (payments.length === 1) {
                onClose();
            }
        } catch (error: any) {
            const message = error?.message && error.message.includes('.') 
                ? t(error.message) 
                : error?.message || t('toast.membership_fee.rejection_error');
            showToast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleViewDocument = (payment: MembershipFeePayment, documentUrls: string[]) => {
        setViewingPayment(payment);
        setViewingDocumentUrls(documentUrls);
        setCurrentDocumentIndex(0);
    };

    const handleCloseViewer = () => {
        setViewingPayment(null);
        setViewingDocumentUrls([]);
        setCurrentDocumentIndex(0);
    };

    const handlePreviousDocument = () => {
        setCurrentDocumentIndex((prev) => (prev > 0 ? prev - 1 : viewingDocumentUrls.length - 1));
    };

    const handleNextDocument = () => {
        setCurrentDocumentIndex((prev) => (prev < viewingDocumentUrls.length - 1 ? prev + 1 : 0));
    };

    if (viewingDocumentUrls.length > 0 && viewingPayment) {
        const currentDocumentUrl = viewingDocumentUrls[currentDocumentIndex];
        
        return (
            <div className="fixed inset-0 z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                <div className="flex items-center justify-center min-h-screen p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b">
                            <div className="flex-1 min-w-0">
                                <h2 className="text-xl font-semibold">Dovadă plată - {memberName}</h2>
                                <p className="text-sm text-gray-500">
                                    {Number(viewingPayment.amount).toFixed(2)} RON • {formatDate(viewingPayment.paymentDate)}
                                    {viewingDocumentUrls.length > 1 && (
                                        <span className="ml-2 text-blue-600 font-medium">
                                            Document {currentDocumentIndex + 1} din {viewingDocumentUrls.length}
                                        </span>
                                    )}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                                {viewingDocumentUrls.length > 1 && (
                                    <>
                                        <button
                                            onClick={handlePreviousDocument}
                                            className="inline-flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors"
                                            title="Document anterior"
                                        >
                                            <ChevronLeftIcon className="w-6 h-6" />
                                        </button>
                                        <button
                                            onClick={handleNextDocument}
                                            className="inline-flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors"
                                            title="Document următor"
                                        >
                                            <ChevronRightIcon className="w-6 h-6" />
                                        </button>
                                        <div className="h-8 w-px bg-gray-300 mx-1"></div>
                                    </>
                                )}
                                <button
                                    onClick={() => handleApprovePayment(viewingPayment)}
                                    disabled={isSubmitting}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                                >
                                    <CheckIcon className="w-5 h-5" />
                                    Aprobă
                                </button>
                                <button
                                    onClick={() => handleRejectPayment(viewingPayment)}
                                    disabled={isSubmitting}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                                >
                                    <XMarkIcon className="w-5 h-5" />
                                    Respinge
                                </button>
                                <a
                                    href={currentDocumentUrl}
                                    download
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <ArrowDownTrayIcon className="w-5 h-5" />
                                    Descarcă
                                </a>
                                <button
                                    onClick={handleCloseViewer}
                                    className="inline-flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <XMarkIcon className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <iframe
                                src={currentDocumentUrl}
                                className="w-full h-full"
                                title="Document Preview"
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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
                    {payments.map((payment, index) => {
                        const documentUrls = extractAllDocumentUrls(payment.notes);
                        const cleanNotes = removeDocumentUrlFromNotes(payment.notes);
                        
                        return (
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

                            {documentUrls.length > 0 && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <div className="text-xs font-medium text-blue-800 mb-2">
                                        {documentUrls.length === 1 ? 'Dovadă plată' : `${documentUrls.length} Dovezi plată`}
                                    </div>
                                    <button
                                        onClick={() => handleViewDocument(payment, documentUrls)}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        <DocumentTextIcon className="w-5 h-5" />
                                        {documentUrls.length === 1 
                                            ? 'Vizualizează și aprobă document' 
                                            : `Vizualizează ${documentUrls.length} documente`
                                        }
                                    </button>
                                </div>
                            )}

                            {cleanNotes && (
                                <div>
                                    <div className="text-xs text-gray-600">Note suplimentare</div>
                                    <div className="text-sm text-gray-900 whitespace-pre-wrap bg-gray-50 p-2 rounded border border-gray-200">
                                        {cleanNotes}
                                    </div>
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
                        );
                    })}
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
