import React, { useRef, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import logoImg from '@/assets/img/logo.png';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    closeOnBackdropClick?: boolean;
    showCloseButton?: boolean;
    showResetButton?: boolean;
    onReset?: () => void;
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
    showResetButton = false,
    onReset,
    className = ''
}) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);
    const dragOffset = useRef({ x: 0, y: 0 });
    const [isDraggable, setIsDraggable] = React.useState(true);

    const sizeClasses = {
        sm: 'modal-content-sm',
        md: 'modal-content',
        lg: 'modal-content-lg',
        xl: 'modal-content-xl'
    };

    const isInteractiveElement = (element: HTMLElement | null): boolean => {
        if (!element || element === modalRef.current) return false;

        const interactiveElements = ['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON', 'A'];
        
        let currentElement: HTMLElement | null = element;
        while (currentElement && currentElement !== modalRef.current) {
            if (interactiveElements.includes(currentElement.tagName)) {
                return true;
            }
            
            if (
                currentElement.hasAttribute('role') && 
                ['button', 'link', 'tab', 'menuitem'].includes(currentElement.getAttribute('role') || '')
            ) {
                return true;
            }
            
            if (currentElement.contentEditable === 'true') {
                return true;
            }
            
            if (
                currentElement.classList.contains('clickable') ||
                currentElement.classList.contains('btn') ||
                currentElement.hasAttribute('data-clickable') ||
                currentElement.style.cursor === 'pointer'
            ) {
                return true;
            }
            
            currentElement = currentElement.parentElement;
        }
        
        return false;
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging.current || !modalRef.current) return;
        
        e.preventDefault();
        const modal = modalRef.current;
        const newX = e.clientX - dragOffset.current.x;
        const newY = e.clientY - dragOffset.current.y;

        modal.style.left = `${newX}px`;
        modal.style.top = `${newY}px`;
        modal.style.transform = 'none';
    };

    const handleMouseUp = () => {
        isDragging.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
    };

    const handleMouseOver = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        const isInteractive = isInteractiveElement(target);
        setIsDraggable(!isInteractive);
        
        if (modalRef.current) {
            modalRef.current.style.cursor = isInteractive ? 'default' : 'move';
        }
    };

    useEffect(() => {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    const handleMouseDown = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        
        if (isInteractiveElement(target)) {
            return;
        }

        if (!modalRef.current) return;

        e.preventDefault();
        const modal = modalRef.current;
        const rect = modal.getBoundingClientRect();
        
        isDragging.current = true;
        dragOffset.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
        
        document.body.style.cursor = 'move';
        document.body.style.userSelect = 'none';
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={closeOnBackdropClick ? onClose : undefined}>
            <Dialog.Portal>
                <Dialog.Overlay className="modal-overlay" />
                <Dialog.Content 
                    ref={modalRef}
                    className={`${sizeClasses[size]} ${className}`}
                    onMouseDown={handleMouseDown}
                    onMouseOver={handleMouseOver}
                    style={{ cursor: isDraggable ? 'move' : 'default' }}
                >
                    {(title || showCloseButton) && (
                        <div className="modal-header">
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                    <img 
                                        src={logoImg} 
                                        alt="Asura Logo" 
                                        className="w-12 h-12 object-contain flex-shrink-0"
                                        style={{ transform: 'scale(2)' }}
                                    />
                                </div>
                                
                                <div className="flex-1 text-center">
                                    {title && (
                                        <Dialog.Title className="modal-title">
                                            {title}
                                        </Dialog.Title>
                                    )}
                                    <Dialog.Description className={description ? "modal-description" : "sr-only"}>
                                        {description || `${title} dialog`}
                                    </Dialog.Description>
                                </div>

                                <div className="flex items-center justify-end gap-2">
                                    {showResetButton && onReset && (
                                        <button 
                                            type="button"
                                            className="modal-reset" 
                                            aria-label="Resetează"
                                            onClick={onReset}
                                            tabIndex={-1}
                                            title="Resetează formularul"
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                                                <path d="M3 3v5h5"/>
                                            </svg>
                                        </button>
                                    )}
                                    {showCloseButton && (
                                        <button 
                                            type="button"
                                            className="modal-close" 
                                            aria-label="Închide"
                                            onClick={onClose}
                                            tabIndex={-1}
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="18" y1="6" x2="6" y2="18"/>
                                                <line x1="6" y1="6" x2="18" y2="18"/>
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>
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
            size="md"
            closeOnBackdropClick={!isLoading}
            showCloseButton={!isLoading}
        >
            <div className="confirmation-modal">
                <p className="confirmation-message">{message}</p>
                
                <div className="modal-footer">
                    <button
                        onClick={handleConfirm}
                        className={`btn ${variant === 'danger' ? 'btn-danger' : variant === 'warning' ? 'btn-warning' : 'btn-primary'} ${isLoading ? 'btn-loading' : ''}`}
                        disabled={isLoading}
                    >
                        {confirmText}
                    </button>
                    <button
                        onClick={onClose}
                        className="btn btn-secondary"
                        disabled={isLoading}
                    >
                        {cancelText}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

interface FormModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    onReset?: () => void;
}

export const FormModal: React.FC<FormModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    className = '',
    onReset
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            size={size}
            className={className}
            closeOnBackdropClick={false}
            showResetButton={!!onReset}
            onReset={onReset}
        >
            {children}
        </Modal>
    );
};

export default Modal;
