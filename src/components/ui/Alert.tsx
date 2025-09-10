import React from 'react';
import {BaseComponentProps} from "@/types/index.types.ts";

interface AlertProps extends BaseComponentProps {
    variant?: 'info' | 'success' | 'warning' | 'error';
    title?: string;
    dismissible?: boolean;
    onDismiss?: () => void;
}

export const Alert: React.FC<AlertProps> = ({children, variant = 'info', title, dismissible = false, onDismiss, className = ''}) => {
    const alertClasses = [
        'alert',
        `alert-${variant}`,
        className
    ].filter(Boolean).join(' ');

    return (
        <div className={alertClasses}>
            <div className="alert-content">
                <div className="alert-icon">
                    {variant === 'success' && '✓'}
                    {variant === 'error' && '✗'}
                    {variant === 'warning' && '⚠'}
                    {variant === 'info' && 'ⓘ'}
                </div>
                <div className="alert-body">
                    {title && (
                        <h3 className="alert-title">{title}</h3>
                    )}
                    <div className="alert-message">{children}</div>
                </div>
                {dismissible && onDismiss && (
                    <div className="alert-dismiss">
                        <button
                            onClick={onDismiss}
                            className="alert-dismiss-btn"
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