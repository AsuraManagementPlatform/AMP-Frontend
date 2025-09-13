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
        control,
        defaultValue: field.type === FieldType.CHECKBOX ? false : ''
    });

    const baseInputClasses = `form-input ${error ? 'border-red-500' : ''}`;
    const baseSelectClasses = `form-select ${error ? 'border-red-500' : ''}`;

    const renderField = () => {
        switch (field.type) {
            case FieldType.TEXT:
            case FieldType.EMAIL:
            case FieldType.TEL:
            case FieldType.NUMBER:
            case FieldType.DATE:
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
                        {!selectField.multiple && !field.required && (
                            <option value="">Selectează o opțiune</option>
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
                            {...fieldProps}
                            type="checkbox"
                            checked={fieldProps.value || false}
                            disabled={field.disabled}
                            className={`form-checkbox ${error ? 'border-red-500' : ''} ${field.className || ''}`}
                        />
                        <span className="form-label">{field.label}</span>
                    </label>
                );

            case FieldType.RADIO:
                // TODO Radio implementation would need options similar to select
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

            default:
                return null;
        }
    };

    const shouldShowLabel = field.type !== FieldType.CHECKBOX;

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