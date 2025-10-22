import { DynamicFormConfig, FieldType, SelectOption } from "@/types/form.types.ts";
import { DocumentType } from "@/types/organization-document.types.ts";

const getDocumentTypeOptions = (): SelectOption[] => [
    { value: DocumentType.REGISTRATION_CERTIFICATE, label: 'Certificat de înregistrare' },
    { value: DocumentType.STATUTE, label: 'Statut' },
    { value: DocumentType.TAX_CERTIFICATE, label: 'Certificat fiscal' },
    { value: DocumentType.FINANCIAL_REPORT, label: 'Raport financiar' },
    { value: DocumentType.ACTIVITY_REPORT, label: 'Raport de activitate' },
    { value: DocumentType.MEETING_MINUTES, label: 'Proces verbal' },
    { value: DocumentType.CONTRACT, label: 'Contract' },
    { value: DocumentType.AGREEMENT, label: 'Acord' },
    { value: DocumentType.AUTHORIZATION, label: 'Autorizație' },
    { value: DocumentType.LICENSE, label: 'Licență' },
    { value: DocumentType.OTHER, label: 'Altele' }
];

export const createOrganizationDocumentFormConfig = (): DynamicFormConfig => ({
    sections: [
        {
            title: "Informații document",
            columns: 1,
            fields: [
                {
                    name: 'organization',
                    label: 'Organizație',
                    type: FieldType.HIDDEN,
                    required: true
                },
                {
                    name: 'name',
                    label: 'Nume document',
                    type: FieldType.TEXT,
                    placeholder: 'ex: Certificat de înregistrare 2024',
                    required: true,
                    maxLength: 255
                },
                {
                    name: 'document_type',
                    label: 'Tip document',
                    type: FieldType.SELECT,
                    required: true,
                    options: getDocumentTypeOptions()
                },
                {
                    name: 'description',
                    label: 'Descriere',
                    type: FieldType.TEXTAREA,
                    placeholder: 'Descriere document (opțional)',
                    required: false,
                    rows: 3
                }
            ]
        },
        {
            title: "Detalii document",
            columns: 2,
            fields: [
                {
                    name: 'document_number',
                    label: 'Număr document',
                    type: FieldType.TEXT,
                    placeholder: 'ex: 123456',
                    required: false,
                    maxLength: 100
                },
                {
                    name: 'issued_by',
                    label: 'Emis de',
                    type: FieldType.TEXT,
                    placeholder: 'ex: ONRC',
                    required: false,
                    maxLength: 255
                },
                {
                    name: 'issue_date',
                    label: 'Data emiterii',
                    type: FieldType.DATE,
                    required: false
                },
                {
                    name: 'expiry_date',
                    label: 'Data expirării',
                    type: FieldType.DATE,
                    required: false
                }
            ]
        },
        {
            title: "Note",
            columns: 1,
            fields: [
                {
                    name: 'notes',
                    label: 'Note',
                    type: FieldType.TEXTAREA,
                    placeholder: 'Note suplimentare (opțional)',
                    required: false,
                    rows: 3
                },
                {
                    name: 'is_active',
                    label: 'Status document',
                    type: FieldType.SELECT,
                    required: true,
                    options: [
                        { value: 'true', label: 'Activ' },
                        { value: 'false', label: 'Inactiv' }
                    ]
                }
            ]
        }
    ]
});

export const updateOrganizationDocumentFormConfig = (): DynamicFormConfig => ({
    ...createOrganizationDocumentFormConfig()
});
