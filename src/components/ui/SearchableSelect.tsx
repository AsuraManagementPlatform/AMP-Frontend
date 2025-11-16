import React, { useState, useRef, useEffect } from 'react';
import { SelectOption } from '@/types/form.types';

interface SearchableSelectProps {
    value: string;
    onChange: (value: string) => void;
    onBlur: () => void;
    options: SelectOption[];
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    name?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
    value,
    onChange,
    onBlur,
    options,
    placeholder = 'Selectează...',
    className = '',
    disabled = false,
    name
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const selectedOption = options.find(opt => opt.value === value);
    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm('');
                onBlur();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onBlur]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
        setSearchTerm('');
    };

    return (
        <div ref={containerRef} className="relative">
            <input type="hidden" name={name} value={value} />
            
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-left bg-white ${
                    disabled ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'
                } ${className}`}
            >
                <span className={selectedOption ? 'text-gray-900' : 'text-gray-400'}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <span className="float-right text-gray-400">▼</span>
            </button>

            {isOpen && !disabled && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
                    <div className="p-2 border-b border-gray-200">
                        <input
                            ref={inputRef}
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Caută..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="overflow-y-auto max-h-60">
                        {filteredOptions.length === 0 ? (
                            <div className="px-3 py-2 text-gray-500 text-sm">
                                Niciun rezultat găsit
                            </div>
                        ) : (
                            filteredOptions.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => handleSelect(String(option.value))}
                                    disabled={option.disabled}
                                    className={`w-full text-left px-3 py-2 hover:bg-gray-100 ${
                                        value === option.value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-900'
                                    } ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                >
                                    {option.label}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
