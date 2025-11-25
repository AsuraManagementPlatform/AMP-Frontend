import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import showToast from '@/components/ui/Toast';
import communicationService from '@/services/communication.service';
import { CommunicationPriority } from '@/types/communication.types';

interface GlobalBroadcastModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const GlobalBroadcastModal: React.FC<GlobalBroadcastModalProps> = ({
    isOpen,
    onClose
}) => {
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [priority, setPriority] = useState<CommunicationPriority>('NORMAL');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!subject.trim()) {
            showToast.error('Subiectul este obligatoriu');
            return;
        }

        if (!message.trim()) {
            showToast.error('Mesajul este obligatoriu');
            return;
        }

        try {
            setIsSubmitting(true);
            const result = await communicationService.sendGlobalBroadcast({
                subject: subject.trim(),
                initialMessage: message.trim(),
                priority
            });

            showToast.success(`Mesaj trimis cu succes către ${result.recipients_count || 0} utilizatori!`);
            setSubject('');
            setMessage('');
            setPriority('NORMAL');
            onClose();
        } catch (error: any) {
            showToast.error(error.message || 'Nu s-a putut trimite mesajul global');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setSubject('');
            setMessage('');
            setPriority('NORMAL');
            onClose();
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="📢 Mesaj Global către Toți Utilizatorii"
            size="lg"
        >
            <div className="space-y-4">
                <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <div className="flex-1">
                            <h4 className="font-semibold text-orange-800 mb-1">Atenție: Mesaj Global</h4>
                            <p className="text-sm text-gray-700">
                                Acest mesaj va fi trimis către <strong>toți utilizatorii activi</strong> din sistem, 
                                indiferent de organizația din care fac parte. Folosește această funcționalitate cu responsabilitate.
                            </p>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subiect <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Ex: Anunț important pentru toți utilizatorii"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isSubmitting}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mesaj <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Scrie mesajul tău aici..."
                        rows={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isSubmitting}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prioritate
                    </label>
                    <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as CommunicationPriority)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isSubmitting}
                    >
                        <option value="LOW">Scăzută</option>
                        <option value="NORMAL">Normală</option>
                        <option value="HIGH">Ridicată</option>
                        <option value="URGENT">Urgentă</option>
                    </select>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button
                        onClick={handleClose}
                        variant="outline"
                        disabled={isSubmitting}
                    >
                        Anulează
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="primary"
                        disabled={isSubmitting || !subject.trim() || !message.trim()}
                    >
                        {isSubmitting ? 'Se trimite...' : '📢 Trimite Mesaj Global'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
