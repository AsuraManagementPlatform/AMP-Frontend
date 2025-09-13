import { DynamicFormConfig, FieldType, SelectOption } from "@/types/form.types.ts";
import { UserGroup } from "@/types/auth.types.ts";
import { UserStatus } from "@/types/user.types.ts";

const getUserGroupOptions = (isAdmin: boolean): SelectOption[] => {
    const allGroups = [
        { value: UserGroup.ORGANIZATION_ADMIN, label: 'Administrator Organizație' },
        { value: UserGroup.MANAGER, label: 'Manager' },
        { value: UserGroup.EMPLOYEE, label: 'Angajat' },
        { value: UserGroup.MEMBER, label: 'Membru' },
        { value: UserGroup.VOLUNTEER, label: 'Voluntar' }
    ];

    return isAdmin
        ? allGroups.filter((group) => group.value === UserGroup.ORGANIZATION_ADMIN)
        : allGroups.filter(group => [UserGroup.MANAGER, UserGroup.EMPLOYEE, UserGroup.MEMBER, UserGroup.VOLUNTEER].includes(group.value));
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
    isAdmin: boolean = false
): DynamicFormConfig => ({
    sections: [
        {
            title: "Informații personale",
            columns: 2,
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
                }
            ]
        },
        {
            title: "Tip utilizator",
            description: "Selectați tipul de utilizator",
            columns: 1,
            fields: [
                {
                    name: 'isLegalEntity',
                    label: 'Entitate juridică (companie)',
                    type: FieldType.CHECKBOX,
                    helperText: 'Bifați această opțiune dacă utilizatorul reprezintă o companie sau organizație'
                }
            ]
        },
        {
            title: "Informații companie",
            description: "Completați informațiile companiei",
            columns: 2,
            condition: (formValues) => formValues?.isLegalEntity === true,
            fields: [
                {
                    name: 'company_number',
                    label: 'Număr înregistrare companie',
                    type: FieldType.TEXT,
                    placeholder: 'Ex: RO12345678 sau 12345678',
                    required: true,
                    helperText: 'Codul de Identificare Fiscală (CIF/CUI)'
                },
                {
                    name: 'company_name',
                    label: 'Numele companiei',
                    type: FieldType.TEXT,
                    placeholder: 'Ex: SC Asura SRL',
                    required: true
                }
            ]
        },
        {
            title: "Configurări cont",
            hidden: isAdmin,
            columns: 2,
            fields: [
                {
                    name: 'group',
                    label: 'Grup utilizator',
                    type: FieldType.SELECT,
                    required: true,
                    disabled: isAdmin,
                    options: getUserGroupOptions(isAdmin),
                },
                {
                    name: 'status',
                    label: 'Status',
                    type: FieldType.SELECT,
                    required: true,
                    options: getUserStatusOptions,
                }
            ]
        }
    ],
    submitButtonText: 'Creează utilizator',
    cancelButtonText: 'Anulează'
});