import React from 'react';

interface SortButtonProps {
    field: string;
    label: string;
}

export const SortButton: React.FC<SortButtonProps> = ({ label }) => (
    <button className="flex items-center text-left font-medium">
        {label}
    </button>
);