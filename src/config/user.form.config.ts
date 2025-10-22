import { DynamicFormConfig, FieldType, SelectOption } from "@/types/form.types.ts";
import { UserGroup } from "@/types/auth.types.ts";
import { UserStatus } from "@/types/user.types.ts";

const getUserGroupOptions = (isAdmin: boolean, isOrgAdmin: boolean): SelectOption[] => {
    const allGroups = [
        { value: UserGroup.ORGANIZATION_ADMIN, label: 'Administrator Organizație' },
        { value: UserGroup.MANAGER, label: 'Manager' },
        { value: UserGroup.EMPLOYEE, label: 'Angajat' },
        { value: UserGroup.MEMBER, label: 'Membru' },
        { value: UserGroup.VOLUNTEER, label: 'Voluntar' }
    ];

    if (isAdmin) {
        return allGroups.filter((group) => group.value === UserGroup.ORGANIZATION_ADMIN);
    } else if (isOrgAdmin) {
        return allGroups.filter(group => [UserGroup.MANAGER, UserGroup.EMPLOYEE, UserGroup.MEMBER, UserGroup.VOLUNTEER].includes(group.value));
    } else {
        return allGroups.filter(group => [UserGroup.MANAGER, UserGroup.EMPLOYEE, UserGroup.MEMBER, UserGroup.VOLUNTEER].includes(group.value));
    }
};

const getUserStatusOptions = (formValues?: any): SelectOption[] => {
    const baseOptions = [
        { value: UserStatus.ACTIVE, label: 'Activ' },
        { value: UserStatus.INACTIVE, label: 'Inactiv' },
        { value: UserStatus.DRAFT, label: 'În așteptare' }
    ];

    if (formValues?.group === UserGroup.ORGANIZATION_ADMIN) {
        return baseOptions.map(option => ({
            ...option,
            disabled: option.value !== UserStatus.DRAFT
        }));
    }

    return baseOptions;
};

export const createUserFormConfig = (
    isAdmin: boolean = false,
    isOrgAdmin: boolean = false
): DynamicFormConfig => ({
    sections: [
        {
            title: "Informații utilizator",
            columns: 1,
            fields: [
                {
                    name: 'full_name',
                    label: 'Nume complet',
                    type: FieldType.TEXT,
                    placeholder: 'Ex: Ion Popescu',
                    required: true,
                    maxLength: 100
                },
                {
                    name: 'email',
                    label: 'Email',
                    type: FieldType.EMAIL,
                    placeholder: 'utilizator@exemplu.com',
                    required: true
                },
                {
                    name: 'personal_numerical_number',
                    label: 'CNP (Cod Numeric Personal)',
                    type: FieldType.TEXT,
                    placeholder: 'Ex: 1234567890123',
                    required: true,
                    maxLength: 13,
                },
                {
                    name: 'phone_number',
                    label: 'Număr telefon',
                    type: FieldType.TEL,
                    placeholder: 'Ex: +40712345678',
                },
                {
                    name: 'isLegalEntity',
                    label: 'Entitate juridică (companie)',
                    type: FieldType.CHECKBOX,
                    helperText: 'Bifați această opțiune dacă utilizatorul reprezintă o companie sau organizație'
                },
                {
                    name: 'company_number',
                    label: 'Număr înregistrare companie',
                    type: FieldType.TEXT,
                    placeholder: 'Ex: RO12345678 sau 12345678',
                    required: true,
                    helperText: 'Codul de Identificare Fiscală (CIF/CUI)',
                    condition: (formValues: any) => formValues?.isLegalEntity === true,
                },
                {
                    name: 'company_name',
                    label: 'Numele companiei',
                    type: FieldType.TEXT,
                    placeholder: 'Ex: SC Asura SRL',
                    required: true,
                    condition: (formValues: any) => formValues?.isLegalEntity === true,
                },
                {
                    name: 'group',
                    label: 'Grup utilizator',
                    type: FieldType.SELECT,
                    required: true,
                    disabled: isAdmin,
                    options: getUserGroupOptions(isAdmin, isOrgAdmin),
                    condition: () => !isAdmin,
                },
                {
                    name: 'status',
                    label: 'Status',
                    type: FieldType.SELECT,
                    required: true,
                    options: getUserStatusOptions,
                    condition: () => !isAdmin,
                },
                {
                    name: 'is_contributor',
                    label: 'Este cotizant?',
                    type: FieldType.CHECKBOX,
                    helperText: 'Utilizatorul plătește cotizații către organizație',
                    condition: () => !isAdmin,
                },
                {
                    name: 'auto_generate_fees',
                    label: 'Generare automată cotizații',
                    type: FieldType.CHECKBOX,
                    helperText: 'Generează automat cotizații recurente pentru acest utilizator',
                    condition: (formValues: any) => formValues?.is_contributor === true,
                }
            ]
        }
    ],
    submitButtonText: 'Creează utilizator',
    cancelButtonText: 'Anulează'
});