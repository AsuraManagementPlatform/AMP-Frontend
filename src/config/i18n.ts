import i18next from 'i18next';
import {initReactI18next} from 'react-i18next';

const resources = {
    en: {
        translation: {
            label: {
                quick_actions: "Quick actions",
                user_create: "Create User",
                organisation_create: "Create Organisation",
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
                },
                project_expense: {
                    planned: "Planned",
                    paid: "Paid",
                    cancelled: "Cancelled",
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
                }
                },
            tab: {
                project_expenses: "Project expenses"
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
            }
        }
    },
    ro: {
        translation: {
            label: {
                quick_actions: "Acțiuni rapide",
                user_create: "Creează utilizator nou",
                organisation_create: "Creează organizație nouă",
                project: {
                    planned_budget: "Buget planificat",
                    active_funds: "Fonduri disponibile",
                    active_expenses: "Fonduri utilizate",
                    active_funds_on_planned_budget: "Procent din bugetul planificat",
                    active_expenses_on_active_funds: "Procent din fonduri",
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
                },
                project_expense: {
                    planned: "Planificat",
                    paid: "Plătit",
                    cancelled: "Anulat",
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
                }
                },
            tab: {
                project_expenses: "Buget Proiect"
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