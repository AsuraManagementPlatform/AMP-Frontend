import { DynamicFormConfig, FieldType, SelectOption } from "@/types/form.types.ts";
import { ProjectMemberStatus, ProjectMemberType } from "@/types/project-member.types.ts";
import { User } from "@/types/user.types.ts";

const getStatusOptions = (): SelectOption[] => [
    { value: ProjectMemberStatus.ACTIVE, label: 'Activ' },
    { value: ProjectMemberStatus.INACTIVE, label: 'Inactiv' },
    { value: ProjectMemberStatus.SUSPENDED, label: 'Suspendat' },
    { value: ProjectMemberStatus.COMPLETED, label: 'Finalizat' }
];

const getTypeOptions = (): SelectOption[] => [
    { value: ProjectMemberType.EMPLOYEE, label: 'Angajat' },
    { value: ProjectMemberType.VOLUNTEER, label: 'Voluntar' },
    { value: ProjectMemberType.CONTRACTOR, label: 'Contractor' },
    { value: ProjectMemberType.CONSULTANT, label: 'Consultant' },
    { value: ProjectMemberType.PARTNER, label: 'Partener' }
];

export const createProjectMemberFormConfig = (organizationUsers: User[] = []): DynamicFormConfig => ({
    sections: [
        {
            title: "Informații membru",
            columns: 1,
            fields: [
                {
                    name: 'project',
                    label: 'Proiect',
                    type: FieldType.HIDDEN,
                    required: true
                },
                {
                    name: 'member',
                    label: 'Membru',
                    type: FieldType.SELECT,
                    required: true,
                    options: [
                        { value: '', label: 'Selectează membrul' },
                        ...organizationUsers.map(user => ({
                            value: user.id,
                            label: `${user.fullName} (${user.email})`
                        }))
                    ]
                },
                {
                    name: 'user_role',
                    label: 'Rol în proiect',
                    type: FieldType.TEXT,
                    placeholder: 'ex: Manager de proiect, Developer, Coordonator',
                    required: true,
                    maxLength: 255
                },
                {
                    name: 'type',
                    label: 'Tip membru',
                    type: FieldType.SELECT,
                    required: true,
                    options: getTypeOptions()
                },
                {
                    name: 'status',
                    label: 'Status',
                    type: FieldType.SELECT,
                    required: true,
                    options: getStatusOptions()
                }
            ]
        },
        {
            title: "Detalii contract",
            columns: 2,
            fields: [
                {
                    name: 'contractual_document_number',
                    label: 'Număr contract',
                    type: FieldType.TEXT,
                    placeholder: 'ex: CT-2025-001',
                    maxLength: 255
                },
                {
                    name: 'added_to_project',
                    label: 'Data adăugării',
                    type: FieldType.DATE,
                    required: true
                },
                {
                    name: 'active_from',
                    label: 'Activ de la',
                    type: FieldType.DATE,
                    required: true
                },
                {
                    name: 'active_to',
                    label: 'Activ până la',
                    type: FieldType.DATE,
                    required: true
                }
            ]
        }
    ],
    submitButtonText: 'Adaugă membru',
    cancelButtonText: 'Anulează'
});

export const updateProjectMemberFormConfig = (organizationUsers: User[] = []): DynamicFormConfig => ({
    ...createProjectMemberFormConfig(organizationUsers),
    submitButtonText: 'Actualizează membru'
});