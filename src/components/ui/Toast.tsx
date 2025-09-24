import toast, { Toaster, ToastOptions } from 'react-hot-toast';

export const toastMessages = {
    success: {
        userCreated: 'Utilizatorul a fost creat cu succes!',
        userUpdated: 'Utilizatorul a fost actualizat cu succes!',
        userDeleted: 'Utilizatorul a fost șters cu succes!',
        organizationCreated: 'Organizația a fost creată cu succes!',
        organizationUpdated: 'Organizația a fost actualizată cu succes!',
        organizationDeleted: 'Organizația a fost ștearsă cu succes!',
        changesSaved: 'Modificările au fost salvate!',
        passwordResetSent: 'Email-ul pentru resetarea parolei a fost trimis cu succes!',
        passwordUpdated: 'Parola a fost actualizată cu succes!',
        formSubmitted: 'Formularul a fost trimis cu succes!',
        operationCompleted: 'Operația a fost finalizată cu succes!',
    },
    error: {
        userCreationFailed: 'Crearea utilizatorului a eșuat',
        userUpdateFailed: 'Actualizarea utilizatorului a eșuat',
        userDeleteFailed: 'Ștergerea utilizatorului a eșuat',
        organizationCreationFailed: 'Crearea organizației a eșuat',
        organizationUpdateFailed: 'Actualizarea organizației a eșuat',
        organizationDeleteFailed: 'Ștergerea organizației a eșuat',
        saveError: 'Eroare la salvarea modificărilor',
        networkError: 'Eroare de rețea. Verificați conexiunea.',
        unauthorized: 'Nu aveți permisiuni pentru această acțiune',
        unknownError: 'A apărut o eroare neașteptată',
        passwordResetFailed: 'Resetarea parolei a eșuat. Verificați adresa de email.',
        userNotFound: 'Utilizatorul nu a fost găsit. Verificați adresa de email.',
        passwordUpdateFailed: 'Actualizarea parolei a eșuat',
        validationError: 'Verificați datele introduse și încercați din nou',
        duplicateEntry: 'Datele introduse există deja în sistem',
        requiredFieldsMissing: 'Câmpurile obligatorii nu sunt completate',
        noPendingAdminUsers: 'Nu există utilizatori administratori în așteptare pentru a crea o organizație.',
        organizationCreatedUserUpdateFailed: 'Organizația a fost creată, dar actualizarea statusului utilizatorului a eșuat.',
    },
    loading: {
        savingChanges: 'Se salvează modificările...',
        creatingUser: 'Se creează utilizatorul...',
        updatingUser: 'Se actualizează utilizatorul...',
        deletingUser: 'Se șterge utilizatorul...',
        creatingOrganization: 'Se creează organizația...',
        updatingOrganization: 'Se actualizează organizația...',
        deletingOrganization: 'Se șterge organizația...',
        submittingForm: 'Se trimite formularul...',
        processing: 'Se procesează...',
    },
    info: {
        formReset: 'Formularul a fost resetat',
        featureInDevelopment: 'Funcționalitate în dezvoltare',
    }
};

