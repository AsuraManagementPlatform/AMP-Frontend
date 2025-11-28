import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { EntityDonation } from '@/types/index.types';

interface ConfirmDonationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (proofDocument?: string) => Promise<void>;
    donation: EntityDonation;
}

export const ConfirmDonationModal: React.FC<ConfirmDonationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    donation
}) => {
    const { t } = useTranslation();
    const [proofDocument, setProofDocument] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setProofDocument(e.target.files[0]);
        }
    };

    const handleConfirm = async () => {
        setIsSubmitting(true);
        try {
            await onConfirm(proofDocument?.name);
            setProofDocument(null);
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
            title={t('label.entity_donation.confirm_donation')}
        >
            <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">
                        {t('label.entity_donation.donation_details')}
                    </h4>
                    <div className="text-sm text-blue-800 space-y-1">
                        <p><strong>{t('label.entity_donation.entity')}:</strong> {donation.entityName}</p>
                        <p><strong>{t('label.entity_donation.amount')}:</strong> {formatCurrency(donation.amount, donation.currency)}</p>
                        <p><strong>{t('label.entity_donation.type')}:</strong> {donation.type}</p>
                        <p><strong>{t('label.entity_donation.date')}:</strong> {new Date(donation.date).toLocaleDateString('ro-RO')}</p>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('label.entity_donation.proof_document')}
                        <span className="text-gray-500 font-normal ml-1">({t('label.optional')})</span>
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                        <div className="space-y-1 text-center">
                            <svg
                                className="mx-auto h-12 w-12 text-gray-400"
                                stroke="currentColor"
                                fill="none"
                                viewBox="0 0 48 48"
                            >
                                <path
                                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                            <div className="flex text-sm text-gray-600">
                                <label
                                    htmlFor="proof-upload"
                                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                                >
                                    <span>{t('label.entity_donation.upload_file')}</span>
                                    <input
                                        id="proof-upload"
                                        name="proof-upload"
                                        type="file"
                                        className="sr-only"
                                        onChange={handleFileChange}
                                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                    />
                                </label>
                                <p className="pl-1">{t('label.entity_donation.or_drag_drop')}</p>
                            </div>
                            <p className="text-xs text-gray-500">
                                PDF, JPG, PNG, DOC {t('label.entity_donation.up_to')} 10MB
                            </p>
                        </div>
                    </div>
                    {proofDocument && (
                        <div className="mt-2 flex items-center justify-between text-sm text-green-600 bg-green-50 p-2 rounded">
                            <div className="flex items-center gap-2">
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span>{proofDocument.name}</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setProofDocument(null)}
                                className="text-gray-400 hover:text-red-500"
                            >
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-800">
                        {t('label.entity_donation.confirm_warning')}
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
                        variant="primary"
                        onClick={handleConfirm}
                        disabled={isSubmitting}
                        className="border-green-600 text-green-600 hover:bg-green-600"
                    >
                        {isSubmitting ? t('label.processing') : t('action.confirm')}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
