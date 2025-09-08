import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    closeOnBackdropClick?: boolean;
    showCloseButton?: boolean;
    className?: string;
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    description,
    children,
    size = 'md',
    closeOnBackdropClick = true,
    showCloseButton = true,
    className = ''
}) => {
    const sizeClasses = {
        sm: 'modal-content-sm',
        md: 'modal-content',
        lg: 'modal-content-lg',
        xl: 'modal-content-xl'
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={closeOnBackdropClick ? onClose : undefined}>
            <Dialog.Portal>
                <Dialog.Overlay className="modal-overlay" />
                <Dialog.Content className={`${sizeClasses[size]} ${className}`}>
                    {(title || showCloseButton) && (
                        <div className="modal-header">
                            <div>
                                {title && (
                                    <Dialog.Title className="modal-title">
                                        {title}
                                    </Dialog.Title>
                                )}
                                {description && (
                                    <Dialog.Description className="modal-description">
                                        {description}
                                    </Dialog.Description>
                                )}
                            </div>
                            {showCloseButton && (
                                <Dialog.Close className="modal-close" aria-label="Închide">
                                    ×
                                </Dialog.Close>
                            )}
                        </div>
                    )}
                    
                    <div className="modal-body">
                        {children}
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

// Specialized components for common use cases
interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
    isLoading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirmă',
    cancelText = 'Anulează',
    variant = 'info',
    isLoading = false
}) => {
    const handleConfirm = () => {
        onConfirm();
        if (!isLoading) {
            onClose();
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            size="sm"
            closeOnBackdropClick={!isLoading}
            showCloseButton={!isLoading}
        >
            <div className="confirmation-modal">
                <p className="confirmation-message">{message}</p>
                
                <div className="modal-footer">
                    <button
                        onClick={onClose}
                        className="btn btn-secondary"
                        disabled={isLoading}
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={handleConfirm}
                        className={`btn ${variant === 'danger' ? 'btn-danger' : variant === 'warning' ? 'btn-warning' : 'btn-primary'} ${isLoading ? 'btn-loading' : ''}`}
                        disabled={isLoading}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

// Form Modal wrapper
interface FormModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

export const FormModal: React.FC<FormModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    className = ''
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            size={size}
            className={className}
            closeOnBackdropClick={false} // Don't close on backdrop click for forms
        >
            {children}
        </Modal>
    );
};

export default Modal;
