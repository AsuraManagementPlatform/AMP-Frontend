import { DynamicFormConfig, FieldType } from "@/types/form.types";
import { RenewPeriod, PaymentMethod } from "@/types/membershipFee.types";

export const createMembershipFeeFormConfig = (rateOptions: Array<{value: string, label: string}> = []): DynamicFormConfig => ({
    sections: [
        {
            title: "Informații membru",
            columns: 1,
            fields: [
                {
                    name: 'memberId',
                    label: 'Membru',
                    type: FieldType.SELECT,
                    placeholder: 'Selectează membrul',
                    required: true,
                    options: []
                }
            ]
        },
        {
            title: "Detalii cotizație",
            columns: 2,
            fields: [
                {
                    name: 'rateType',
                    label: 'Tip cotizație',
                    type: FieldType.SELECT,
                    placeholder: 'Selectează tipul cotizației',
                    required: true,
                    options: rateOptions,
                    helperText: 'Valoarea finală va fi calculată automat în funcție de perioada selectată (ex: 50 lei/lună × 12 luni = 600 lei anual)'
                },
                {
                    name: 'customAmount',
                    label: 'Sumă personalizată (per lună)',
                    type: FieldType.NUMBER,
                    placeholder: 'ex: 50',
                    required: false,
                    min: 0.01,
                    step: 0.01,
                    condition: (values: any) => values.rateType === 'CUSTOM',
                    helperText: 'Introduceți suma lunară dorită'
                },
                {
                    name: 'currency',
                    label: 'Monedă',
                    type: FieldType.SELECT,
                    placeholder: 'Selectează moneda',
                    required: true,
                    options: [
                        { value: 'RON', label: 'Lei Românești (RON)' },
                        { value: 'EUR', label: 'Euro (EUR)' },
                        { value: 'USD', label: 'Dolari Americani (USD)' }
                    ]
                },
                {
                    name: 'renewPeriod',
                    label: 'Perioadă reînnoire',
                    type: FieldType.SELECT,
                    required: true,
                    options: [
                        { value: RenewPeriod.MONTHLY, label: 'Lunar' },
                        { value: RenewPeriod.QUARTERLY, label: 'Trimestrial' },
                        { value: RenewPeriod.SEMI_ANNUAL, label: 'Semestrial' },
                        { value: RenewPeriod.ANNUAL, label: 'Anual' },
                        { value: RenewPeriod.ONE_TIME, label: 'O singură dată' }
                    ]
                },
                {
                    name: 'autoRenew',
                    label: 'Reînnoire automată',
                    type: FieldType.CHECKBOX,
                    required: false
                }
            ]
        },
        {
            title: "Perioada",
            columns: 2,
            fields: [
                {
                    name: 'startedFrom',
                    label: 'Data început',
                    type: FieldType.DATE,
                    placeholder: 'Selectează data de început',
                    required: true
                },
                {
                    name: 'endedAt',
                    label: 'Data sfârșit',
                    type: FieldType.DATE,
                    placeholder: 'Selectează data de sfârșit',
                    required: true
                }
            ]
        },
        {
            title: "Detalii plată (opțional)",
            columns: 2,
            fields: [
                {
                    name: 'paymentMethod',
                    label: 'Metodă de plată',
                    type: FieldType.SELECT,
                    required: false,
                    options: [
                        { value: PaymentMethod.BANK_TRANSFER, label: 'Transfer bancar' },
                        { value: PaymentMethod.CREDIT_CARD, label: 'Card de credit' },
                        { value: PaymentMethod.CASH, label: 'Numerar' },
                        { value: PaymentMethod.STRIPE, label: 'Stripe' },
                        { value: PaymentMethod.PAYPAL, label: 'PayPal' },
                        { value: PaymentMethod.OTHER, label: 'Altă metodă' }
                    ]
                }
            ]
        },
        {
            title: "Note",
            columns: 1,
            fields: [
                {
                    name: 'notes',
                    label: 'Note suplimentare',
                    type: FieldType.TEXTAREA,
                    placeholder: 'Note despre cotizație...',
                    maxLength: 1000,
                    rows: 3,
                    required: false
                }
            ]
        }
    ],
    submitButtonText: 'Adaugă cotizație',
    cancelButtonText: 'Anulează'
});

export const updateMembershipFeeFormConfig = (rateOptions: Array<{value: string, label: string}> = []): DynamicFormConfig => ({
    ...createMembershipFeeFormConfig(rateOptions),
    submitButtonText: 'Actualizează cotizație'
});

export const processPaymentFormConfig = (): DynamicFormConfig => ({
    sections: [
        {
            title: "Confirmare plată",
            columns: 1,
            fields: [
                {
                    name: 'paymentMethod',
                    label: 'Metodă de plată',
                    type: FieldType.SELECT,
                    required: true,
                    options: [
                        { value: PaymentMethod.BANK_TRANSFER, label: 'Transfer bancar' },
                        { value: PaymentMethod.CREDIT_CARD, label: 'Card de credit' },
                        { value: PaymentMethod.CASH, label: 'Numerar' },
                        { value: PaymentMethod.STRIPE, label: 'Stripe' },
                        { value: PaymentMethod.PAYPAL, label: 'PayPal' },
                        { value: PaymentMethod.OTHER, label: 'Altă metodă' }
                    ]
                },
                {
                    name: 'transactionReference',
                    label: 'Referință tranzacție',
                    type: FieldType.TEXT,
                    placeholder: 'ex: TRX123456789',
                    required: false,
                    maxLength: 255
                },
                {
                    name: 'paymentDate',
                    label: 'Data plății',
                    type: FieldType.DATE,
                    required: false
                }
            ]
        }
    ],
    submitButtonText: 'Confirmă plata',
    cancelButtonText: 'Anulează'
});

export const processPaymentSelfFormConfig = (): DynamicFormConfig => ({
    sections: [
        {
            title: "Confirmare plată personală",
            columns: 1,
            fields: [
                {
                    name: 'paymentMethod',
                    label: 'Metodă de plată',
                    type: FieldType.SELECT,
                    required: true,
                    options: [
                        { value: PaymentMethod.BANK_TRANSFER, label: 'Transfer bancar' },
                        { value: PaymentMethod.CREDIT_CARD, label: 'Card de credit' },
                        { value: PaymentMethod.CASH, label: 'Numerar' },
                        { value: PaymentMethod.STRIPE, label: 'Stripe' },
                        { value: PaymentMethod.PAYPAL, label: 'PayPal' },
                        { value: PaymentMethod.OTHER, label: 'Altă metodă' }
                    ]
                },
                {
                    name: 'transactionReference',
                    label: 'Referință tranzacție',
                    type: FieldType.TEXT,
                    placeholder: 'ex: TRX123456789',
                    required: true,
                    maxLength: 255
                },
                {
                    name: 'documentReference',
                    label: 'Link dovadă plată',
                    type: FieldType.TEXT,
                    placeholder: 'ex: https://drive.google.com/file/...',
                    required: true,
                    maxLength: 500,
                    helperText: 'Încarcă dovada plății (chitanță/bon fiscal) și adaugă link-ul aici'
                },
                {
                    name: 'paymentDate',
                    label: 'Data plății',
                    type: FieldType.DATE,
                    required: false
                }
            ]
        }
    ],
    submitButtonText: 'Confirmă plata',
    cancelButtonText: 'Anulează'
});
