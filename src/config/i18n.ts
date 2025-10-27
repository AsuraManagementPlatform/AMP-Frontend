import i18next from 'i18next';
import {initReactI18next} from 'react-i18next';

const resources = {
    en: {
        translation: {
            label: {
                quick_actions: "Quick actions",
                user_create: "Create User",
                organisation_create: "Create Organisation",
                loading: "Loading...",
                project: {
                    planned_budget: "Planned budget",
                    active_funds: "Available funds",
                    active_expenses: "Used funds",
                    active_funds_on_planned_budget: "Procent from planned budget",
                    active_expenses_on_active_funds: "Procent from available funds",
                    active_expenses_on_planned_budget: "Procent from planned budget",
                },
                project_fund: {
                    source: "Source",
                    category: "Category",
                    scope: "Scope",
                    estimated_amount: "Estimated Amount",
                    received_amount: "Received Amount",
                    status: "Status",
                    planned: "Planned",
                    paid: "Received",
                    cancelled: "Cancelled",
                    confirm_payment: "Confirm Payment",
                    received_amount_label: "Received Amount",
                    receipt_date: "Receipt Date",
                    confirm_payment_title: "Confirm Payment",
                    payment_info: "Payment Information",
                    estimated_info: "Estimated Information",
                    delete_fund_title: "Delete Funding Source",
                    delete_fund_message: "Are you sure you want to delete the funding source",
                    empty_list: "No funding sources found for this project.",
                    cancel_fund: "Cancel Funding",
                    cancel_fund_title: "Cancel Funding Source",
                    cancel_fund_message: "Are you sure you want to cancel the funding source",
                    cancel_fund_warning: "This action will mark the funding as cancelled and cannot be undone.",
                    details: "Fund Details",
                    fund_info: "Fund Information",
                    total_amount: "Total Amount",
                    active_allocations: "Active Allocations",
                    cancelled_allocations: "Cancelled Allocations",
                    no_allocations: "No allocations for this fund",
                    allocated_on: "Allocated on",
                    remaining_amount: "Remaining Amount",
                    allocated_amount: "Allocated Amount",
                    total_planned_funds: "Total Planned Funds",
                    total_paid_remaining: "Total Paid / Remaining",
                    remaining: "Remaining"
                },
                project_expense: {
                    planned: "Planned",
                    paid: "Paid",
                    cancelled: "Cancelled",
                    project: "Project",
                    activity: "Activity",
                    vat: "VAT",
                    name: "Expense Name",
                    category: "Category",
                    unit_type: "Unit Type",
                    quantity: "Quantity",
                    unit_price: "Unit Price",
                    currency: "Currency",
                    select_activity: "Select activity",
                    select_vat: "Select VAT",
                    name_placeholder: "e.g.: Office supplies",
                    quantity_placeholder: "e.g.: 10",
                    unit_price_placeholder: "e.g.: 150",
                    execution_date: "Execution Date",
                    expense_info: "Expense Information",
                    original_amount: "Original Amount",
                    new_amount: "New Amount",
                    fund_allocation_preview: "Fund Allocation Preview",
                    no_available_funds: "No available funds with remaining balance for this project.",
                    insufficient_funds_warning: "Insufficient funds! Still need: {{remaining}} {{currency}}",
                    no_allocations: "Enter values to see fund allocation",
                    execute_expense: "Execute Expense",
                    total_amount: "Total Amount",
                    status: "Status",
                    cancel_expense_title: "Cancel Expense",
                    cancel_expense_message: "Are you sure you want to cancel the expense",
                    cancel_expense_warning: "This action will cancel all fund allocations and mark the expense as cancelled. This action cannot be undone.",
                    delete_expense_title: "Delete Expense",
                    delete_expense_message: "Are you sure you want to delete the expense",
                    empty_list: "No expenses found for this project.",
                    details: "Expense Details",
                    funded_by: "Funded By",
                    cancelled_funding: "Cancelled Funding",
                    funded_on: "Funded on",
                    total_planned_expenses: "Total Planned Expenses",
                    total_paid_expenses: "Total Paid Expenses"
                },
                vat: {
                    name: "Unique name",
                    value: "Value",
                    vats_page_title: "Vats",
                    create_vat: "Add new vat",
                    vat_list: "Vat list",
                    confirm_vat_deleted_tile: "Remove vat",
                    confirm_vat_deleted_message: "Are you sure that you want to delete vat",
                    confirm_vat_confirm_message: "Confirm",
                    confirm_vat_cancel_message: "Cancel",
                    empty_list: "not vats found",
                },
                expense_category: {
                    personnel: "Personnel",
                    equipment: "Equipment",
                    materials: "Materials",
                    services: "Services",
                    travel: "Travel",
                    utilities: "Utilities",
                    marketing: "Marketing",
                    administrative: "Administrative",
                    other: "Other"
                },
                unit_type: {
                    hour: "Hour",
                    day: "Day",
                    number: "Piece",
                    batch: "Batch"
                },
                currency: {
                    ron: "Romanian Leu (RON)",
                    eur: "Euro (EUR)",
                    usd: "US Dollar (USD)"
                },
                allocation_status: {
                    active: "Active",
                    cancelled: "Cancelled"
                }
            },
            tab: {
                project_expenses: "Project expenses",
                project_funds: "Project funds",
            },
            schema: {
                max_decimals: "Cannot have more than 2 decimals",
                vat: {
                    min_name: "Name must be a minimum of 3 characters long",
                    positive_value: "Value must be positive",
                    min_value: "Value must be at least 0",
                    max_value: "Value can not be more than 100",
                },
                project_fund: {
                    amount_required: "Amount is required",
                    amount_must_be_number: "Amount must be a valid number",
                    amount_must_be_positive: "Amount must be positive",
                    date_required: "Date is required",
                    date_invalid: "Date is not valid",
                },
                project_expense: {
                    vat_required: "VAT is required",
                    quantity_required: "Quantity is required",
                    quantity_must_be_number: "Quantity must be a valid number",
                    quantity_must_be_positive: "Quantity must be positive",
                    quantity_max_decimals: "Quantity cannot have more than 2 decimals",
                    unit_price_required: "Unit price is required",
                    unit_price_must_be_number: "Unit price must be a valid number",
                    unit_price_must_be_positive: "Unit price must be positive",
                    unit_price_max_decimals: "Unit price cannot have more than 2 decimals",
                    date_required: "Date is required",
                    date_invalid: "Date is not valid",
                    funds_required: "At least one fund allocation is required",
                    max_decimals: "Cannot have more than 2 decimals"
                }
            },
            form: {
                vat: {
                    create_modal_title: "Add new vat",
                    section_one_title: "Vat details",
                    submit_btn_text: "Add vat",
                    cancel_btn_text: "Cancel",
                    update_btn_text: "Update vat",
                },
                project_fund: {
                    confirm_payment_section: "Confirm Payment",
                    submit_payment: "Confirm Payment",
                    cancel: "Cancel",
                },
                project_expense: {
                    section_info: "Expense Information",
                    section_financial: "Financial Details",
                    submit_create: "Add Expense",
                    submit_update: "Update Expense",
                    cancel: "Cancel",
                    section_execute: "Execute Expense",
                    submit_execute: "Execute Expense",
                    execute_title: "Execute Expense"
                }
            },
            toast: {
                default_error_message: "An error occurred.",
                vat: {
                    created: "Vat created",
                    updated: "Vat updated",
                    deleted: "Vat removed",
                },
                project_fund: {
                    payment_confirmed: "Payment confirmed successfully!",
                    payment_error: "Error confirming payment",
                    deleted: "Funding source deleted successfully!",
                    delete_error: "Error deleting funding source",
                    cancelled: "Funding source cancelled successfully!",
                    cancel_error: "Error cancelling funding source",
                    load_error: "Error loading fund details"
                },
                project_expense: {
                    executed: "Expense executed successfully!",
                    execute_error: "Error executing expense",
                    load_data_error: "Error loading data",
                    insufficient_funds: "Insufficient funds! Still need: {{remaining}}",
                    cancelled: "Expense cancelled successfully!",
                    cancel_error: "Error cancelling expense",
                    deleted: "Expense deleted successfully!",
                    delete_error: "Error deleting expense",
                    load_error: "Error loading expense details"
                }
            },
            nav: {
                vats: "Vats",
            },
            action: {
                edit: "Edit",
                delete: "Delete",
                confirm_payment: "Confirm Payment",
                confirm: "Confirm",
                cancel: "Cancel",
                cancel_fund: "Cancel Funding",
                execute_expense: "Execute Expense",
                close: "Close",
                cancel_expense: "Cancel Expense"
            }
        }
    },
    ro: {
        translation: {
            label: {
                quick_actions: "Acțiuni rapide",
                user_create: "Creează utilizator nou",
                organisation_create: "Creează organizație nouă",
                loading: "Se încarcă...",
                project: {
                    planned_budget: "Buget planificat",
                    active_funds: "Fonduri disponibile",
                    active_expenses: "Fonduri utilizate",
                    active_funds_on_planned_budget: "Procent din bugetul planificat",
                    active_expenses_on_active_funds: "Procent din fondurile disponibile",
                    active_expenses_on_planned_budget: "Procent din bugetul planificat",
                },
                project_fund: {
                    source: "Sursă",
                    category: "Categorie",
                    scope: "Scop",
                    estimated_amount: "Sumă estimată",
                    received_amount: "Sumă primită",
                    status: "Status",
                    planned: "Planificat",
                    paid: "Primit",
                    cancelled: "Anulat",
                    confirm_payment: "Confirmă plata",
                    received_amount_label: "Sumă primită",
                    receipt_date: "Data primirii",
                    confirm_payment_title: "Confirmă plata",
                    payment_info: "Informații plată",
                    estimated_info: "Informații estimate",
                    delete_fund_title: "Șterge sursa de finanțare",
                    delete_fund_message: "Sigur doriți să ștergeți sursa de finanțare",
                    empty_list: "Nu există surse de finanțare pentru acest proiect.",
                    cancel_fund: "Anulează finanțarea",
                    cancel_fund_title: "Anulează sursa de finanțare",
                    cancel_fund_message: "Sigur doriți să anulați sursa de finanțare",
                    cancel_fund_warning: "Această acțiune va marca finanțarea ca anulată și nu poate fi anulată.",
                    details: "Detalii finanțare",
                    fund_info: "Informații finanțare",
                    total_amount: "Suma totală",
                    active_allocations: "Alocări active",
                    cancelled_allocations: "Alocări anulate",
                    no_allocations: "Nu există alocări pentru această finanțare",
                    allocated_on: "Alocat la data de",
                    remaining_amount: "Suma rămasă",
                    allocated_amount: "Suma alocată",
                    total_planned_funds: "Total Fonduri Planificate",
                    total_paid_remaining: "Total Plătit / Rămas",
                    remaining: "Rămas"
                },
                project_expense: {
                    planned: "Planificat",
                    paid: "Plătit",
                    cancelled: "Anulat",
                    project: "Proiect",
                    activity: "Activitate",
                    vat: "TVA",
                    name: "Nume cheltuială",
                    category: "Categorie",
                    unit_type: "Tip unitate",
                    quantity: "Cantitate",
                    unit_price: "Preț unitar",
                    currency: "Moneda",
                    select_activity: "Selectează activitatea",
                    select_vat: "Selectează o opțiune",
                    name_placeholder: "ex: Materiale de birou",
                    quantity_placeholder: "ex: 10",
                    unit_price_placeholder: "ex: 150",
                    execution_date: "Data executării",
                    expense_info: "Informații cheltuială",
                    original_amount: "Suma originală",
                    new_amount: "Suma nouă",
                    fund_allocation_preview: "Previzualizare alocare fonduri",
                    no_available_funds: "Nu există fonduri disponibile cu sold rămas pentru acest proiect.",
                    insufficient_funds_warning: "Fonduri insuficiente! Mai sunt necesare: {{remaining}} {{currency}}",
                    no_allocations: "Introduceți valorile pentru a vedea alocarea fondurilor",
                    execute_expense: "Execută cheltuiala",
                    total_amount: "Total",
                    status: "Status",
                    cancel_expense_title: "Anulează cheltuiala",
                    cancel_expense_message: "Sigur doriți să anulați cheltuiala",
                    cancel_expense_warning: "Această acțiune va anula toate alocările de fonduri și va marca cheltuiala ca anulată. Această acțiune nu poate fi anulată.",
                    delete_expense_title: "Șterge cheltuiala",
                    delete_expense_message: "Sigur doriți să ștergeți cheltuiala",
                    empty_list: "Nu există cheltuieli pentru acest proiect.",
                    details: "Detalii cheltuială",
                    funded_by: "Finanțat de",
                    cancelled_funding: "Finanțare anulată",
                    funded_on: "Finanțat la data de",
                    total_planned_expenses: "Total Cheltuieli Planificate",
                    total_paid_expenses: "Total Cheltuieli Plătite"
                },
                vat: {
                    name: "Denumire unica",
                    value: "Procentaj",
                    vats_page_title: "TVA",
                    create_vat: "Adaugă TVA",
                    vat_list: "Listă TVA",
                    confirm_vat_deleted_tile: "Șterge activitatea",
                    confirm_vat_deleted_message: "Sigur doriți să ștergeți activitatea",
                    confirm_vat_confirm_message: "Confirmă",
                    confirm_vat_cancel_message: "Renunță",
                    empty_list: "Nu există activități pentru acest proiect.",
                },
                expense_category: {
                    personnel: "Personal",
                    equipment: "Echipamente",
                    materials: "Materiale",
                    services: "Servicii",
                    travel: "Deplasări",
                    utilities: "Utilități",
                    marketing: "Marketing",
                    administrative: "Administrative",
                    other: "Altele"
                },
                unit_type: {
                    hour: "Oră",
                    day: "Zi",
                    number: "Bucată",
                    batch: "Lot"
                },
                currency: {
                    ron: "Lei Românești (RON)",
                    eur: "Euro (EUR)",
                    usd: "Dolari Americani (USD)"
                },
                allocation_status: {
                    active: "Activ",
                    cancelled: "Anulat"
                }
            },
            tab: {
                project_expenses: "Buget Proiect",
                project_funds: "Finanțare proiect",
            },
            schema: {
                max_decimals: "Nu poate avea mai mult de 2 zecimale",
                vat: {
                    min_name: "Numele trebuie să conțină cel puțin 3 caractere",
                    positive_value: "Valoarea trebuie să fie pozitivă",
                    min_value: "Valoarea trebuie să fie cel puțin 0",
                    max_value: "Valoarea trebuie să nu depășească 100",
                },
                project_fund: {
                    amount_required: "Suma este obligatorie",
                    amount_must_be_number: "Suma trebuie să fie un număr valid",
                    amount_must_be_positive: "Suma trebuie să fie pozitivă",
                    date_required: "Data este obligatorie",
                    date_invalid: "Data nu este validă",
                },
                project_expense: {
                    vat_required: "TVA-ul este obligatoriu",
                    quantity_required: "Cantitatea este obligatorie",
                    quantity_must_be_number: "Cantitatea trebuie să fie un număr valid",
                    quantity_must_be_positive: "Cantitatea trebuie să fie pozitivă",
                    quantity_max_decimals: "Cantitatea nu poate avea mai mult de 2 zecimale",
                    unit_price_required: "Prețul unitar este obligatoriu",
                    unit_price_must_be_number: "Prețul unitar trebuie să fie un număr valid",
                    unit_price_must_be_positive: "Prețul unitar trebuie să fie pozitiv",
                    unit_price_max_decimals: "Prețul unitar nu poate avea mai mult de 2 zecimale",
                    date_required: "Data este obligatorie",
                    date_invalid: "Data nu este validă",
                    funds_required: "Este necesară cel puțin o alocare de fonduri",
                    max_decimals: "Nu poate avea mai mult de 2 zecimale"
                }
            },
            form: {
                vat: {
                    create_modal_title: "Adaugă TVA nou",
                    section_one_title: "Date TVA",
                    submit_btn_text: "Adaugă TVA",
                    cancel_btn_text: "Renunță",
                    update_btn_text: "Actualizează TVA",
                },
                project_fund: {
                    confirm_payment_section: "Confirmare plată",
                    submit_payment: "Confirmă plata",
                    cancel: "Anulează",
                },
                project_expense: {
                    section_info: "Informații cheltuială",
                    section_financial: "Detalii financiare",
                    submit_create: "Adaugă cheltuială",
                    submit_update: "Actualizează cheltuială",
                    cancel: "Anulează",
                    section_execute: "Execută cheltuiala",
                    submit_execute: "Execută cheltuiala",
                    execute_title: "Execută cheltuiala"
                }
            },
            toast: {
                default_error_message: "A apărut o eroare",
                vat: {
                    created: "TVA-ul a fost adăugat",
                    updated: "TVA-ul a fost actualizat",
                    deleted: "TVA-ul a fost eliminat",
                },
                project_fund: {
                    payment_confirmed: "Plata a fost confirmată cu succes!",
                    payment_error: "Eroare la confirmarea plății",
                    deleted: "Sursa de finanțare a fost ștearsă cu succes!",
                    delete_error: "Eroare la ștergerea sursei de finanțare",
                    cancelled: "Sursa de finanțare a fost anulată cu succes!",
                    cancel_error: "Eroare la anularea sursei de finanțare",
                    load_error: "Eroare la încărcarea detaliilor finanțării"
                },
                project_expense: {
                    executed: "Cheltuiala a fost executată cu succes!",
                    execute_error: "Eroare la executarea cheltuielii",
                    load_data_error: "Eroare la încărcarea datelor",
                    insufficient_funds: "Fonduri insuficiente! Mai sunt necesare: {{remaining}}",
                    cancelled: "Cheltuiala a fost anulată cu succes!",
                    cancel_error: "Eroare la anularea cheltuielii",
                    deleted: "Cheltuiala a fost ștearsă cu succes!",
                    delete_error: "Eroare la ștergerea cheltuielii",
                    load_error: "Eroare la încărcarea detaliilor cheltuielii"
                }
            },
            nav: {
                vats: "Listă TVA",
            },
            action: {
                edit: "Editează",
                delete: "Șterge",
                confirm_payment: "Confirmă plata",
                confirm: "Confirmă",
                cancel: "Renunță",
                cancel_fund: "Anulează finanțarea",
                execute_expense: "Execută cheltuiala",
                close: "Închide",
                cancel_expense: "Anulează cheltuiala"
            }
        }
    }
};

i18next
.use(initReactI18next)
.init({
resources,
lng: 'ro',
fallbackLng: 'ro',
interpolation: {
escapeValue: false
}
});

export default i18next;