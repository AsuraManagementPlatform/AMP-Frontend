
export const FieldType = {
    TEXT: 'text',
    EMAIL: 'email',
    TEL: 'tel',
    NUMBER: 'number',
    SELECT: 'select',
    TEXTAREA: 'textarea',
    CHECKBOX: 'checkbox',
    RADIO: 'radio',
    DATE: 'date',
    FILE: 'file',
    HIDDEN: 'hidden'
} as const;

export type FieldType = typeof FieldType[keyof typeof FieldType];

export interface SelectOption {
    value: string | number;
    label: string;
    disabled?: boolean;
}

export interface BaseFieldConfig {
    name: string;
    label: string;
    type: FieldType;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
    helperText?: string;
    gridColumn?: 'full' | 'half';
    condition?: (formValues: object) => boolean;
}

export interface TextFieldConfig extends BaseFieldConfig {
    type: typeof FieldType.TEXT | typeof FieldType.EMAIL | typeof FieldType.TEL | typeof FieldType.DATE;
    maxLength?: number;
    minLength?: number;
}

export interface NumberFieldConfig extends BaseFieldConfig {
    type: typeof FieldType.NUMBER;
    min?: number;
    max?: number;
    step?: number;
}

export interface SelectFieldConfig extends BaseFieldConfig {
    type: typeof FieldType.SELECT;
    options: SelectOption[] | (() => SelectOption[]);
    multiple?: boolean;
}

export interface CheckboxFieldConfig extends BaseFieldConfig {
    type: typeof FieldType.CHECKBOX | typeof FieldType.RADIO;
    multiple?: boolean;
}

export interface TextareaFieldConfig extends BaseFieldConfig {
    type: typeof FieldType.TEXTAREA;
    rows?: number;
    maxLength?: number;
}

export interface FileFieldConfig extends BaseFieldConfig {
    type: typeof FieldType.FILE;
}

export interface HiddenFieldConfig extends BaseFieldConfig {
    type: typeof FieldType.HIDDEN;
}

export type FieldConfig =
    | TextFieldConfig
    | NumberFieldConfig
    | SelectFieldConfig
    | CheckboxFieldConfig
    | TextareaFieldConfig
    | FileFieldConfig
    | HiddenFieldConfig;

export interface FormSection {
    title?: string;
    hidden?: boolean;
    description?: string;
    fields: FieldConfig[];
    columns?: number;
    condition?: (formValues: any) => boolean;
}

export interface DynamicFormConfig {
    sections: FormSection[];
    submitButtonText?: string;
    cancelButtonText?: string;
}
