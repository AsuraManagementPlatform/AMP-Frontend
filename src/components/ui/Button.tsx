import React, { ButtonHTMLAttributes } from 'react';
import {LoadingSpinner} from "@/components/ui/LoadingSpinner.tsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({children, variant = 'primary', size = 'md', isLoading = false, className = '', disabled, ...props}) => {
    const baseClasses = 'font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variantClasses = {
        primary: 'bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-500',
        secondary: 'bg-gray-500 text-white hover:bg-gray-600 focus:ring-gray-500',
        danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
        outline: 'border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white focus:ring-orange-500'
    };

    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base'
    };

    return (
        <button
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <div className="flex items-center justify-center">
                    <LoadingSpinner size="sm" className="mr-2" />
                    Loading...
                </div>
            ) : (
                children
            )}
        </button>
    );
};