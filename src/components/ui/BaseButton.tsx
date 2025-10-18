import React from 'react';

export interface BaseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    fullWidth?: boolean;
    className?: string;
}

export const BaseButton: React.FC<BaseButtonProps & { styleClasses: string }> = ({
    children,
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    className = '',
    styleClasses,
    disabled,
    onClick,
    ...props
}) => {
    const baseClasses = [
        'relative',
        'inline-flex',
        'items-center',
        'justify-center',
        'font-medium',
        'rounded-lg',
        'transition-all',
        'duration-200',
        'ease-in-out',
        'focus:outline-none',
        'focus:ring-2',
        'focus:ring-orange-500',
        'focus:ring-offset-2',
        'active:scale-95',
        'disabled:opacity-50',
        'disabled:cursor-not-allowed'
    ];
    const sizeClasses = {
        sm: 'px-3 py-2 text-sm',
        md: 'px-4 py-2.5 text-base',
        lg: 'px-6 py-3 text-lg',
        xl: 'px-8 py-4 text-xl'
    };
    const buttonClasses = [
        ...baseClasses,
        sizeClasses[size],
        styleClasses,
        fullWidth && 'w-full',
        className
    ].filter(Boolean).join(' ');

    return (
        <button
            className={buttonClasses}
            disabled={disabled || isLoading}
            onClick={onClick}
            {...props}
        >
            {isLoading ? (
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                    Loading...
                </div>
            ) : (
                <>
                    {leftIcon && <span className="mr-2 flex items-center">{leftIcon}</span>}
                    {children}
                    {rightIcon && <span className="ml-2 flex items-center">{rightIcon}</span>}
                </>
            )}
        </button>
    );
};
