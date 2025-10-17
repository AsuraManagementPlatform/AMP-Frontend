import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { Button } from './Button';

interface ConfirmDialogOptions {
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    confirmButtonVariant?: 'primary' | 'danger';
    icon?: React.ReactNode;
}

interface ConfirmDialogContextType {
    confirm: (options: ConfirmDialogOptions) => Promise<boolean>;
}

const ConfirmDialogContext = createContext<ConfirmDialogContextType | undefined>(undefined);

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    confirmButtonVariant?: 'primary' | 'danger';
    icon?: React.ReactNode;
    isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
                                                                isOpen,
                                                                onClose,
                                                                onConfirm,
                                                                title = 'Confirmare',
                                                                message,
                                                                confirmText = 'Confirmă',
                                                                cancelText = 'Anulează',
                                                                confirmButtonVariant = 'danger',
                                                                icon,
                                                                isLoading = false
                                                            }) => {
    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget && !isLoading) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 overflow-y-auto"
            aria-labelledby="confirm-dialog-title"
            role="dialog"
            aria-modal="true"
        >
            <div
                className="fixed inset-0 bg-black opacity-25 transition-opacity"
                onClick={handleBackdropClick}
            />

            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                    <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            {icon}
                            <div className={`mt-3 text-center sm:mt-0 ${icon ? 'sm:ml-4' : ''} sm:text-left flex-1`}>
                                <h3
                                    className="text-lg font-semibold leading-6 text-gray-900 mb-2"
                                    id="confirm-dialog-title"
                                >
                                    {title}
                                </h3>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500">
                                        {message}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 gap-2">
                        <Button
                            onClick={onConfirm}
                            variant={confirmButtonVariant}
                            size="sm"
                            disabled={isLoading}
                            isLoading={isLoading}
                            className="w-full sm:w-auto"
                        >
                            {confirmText}
                        </Button>
                        <Button
                            onClick={onClose}
                            variant="danger"
                            size="sm"
                            disabled={isLoading}
                            className="w-full sm:w-auto mt-2 sm:mt-0"
                        >
                            {cancelText}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const ConfirmDialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [dialogState, setDialogState] = useState<ConfirmDialogOptions | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const resolveRef = useRef<((value: boolean) => void) | null>(null);

    const confirm = useCallback((options: ConfirmDialogOptions): Promise<boolean> => {
        return new Promise((resolve) => {
            setDialogState(options);
            resolveRef.current = resolve;
        });
    }, []);

    const handleClose = useCallback(() => {
        if (!isLoading) {
            setDialogState(null);
            if (resolveRef.current) {
                resolveRef.current(false);
                resolveRef.current = null;
            }
        }
    }, [isLoading]);

    const handleConfirm = useCallback(() => {
        setIsLoading(true);
        setTimeout(() => {
            setDialogState(null);
            setIsLoading(false);
            if (resolveRef.current) {
                resolveRef.current(true);
                resolveRef.current = null;
            }
        }, 100);
    }, []);

    return (
        <ConfirmDialogContext.Provider value={{ confirm }}>
            {children}
            {dialogState && (
                <ConfirmDialog
                    isOpen={true}
                    onClose={handleClose}
                    onConfirm={handleConfirm}
                    {...dialogState}
                    isLoading={isLoading}
                />
            )}
        </ConfirmDialogContext.Provider>
    );
};

export const useConfirmDialog = () => {
    const context = useContext(ConfirmDialogContext);
    if (!context) {
        throw new Error('useConfirmDialog must be used within ConfirmDialogProvider');
    }
    return context.confirm;
};