import {DynamicFormConfig, FieldType, SelectOption} from "@/types/form.types.ts";
import {LegalType, EntityType, EntityStatus} from "@/types/entity.types.ts";
import {t} from "i18next";

const getLegalTypeOptions = (): SelectOption[] => [
    { value: LegalType.FIZICA, label: 'Persoană Fizică' },
    { value: LegalType.JURIDICA, label: 'Persoană Juridică' }
];

const getEntityTypeOptions = (): SelectOption[] => [
    { value: EntityType.DONOR, label: 'Donator' },
    { value: EntityType.SPONSOR, label: 'Sponsor' },
    { value: EntityType.PARTNER, label: 'Partener' },
    { value: EntityType.VOLUNTEER, label: 'Voluntar' },
    { value: EntityType.BENEFICIARY, label: 'Beneficiar' },
    { value: EntityType.OTHER, label: 'Altul' }
];

const getEntityStatusOptions = (): SelectOption[] => [
    { value: EntityStatus.ACTIV, label: 'Activ' },
    { value: EntityStatus.INACTIV, label: 'Inactiv' },
    { value: EntityStatus.POTENTIAL, label: 'Potențial' },
    { value: EntityStatus.BLOCAT, label: 'Blocat' }
];

export const createEntityFormConfig = (): DynamicFormConfig => ({
    sections: [
        {
            title: "Informații de bază",
            columns: 2,
            fields: [
                {
                    name: 'organization',
                    required: true,
                    type: FieldType.HIDDEN,
                    label: t('label.entity.organization')
                },
                {
                    name: 'legalType',
                    label: 'Tip persoană',
                    type: FieldType.SELECT,
                    required: true,
                    options: getLegalTypeOptions()
                },
                {
                    name: 'name',
                    label: 'Nume',
                    type: FieldType.TEXT,
                    placeholder: 'ex: Ion Popescu sau SC Example SRL',
                    required: true,
                    maxLength: 255
                },
                {
                    name: 'identificationNumber',
                    label: 'CNP/CUI',
                    type: FieldType.TEXT,
                    placeholder: 'CNP pentru persoană fizică sau CUI pentru persoană juridică',
                    required: true,
                    maxLength: 255,
                    helperText: 'CNP pentru persoană fizică, CUI pentru persoană juridică'
                },
                {
                    name: 'type',
                    label: 'Tip entitate',
                    type: FieldType.SELECT,
                    required: true,
                    options: getEntityTypeOptions()
                }
            ]
        },
        {
            title: "Informații de contact",
            columns: 2,
            fields: [
                {
                    name: 'email',
                    label: 'Email',
                    type: FieldType.EMAIL,
                    placeholder: 'ex: contact@example.ro',
                    required: true
                },
                {
                    name: 'phone',
                    label: 'Telefon',
                    type: FieldType.TEL,
                    placeholder: 'ex: +40712345678',
                    required: true
                },
                {
                    name: 'address',
                    label: 'Adresă',
                    type: FieldType.TEXTAREA,
                    placeholder: 'ex: Strada Principală, nr. 123, București',
                    required: true,
                    maxLength: 500,
                    rows: 2,
                    gridColumn: 'full'
                },
                {
                    name: 'address2',
                    label: 'Adresă secundară',
                    type: FieldType.TEXTAREA,
                    placeholder: 'Informații suplimentare (opțional)',
                    maxLength: 500,
                    rows: 2,
                    gridColumn: 'full'
                }
            ]
        },
        {
            title: "Status",
            columns: 2,
            fields: [
                {
                    name: 'status',
                    label: 'Status',
                    type: FieldType.SELECT,
                    required: true,
                    options: getEntityStatusOptions()
                },
                {
                    name: 'observation',
                    label: 'Observații',
                    type: FieldType.TEXTAREA,
                    placeholder: 'Note sau observații suplimentare (opțional)',
                    maxLength: 511,
                    rows: 3,
                    gridColumn: 'full'
                }
            ]
        }
    ],
    submitButtonText: 'Creează entitate',
    cancelButtonText: 'Anulează'
});

export const updateEntityFormConfig = (): DynamicFormConfig => ({
    ...createEntityFormConfig(),
    submitButtonText: t('form.entity.submit_update'),
});
