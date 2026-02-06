import { DynamicFormConfig, FieldType } from "@/types/form.types";
import { PaymentMethod, RenewPeriod } from "@/types/membershipFee.types";

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
                    helperText: 'Cotizația este anuală. Poți plăti suma completă sau în mai multe tranșe.'
                },
                {
                    name: 'customAmount',
                    label: 'Sumă anuală personalizată',
                    type: FieldType.NUMBER,
                    placeholder: 'ex: 200',
                    required: false,
                    min: 0.01,
                    step: 0.01,
                    condition: (values: any) => values.rateType === 'CUSTOM',
                    helperText: 'Introduceți suma anuală dorită'
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
                    label: 'Perioada de plată',
                    type: FieldType.SELECT,
                    placeholder: 'Selectează perioada',
                    required: true,
                    options: [
                        { value: RenewPeriod.MONTHLY, label: 'Lunar' },
                        { value: RenewPeriod.QUARTERLY, label: 'Trimestrial' },
                        { value: RenewPeriod.SEMI_ANNUAL, label: 'Semestrial' },
                        { value: RenewPeriod.ANNUAL, label: 'Anual' }
                    ],
                    helperText: 'Perioada pentru care se calculează cotizația'
                },
                {
                    name: 'startedFrom',
                    label: 'Luna de început',
                    type: FieldType.MONTH,
                    placeholder: 'Selectează luna',
                    required: true,
                    helperText: 'Luna din care începe cotizația'
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
                    name: 'amount',
                    label: 'Sumă de plată',
                    type: FieldType.NUMBER,
                    placeholder: 'ex: 50',
                    required: true,
                    min: 0.01,
                    step: 0.01,
                    helperText: 'Introduceți suma plătită de către membru. Poate fi o sumă parțială.'
                },
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
                },
                {
                    name: 'notes',
                    label: 'Note suplimentare',
                    type: FieldType.TEXTAREA,
                    placeholder: 'Note despre plată...',
                    maxLength: 500,
                    rows: 2,
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
                    name: 'amount',
                    label: 'Sumă de plată',
                    type: FieldType.NUMBER,
                    placeholder: 'ex: 50',
                    required: true,
                    min: 0.01,
                    step: 0.01,
                    helperText: 'Introduceți suma pe care doriți să o plătiți acum. Puteți plăti oricât doriți din suma totală.'
                },
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
                    name: 'paymentProof',
                    label: 'Dovadă plată',
                    type: FieldType.FILE,
                    required: true,
                    accept: '.pdf,.jpg,.jpeg,.png,.doc,.docx',
                    multiple: true,
                    helperText: 'Încarcă chitanțe sau bonuri fiscale (PDF, imagine sau document) - poți selecta mai multe fișiere simultan'
                },
                {
                    name: 'paymentDate',
                    label: 'Data plății',
                    type: FieldType.DATE,
                    required: false
                },
                {
                    name: 'notes',
                    label: 'Note suplimentare',
                    type: FieldType.TEXTAREA,
                    placeholder: 'Note despre plată...',
                    maxLength: 500,
                    rows: 2,
                    required: false
                }
            ]
        }
    ],
    submitButtonText: 'Confirmă plata',
    cancelButtonText: 'Anulează'
});
