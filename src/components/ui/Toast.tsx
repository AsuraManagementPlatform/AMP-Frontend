import toast, { Toaster, ToastOptions } from 'react-hot-toast';

// Romanian toast messages
export const toastMessages = {
    success: {
        userCreated: 'Utilizatorul a fost creat cu succes!',
        userUpdated: 'Utilizatorul a fost actualizat cu succes!',
        userDeleted: 'Utilizatorul a fost șters cu succes!',
        changesSaved: 'Modificările au fost salvate!',
        loginSuccess: 'Autentificare reușită!',
    },
    error: {
        userCreationFailed: 'Crearea utilizatorului a eșuat',
        userUpdateFailed: 'Actualizarea utilizatorului a eșuat',
        userDeleteFailed: 'Ștergerea utilizatorului a eșuat',
        saveError: 'Eroare la salvarea modificărilor',
        networkError: 'Eroare de rețea. Verificați conexiunea.',
        unauthorized: 'Nu aveți permisiuni pentru această acțiune',
        unknownError: 'A apărut o eroare neașteptată',
    },
    loading: {
        savingChanges: 'Se salvează modificările...',
        creatingUser: 'Se creează utilizatorul...',
        updatingUser: 'Se actualizează utilizatorul...',
        deletingUser: 'Se șterge utilizatorul...',
        authenticating: 'Se autentifică...',
    },
    info: {
        formSaved: 'Formularul a fost salvat automat',
        sessionExpiring: 'Sesiunea expiră în curând',
        dataRefreshed: 'Datele au fost reîmprospătate',
    }
};

// Custom toast functions with Romanian messages
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

    // Convenience methods using predefined messages
    userCreated: () => showToast.success(toastMessages.success.userCreated),
    userUpdated: () => showToast.success(toastMessages.success.userUpdated),
    userDeleted: () => showToast.success(toastMessages.success.userDeleted),
    
    userCreationFailed: (error?: string) => 
        showToast.error(error || toastMessages.error.userCreationFailed),
    userUpdateFailed: (error?: string) => 
        showToast.error(error || toastMessages.error.userUpdateFailed),
    userDeleteFailed: (error?: string) => 
        showToast.error(error || toastMessages.error.userDeleteFailed),
    
    networkError: () => showToast.error(toastMessages.error.networkError),
    unauthorized: () => showToast.error(toastMessages.error.unauthorized),
    
    savingChanges: () => showToast.loading(toastMessages.loading.savingChanges),
    creatingUser: () => showToast.loading(toastMessages.loading.creatingUser),
};

// Toast configuration component
export const ToastConfig: React.FC = () => (
    <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toastOptions={{
            // Default options for all toasts
            className: '',
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
            // Default options for specific types
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
