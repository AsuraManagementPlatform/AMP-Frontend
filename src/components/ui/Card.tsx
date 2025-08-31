import React from 'react';
import {BaseComponentProps} from "@/types/index.types.ts";

interface CardProps extends BaseComponentProps {
    title?: string;
    subtitle?: string;
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({children, title, subtitle, className = '', padding = 'md'}) => {
    const paddingClasses = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8'
    };

    return (
        <div className={`bg-white rounded-lg shadow-md ${paddingClasses[padding]} ${className}`}>
            {(title || subtitle) && (
                <div className="mb-4">
                    {title && <h3 className="text-xl font-semibold text-gray-900">{title}</h3>}
                    {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
                </div>
            )}
            {children}
        </div>
    );
};
