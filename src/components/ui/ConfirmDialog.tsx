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

    const variantStyles = {
        danger: {
            iconBg: 'bg-red-100',
            iconText: 'text-red-600',
            defaultIcon: '🗑️'
        },
        primary: {
            iconBg: 'bg-blue-100',
            iconText: 'text-blue-600',
            defaultIcon: 'ℹ️'
        }
    };

    const styles = variantStyles[confirmButtonVariant];

    return (
        <div
            className="fixed inset-0 z-[99999] overflow-y-auto"
            aria-labelledby="confirm-dialog-title"
            role="dialog"
            aria-modal="true"
        >
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={handleBackdropClick}
            />

            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                    <div className="bg-white px-6 pt-6 pb-4">
                        <div className="flex items-start gap-4">
                            <div className={`flex-shrink-0 w-12 h-12 rounded-full ${styles.iconBg} flex items-center justify-center`}>
                                {icon ? (
                                    <span className={`text-2xl ${styles.iconText}`}>{icon}</span>
                                ) : (
                                    <span className="text-2xl">{styles.defaultIcon}</span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0 mt-1">
                                <h3
                                    className="text-lg font-semibold leading-6 text-gray-900 mb-2"
                                    id="confirm-dialog-title"
                                >
                                    {title}
                                </h3>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    {message}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3">
                        <Button
                            onClick={onClose}
                            variant="outline"
                            size="sm"
                            disabled={isLoading}
                            className="w-auto"
                        >
                            {cancelText}
                        </Button>
                        <Button
                            onClick={onConfirm}
                            variant={confirmButtonVariant}
                            size="sm"
                            disabled={isLoading}
                            isLoading={isLoading}
                            className="w-auto shadow-sm"
                        >
                            {confirmText}
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