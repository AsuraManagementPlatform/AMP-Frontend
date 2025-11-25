import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import showToast from '@/components/ui/Toast';
import communicationService from '@/services/communication.service';
import { Communication, UserCommunicationStatus } from '@/types/communication.types';
import { apiService } from '@/services/api.service';
import { AuthContext } from '@/context/Auth.context';
import { useConfirmDialog } from '@/components/ui/ConfirmDialog';

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
            showToast.error('Te rog scrie un răspuns');
            return;
        }

        try {
            setIsSubmitting(true);
            const response = await communicationService.reply(communication.id, { message: replyMessage });
            showToast.success('Răspunsul a fost trimis cu succes!');
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
            showToast.success('Statusul a fost actualizat!');
            await communicationService.markAsRead(communication.id);
            onUpdate();
        } catch (error: any) {
            showToast.error(error.message || 'Nu s-a putut actualiza statusul');
        }
    };

    const handleConfirmSponsorship = async () => {
        const donationIdMatch = communication.initialMessage.match(/donation_id:([a-f0-9-]+)/);
        if (!donationIdMatch) {
            showToast.error('Nu s-a putut găsi ID-ul sponsorizării');
            return;
        }

        const donationId = donationIdMatch[1];

        try {
            setIsSubmitting(true);
            await apiService.post(`entity-donation/${donationId}/confirm`);
            showToast.success('Sponsorizarea a fost confirmată! Suma a fost adăugată la buget.');
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
            showToast.error('Nu s-a putut găsi ID-ul sponsorizării');
            return;
        }

        const donationId = donationIdMatch[1];

        try {
            setIsSubmitting(true);
            await apiService.post(`entity-donation/${donationId}/reject`);
            showToast.success('Sponsorizarea a fost respinsă.');
            await communicationService.markAsRead(communication.id);
            onUpdate();
        } catch (error: any) {
            showToast.error(error.message || 'Nu s-a putut respinge sponsorizarea');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        setIsModalVisible(false);
        
        const confirmed = await confirm({
            title: 'Șterge mesajul',
            message: 'Ești sigur că vrei să ștergi acest mesaj? Această acțiune va șterge mesajul doar pentru tine.',
            confirmText: 'Șterge',
            cancelText: 'Anulează',
            confirmButtonVariant: 'danger',
            icon: '🗑️'
        });

        if (!confirmed) {
            setIsModalVisible(true);
            return;
        }

        try {
            setIsSubmitting(true);
            await communicationService.delete(communication.id);
            showToast.success('Mesajul a fost șters cu succes');
            onClose();
            onUpdate();
        } catch (error: any) {
            showToast.error(error.message || 'Nu s-a putut șterge mesajul');
            setIsModalVisible(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    const isSponsorshipRequest = communication.type === 'SPONSORSHIP_REQUEST';

    const getStatusLabel = (status: UserCommunicationStatus) => {
        return t(`label.communication.status.${status.toLowerCase()}`);
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
                            <span className="ml-2 font-medium">{communication.priority}</span>
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
                                    <p className="text-gray-700 mt-1">{communication.initialMessage}</p>
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
                                const displayMessage = msg.message.startsWith('label.') 
                                    ? t(msg.message) 
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
                {communication.status !== 'CLOSED' && !isSponsorshipRequest && (
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
                                <div className="text-3xl">💰</div>
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
                                <div className="text-2xl">ℹ️</div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-blue-800 mb-2">Status Sponsorizare</h4>
                                    <p className="text-sm text-gray-700">
                                        {communication.status === 'PENDING' && 'Cererea ta de sponsorizare este în așteptare. Adminul organizației va verifica și confirma suma.'}
                                        {communication.status === 'RESOLVED' && 'Sponsorizarea ta a fost confirmată! Suma a fost adăugată la bugetul organizației. Mulțumim pentru susținere! ❤️'}
                                        {communication.status === 'CLOSED' && 'Această sponsorizare a fost respinsă sau închisă.'}
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
                    <Button
                        onClick={handleDelete}
                        disabled={isSubmitting}
                        variant="danger"
                        size="sm"
                    >
                        Șterge mesajul
                    </Button>
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
