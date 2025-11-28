import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { EntityDonation } from '@/types/index.types';

interface RejectDonationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onReject: (reason: string) => Promise<void>;
    donation: EntityDonation;
}

export const RejectDonationModal: React.FC<RejectDonationModalProps> = ({
    isOpen,
    onClose,
    onReject,
    donation
}) => {
    const { t } = useTranslation();
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleReject = async () => {
        if (!reason.trim()) {
            return;
        }
        setIsSubmitting(true);
        try {
            await onReject(reason);
            setReason('');
            onClose();
        } catch {
            // Error is handled by parent, just stop submitting
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('ro-RO', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount) + ' ' + currency;
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={t('label.entity_donation.reject_donation')}
        >
            <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-medium text-red-900 mb-2">
                        {t('label.entity_donation.donation_details')}
                    </h4>
                    <div className="text-sm text-red-800 space-y-1">
                        <p><strong>{t('label.entity_donation.entity')}:</strong> {donation.entityName}</p>
                        <p><strong>{t('label.entity_donation.amount')}:</strong> {formatCurrency(donation.amount, donation.currency)}</p>
                        <p><strong>{t('label.entity_donation.type')}:</strong> {donation.type}</p>
                        <p><strong>{t('label.entity_donation.date')}:</strong> {new Date(donation.date).toLocaleDateString('ro-RO')}</p>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('label.entity_donation.rejection_reason')}
                        <span className="text-red-500 ml-1">*</span>
                    </label>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                        placeholder={t('label.entity_donation.rejection_reason_placeholder')}
                    />
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-800">
                        {t('label.entity_donation.reject_warning')}
                    </p>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        {t('action.cancel')}
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleReject}
                        disabled={isSubmitting || !reason.trim()}
                    >
                        {isSubmitting ? t('label.processing') : t('label.entity_donation.reject')}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
