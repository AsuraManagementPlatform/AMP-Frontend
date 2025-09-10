import React from 'react';
import {BaseComponentProps} from "@/types/index.types.ts";

interface CardProps extends BaseComponentProps {
    title?: string;
    subtitle?: string;
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({children, title, subtitle, className = '', padding = 'md'}) => {
    const cardClasses = [
        'card',
        `card-padding-${padding}`,
        className
    ].filter(Boolean).join(' ');

    return (
        <div className={cardClasses}>
            {(title || subtitle) && (
                <div className="card-header">
                    {title && <h3 className="card-title">{title}</h3>}
                    {subtitle && <p className="card-subtitle">{subtitle}</p>}
                </div>
            )}
            {children}
        </div>
    );
};
