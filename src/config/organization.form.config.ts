import {DynamicFormConfig, FieldType, SelectOption} from "@/types/form.types.ts";
import {OrganizationStatus, OrganizationType} from "@/types/organization.types.ts";
import {User, UserMeResponse} from "@/types/user.types.ts";

const getOrganizationStatusOptions = (): SelectOption[] => [
    { value: OrganizationStatus.ACTIVE, label: 'Activ' },
    { value: OrganizationStatus.INACTIVE, label: 'Inactiv' },
    { value: OrganizationStatus.PENDING, label: 'În așteptare' }
];

const getOrganizationTypeOptions = (): SelectOption[] => [
    { value: OrganizationType.NGO, label: 'ONG' },
    { value: OrganizationType.ASSOCIATION, label: 'Asociație' },
    { value: OrganizationType.FOUNDATION, label: 'Fundație' },
    { value: OrganizationType.COMPANY, label: 'Companie' },
    { value: OrganizationType.COOPERATIVE, label: 'Cooperativă' },
    { value: OrganizationType.OTHER, label: 'Altul' }
];

const getRomanianCounties = (): SelectOption[] => [
    { value: 'Alba', label: 'Alba' },
    { value: 'Arad', label: 'Arad' },
    { value: 'Argeș', label: 'Argeș' },
    { value: 'Bacău', label: 'Bacău' },
    { value: 'Bihor', label: 'Bihor' },
    { value: 'Bistrița-Năsăud', label: 'Bistrița-Năsăud' },
    { value: 'Botoșani', label: 'Botoșani' },
    { value: 'Brăila', label: 'Brăila' },
    { value: 'Brașov', label: 'Brașov' },
    { value: 'București', label: 'București' },
    { value: 'Buzău', label: 'Buzău' },
    { value: 'Călărași', label: 'Călărași' },
    { value: 'Caraș-Severin', label: 'Caraș-Severin' },
    { value: 'Cluj', label: 'Cluj' },
    { value: 'Constanța', label: 'Constanța' },
    { value: 'Covasna', label: 'Covasna' },
    { value: 'Dâmbovița', label: 'Dâmbovița' },
    { value: 'Dolj', label: 'Dolj' },
    { value: 'Galați', label: 'Galați' },
    { value: 'Giurgiu', label: 'Giurgiu' },
    { value: 'Gorj', label: 'Gorj' },
    { value: 'Harghita', label: 'Harghita' },
    { value: 'Hunedoara', label: 'Hunedoara' },
    { value: 'Ialomița', label: 'Ialomița' },
    { value: 'Iași', label: 'Iași' },
    { value: 'Ilfov', label: 'Ilfov' },
    { value: 'Maramureș', label: 'Maramureș' },
    { value: 'Mehedinți', label: 'Mehedinți' },
    { value: 'Mureș', label: 'Mureș' },
    { value: 'Neamț', label: 'Neamț' },
    { value: 'Olt', label: 'Olt' },
    { value: 'Prahova', label: 'Prahova' },
    { value: 'Sălaj', label: 'Sălaj' },
    { value: 'Satu Mare', label: 'Satu Mare' },
    { value: 'Sibiu', label: 'Sibiu' },
    { value: 'Suceava', label: 'Suceava' },
    { value: 'Teleorman', label: 'Teleorman' },
    { value: 'Timiș', label: 'Timiș' },
    { value: 'Tulcea', label: 'Tulcea' },
    { value: 'Vâlcea', label: 'Vâlcea' },
    { value: 'Vaslui', label: 'Vaslui' },
    { value: 'Vrancea', label: 'Vrancea' }
];

