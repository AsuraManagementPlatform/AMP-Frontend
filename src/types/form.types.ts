// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export enum FieldType {
    TEXT = 'text',
    EMAIL = 'email',
    TEL = 'tel',
    NUMBER = 'number',
    SELECT = 'select',
    TEXTAREA = 'textarea',
    CHECKBOX = 'checkbox',
    RADIO = 'radio',
    DATE = 'date',
    FILE = 'file'
}

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
    type: FieldType.TEXT | FieldType.EMAIL | FieldType.TEL | FieldType.DATE;
    maxLength?: number;
    minLength?: number;
}

export interface NumberFieldConfig extends BaseFieldConfig {
    type: FieldType.NUMBER;
    min?: number;
    max?: number;
    step?: number;
}

export interface SelectFieldConfig extends BaseFieldConfig {
    type: FieldType.SELECT;
    options: SelectOption[] | (() => SelectOption[]);
    multiple?: boolean;
}

export interface CheckboxFieldConfig extends BaseFieldConfig {
    type: FieldType.CHECKBOX | FieldType.RADIO;
    multiple?: boolean;
}

export interface TextareaFieldConfig extends BaseFieldConfig {
    type: FieldType.TEXTAREA;
    rows?: number;
    maxLength?: number;
}

export interface FileFieldConfig extends BaseFieldConfig {
    type: FieldType.FILE;
}

export type FieldConfig =
    | TextFieldConfig
    | NumberFieldConfig
    | SelectFieldConfig
    | CheckboxFieldConfig
    | TextareaFieldConfig
    | FileFieldConfig;

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