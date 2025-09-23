import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    px?: number;
    py?: number;
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    fullWidth?: boolean;
    rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
    className?: string;
}

export const Button: React.FC<ButtonProps> = ({
                                                  children,
                                                  variant = 'primary',
                                                  size = 'md',
                                                  px,
                                                  py,
                                                  isLoading = false,
                                                  leftIcon,
                                                  rightIcon,
                                                  fullWidth = false,
                                                  rounded = 'lg',
                                                  className = '',
                                                  disabled,
                                                  ...props
                                              }) => {
    const buttonClasses = [
        'btn',
        `btn-${variant}`,
        `px-${px}`,
        `py-${py}`,
        `text-${size}`,
        `rounded-${rounded}`,
        'font-medium',
        'outline-none',
        'relative',
        'inline-flex',
        'items-center',
        'justify-center',
        'cursor-pointer',
        'border-none',
        'transition-all',
        'duration-200',
        'ease-in-out',
        'hover:-translate-y-0.5',
        'hover:shadow-lg',
        'focus:ring-2 ring-orange-500/50',
        'active:translate-y-0',
        'active:scale-95',
        'disabled:opacity-50',
        'disabled:cursor-not-allowed',
        fullWidth && 'w-full',
        isLoading && 'btn-loading',
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
                    <div className="spinner spinner-sm mr-2" />
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