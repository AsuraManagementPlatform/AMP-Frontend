import React from 'react';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    children: React.ReactNode;
    size?: ModalSize;
    closeOnBackdropClick?: boolean;
    showCloseButton?: boolean;
    showResetButton?: boolean;
    onReset?: () => void;
    className?: string;
}

export interface BaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: ModalSize;
    className?: string;
    onReset?: () => void;
    primaryButtonText?: string;
    secondaryButtonText?: string;
    onPrimaryAction?: () => void;
    onSecondaryAction?: () => void;
    isPrimaryLoading?: boolean;
    isPrimaryDisabled?: boolean;
    showFooter?: boolean;
    customFooter?: React.ReactNode;
}

export interface FormBaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: ModalSize;
    className?: string;
    onReset?: () => void;
    onSubmit?: (e: React.FormEvent) => void;
    submitButtonText?: string;
    cancelButtonText?: string;
    isSubmitting?: boolean;
    isFormValid?: boolean;
    hideDefaultButtons?: boolean;
}

export interface ConfirmationModalProps {
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

export interface FormModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: ModalSize;
    className?: string;
    onReset?: () => void;
}