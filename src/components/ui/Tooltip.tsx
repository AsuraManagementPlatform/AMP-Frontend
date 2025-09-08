import React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

interface TooltipProps {
    children: React.ReactNode;
    content: React.ReactNode;
    side?: 'top' | 'right' | 'bottom' | 'left';
    align?: 'start' | 'center' | 'end';
    delayDuration?: number;
    className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
    children,
    content,
    side = 'top',
    align = 'center',
    delayDuration = 400,
    className = ''
}) => {
    return (
        <TooltipPrimitive.Provider delayDuration={delayDuration}>
            <TooltipPrimitive.Root>
                <TooltipPrimitive.Trigger asChild>
                    {children}
                </TooltipPrimitive.Trigger>
                <TooltipPrimitive.Portal>
                    <TooltipPrimitive.Content
                        side={side}
                        align={align}
                        className={`tooltip-content animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ${className}`}
                        sideOffset={5}
                    >
                        {content}
                        <TooltipPrimitive.Arrow className="tooltip-arrow" />
                    </TooltipPrimitive.Content>
                </TooltipPrimitive.Portal>
            </TooltipPrimitive.Root>
        </TooltipPrimitive.Provider>
    );
};

// Simple wrapper for quick tooltips
export const SimpleTooltip: React.FC<{
    children: React.ReactNode;
    tooltip: string;
    side?: 'top' | 'right' | 'bottom' | 'left';
}> = ({ children, tooltip, side = 'top' }) => (
    <Tooltip content={tooltip} side={side}>
        {children}
    </Tooltip>
);