export const createOrganizationFormConfig = (
    pendingAdminUsers: User[] = [],
    loadingPendingUsers: boolean = false,
    preselectedUser?: UserMeResponse | null
): DynamicFormConfig => ({
    sections: [
        {
            title: "Informații organizație",
            columns: 2,
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
                    name: 'cui',
                    label: 'CUI (Cod Unic de Înregistrare)',
                    type: FieldType.TEXT,
                    placeholder: 'ex: RO12345678 sau 12345678',
                    maxLength: 20
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
                    rows: 2,
                    gridColumn: 'full'
                },
                {
                    name: 'address2',
                    label: 'Adresă secundară',
                    type: FieldType.TEXTAREA,
                    placeholder: 'Informații suplimentare despre adresă (opțional)',
                    maxLength: 500,
                    rows: 2,
                    gridColumn: 'full'
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

export const organizationDetailsFormConfig: DynamicFormConfig = {
    sections: [
        {
            title: "Informații de bază",
            columns: 2,
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
                    name: 'legal_name',
                    label: 'Nume legal',
                    type: FieldType.TEXT,
                    placeholder: 'Numele legal complet al organizației',
                    maxLength: 255
                },
                {
                    name: 'short_name',
                    label: 'Nume scurt',
                    type: FieldType.TEXT,
                    placeholder: 'Acronim sau nume scurt',
                    maxLength: 50
                },

                {
                    name: 'organization_type',
                    label: 'Tip organizație',
                    type: FieldType.SELECT,
                    options: getOrganizationTypeOptions()
                },
                {
                    name: 'status',
                    label: 'Status organizație',
                    type: FieldType.SELECT,
                    required: true,
                    options: getOrganizationStatusOptions()
                }
            ]
        },
        {
            title: "Conformitate românească",
            columns: 2,
            fields: [
                {
                    name: 'cui',
                    label: 'CUI (Cod Unic de Înregistrare)',
                    type: FieldType.TEXT,
                    placeholder: 'ex: RO12345678 sau 12345678',
                    maxLength: 20
                },
                {
                    name: 'registration_number',
                    label: 'Număr înregistrare',
                    type: FieldType.TEXT,
                    placeholder: 'Numărul de înregistrare oficial',
                    maxLength: 50
                },

                {
                    name: 'registration_date',
                    label: 'Data înregistrării',
                    type: FieldType.DATE,
                    placeholder: 'YYYY-MM-DD'
                },
                {
                    name: 'tax_exempt_status',
                    label: 'Neplătitor TVA',
                    type: FieldType.CHECKBOX,
                    helperText: 'Bifează dacă organizația NU plătește TVA'
                },
                {
                    name: 'tax_percentage',
                    label: 'Procent TVA',
                    type: FieldType.NUMBER,
                    placeholder: 'ex: 0.19 pentru 19%',
                    min: 0,
                    max: 1,
                    step: 0.01,
                    disabled: true,
                    helperText: 'Calculat automat (19% pentru plătitori TVA, 0% pentru neplătitori)'
                },
                {
                    name: 'is_verified',
                    label: 'Organizație verificată',
                    type: FieldType.CHECKBOX,
                    disabled: true,
                    helperText: 'Doar administratorii pot modifica acest câmp'
                }
            ]
        },
        {
            title: "Informații de contact",
            columns: 2,
            fields: [
                {
                    name: 'email',
                    label: 'Email principal',
                    type: FieldType.EMAIL,
                    placeholder: 'ex: contact@organizatia.ro',
                    required: true
                },
                {
                    name: 'phone_number',
                    label: 'Telefon principal',
                    type: FieldType.TEL,
                    placeholder: 'ex: +40712345678'
                },
                {
                    name: 'secondary_phone',
                    label: 'Telefon secundar',
                    type: FieldType.TEL,
                    placeholder: 'ex: +40712345679'
                },
                {
                    name: 'fax_number',
                    label: 'Număr fax',
                    type: FieldType.TEL,
                    placeholder: 'ex: +40212345678'
                },
                {
                    name: 'website',
                    label: 'Website',
                    type: FieldType.TEXT,
                    placeholder: 'ex: https://organizatia.ro'
                }
            ]
        },
        {
            title: "Adresă și locație",
            columns: 2,
            fields: [
                {
                    name: 'address',
                    label: 'Adresă principală',
                    type: FieldType.TEXTAREA,
                    placeholder: 'ex: Strada Principală, nr. 123',
                    required: true,
                    maxLength: 500,
                    rows: 3,
                    gridColumn: 'full'
                },
                {
                    name: 'address2',
                    label: 'Adresă secundară',
                    type: FieldType.TEXTAREA,
                    placeholder: 'Informații suplimentare despre adresă (opțional)',
                    maxLength: 500,
                    rows: 2,
                    gridColumn: 'full'
                },
                {
                    name: 'city',
                    label: 'Oraș',
                    type: FieldType.TEXT,
                    placeholder: 'ex: București',
                    maxLength: 100
                },
                {
                    name: 'county',
                    label: 'Județ',
                    type: FieldType.SELECT,
                    placeholder: 'Selectează județul',
                    options: getRomanianCounties()
                },
                {
                    name: 'postal_code',
                    label: 'Cod poștal',
                    type: FieldType.TEXT,
                    placeholder: 'ex: 123456 (6 cifre)',
                    maxLength: 6
                },
                {
                    name: 'country',
                    label: 'Țară',
                    type: FieldType.TEXT,
                    placeholder: 'Romania',
                    maxLength: 100
                }
            ]
        },
        {
            title: "Informații de afaceri",
            columns: 2,
            fields: [
                {
                    name: 'industry_sector',
                    label: 'Sector de activitate',
                    type: FieldType.TEXT,
                    placeholder: 'ex: Servicii sociale, Educație, Sănătate',
                    maxLength: 100
                },
                {
                    name: 'description',
                    label: 'Descrierea organizației',
                    type: FieldType.TEXTAREA,
                    placeholder: 'Descriere detaliată a misiunii și activităților organizației',
                    maxLength: 1000,
                    rows: 4,
                    gridColumn: 'full'
                }
            ]
        },
        {
            title: "Informații financiare",
            columns: 2,
            fields: [
                {
                    name: 'budget',
                    label: 'Buget anual (RON)',
                    type: FieldType.NUMBER,
                    placeholder: 'ex: 100000',
                    min: 0,
                    step: 1000
                },
                {
                    name: 'funding_sources',
                    label: 'Surse de finanțare',
                    type: FieldType.TEXTAREA,
                    placeholder: 'ex: Granturi UE, Donații private, Finanțare guvernamentală',
                    rows: 3,
                    helperText: 'Listați principalele surse de finanțare separate prin virgulă'
                }
            ]
        },
        {
            title: "Statistici organizație",
            columns: 3,
            fields: [
                {
                    name: 'employee_count',
                    label: 'Nr. angajați',
                    type: FieldType.TEXT,
                    disabled: true,
                    helperText: 'Calculat automat din numărul utilizatorilor cu rol de angajat'
                },
                {
                    name: 'volunteer_count',
                    label: 'Nr. voluntari', 
                    type: FieldType.TEXT,
                    disabled: true,
                    helperText: 'Calculat automat din numărul utilizatorilor cu rol de voluntar'
                },
                {
                    name: 'member_count',
                    label: 'Nr. membri',
                    type: FieldType.TEXT,
                    disabled: true,
                    helperText: 'Calculat automat din numărul utilizatorilor cu rol de membru'
                }
            ]
        }
    ],
    submitButtonText: 'Salvează modificările',
    cancelButtonText: 'Anulează'
};
