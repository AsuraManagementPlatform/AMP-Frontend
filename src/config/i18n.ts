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
                vat: {
                    min_name: "Name must be a minimum of 3 characters long",
                    positive_value: "Value must be positive",
                    min_value: "Value must be at least 0",
                    max_value: "Value can not be more than 100",
                }
            },
            form: {
                vat: {
                    create_modal_title: "Add new vat",
                    section_one_title: "Vat details",
                    submit_btn_text: "Add vat",
                    cancel_btn_text: "Cancel",
                    update_btn_text: "Update vat",
                }
            },
            toast: {
                default_error_message: "An error occurred.",
                vat: {
                    created: "Vat created",
                    updated: "Vat updated",
                    deleted: "Vat removed",
                }
            },
            nav: {
                vats: "Vats",
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
                vat: {
                    min_name: "Numele trebuie să conțină cel puțin 3 caractere",
                    positive_value: "Valoarea trebuie să fie pozitivă",
                    min_value: "Valoarea trebuie să fie cel puțin 0",
                    max_value: "Valoarea trebuie să nu depășească 100",
                }
            },
            form: {
                vat: {
                    create_modal_title: "Adaugă TVA nou",
                    section_one_title: "Date TVA",
                    submit_btn_text: "Adaugă TVA",
                    cancel_btn_text: "Renunță",
                    update_btn_text: "Actualizează TVA",
                }
            },
            toast: {
                default_error_message: "A apărut o eroare",
                vat: {
                    created: "TVA-ul a fost adăugat",
                    updated: "TVA-ul a fost actualizat",
                    deleted: "TVA-ul a fost eliminat",
                }
            },
            nav: {
                vats: "Listă TVA",
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