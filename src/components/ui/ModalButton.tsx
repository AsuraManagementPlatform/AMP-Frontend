import React from 'react';
import { BaseButton, BaseButtonProps } from './BaseButton';

interface ModalButtonProps extends Omit<BaseButtonProps, 'size'> {
    variant?: 'primary' | 'secondary' | 'danger' | 'cancel';
    size?: 'sm' | 'md' | 'lg';
}

/**
 * ModalButton - Pentru butoane din modale
 * - Design fin fără contur, cu fundal translucid
 * - Hover effect cu umplere, similar cu navigarea
 * - Mărime moderată pentru context modal
 * - Folosit pentru: Submit, Cancel, Delete, etc.
 */
export const ModalButton: React.FC<ModalButtonProps> = ({
    variant = 'primary',
    size = 'md',
    className = '',
    ...props
}) => {
    const variantClasses = {
        primary: 'bg-orange-100 text-orange-600 border-none hover:bg-orange-500 hover:text-white shadow-none hover:shadow-md',
        secondary: 'bg-gray-100 text-gray-600 border-none hover:bg-gray-500 hover:text-white shadow-none hover:shadow-md',
        danger: 'bg-red-100 text-red-600 border-none hover:bg-red-500 hover:text-white shadow-none hover:shadow-md',
        cancel: 'bg-gray-50 text-gray-500 border-none hover:bg-gray-400 hover:text-white shadow-none hover:shadow-md'
    };

    const styleClasses = `${variantClasses[variant]} font-medium`;

    return (
        <BaseButton
            size={size}
            styleClasses={styleClasses}
            className={className}
            {...props}
        />
    );
};
