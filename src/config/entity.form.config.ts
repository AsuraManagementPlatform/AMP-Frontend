import {DynamicFormConfig, FieldType, SelectOption} from "@/types/form.types.ts";
import {EntityType, EntityStatus} from "@/types/entity.types.ts";

const getEntityTypeOptions = (): SelectOption[] => [
    { value: EntityType.DONATOR, label: 'Donator' },
    { value: EntityType.SPONSOR, label: 'Sponsor' },
    { value: EntityType.PARTNER, label: 'Partener' }
];

const getEntityStatusOptions = (): SelectOption[] => [
    { value: EntityStatus.ACTIVE, label: 'Activ' },
    { value: EntityStatus.INACTIVE, label: 'Inactiv' },
    { value: EntityStatus.PENDING, label: 'În așteptare' },
    { value: EntityStatus.SUSPENDED, label: 'Suspendat' }
];

export const createEntityFormConfig = (
    _organizationId?: string,
    availableUsers: { id: string; name: string }[] = []
): DynamicFormConfig => ({
    sections: [
        {
            title: "Informații entitate",
            columns: 2,
            fields: [
                {
                    name: 'name',
                    label: 'Nume entitate',
                    type: FieldType.TEXT,
                    placeholder: 'ex: Fundația pentru Dezvoltare',
                    required: true,
                    maxLength: 255,
                    gridColumn: 'full'
                },
                {
                    name: 'type',
                    label: 'Tip entitate',
                    type: FieldType.SELECT,
                    required: true,
                    options: getEntityTypeOptions()
                },
                {
                    name: 'status',
                    label: 'Status',
                    type: FieldType.SELECT,
                    required: true,
                    options: getEntityStatusOptions()
                },
                {
                    name: 'email',
                    label: 'Email',
                    type: FieldType.EMAIL,
                    placeholder: 'contact@entitate.ro'
                },
                {
                    name: 'phoneNumber',
                    label: 'Telefon',
                    type: FieldType.TEL,
                    placeholder: 'ex: +40729669208'
                },
                {
                    name: 'contactPerson',
                    label: 'Persoana de contact',
                    type: FieldType.TEXT,
                    placeholder: 'ex: Ion Popescu',
                    maxLength: 255
                },
                {
                    name: 'website',
                    label: 'Website',
                    type: FieldType.TEXT,
                    placeholder: 'https://entitatea.ro'
                },
                {
                    name: 'address',
                    label: 'Adresă',
                    type: FieldType.TEXTAREA,
                    placeholder: 'Adresa completă a entității...',
                    maxLength: 500,
                    rows: 3,
                    gridColumn: 'full'
                },
                {
                    name: 'description',
                    label: 'Descriere',
                    type: FieldType.TEXTAREA,
                    placeholder: 'Descriere detaliată a entității...',
                    maxLength: 1000,
                    rows: 3,
                    gridColumn: 'full'
                },
                {
                    name: 'taxId',
                    label: 'Cod fiscal',
                    type: FieldType.TEXT,
                    placeholder: 'ex: RO12345678',
                    maxLength: 50
                },
                {
                    name: 'registrationNumber',
                    label: 'Număr înregistrare',
                    type: FieldType.TEXT,
                    placeholder: 'ex: J40/12345/2020',
                    maxLength: 50
                },
                {
                    name: 'userId',
                    label: 'Cont utilizator asociat (opțional)',
                    type: FieldType.SELECT,
                    options: [
                        { value: '', label: 'Fără cont asociat' },
                        ...availableUsers.map(user => ({
                            value: user.id,
                            label: user.name
                        }))
                    ]
                }
            ]
        }
    ],
    submitButtonText: 'Creează entitate',
    cancelButtonText: 'Anulează'
});

export const updateEntityFormConfig = (
    _organizationId?: string,
    availableUsers: { id: string; name: string }[] = []
): DynamicFormConfig => ({
    ...createEntityFormConfig(_organizationId, availableUsers),
    submitButtonText: 'Actualizează entitate'
});
