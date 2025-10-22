import toast, { Toaster, ToastOptions } from 'react-hot-toast';

export const toastMessages = {
    success: {
        userCreated: 'Utilizatorul a fost creat cu succes!',
        userUpdated: 'Utilizatorul a fost actualizat cu succes!',
        userDeleted: 'Utilizatorul a fost șters cu succes!',
        organizationCreated: 'Organizația a fost creată cu succes!',
        organizationUpdated: 'Organizația a fost actualizată cu succes!',
        organizationDeleted: 'Organizația a fost ștearsă cu succes!',
        projectCreated: 'Proiectul a fost creat cu succes!',
        projectUpdated: 'Proiectul a fost actualizat cu succes!',
        projectDeleted: 'Proiectul a fost șters cu succes!',
        activityCreated: 'Activitatea a fost creată cu succes!',
        activityUpdated: 'Activitatea a fost actualizată cu succes!',
        activityDeleted: 'Activitatea a fost ștearsă cu succes!',
        budgetCreated: 'Bugetul a fost creat cu succes!',
        budgetUpdated: 'Bugetul a fost actualizat cu succes!',
        budgetApproved: 'Bugetul a fost aprobat cu succes!',
        expenseCreated: 'Cheltuiala a fost înregistrată cu succes!',
        expenseUpdated: 'Cheltuiala a fost actualizată cu succes!',
        expenseApproved: 'Cheltuiala a fost aprobată cu succes!',
        expenseDeleted: 'Cheltuiala a fost ștearsă cu succes!',
        incomeCreated: 'Venitul a fost înregistrat cu succes!',
        incomeUpdated: 'Venitul a fost actualizat cu succes!',
        incomeDeleted: 'Venitul a fost șters cu succes!',
        entityCreated: 'Entitatea a fost creată cu succes!',
        entityUpdated: 'Entitatea a fost actualizată cu succes!',
        entityDeleted: 'Entitatea a fost ștearsă cu succes!',
        cvUpdated: 'CV-ul a fost actualizat cu succes!',
        skillAdded: 'Competența a fost adăugată cu succes!',
        experienceAdded: 'Experiența a fost adăugată cu succes!',
        membershipFeeCreated: 'Cotizația a fost creată cu succes!',
        membershipFeeUpdated: 'Cotizația a fost actualizată cu succes!',
        membershipFeeDeleted: 'Cotizația a fost ștearsă cu succes!',
        paymentConfirmed: 'Plata a fost confirmată cu succes!',
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
        projectCreationFailed: 'Crearea proiectului a eșuat',
        projectUpdateFailed: 'Actualizarea proiectului a eșuat',
        projectDeleteFailed: 'Ștergerea proiectului a eșuat',
        activityCreationFailed: 'Crearea activității a eșuat',
        activityUpdateFailed: 'Actualizarea activității a eșuat',
        activityDeleteFailed: 'Ștergerea activității a eșuat',
        budgetCreationFailed: 'Crearea bugetului a eșuat',
        budgetUpdateFailed: 'Actualizarea bugetului a eșuat',
        budgetApprovalFailed: 'Aprobarea bugetului a eșuat',
        expenseCreationFailed: 'Înregistrarea cheltuielii a eșuat',
        expenseUpdateFailed: 'Actualizarea cheltuielii a eșuat',
        expenseApprovalFailed: 'Aprobarea cheltuielii a eșuat',
        expenseDeleteFailed: 'Ștergerea cheltuielii a eșuat',
        incomeCreationFailed: 'Înregistrarea venitului a eșuat',
        incomeUpdateFailed: 'Actualizarea venitului a eșuat',
        incomeDeleteFailed: 'Ștergerea venitului a eșuat',
        entityCreationFailed: 'Crearea entității a eșuat',
        entityUpdateFailed: 'Actualizarea entității a eșuat',
        entityDeleteFailed: 'Ștergerea entității a eșuat',
        cvUpdateFailed: 'Actualizarea CV-ului a eșuat',
        membershipFeeCreationFailed: 'Crearea cotizației a eșuat',
        membershipFeeUpdateFailed: 'Actualizarea cotizației a eșuat',
        membershipFeeDeleteFailed: 'Ștergerea cotizației a eșuat',
        paymentConfirmationFailed: 'Confirmarea plății a eșuat',
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
        creatingProject: 'Se creează proiectul...',
        updatingProject: 'Se actualizează proiectul...',
        deletingProject: 'Se șterge proiectul...',
        creatingActivity: 'Se creează activitatea...',
        updatingActivity: 'Se actualizează activitatea...',
        deletingActivity: 'Se șterge activitatea...',
        creatingBudget: 'Se creează bugetul...',
        updatingBudget: 'Se actualizează bugetul...',
        approvingBudget: 'Se aprobă bugetul...',
        creatingExpense: 'Se înregistrează cheltuiala...',
        updatingExpense: 'Se actualizează cheltuiala...',
        approvingExpense: 'Se aprobă cheltuiala...',
        deletingExpense: 'Se șterge cheltuiala...',
        creatingIncome: 'Se înregistrează venitul...',
        updatingIncome: 'Se actualizează venitul...',
        deletingIncome: 'Se șterge venitul...',
        creatingEntity: 'Se creează entitatea...',
        updatingEntity: 'Se actualizează entitatea...',
        deletingEntity: 'Se șterge entitatea...',
        updatingCv: 'Se actualizează CV-ul...',
        creatingMembershipFee: 'Se creează cotizația...',
        updatingMembershipFee: 'Se actualizează cotizația...',
        deletingMembershipFee: 'Se șterge cotizația...',
        confirmingPayment: 'Se confirmă plata...',
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
    projectCreated: () => showToast.success(toastMessages.success.projectCreated),
    projectUpdated: () => showToast.success(toastMessages.success.projectUpdated),
    projectDeleted: () => showToast.success(toastMessages.success.projectDeleted),
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
    updatingUser: () => showToast.loading(toastMessages.loading.updatingUser),
    creatingOrganization: () => showToast.loading(toastMessages.loading.creatingOrganization),
    updatingOrganization: () => showToast.loading(toastMessages.loading.updatingOrganization),
    submittingForm: () => showToast.loading(toastMessages.loading.submittingForm),
    processing: () => showToast.loading(toastMessages.loading.processing),
    formReset: () => showToast.info(toastMessages.info.formReset),
    featureInDevelopment: () => showToast.info(toastMessages.info.featureInDevelopment),
    noPendingAdminUsers: () => showToast.error(toastMessages.error.noPendingAdminUsers),
    organizationCreatedUserUpdateFailed: () => showToast.error(toastMessages.error.organizationCreatedUserUpdateFailed),
    
    membershipFeeCreated: () => showToast.success(toastMessages.success.membershipFeeCreated),
    membershipFeeUpdated: () => showToast.success(toastMessages.success.membershipFeeUpdated),
    membershipFeeDeleted: () => showToast.success(toastMessages.success.membershipFeeDeleted),
    paymentConfirmed: () => showToast.success(toastMessages.success.paymentConfirmed),
    membershipFeeCreationFailed: (error?: string) => showToast.error(error || toastMessages.error.membershipFeeCreationFailed),
    membershipFeeUpdateFailed: (error?: string) => showToast.error(error || toastMessages.error.membershipFeeUpdateFailed),
    membershipFeeDeleteFailed: (error?: string) => showToast.error(error || toastMessages.error.membershipFeeDeleteFailed),
    paymentConfirmationFailed: (error?: string) => showToast.error(error || toastMessages.error.paymentConfirmationFailed),
    creatingMembershipFee: () => showToast.loading(toastMessages.loading.creatingMembershipFee),
    updatingMembershipFee: () => showToast.loading(toastMessages.loading.updatingMembershipFee),
    deletingMembershipFee: () => showToast.loading(toastMessages.loading.deletingMembershipFee),
    confirmingPayment: () => showToast.loading(toastMessages.loading.confirmingPayment),

    confirm: (message: string): Promise<boolean> => {
        return new Promise((resolve) => {
            const toastId = toast.custom(
                (t) => (
                    <div
                        className={`${
                            t.visible ? 'animate-enter' : 'animate-leave'
                        } max-w-sm bg-white shadow-xl rounded-lg pointer-events-auto border border-gray-200`}
                        style={{ zIndex: 9999 }}
                    >
                        <div className="p-3">
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900">
                                        Confirmă ștergerea
                                    </p>
                                    <p className="mt-0.5 text-xs text-gray-600">
                                        {message}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-3 flex gap-2 justify-end">
                                <button
                                    onClick={() => {
                                        toast.remove(toastId);
                                        resolve(false);
                                    }}
                                    className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400 transition-colors"
                                >
                                    Anulează
                                </button>
                                <button
                                    onClick={() => {
                                        toast.remove(toastId);
                                        resolve(true);
                                    }}
                                    className="px-3 py-1.5 text-xs font-medium text-white bg-orange-500 border border-orange-500 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-orange-500 transition-colors"
                                >
                                    Șterge
                                </button>
                            </div>
                        </div>
                    </div>
                ),
                {
                    duration: Infinity,
                    position: 'top-center',
                }
            );
        });
    },
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
