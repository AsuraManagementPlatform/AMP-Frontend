import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface PasswordResetConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    userEmail: string;
}

export const PasswordResetConfirmModal: React.FC<PasswordResetConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    userEmail
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Trimite email resetare parolă?"
            size="sm"
        >
            <div className="space-y-4">
                <p className="text-gray-700">
                    Doriți să trimiteți un email de resetare parolă acestui utilizator?
                </p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-gray-700">
                        <span className="font-medium">Email:</span> {userEmail}
                    </p>
                </div>
                
                <p className="text-sm text-gray-600">
                    Utilizatorul va primi un link pentru a-și reseta parola.
                </p>
                
                <div className="flex gap-3 justify-end pt-4">
                    <Button
                        variant="outline"
                        onClick={onClose}
                    >
                        Nu, mulțumesc
                    </Button>
                    <Button
                        variant="primary"
                        onClick={onConfirm}
                    >
                        Da, trimite email
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
