import { DynamicFormConfig, FieldType, SelectOption } from "@/types/form.types.ts";
import { OrganizationStatus } from "@/types/organization.types.ts";
import { UserMeResponse } from "@/types/user.types.ts";

const getOrganizationStatusOptions = (): SelectOption[] => [
    { value: OrganizationStatus.ACTIVE, label: 'Activ' },
    { value: OrganizationStatus.INACTIVE, label: 'Inactiv' },
    { value: OrganizationStatus.PENDING, label: 'În așteptare' }
];

export const createOrganizationFormConfig = (
    pendingAdminUsers: UserMeResponse[] = [],
    loadingPendingUsers: boolean = false,
    preselectedUser?: UserMeResponse | null
): DynamicFormConfig => ({
    sections: [
        {
            title: "Informații organizație",
            columns: 1,
            fields: [
                {
                    name: 'name',
                    label: 'Nume organizație',
                    type: FieldType.TEXT,
                    placeholder: 'ex: Asociația Asura',
                    required: true,
                    maxLength: 255
                },
                {
                    name: 'email',
                    label: 'Email organizație',
                    type: FieldType.EMAIL,
                    placeholder: 'ex: contact@asociatia-asura.ro',
                    required: true
                },
                {
                    name: 'unique_code',
                    label: 'Cod unic',
                    type: FieldType.TEXT,
                    placeholder: 'ex: CIF123456789',
                    required: true,
                    maxLength: 50
                },
                {
                    name: 'phone_number',
                    label: 'Telefon',
                    type: FieldType.TEL,
                    placeholder: 'ex: +40729669208'
                },
                {
                    name: 'address',
                    label: 'Adresă',
                    type: FieldType.TEXTAREA,
                    placeholder: 'ex: Strada Matei Basarab, nr. 59A',
                    required: true,
                    maxLength: 500,
                    rows: 3
                },
                {
                    name: 'address2',
                    label: 'Adresă secundară',
                    type: FieldType.TEXTAREA,
                    placeholder: 'Informații suplimentare despre adresă (opțional)',
                    maxLength: 500,
                    rows: 2
                },
                {
                    name: 'status',
                    label: 'Status',
                    type: FieldType.SELECT,
                    required: true,
                    options: getOrganizationStatusOptions()
                },
                {
                    name: 'admin_user',
                    label: 'Administrator organizație',
                    type: FieldType.SELECT,
                    required: true,
                    disabled: !!preselectedUser || loadingPendingUsers,
                    options: preselectedUser 
                        ? [
                            { value: preselectedUser.id, label: `${preselectedUser.full_name} (${preselectedUser.email})` }
                        ]
                        : [
                            { value: '', label: loadingPendingUsers ? 'Se încarcă...' : 'Selectează administrator' },
                            ...pendingAdminUsers.map(admin => ({
                                value: admin.id,
                                label: `${admin.full_name} (${admin.email})`
                            }))
                        ]
                }
            ]
        }
    ],
    submitButtonText: 'Creează organizație',
    cancelButtonText: 'Anulează'
});