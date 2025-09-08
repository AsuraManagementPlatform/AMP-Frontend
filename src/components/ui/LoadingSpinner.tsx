import React from 'react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({size = 'md', className = ''}) => {
    const spinnerClasses = [
        'spinner',
        `spinner-${size}`,
        className
    ].filter(Boolean).join(' ');

    return (
        <div
            className={spinnerClasses}
            role="status"
            aria-label="Loading"
        >
            <span className="sr-only">Loading...</span>
        </div>
    );
};