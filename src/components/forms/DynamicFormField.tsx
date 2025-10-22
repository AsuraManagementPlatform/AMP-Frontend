import React from 'react';
import { Control, useController } from 'react-hook-form';
import {FieldConfig, FieldType, SelectFieldConfig} from "@/types/form.types.ts";

interface DynamicFormFieldProps {
    field: FieldConfig;
    control: Control<any>;
    error?: string;
    formValues?: any;
}

export const DynamicFormField: React.FC<DynamicFormFieldProps> = ({
                                                                      field,
                                                                      control,
                                                                      error,
                                                                  }) => {
    const { field: fieldProps } = useController({
        name: field.name,
        control
    });

    const baseInputClasses = `form-input ${error ? 'border-red-500' : ''}`;
    const baseSelectClasses = `form-select ${error ? 'border-red-500' : ''}`;

    const renderField = () => {
        switch (field.type) {
            case FieldType.DATE:
                return (
                    <div className="relative">
                        <input
                            {...fieldProps}
                            type="date"
                            placeholder={field.placeholder}
                            disabled={field.disabled}
                            className={`${baseInputClasses} ${field.className || ''} cursor-pointer`}
                            onClick={(e) => {
                                if (!e.currentTarget.disabled) {
                                    e.currentTarget.focus();
                                    e.currentTarget.showPicker?.();
                                }
                            }}
                        />
                    </div>
                );

            case FieldType.TEXT:
            case FieldType.EMAIL:
            case FieldType.TEL:
            case FieldType.NUMBER:
                return (
                    <input
                        {...fieldProps}
                        type={field.type}
                        placeholder={field.placeholder}
                        maxLength={field.type === FieldType.TEXT && 'maxLength' in field ? field.maxLength : undefined}
                        min={field.type === FieldType.NUMBER && 'min' in field ? field.min : undefined}
                        max={field.type === FieldType.NUMBER && 'max' in field ? field.max : undefined}
                        step={field.type === FieldType.NUMBER && 'step' in field ? field.step : undefined}
                        disabled={field.disabled}
                        className={`${baseInputClasses} ${field.className || ''}`}
                    />
                );

            case FieldType.SELECT: {
                const selectField = field as SelectFieldConfig;
                const options = typeof selectField.options === 'function'
                    ? selectField.options()
                    : selectField.options;

                return (
                    <select
                        {...fieldProps}
                        disabled={field.disabled}
                        multiple={selectField.multiple}
                        className={`${baseSelectClasses} ${field.className || ''}`}
                    >
                        {field.placeholder && (
                            <option value="" disabled>
                                {field.placeholder}
                            </option>
                        )}
                        {options.map((option) => (
                            <option
                                key={option.value}
                                value={option.value}
                                disabled={option.disabled}
                            >
                                {option.label}
                            </option>
                        ))}
                    </select>
                );
            }

            case FieldType.TEXTAREA: {
                const textareaField = field.type === FieldType.TEXTAREA ? field : null;
                return (
                    <textarea
                        {...fieldProps}
                        placeholder={field.placeholder}
                        rows={textareaField && 'rows' in field ? field.rows : 3}
                        maxLength={textareaField && 'maxLength' in field ? field.maxLength : undefined}
                        disabled={field.disabled}
                        className={`${baseInputClasses} ${field.className || ''}`}
                    />
                );
            }

            case FieldType.CHECKBOX:
                return (
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={fieldProps.value || false}
                            onChange={(e) => fieldProps.onChange(e.target.checked)}
                            onBlur={fieldProps.onBlur}
                            name={fieldProps.name}
                            ref={fieldProps.ref}
                            disabled={field.disabled}
                            className={`form-checkbox ${error ? 'border-red-500' : ''} ${field.className || ''}`}
                        />
                        <span className="form-label">{field.label}</span>
                    </label>
                );

            case FieldType.RADIO:
                return null;

            case FieldType.FILE:
                return (
                    <input
                        {...fieldProps}
                        type="file"
                        disabled={field.disabled}
                        className={`${baseInputClasses} ${field.className || ''}`}
                        value={undefined}
                        onChange={(e) => fieldProps.onChange(e.target.files)}
                    />
                );

            case FieldType.HIDDEN:
                return (
                    <input
                        {...fieldProps}
                        type="hidden"
                    />
                );

            default:
                return null;
        }
    };

    const shouldShowLabel = field.type !== FieldType.CHECKBOX && field.type !== FieldType.HIDDEN;
    const shouldShowContainer = field.type !== FieldType.HIDDEN;

    if (!shouldShowContainer) {
        return renderField();
    }

    return (
        <div className={`form-group ${field.gridColumn === 'full' ? 'col-span-full' : ''}`}>
            {shouldShowLabel && (
                <label className="form-label">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            {renderField()}

            {error && (
                <p className="text-red-500 text-sm mt-1">{error}</p>
            )}
        </div>
    );
};