export const showToast = {
    success: (message: string, options?: ToastOptions) => {
        return toast.success(message, {
            duration: 4000,
            style: {
                background: '#10B981',
                color: '#ffffff',
                border: '1px solid #059669',
            },
            iconTheme: {
                primary: '#ffffff',
                secondary: '#10B981',
            },
            ...options,
        });
    },

    error: (message: string, options?: ToastOptions) => {
        return toast.error(message, {
            duration: 5000,
            style: {
                background: '#EF4444',
                color: '#ffffff',
                border: '1px solid #DC2626',
            },
            iconTheme: {
                primary: '#ffffff',
                secondary: '#EF4444',
            },
            ...options,
        });
    },

    loading: (message: string, options?: ToastOptions) => {
        return toast.loading(message, {
            style: {
                background: '#F59E0B',
                color: '#ffffff',
                border: '1px solid #D97706',
            },
            ...options,
        });
    },

    info: (message: string, options?: ToastOptions) => {
        return toast(message, {
            duration: 4000,
            icon: 'ℹ️',
            style: {
                background: '#3B82F6',
                color: '#ffffff',
                border: '1px solid #2563EB',
            },
            ...options,
        });
    },

    userCreated: () => showToast.success(toastMessages.success.userCreated),
    userUpdated: () => showToast.success(toastMessages.success.userUpdated),
    userDeleted: () => showToast.success(toastMessages.success.userDeleted),
    organizationCreated: () => showToast.success(toastMessages.success.organizationCreated),
    organizationUpdated: () => showToast.success(toastMessages.success.organizationUpdated),
    organizationDeleted: () => showToast.success(toastMessages.success.organizationDeleted),
    userCreationFailed: (error?: string) => showToast.error(error || toastMessages.error.userCreationFailed),
    userUpdateFailed: (error?: string) => showToast.error(error || toastMessages.error.userUpdateFailed),
    userDeleteFailed: (error?: string) => showToast.error(error || toastMessages.error.userDeleteFailed),
    organizationCreationFailed: (error?: string) => showToast.error(error || toastMessages.error.organizationCreationFailed),
    organizationUpdateFailed: (error?: string) => showToast.error(error || toastMessages.error.organizationUpdateFailed),
    organizationDeleteFailed: (error?: string) => showToast.error(error || toastMessages.error.organizationDeleteFailed),
    validationError: (error?: string) => showToast.error(error || toastMessages.error.validationError),
    duplicateEntry: (error?: string) => showToast.error(error || toastMessages.error.duplicateEntry),
    requiredFieldsMissing: () => showToast.error(toastMessages.error.requiredFieldsMissing),
    passwordResetSent: () => showToast.success(toastMessages.success.passwordResetSent),
    passwordUpdated: () => showToast.success(toastMessages.success.passwordUpdated),
    passwordResetFailed: (error?: string) => showToast.error(error || toastMessages.error.passwordResetFailed),
    userNotFound: () => showToast.error(toastMessages.error.userNotFound),
    passwordUpdateFailed: (error?: string) => showToast.error(error || toastMessages.error.passwordUpdateFailed),
    networkError: () => showToast.error(toastMessages.error.networkError),
    unauthorized: () => showToast.error(toastMessages.error.unauthorized),
    formSubmitted: () => showToast.success(toastMessages.success.formSubmitted),
    operationCompleted: () => showToast.success(toastMessages.success.operationCompleted),
    savingChanges: () => showToast.loading(toastMessages.loading.savingChanges),
    creatingUser: () => showToast.loading(toastMessages.loading.creatingUser),
    creatingOrganization: () => showToast.loading(toastMessages.loading.creatingOrganization),
    updatingOrganization: () => showToast.loading(toastMessages.loading.updatingOrganization),
    submittingForm: () => showToast.loading(toastMessages.loading.submittingForm),
    processing: () => showToast.loading(toastMessages.loading.processing),
    formReset: () => showToast.info(toastMessages.info.formReset),
    featureInDevelopment: () => showToast.info(toastMessages.info.featureInDevelopment),
    noPendingAdminUsers: () => showToast.error(toastMessages.error.noPendingAdminUsers),
    organizationCreatedUserUpdateFailed: () => showToast.error(toastMessages.error.organizationCreatedUserUpdateFailed),
};

export const ToastConfig: React.FC = () => (
    <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
            duration: 4000,
            style: {
                background: '#ffffff',
                color: '#374151',
                border: '1px solid #E5E7EB',
                borderRadius: '0.5rem',
                fontSize: '14px',
                fontWeight: '500',
                padding: '12px 16px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            },
            success: {
                duration: 4000,
                iconTheme: {
                    primary: '#10B981',
                    secondary: '#ffffff',
                },
            },
            error: {
                duration: 5000,
                iconTheme: {
                    primary: '#EF4444',
                    secondary: '#ffffff',
                },
            },
        }}
    />
);

export default showToast;
