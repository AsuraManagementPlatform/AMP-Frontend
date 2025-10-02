import React from 'react';
import { BaseButton, BaseButtonProps } from './BaseButton';

interface SecondaryButtonProps extends Omit<BaseButtonProps, 'size'> {
    variant?: 'outline' | 'ghost' | 'subtle' | 'filter';
    size?: 'sm' | 'md';
}

/**
 * SecondaryButton - Pentru acțiuni secundare
 * - Stiluri subtile pentru acțiuni mai puțin importante
 * - Mărime mai mică pentru folosire în tables, forms
 * - Folosit pentru: filtre, sorting, acțiuni din table, etc.
 */
export const SecondaryButton: React.FC<SecondaryButtonProps> = ({
    variant = 'outline',
    size = 'sm',
    className = '',
    ...props
}) => {
    const variantClasses = {
        outline: 'border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 hover:border-gray-400',
        ghost: 'border border-transparent bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-700',
        subtle: 'border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 hover:border-gray-300',
        filter: 'border border-orange-200 bg-orange-50 text-orange-600 hover:bg-orange-100 hover:border-orange-300'
    };

    const styleClasses = `${variantClasses[variant]} font-normal shadow-none hover:shadow-sm`;

    return (
        <BaseButton
            size={size}
            styleClasses={styleClasses}
            className={className}
            {...props}
        />
    );
};
