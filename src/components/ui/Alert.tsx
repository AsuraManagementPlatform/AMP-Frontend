import React from 'react';
import {BaseComponentProps} from "@/types/index.types.ts";

interface AlertProps extends BaseComponentProps {
    variant?: 'info' | 'success' | 'warning' | 'error';
    title?: string;
    dismissible?: boolean;
    onDismiss?: () => void;
}

export const Alert: React.FC<AlertProps> = ({children, variant = 'info', title, dismissible = false, onDismiss, className = ''}) => {
    const variantClasses = {
        info: 'bg-blue-50 border-blue-200 text-blue-800',
        success: 'bg-green-50 border-green-200 text-green-800',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        error: 'bg-red-50 border-red-200 text-red-800'
    };

    const iconClasses = {
        info: 'text-blue-400',
        success: 'text-green-400',
        warning: 'text-yellow-400',
        error: 'text-red-400'
    };

    return (
        <div className={`border-2 rounded-lg p-4 ${variantClasses[variant]} ${className}`}>
            <div className="flex">
                <div className="flex-shrink-0">
                    {/* You can add icons here */}
                    <div className={`w-5 h-5 ${iconClasses[variant]}`}>
                        {variant === 'success' && '✓'}
                        {variant === 'error' && '✗'}
                        {variant === 'warning' && '⚠'}
                        {variant === 'info' && 'ⓘ'}
                    </div>
                </div>
                <div className="ml-3 flex-1">
                    {title && (
                        <h3 className="text-sm font-medium mb-1">{title}</h3>
                    )}
                    <div className="text-sm">{children}</div>
                </div>
                {dismissible && onDismiss && (
                    <div className="flex-shrink-0 ml-3">
                        <button
                            onClick={onDismiss}
                            className="inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-50 focus:ring-blue-600"
                        >
                            <span className="sr-only">Dismiss</span>
                            ✕
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};