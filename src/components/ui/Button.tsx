import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    fullWidth?: boolean;
    className?: string;
}

export const Button: React.FC<ButtonProps> = ({
                                                  children,
                                                  variant = 'primary',
                                                  size = 'md',
                                                  isLoading = false,
                                                  leftIcon,
                                                  rightIcon,
                                                  fullWidth = false,
                                                  className = '',
                                                  disabled,
                                                  ...props
                                              }) => {
    const hasCustomClassName = className.includes('border-') || className.includes('text-');
    
    const baseClasses = [
        'relative',
        'inline-flex',
        'items-center',
        'justify-center',
        'font-medium',
        'rounded-lg',
        !hasCustomClassName && 'border-2',
        !hasCustomClassName && 'border-orange-500',
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
        sm: 'px-4 py-2.5 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg',
        xl: 'px-10 py-5 text-xl'
    };
    const variantClasses = {
        primary: 'bg-transparent text-orange-500 hover:bg-orange-500 hover:text-white',
        secondary: 'bg-transparent text-orange-500 hover:bg-orange-500 hover:text-white',
        danger: 'bg-transparent text-red-500 hover:bg-red-500 hover:text-white border-red-500',
        ghost: 'bg-transparent text-orange-500 hover:bg-orange-500 hover:text-white',
        outline: 'bg-transparent text-orange-500 hover:bg-orange-500 hover:text-white'
    };
    const buttonClasses = [
        ...baseClasses,
        sizeClasses[size],
        variantClasses[variant],
        fullWidth && 'w-full',
        className
    ].filter(Boolean).join(' ');

    return (
        <button
            className={buttonClasses}
            disabled={disabled || isLoading}
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
