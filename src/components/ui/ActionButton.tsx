import React from 'react';

export type ActionButtonVariant = 'edit' | 'delete' | 'payment' | 'view' | 'download' | 'custom';

interface ActionButtonProps {
    variant: ActionButtonVariant;
    onClick: (e: React.MouseEvent) => void;
    title?: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    disabled?: boolean;
    className?: string;
}

const variantStyles: Record<ActionButtonVariant, string> = {
    edit: 'border-blue-200 text-blue-600 hover:border-blue-400 hover:bg-blue-50',
    delete: 'border-red-200 text-red-600 hover:border-red-400 hover:bg-red-50',
    payment: 'border-green-200 text-green-600 hover:border-green-400 hover:bg-green-50',
    view: 'border-gray-200 text-gray-600 hover:border-gray-400 hover:bg-gray-50',
    download: 'border-purple-200 text-purple-600 hover:border-purple-400 hover:bg-purple-50',
    custom: 'border-gray-200 text-gray-600 hover:border-gray-400 hover:bg-gray-50'
};

export const ActionButton: React.FC<ActionButtonProps> = ({
    variant,
    onClick,
    title,
    icon: Icon,
    disabled = false,
    className = ''
}) => {
    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!disabled) {
            onClick(e);
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={disabled}
            title={title}
            className={`
                p-2 border-2 rounded-lg transition-all duration-200
                ${variantStyles[variant]}
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-sm'}
                ${className}
            `.trim()}
        >
            <Icon className="w-5 h-5" />
        </button>
    );
};
