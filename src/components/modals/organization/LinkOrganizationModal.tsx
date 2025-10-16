import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { UserMeResponse } from '@/types/user.types';

interface LinkOrganizationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    user: UserMeResponse | null;
}

export const LinkOrganizationModal: React.FC<LinkOrganizationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    user
}) => {
    if (!user) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Creare organizație"
            size="sm"
        >
            <div className="space-y-4">
                <p className="text-gray-700">
                    Utilizatorul <span className="font-semibold">{user.full_name}</span> ({user.email}) 
                    a fost creat cu succes ca entitate juridică.
                </p>
                
                {user.company_name && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-gray-700">
                            <span className="font-medium">Companie:</span> {user.company_name}
                        </p>
                        {user.company_number && (
                            <p className="text-sm text-gray-700 mt-1">
                                <span className="font-medium">CUI:</span> {user.company_number}
                            </p>
                        )}
                    </div>
                )}
                
                <p className="text-gray-700 font-medium">
                    Doriți să creați o organizație nouă pentru acest utilizator?
                </p>
                
                <p className="text-sm text-gray-600">
                    Dacă bifați "Da", formularul de creare organizație va fi pre-completat cu datele companiei.
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
                        Da, creează organizație
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
