import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
    en: {
        translation: {
            label: {
                user_create: "Create User",
                organisation_create: "Create Organisation"
            }
        }
    },
    ro: {
        translation: {
            label: {
                user_create: "Creează utilizator nou",
                organisation_create: "Creează organizație nouă",
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