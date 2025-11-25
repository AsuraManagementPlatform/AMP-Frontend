import React, { useState, useRef, useEffect } from 'react';

export interface ComboFieldProps {
    id: string;
    name: string;
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    suggestions?: string[];
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    helperText?: string;
}

export const ComboField: React.FC<ComboFieldProps> = ({
    id,
    name,
    value,
    onChange,
    onBlur,
    suggestions = [],
    placeholder,
    disabled = false,
    className = '',
    helperText
}) => {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (value && suggestions.length > 0) {
            const filtered = suggestions.filter(s => 
                s.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredSuggestions(filtered);
        } else {
            setFilteredSuggestions(suggestions);
        }
    }, [value, suggestions]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        onChange(newValue);
        setShowSuggestions(true);
    };

    const handleSuggestionClick = (suggestion: string) => {
        onChange(suggestion);
        setShowSuggestions(false);
    };

    const handleFocus = () => {
        setShowSuggestions(true);
    };

    const handleBlur = () => {
        setTimeout(() => {
            setShowSuggestions(false);
            onBlur?.();
        }, 200);
    };

    return (
        <div ref={wrapperRef} className="relative w-full">
            <input
                id={id}
                name={name}
                type="text"
                value={value}
                onChange={handleInputChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder={placeholder}
                disabled={disabled}
                autoComplete="off"
                className={`
                    w-full px-4 py-2 border rounded-md
                    focus:outline-none focus:ring-2
                    border-gray-300 focus:ring-orange-500
                    ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
                    ${className}
                `}
            />

            {showSuggestions && filteredSuggestions.length > 0 && !disabled && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredSuggestions.map((suggestion, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors text-sm text-gray-700 border-b border-gray-100 last:border-b-0"
                        >
                            {suggestion}
                        </button>
                    ))}
                </div>
            )}

            {helperText && (
                <p className="mt-1 text-sm text-gray-500">{helperText}</p>
            )}
        </div>
    );
};
