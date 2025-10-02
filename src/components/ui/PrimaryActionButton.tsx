import React from 'react';
import { BaseButton, BaseButtonProps } from './BaseButton';

interface PrimaryActionButtonProps extends Omit<BaseButtonProps, 'size'> {
    variant?: 'create' | 'action' | 'important';
    size?: 'md' | 'lg' | 'xl';
}

/**
 * PrimaryActionButton - Pentru acțiuni principale din dashboard
 * - Contur portocaliu cu umplere la hover
 * - Mărime mai mare pentru vizibilitate
 * - Folosit pentru: "Creează proiect", "Creează buget", etc.
 */
export const PrimaryActionButton: React.FC<PrimaryActionButtonProps> = ({
    variant = 'action',
    size = 'lg',
    className = '',
    ...props
}) => {
    const variantClasses = {
        create: 'bg-transparent text-orange-500 hover:bg-orange-500 hover:text-white shadow-sm hover:shadow-md',
        action: 'bg-transparent text-orange-500 hover:bg-orange-500 hover:text-white shadow-sm hover:shadow-md',
        important: 'bg-transparent text-orange-600 hover:bg-orange-600 hover:text-white shadow-md hover:shadow-lg'
    };

    const styleClasses = `${variantClasses[variant]} font-semibold`;

    return (
        <BaseButton
            size={size}
            styleClasses={styleClasses}
            className={className}
            {...props}
        />
    );
};
