import React from 'react';
import { BaseComponentProps } from '@/types/index.types.ts';

interface EmptyStateProps extends BaseComponentProps {
    title: string;
    description?: string;
    action?: React.ReactNode;
    icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({title, description, action, icon, className = ''}) => {
    return (
        <div className={`text-center py-12 ${className}`}>
            {icon && (
                <div className="flex justify-center mb-4 text-gray-400">
                    {icon}
                </div>
            )}
            <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
            {description && (
                <p className="text-gray-500 mb-6 max-w-sm mx-auto">{description}</p>
            )}
            {action && (
                <div>{action}</div>
            )}
        </div>
    );
};