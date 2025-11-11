import React from 'react';

interface ActionButtonGroupProps {
    children: React.ReactNode;
    align?: 'left' | 'center' | 'right';
    className?: string;
}

export const ActionButtonGroup: React.FC<ActionButtonGroupProps> = ({
    children,
    align = 'center',
    className = ''
}) => {
    const alignmentClass = {
        left: 'justify-start',
        center: 'justify-center',
        right: 'justify-end'
    }[align];

    return (
        <div className={`flex items-center gap-1 ${alignmentClass} ${className}`.trim()}>
            {children}
        </div>
    );
};
