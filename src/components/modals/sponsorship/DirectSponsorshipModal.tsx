import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import showToast from '@/components/ui/Toast';
import { apiService } from '@/services/api.service';

interface DirectSponsorshipModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    organizationId: string;
}

export const DirectSponsorshipModal: React.FC<DirectSponsorshipModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    organizationId
}) => {
    const [amount, setAmount] = useState('');
    const [proofDocument, setProofDocument] = useState('');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!amount || parseFloat(amount) <= 0) {
            showToast.error('Te rog introdu o sumă validă');
            return;
        }

        try {
            setIsSubmitting(true);

            await apiService.post('entity-donation/direct-sponsorship', {
                amount: parseFloat(amount),
                currency: 'RON',
                destination_type: 'organization',
                destination_id: organizationId,
                payment_method: 'transfer',
                notes,
                proof_document: proofDocument
            });

            showToast.success('Sponsorizarea a fost trimisă! Adminul va verifica și confirma suma.');
            setAmount('');
            setProofDocument('');
            setNotes('');
            onSuccess();
            onClose();
        } catch (error: any) {
            showToast.error(error.message || 'Nu s-a putut trimite sponsorizarea');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setAmount('');
            setProofDocument('');
            setNotes('');
            onClose();
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Sponsorizare Directă"
            size="md"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-4 rounded-lg border border-orange-200">
                    <div className="text-center mb-3">
                        <div className="text-4xl mb-2">❤️</div>
                        <p className="text-sm text-gray-700 font-medium">Mulțumim pentru susținere!</p>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sumă (RON) <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="100"
                        min="1"
                        step="0.01"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Link Dovadă Plată
                    </label>
                    <input
                        type="url"
                        value={proofDocument}
                        onChange={(e) => setProofDocument(e.target.value)}
                        placeholder="https://example.com/proof.pdf"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Link către dovada plății (screenshot, PDF cu extras bancar, etc.)
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Note / Mesaj
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Mesaj pentru organizație (opțional)"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                </div>

                <div className="flex gap-3 pt-4 border-t">
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={isSubmitting}
                        fullWidth
                    >
                        {isSubmitting ? 'Se trimite...' : 'Confirmă Sponsorizarea'}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        disabled={isSubmitting}
                        fullWidth
                    >
                        Anulează
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
