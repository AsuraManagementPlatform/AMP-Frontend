import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/layout/Layout';
import {Card} from "@/components/ui/Card.tsx";
import {Button} from "@/components/ui/Button.tsx";
import {AuthState} from "@/types/auth.types.ts";
import {LoadingSpinner} from "@/components/ui/LoadingSpinner.tsx";
import {DashboardStats} from "@/types/index.types.ts";
import {CreateUserRequest, CreateUserModalProps} from "@/types/adminPanel.types.ts";
import userService from "@/services/user.service.ts";
import showToast from "@/components/ui/Toast.tsx";
import { SimpleTooltip } from "@/components/ui/Tooltip.tsx";
import { FormModal } from "@/components/ui/Modal.tsx";

const CreateUserModal: React.FC<CreateUserModalProps> = ({isOpen, onClose, onSuccess}) => {
    const [formData, setFormData] = useState<CreateUserRequest>({
        username: '',
        email: '',
        full_name: '',
        phone_number: '',
        personal_numerical_number: '',
        company_number: '',
        company_name: '',
        group: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault();

        try {
            setIsSubmitting(true);
            
            const loadingToastId = showToast.creatingUser();

            await userService.createUser(formData);

            // Close loading toast and show success
            showToast.success('', { id: loadingToastId });
            showToast.userCreated();

            setFormData({
                username: '',
                email: '',
                full_name: '',
                phone_number: '',
                personal_numerical_number: '',
                company_number: '',
                company_name: '',
                group: ''
            });

            onSuccess();
            onClose();
        } catch (error) {
            console.error('Eroare la crearea utilizatorului:', error);
            const errorMessage = error instanceof Error ? error.message : 'Crearea utilizatorului a eșuat';
            showToast.userCreationFailed(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (field: keyof CreateUserRequest, value: string): void => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleGroupChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
        setFormData(prev => ({
            ...prev,
            group: event.target.value
        }));
    };

    return (
        <FormModal
            isOpen={isOpen}
            onClose={onClose}
            title="Creează utilizator nou"
            size="md"
        >
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <div>
                        <label className="form-label">
                            Nume de utilizator
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.username}
                            onChange={(e) => handleInputChange('username', e.target.value)}
                            className="form-input"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div>
                        <label className="form-label">
                            Adresă de email
                        </label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className="form-input"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div>
                        <label className="form-label">
                            Nume complet
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.full_name}
                            onChange={(e) => handleInputChange('full_name', e.target.value)}
                            className="form-input"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div>
                        <label className="form-label">
                            Număr de telefon
                        </label>
                        <input
                            type="tel"
                            required
                            value={formData.phone_number}
                            onChange={(e) => handleInputChange('phone_number', e.target.value)}
                            className="form-input"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div>
                        <label className="form-label">
                            Grup utilizator
                        </label>
                        <select
                            value={formData.group}
                            onChange={handleGroupChange}
                            className="form-select"
                            disabled={isSubmitting}
                            required
                        >
                            <option value="">Selectează grupul</option>
                            <option value="admin">Administrator</option>
                            <option value="organization_admin">Administrator organizație</option>
                            <option value="manager">Manager</option>
                            <option value="employee">Angajat</option>
                            <option value="member">Membru</option>
                            <option value="volunteer">Voluntar</option>
                        </select>
                    </div>
                </div>

                <div className="modal-footer">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        Anulează
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        isLoading={isSubmitting}
                    >
                        Creează utilizator
                    </Button>
                </div>
            </form>
        </FormModal>
    );
};

const LandingPage: React.FC = () => {
    return (
        <Layout showNavigation={false}>
            <div className="text-center py-16">

                <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                    Împreună aducem schimbarea!
                </h1>

                <p className="text-xl md:text-2xl text-gray-600 mb-12 italic">
                    "Drumul unei societăți mature este dat de oameni cu principii solide."
                </p>

                <Card className="border-2 border-orange-200 bg-orange-50 mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                        Bine ai venit pe Platforma Asura!
                    </h2>
                    <p className="text-lg text-gray-600 mb-6">
                        AsuraPlatform ajută organizațiile să își gestioneze structura, proiectele și activitățile eficient.
                        Te rugăm să te autentifici pentru a accesa panoul tău personalizat.
                    </p>
                    <div className="mt-4 p-4 bg-orange-100 rounded-md border border-orange-200 text-gray-700">
                        <p className="flex items-center">
                            <svg className="w-5 h-5 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Autentifică-te pentru a accesa mai multe informații și funcționalități
                        </p>
                    </div>
                </Card>

                {/* Carduri previzualizare funcționalități */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                    <Card className="opacity-75" title="Proiecte active">
                        <p className="text-gray-400">Autentifică-te pentru a vedea proiectele tale</p>
                    </Card>

                    <Card className="opacity-75" title="Activități recente">
                        <p className="text-gray-400">Autentifică-te pentru a vedea activitățile</p>
                    </Card>

                    <Card className="opacity-75" title="Statistici">
                        <p className="text-gray-400">Autentifică-te pentru a vedea statisticile</p>
                    </Card>
                </div>
            </div>
        </Layout>
    );
};

const Dashboard: React.FC = () => {
    const { user, checkUserGroup } = useAuth();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const stats: DashboardStats = {
        recentActivities: 0,
        activeProjects: 0,
        totalStats: 0
    };

    const getUserDisplayName = (): string => {
        if (!user) return 'Utilizator';
        return user.fullName || user.username;
    };

    const isAdmin = checkUserGroup('admin');

    const handleCreateUserSuccess = () => {
        // Opțional reîmprospătează datele sau afișează un mesaj de succes
        console.log('Utilizatorul a fost creat cu succes');
        // Toast notification is already shown in the modal
    };

    return (
        <Layout showNavigation={true}>
            <div className="container mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Bine ai revenit, {getUserDisplayName()}!</h1>
                    <p className="text-gray-600">Iată ce se întâmplă cu proiectele și activitățile tale.</p>
                    {import.meta.env.DEV && (
                        <p className="text-xs text-gray-400 mt-2">
                            Grupuri utilizator: {user?.userGroups?.join(', ') || 'Niciunul'}
                        </p>
                    )}
                </div>

                {isAdmin && (
                    <Card title="Acțiuni administrator" className="mb-6">
                        <div className="flex flex-wrap gap-4">
                            <SimpleTooltip tooltip="Deschide formularul pentru a adăuga un utilizator nou în sistem" side="bottom">
                                <Button 
                                    variant="primary"
                                    onClick={() => setIsCreateModalOpen(true)}
                                >
                                    Creează utilizator nou
                                </Button>
                            </SimpleTooltip>
                        </div>
                    </Card>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card title="Activități recente" subtitle="Ultimele noutăți din proiectele tale">
                        {stats.recentActivities > 0 ? (
                            <div className="text-2xl font-semibold text-orange-600">
                                {stats.recentActivities}
                            </div>
                        ) : (
                            <p className="text-gray-500">Nicio activitate recentă.</p>
                        )}
                    </Card>

                    <Card title="Proiecte active" subtitle="Proiecte la care lucrezi în prezent">
                        {stats.activeProjects > 0 ? (
                            <div className="text-2xl font-semibold text-blue-600">
                                {stats.activeProjects}
                            </div>
                        ) : (
                            <p className="text-gray-500">Niciun proiect activ.</p>
                        )}
                    </Card>

                    <Card title="Statistici" subtitle="Prezentare generală a performanței tale">
                        {stats.totalStats > 0 ? (
                            <div className="text-2xl font-semibold text-green-600">
                                {stats.totalStats}
                            </div>
                        ) : (
                            <p className="text-gray-500">Nu există date statistice disponibile.</p>
                        )}
                    </Card>
                </div>

                <Card title="Acțiuni rapide" className="mt-8">
                    <div className="flex flex-wrap gap-4">
                        <Button variant="outline">Creează proiect nou</Button>
                        <Button variant="outline">Vezi calendarul</Button>
                        <Button variant="outline">Generează raport</Button>
                    </div>
                </Card>

                <CreateUserModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSuccess={handleCreateUserSuccess}
                />
            </div>
        </Layout>
    );
};

const Home: React.FC = () => {
    const { authState, isAuthenticated, user, error } = useAuth();

    // Jurnalizare pentru dezvoltare
    if (import.meta.env.DEV) {
        console.log('Debug autentificare:', {
            authState,
            isAuthenticated,
            user,
            error
        });
    }

    if (authState === AuthState.LOADING) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100">
                <LoadingSpinner size="lg" />
                <div className="ml-4">
                    <p className="text-gray-600">Se inițializează autentificarea...</p>
                    {import.meta.env.DEV && (
                        <p className="text-xs text-gray-400 mt-2">
                            Se verifică statusul autentificării cu backend-ul...
                        </p>
                    )}
                </div>
            </div>
        );
    }

    if (authState === AuthState.ERROR) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-red-600 mb-4">Eroare de autentificare</h2>
                    <p className="text-gray-600 mb-4">{error || 'Autentificarea nu a putut fi inițializată'}</p>
                    <Button onClick={() => window.location.reload()}>
                        Reîncearcă
                    </Button>
                </div>
            </div>
        );
    }

    return isAuthenticated ? <Dashboard /> : <LandingPage />;
};

export default Home;