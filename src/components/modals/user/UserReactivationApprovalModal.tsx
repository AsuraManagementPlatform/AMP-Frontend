import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { PendingReactivationUser, userReactivationService } from '@/services/userReactivation.service';
import showToast from '@/components/ui/Toast';

interface UserReactivationApprovalModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: PendingReactivationUser | null;
    onRefresh: () => void;
}

export default function UserReactivationApprovalModal({
    isOpen,
    onClose,
    user,
    onRefresh
}: UserReactivationApprovalModalProps) {
    const { t } = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectForm, setShowRejectForm] = useState(false);

    if (!user) return null;

    const handleApprove = async () => {
        setIsSubmitting(true);
        try {
            await userReactivationService.approveReactivation(user.id);
            showToast.success(t('toast.user.reactivation_approved'));
            onRefresh();
            onClose();
        } catch (error: any) {
            showToast.error(error.response?.data?.error || t('toast.user.reactivation_approve_error'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            showToast.error(t('toast.user.rejection_reason_required'));
            return;
        }

        setIsSubmitting(true);
        try {
            await userReactivationService.rejectReactivation(user.id, rejectionReason);
            showToast.success(t('toast.user.reactivation_rejected'));
            onRefresh();
            onClose();
            setRejectionReason('');
            setShowRejectForm(false);
        } catch (error: any) {
            showToast.error(error.response?.data?.error || t('toast.user.reactivation_reject_error'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        setRejectionReason('');
        setShowRejectForm(false);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleCancel} title="Aprobare Reactivare Membru">
            <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Detalii Membru</h3>
                    <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Nume:</span> {user.full_name}</p>
                        <p><span className="font-medium">Email:</span> {user.email}</p>
                        <p><span className="font-medium">Status:</span> {user.status}</p>
                        {user.reactivation_requested_at && (
                            <p>
                                <span className="font-medium">Data cererii:</span>{' '}
                                {new Date(user.reactivation_requested_at).toLocaleDateString('ro-RO', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        )}
                    </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Motiv Cerere Reactivare</h4>
                    <p className="text-sm text-gray-700">
                        Membrul a plătit cotizația restantă și solicită reactivarea contului.
                    </p>
                </div>

                {!showRejectForm ? (
                    <div className="flex gap-3 justify-end pt-4">
                        <Button variant="secondary" onClick={handleCancel} disabled={isSubmitting}>
                            Anulează
                        </Button>
                        <Button
                            variant="danger"
                            onClick={() => setShowRejectForm(true)}
                            disabled={isSubmitting}
                        >
                            Respinge
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleApprove}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Se procesează...' : 'Aprobă Reactivarea'}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3 pt-4 border-t">
                        <h4 className="font-semibold text-gray-900">Motivul Respingerii</h4>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Introdu motivul pentru care respingi cererea de reactivare..."
                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            rows={4}
                            disabled={isSubmitting}
                        />
                        <div className="flex gap-3 justify-end">
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setShowRejectForm(false);
                                    setRejectionReason('');
                                }}
                                disabled={isSubmitting}
                            >
                                Înapoi
                            </Button>
                            <Button
                                variant="danger"
                                onClick={handleReject}
                                disabled={isSubmitting || !rejectionReason.trim()}
                            >
                                {isSubmitting ? 'Se procesează...' : 'Confirmă Respingerea'}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}
