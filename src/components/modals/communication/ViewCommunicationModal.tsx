import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import showToast from '@/components/ui/Toast';
import communicationService from '@/services/communication.service';
import leaveRequestService from '@/services/leave-request.service';
import { Communication, UserCommunicationStatus } from '@/types/communication.types';
import { apiService } from '@/services/api.service';
import { AuthContext } from '@/context/Auth.context';
import { useConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ActionIcons } from '@/components/ui/ActionIcons';

interface ViewCommunicationModalProps {
    isOpen: boolean;
    onClose: () => void;
    communication: Communication | null;
    onUpdate: () => void;
}

export const ViewCommunicationModal: React.FC<ViewCommunicationModalProps> = ({
    isOpen,
    onClose,
    communication,
    onUpdate
}) => {
    const { t } = useTranslation();
    const [replyMessage, setReplyMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [markedAsRead, setMarkedAsRead] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(true);
    const authContext = useContext(AuthContext);
    const currentUserId = authContext?.user?.id;
    const confirm = useConfirmDialog();

    useEffect(() => {
        if (!isOpen) {
            setMarkedAsRead(false);
            setReplyMessage('');
            setIsModalVisible(true);
        }
    }, [isOpen]);

    useEffect(() => {
        const markAsRead = async () => {
            if (!isOpen || !communication || markedAsRead || !currentUserId) return;
            
            const shouldMarkAsRead = 
                (communication.recipient === currentUserId && !communication.isReadByRecipient) ||
                (communication.sender === currentUserId && communication.unreadCountForSender > 0);
            
            if (shouldMarkAsRead) {
                try {
                    await communicationService.markAsRead(communication.id);
                    setMarkedAsRead(true);
                } catch (error: any) {
                }
            }
        };

        markAsRead();
    }, [isOpen, communication?.id, communication?.isReadByRecipient, communication?.unreadCountForSender, markedAsRead, currentUserId]);

    if (!communication) return null;

    const handleReply = async () => {
        if (!replyMessage.trim()) {
            showToast.error(t('toast.communication.reply_required'));
            return;
        }

        try {
            setIsSubmitting(true);
            const response = await communicationService.reply(communication.id, { message: replyMessage });
            showToast.success(t('toast.communication.reply_sent'));
            setReplyMessage('');
            
            if (response?.conversationHistory) {
                communication.conversationHistory = response.conversationHistory;
                communication.lastMessageAt = response.lastMessageAt;
            }
            
            await communicationService.markAsRead(communication.id);
            
            onUpdate();
        } catch (error: any) {
            showToast.error(error.message || 'Nu s-a putut trimite răspunsul');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleStatusChange = async (newStatus: UserCommunicationStatus) => {
        try {
            await communicationService.updateStatus(communication.id, { status: newStatus });
            showToast.success(t('toast.communication.status_updated'));
            await communicationService.markAsRead(communication.id);
            onUpdate();
        } catch (error: any) {
            showToast.error(error.message || 'Nu s-a putut actualiza statusul');
        }
    };

    const handleConfirmSponsorship = async () => {
        const donationIdMatch = communication.initialMessage.match(/donation_id:([a-f0-9-]+)/);
        if (!donationIdMatch) {
            showToast.error(t('toast.communication.sponsorship_id_not_found'));
            return;
        }

        const donationId = donationIdMatch[1];

        try {
            setIsSubmitting(true);
            await apiService.post(`entity-donation/${donationId}/confirm`);
            showToast.success(t('toast.communication.sponsorship_confirmed'));
            await communicationService.markAsRead(communication.id);
            onUpdate();
        } catch (error: any) {
            showToast.error(error.message || 'Nu s-a putut confirma sponsorizarea');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRejectSponsorship = async () => {
        const donationIdMatch = communication.initialMessage.match(/donation_id:([a-f0-9-]+)/);
        if (!donationIdMatch) {
            showToast.error(t('toast.communication.sponsorship_id_not_found'));
            return;
        }

        const donationId = donationIdMatch[1];

        try {
            setIsSubmitting(true);
            await apiService.post(`entity-donation/${donationId}/reject`);
            showToast.success(t('toast.communication.sponsorship_rejected'));
            await communicationService.markAsRead(communication.id);
            onUpdate();
        } catch (error: any) {
            showToast.error(error.message || 'Nu s-a putut respinge sponsorizarea');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleApproveLeaveRequest = async () => {
        const leaveRequestIdMatch = communication.initialMessage.match(/leave_request_id:([a-f0-9-]+)/);
        if (!leaveRequestIdMatch) {
            showToast.error(t('toast.leave_request.id_not_found'));
            return;
        }

        const leaveRequestId = leaveRequestIdMatch[1];

        try {
            setIsSubmitting(true);
            await leaveRequestService.approve(leaveRequestId);
            showToast.success(t('toast.leave_request.approve_success'));
            await communicationService.markAsRead(communication.id);
            onUpdate();
            onClose();
        } catch (error: any) {
            const message = error?.message?.includes('.') ? t(error.message) : error.message;
            showToast.error(message || t('toast.leave_request.approve_error'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRejectLeaveRequest = async () => {
        const leaveRequestIdMatch = communication.initialMessage.match(/leave_request_id:([a-f0-9-]+)/);
        if (!leaveRequestIdMatch) {
            showToast.error(t('toast.leave_request.id_not_found'));
            return;
        }

        const leaveRequestId = leaveRequestIdMatch[1];

        try {
            setIsSubmitting(true);
            await leaveRequestService.reject(leaveRequestId);
            showToast.success(t('toast.leave_request.reject_success'));
            await communicationService.markAsRead(communication.id);
            onUpdate();
            onClose();
        } catch (error: any) {
            const message = error?.message?.includes('.') ? t(error.message) : error.message;
            showToast.error(message || t('toast.leave_request.reject_error'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        setIsModalVisible(false);
        
        const confirmed = await confirm({
            title: t('label.communication.delete_title'),
            message: t('label.communication.delete_confirm'),
            confirmText: t('button.delete'),
            cancelText: t('button.cancel'),
            confirmButtonVariant: 'danger',
        });

        if (!confirmed) {
            setIsModalVisible(true);
            return;
        }

        try {
            setIsSubmitting(true);
            await communicationService.delete(communication.id);
            showToast.success(t('toast.communication.deleted_single'));
            onClose();
            onUpdate();
        } catch (error: any) {
            showToast.error(error.message || t('toast.default_error_message'));
            setIsModalVisible(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    const isSponsorshipRequest = communication.type === 'SPONSORSHIP_REQUEST';
    const isLeaveRequest = communication.type === 'LEAVE_REQUEST';

    const getStatusLabel = (status: UserCommunicationStatus) => {
        return t(`label.communication.status.${status.toLowerCase()}`);
    };

    const getPriorityLabel = (priority: string) => {
        return t(`label.communication.priority.${priority.toLowerCase()}`);
    };

    const cleanMessageFromIds = (message: string): string => {
        return message
            .replace(/\[leave_request_id:[a-f0-9-]+\]/gi, '')
            .replace(/\[donation_id:[a-f0-9-]+\]/gi, '')
            .trim();
    };

    const formatLeaveRequestMessage = (message: string): string => {
        const dataMatch = message.match(/\[LEAVE_REQUEST_DATA\]([\s\S]*?)\[\/LEAVE_REQUEST_DATA\]/);
        if (dataMatch) {
            const dataContent = dataMatch[1];
            const getData = (key: string): string => {
                const match = dataContent.match(new RegExp(`${key}:(.+)`));
                return match ? match[1].trim() : '';
            };

            const userName = getData('user_name');
            const vacationDays = getData('vacation_days');
            const startDate = getData('start_date');
            const endDate = getData('end_date');
            const notes = getData('notes');

            let formattedMessage = t('label.leave_request.request_message', {
                userName,
                vacationDays,
                startDate,
                endDate
            });

            if (notes) {
                formattedMessage += `\n${t('label.leave_request.notes')}: ${notes}`;
            }

            return formattedMessage;
        }

        const oldFormatMatch = message.match(/(.+) has requested (\d+) vacation day\(s\)\.\s*Period: (\d{4}-\d{2}-\d{2}) to (\d{4}-\d{2}-\d{2})/);
        if (oldFormatMatch) {
            const userName = oldFormatMatch[1];
            const vacationDays = oldFormatMatch[2];
            const startDate = oldFormatMatch[3];
            const endDate = oldFormatMatch[4];
            
            const notesMatch = message.match(/Notes: (.+?)(?:\[|$)/s);
            const notes = notesMatch ? notesMatch[1].trim() : '';

            let formattedMessage = t('label.leave_request.request_message', {
                userName,
                vacationDays,
                startDate,
                endDate
            });

            if (notes) {
                formattedMessage += `\n${t('label.leave_request.notes')}: ${notes}`;
            }

            return formattedMessage;
        }

        return cleanMessageFromIds(message);
    };

    return (
        <Modal
            isOpen={isOpen && isModalVisible}
            onClose={onClose}
            title={communication.subject}
            size="lg"
        >
            <div className="space-y-4">
                {/* Header Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-gray-600">De la:</span>
                            <span className="ml-2 font-medium">{communication.senderName}</span>
                        </div>
                        <div>
                            <span className="text-gray-600">Către:</span>
                            <span className="ml-2 font-medium">{communication.recipientName}</span>
                        </div>
                        <div>
                            <span className="text-gray-600">Status:</span>
                            <span className="ml-2 font-medium">{getStatusLabel(communication.status)}</span>
                        </div>
                        <div>
                            <span className="text-gray-600">Prioritate:</span>
                            <span className="ml-2 font-medium">{getPriorityLabel(communication.priority)}</span>
                        </div>
                    </div>
                </div>

                {/* Conversation History */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                    {/* Initial Message */}
                    {(!communication.deletedAt || new Date(communication.createdAt) > new Date(communication.deletedAt)) && (
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="flex items-start gap-3">
                                <div className="flex-1">
                                    <div className="font-semibold text-sm text-gray-900">{communication.senderName}</div>
                                    <p className="text-gray-700 mt-1 whitespace-pre-line">
                                        {isLeaveRequest 
                                            ? formatLeaveRequestMessage(communication.initialMessage)
                                            : cleanMessageFromIds(communication.initialMessage)
                                        }
                                    </p>
                                    <div className="text-xs text-gray-500 mt-2">
                                        {new Date(communication.createdAt).toLocaleString('ro-RO')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Conversation Messages */}
                    {communication.conversationHistory && communication.conversationHistory.length > 0 && (
                        communication.conversationHistory
                            .filter(msg => !communication.deletedAt || new Date(msg.timestamp) > new Date(communication.deletedAt))
                            .map((msg, index) => {
                                const isTranslationKey = msg.message.startsWith('label.') || msg.message.startsWith('leave_request.');
                                const displayMessage = isTranslationKey 
                                    ? t(`label.${msg.message}`)
                                    : msg.message;
                                
                                return (
                                    <div 
                                        key={index}
                                        className={`p-4 rounded-lg ${msg.isAdmin ? 'bg-green-50' : 'bg-gray-50'}`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex-1">
                                                <div className="font-semibold text-sm text-gray-900">{msg.senderName}</div>
                                                <p className="text-gray-700 mt-1">{displayMessage}</p>
                                                <div className="text-xs text-gray-500 mt-2">
                                                    {new Date(msg.timestamp).toLocaleString('ro-RO')}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                    )}
                </div>

                {/* Reply Section */}
                {communication.status !== 'CLOSED' && !isSponsorshipRequest && !isLeaveRequest && (
                    <div className="border-t pt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Răspunde
                        </label>
                        <textarea
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                            placeholder="Scrie răspunsul tău aici..."
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="mt-3 flex gap-2">
                            <Button
                                onClick={handleReply}
                                disabled={isSubmitting || !replyMessage.trim()}
                                size="sm"
                            >
                                {isSubmitting ? 'Se trimite...' : 'Trimite răspuns'}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Sponsorship Confirmation Section - Only for recipient (admin) */}
                {isSponsorshipRequest && communication.status === 'PENDING' && currentUserId === communication.recipient && (
                    <div className="border-t pt-4">
                        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-4 rounded-lg border border-orange-200 mb-4">
                            <div className="flex items-start gap-3">
                                <div className="flex-1">
                                    <h4 className="font-semibold text-orange-800 mb-2">Cerere de Sponsorizare</h4>
                                    <p className="text-sm text-gray-700 mb-3">
                                        Un membru dorește să sponsorizeze organizația. Verifică detaliile și confirmă pentru a adăuga suma la buget.
                                    </p>
                                    <div className="bg-white rounded p-3 text-sm">
                                        <div className="grid grid-cols-2 gap-2">
                                            <div><span className="text-gray-600">Status:</span> <span className="font-medium">În așteptare</span></div>
                                            <div><span className="text-gray-600">Prioritate:</span> <span className="font-medium text-orange-600">Ridicată</span></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                onClick={handleConfirmSponsorship}
                                disabled={isSubmitting}
                                className="flex-1 border-green-500 text-green-500 hover:bg-green-500 hover:text-white hover:border-green-500"
                                size="sm"
                            >
                                {isSubmitting ? 'Se procesează...' : 'Confirmă'}
                            </Button>
                            <Button
                                onClick={handleRejectSponsorship}
                                disabled={isSubmitting}
                                variant="danger"
                                size="sm"
                                className="flex-1"
                            >
                                {isSubmitting ? 'Se procesează...' : 'Respinge'}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Sponsorship Status - For sender (member who sent the sponsorship) */}
                {isSponsorshipRequest && currentUserId === communication.sender && (
                    <div className="border-t pt-4">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <div className="flex items-start gap-3">
                                <div className="flex-1">
                                    <h4 className="font-semibold text-blue-800 mb-2">Status Sponsorizare</h4>
                                    <p className="text-sm text-gray-700">
                                        {communication.status === 'PENDING' && 'Cererea ta de sponsorizare este în așteptare. Adminul organizației va verifica și confirma suma.'}
                                        {communication.status === 'RESOLVED' && 'Sponsorizarea ta a fost confirmată! Suma a fost adăugată la bugetul organizației. Mulțumim pentru susținere!'}
                                        {communication.status === 'CLOSED' && 'Această sponsorizare a fost respinsă sau închisă.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Leave Request Approval Section - Only for recipient (admin) */}
                {isLeaveRequest && communication.status === 'PENDING' && currentUserId === communication.recipient && (
                    <div className="border-t pt-4">
                        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-4 rounded-lg border border-teal-200 mb-4">
                            <div className="flex items-start gap-3">
                                <div className="flex-1">
                                    <h4 className="font-semibold text-teal-800 mb-2">{t('label.leave_request.title')}</h4>
                                    <p className="text-sm text-gray-700 mb-3">
                                        {t('label.leave_request.admin_review_message')}
                                    </p>
                                    <div className="bg-white rounded p-3 text-sm">
                                        <div className="grid grid-cols-2 gap-2">
                                            <div><span className="text-gray-600">{t('label.leave_request.status')}:</span> <span className="font-medium">{t('label.leave_request.status_pending')}</span></div>
                                            <div><span className="text-gray-600">{t('label.leave_request.priority')}:</span> <span className="font-medium text-teal-600">{t('label.communication.priority.normal')}</span></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                onClick={handleApproveLeaveRequest}
                                disabled={isSubmitting}
                                className="flex-1 border-green-500 text-green-500 hover:bg-green-500 hover:text-white hover:border-green-500"
                                size="sm"
                            >
                                {isSubmitting ? t('label.processing') : t('label.leave_request.approve')}
                            </Button>
                            <Button
                                onClick={handleRejectLeaveRequest}
                                disabled={isSubmitting}
                                variant="danger"
                                size="sm"
                                className="flex-1"
                            >
                                {isSubmitting ? t('label.processing') : t('label.leave_request.reject')}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Leave Request Status - For sender (member who sent the request) */}
                {isLeaveRequest && currentUserId === communication.sender && (
                    <div className="border-t pt-4">
                        <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                            <div className="flex items-start gap-3">
                                <div className="flex-1">
                                    <h4 className="font-semibold text-teal-800 mb-2">{t('label.leave_request.status')}</h4>
                                    <p className="text-sm text-gray-700">
                                        {communication.status === 'PENDING' && t('label.leave_request.status_pending_message')}
                                        {communication.status === 'RESOLVED' && t('label.leave_request.status_approved_message')}
                                        {communication.status === 'CLOSED' && t('label.leave_request.status_rejected_message')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Status Actions */}
                <div className="border-t pt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Acțiuni Status
                    </label>
                    <div className="flex gap-2 flex-wrap">
                        {communication.status === 'PENDING' && (
                            <Button
                                onClick={() => handleStatusChange('IN_PROGRESS')}
                                className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-white hover:border-yellow-500"
                                size="sm"
                            >
                                Marchează în progres
                            </Button>
                        )}
                        {(communication.status === 'PENDING' || communication.status === 'IN_PROGRESS') && (
                            <Button
                                onClick={() => handleStatusChange('RESOLVED')}
                                className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white hover:border-green-500"
                                size="sm"
                            >
                                Marchează rezolvat
                            </Button>
                        )}
                        {communication.status !== 'CLOSED' && (
                            <Button
                                onClick={() => handleStatusChange('CLOSED')}
                                variant="danger"
                                size="sm"
                            >
                                Închide conversația
                            </Button>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center border-t pt-4">
                    <button
                        onClick={handleDelete}
                        disabled={isSubmitting}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                        title="Șterge mesajul"
                    >
                        <ActionIcons.Delete />
                    </button>
                    <Button
                        onClick={onClose}
                        variant="outline"
                    >
                        Închide
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
