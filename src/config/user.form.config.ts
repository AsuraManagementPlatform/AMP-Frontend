import { DynamicFormConfig, FieldType, SelectOption } from "@/types/form.types.ts";
import { UserGroup } from "@/types/auth.types.ts";
import { UserStatus } from "@/types/user.types.ts";
import i18next from 'i18next';

const t = (key: string) => i18next.t(key);

const getUserGroupOptions = (isAdmin: boolean, isOrgAdmin: boolean): SelectOption[] => {
    const allGroups = [
        { value: UserGroup.ORGANIZATION_ADMIN, label: t('label.user.group_organization_admin') },
        { value: UserGroup.MANAGER, label: t('label.user.group_manager') },
        { value: UserGroup.EMPLOYEE, label: t('label.user.group_employee') },
        { value: UserGroup.MEMBER, label: t('label.user.group_member') },
        { value: UserGroup.VOLUNTEER, label: t('label.user.group_volunteer') }
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
        { value: UserStatus.ACTIVE, label: t('label.user.status_active') },
        { value: UserStatus.INACTIVE, label: t('label.user.status_inactive') },
        { value: UserStatus.DRAFT, label: t('label.user.status_draft') }
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
            title: t('label.user.section_info'),
            columns: 1,
            fields: [
                {
                    name: 'full_name',
                    label: t('label.user.full_name'),
                    type: FieldType.TEXT,
                    placeholder: t('label.user.full_name_placeholder'),
                    required: true,
                    maxLength: 100
                },
                {
                    name: 'email',
                    label: t('label.user.email'),
                    type: FieldType.EMAIL,
                    placeholder: t('label.user.email_placeholder'),
                    required: true
                },
                {
                    name: 'personal_numerical_number',
                    label: t('label.user.cnp'),
                    type: FieldType.TEXT,
                    placeholder: t('label.user.cnp_placeholder'),
                    required: true,
                    maxLength: 13,
                },
                {
                    name: 'phone_number',
                    label: t('label.user.phone_number'),
                    type: FieldType.TEL,
                    placeholder: t('label.user.phone_number_placeholder'),
                },
                {
                    name: 'isLegalEntity',
                    label: t('label.user.is_legal_entity'),
                    type: FieldType.CHECKBOX,
                    helperText: t('label.user.is_legal_entity_helper')
                },
                {
                    name: 'company_number',
                    label: t('label.user.company_number'),
                    type: FieldType.TEXT,
                    placeholder: t('label.user.company_number_placeholder'),
                    required: true,
                    helperText: t('label.user.company_number_helper'),
                    condition: (formValues: any) => formValues?.isLegalEntity === true,
                },
                {
                    name: 'company_name',
                    label: t('label.user.company_name'),
                    type: FieldType.TEXT,
                    placeholder: t('label.user.company_name_placeholder'),
                    required: true,
                    condition: (formValues: any) => formValues?.isLegalEntity === true,
                },
                {
                    name: 'branch',
                    label: t('label.user.branch'),
                    type: FieldType.TEXT,
                    placeholder: t('label.user.branch_placeholder'),
                    maxLength: 100,
                    helperText: t('label.user.branch_helper')
                },
                {
                    name: 'registration_number',
                    label: t('label.user.registration_number'),
                    type: FieldType.TEXT,
                    placeholder: t('label.user.registration_number_placeholder'),
                    maxLength: 50,
                    helperText: t('label.user.registration_number_helper')
                },
                {
                    name: 'group',
                    label: t('label.user.group'),
                    type: FieldType.SELECT,
                    required: true,
                    disabled: isAdmin,
                    options: getUserGroupOptions(isAdmin, isOrgAdmin),
                    condition: () => !isAdmin,
                },
                {
                    name: 'status',
                    label: t('label.user.status'),
                    type: FieldType.SELECT,
                    required: true,
                    options: getUserStatusOptions,
                    condition: () => !isAdmin,
                },
                {
                    name: 'is_contributor',
                    label: t('label.user.is_contributor'),
                    type: FieldType.CHECKBOX,
                    helperText: t('label.user.is_contributor_helper'),
                    condition: () => !isAdmin,
                },
                {
                    name: 'auto_generate_fees',
                    label: t('label.user.auto_generate_fees'),
                    type: FieldType.CHECKBOX,
                    helperText: t('label.user.auto_generate_fees_helper'),
                    condition: (formValues: any) => formValues?.is_contributor === true,
                }
            ]
        }
    ],
    submitButtonText: t('label.user.submit_create'),
    cancelButtonText: t('label.button.cancel')
});