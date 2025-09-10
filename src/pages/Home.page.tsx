import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/layout/Layout';
import {Card} from "@/components/ui/Card.tsx";
import {Button} from "@/components/ui/Button.tsx";
import {AuthState} from "@/types/auth.types.ts";
import {LoadingSpinner} from "@/components/ui/LoadingSpinner.tsx";
import {DashboardStats} from "@/types/index.types.ts";
import { Modal, ConfirmationModal, FormModal } from '../components/ui/Modal';
import userService from '@/services/user.service';

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
    const [isTestModalOpen, setIsTestModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
    const [isCreatingUser, setIsCreatingUser] = useState(false);

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

    // Handle form submissions
    const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsCreatingUser(true);
        
        try {
            const formData = new FormData(e.currentTarget);
            const userData = {
                full_name: formData.get('full_name') as string,
                email: formData.get('email') as string,
                personal_numerical_number: formData.get('personal_numerical_number') as string || undefined,
                company_number: formData.get('company_number') as string || undefined,
                company_name: formData.get('company_name') as string || undefined,
                group: formData.get('group') as string,
                phone_number: formData.get('phone_number') as string || undefined,
                status: (formData.get('status') as 'ACTIVE' | 'INACTIVE' | 'PENDING') || 'ACTIVE',
            };
            
            // Client-side validation (matching backend validation)
            if (!userData.personal_numerical_number && !userData.company_number) {
                throw new Error('Either personal numerical number or company information must be provided');
            }
            
            if (userData.company_number && !userData.company_name) {
                throw new Error('You can\'t have a company number without providing a company name');
            }
            
            console.log('Creating user with data:', userData);
            
            // Call the backend API
            const createdUser = await userService.createUser(userData);
            console.log('User created successfully:', createdUser);
            
            // Close modal and show success message
            setIsCreateUserModalOpen(false);
            
            // TODO: Add success toast notification
            // showToast('User created successfully!', 'success');
            
        } catch (error: any) {
            console.error('Failed to create user:', error);
            
            // TODO: Add error toast notification
            // showToast(error.message || 'Failed to create user', 'error');
            alert(error.message || 'Failed to create user');
            
        } finally {
            setIsCreatingUser(false);
        }
    };

    const handleConfirmAction = () => {
        console.log('Action confirmed!');
        // Add your action logic here
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
                                <Button
                                    variant="primary"
                                    onClick={() => setIsCreateUserModalOpen(true)}
                                >
                                    Creează utilizator nou
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsTestModalOpen(true)}
                                >
                                    Test Modal
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={() => setIsConfirmModalOpen(true)}
                                >
                                    Test Confirmation
                                </Button>
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

                {/* Test Modal */}
                <Modal
                    isOpen={isTestModalOpen}
                    onClose={() => setIsTestModalOpen(false)}
                    title="Test Modal"
                    description="Acesta este un modal de test pentru a demonstra funcționalitatea."
                    size="md"
                >
                    <div className="space-y-4">
                        <p>Acest modal funcționează perfect! Poți adăuga aici orice conținut dorim.</p>
                        <p>Modalul poate fi închis prin:</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Apăsarea butonului X din colțul din dreapta sus</li>
                            <li>Clic pe fundal (overlay)</li>
                            <li>Apăsarea tastei Escape</li>
                        </ul>
                        <div className="pt-4">
                            <Button 
                                variant="primary" 
                                onClick={() => setIsTestModalOpen(false)}
                            >
                                Închide Modal
                            </Button>
                        </div>
                    </div>
                </Modal>

                {/* Confirmation Modal */}
                <ConfirmationModal
                    isOpen={isConfirmModalOpen}
                    onClose={() => setIsConfirmModalOpen(false)}
                    onConfirm={handleConfirmAction}
                    title="Confirmă acțiunea"
                    message="Ești sigur că vrei să execuți această acțiune? Această operațiune nu poate fi anulată."
                    confirmText="Da, confirmă"
                    cancelText="Anulează"
                    variant="warning"
                />

                {/* Create User Modal */}
                <FormModal
                    isOpen={isCreateUserModalOpen}
                    onClose={() => setIsCreateUserModalOpen(false)}
                    title="Creează utilizator nou"
                    size="lg"
                >
                    <form onSubmit={handleCreateUser} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-group">
                                <label className="form-label">Nume complet *</label>
                                <input 
                                    type="text"
                                    name="full_name"
                                    className="form-input" 
                                    placeholder="Ex: Ion Popescu"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email *</label>
                                <input 
                                    type="email"
                                    name="email"
                                    className="form-input" 
                                    placeholder="utilizator@exemplu.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-group">
                                <label className="form-label">CNP (Cod Numeric Personal)</label>
                                <input 
                                    type="text"
                                    name="personal_numerical_number"
                                    className="form-input" 
                                    placeholder="Ex: 1234567890123"
                                    maxLength={13}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Număr telefon</label>
                                <input 
                                    type="tel"
                                    name="phone_number"
                                    className="form-input" 
                                    placeholder="Ex: +40712345678"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-group">
                                <label className="form-label">Număr firmă</label>
                                <input 
                                    type="text"
                                    name="company_number"
                                    className="form-input" 
                                    placeholder="Ex: J40/1234/2023"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Nume firmă</label>
                                <input 
                                    type="text"
                                    name="company_name"
                                    className="form-input" 
                                    placeholder="Ex: SC Exemplu SRL"
                                />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-group">
                                <label className="form-label">Grup utilizator *</label>
                                <select name="group" className="form-select" required>
                                    <option value="">Selectează grup</option>
                                    <option value="admin">Administrator</option>
                                    <option value="user">Utilizator</option>
                                    <option value="moderator">Moderator</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Status</label>
                                <select name="status" className="form-select">
                                    <option value="ACTIVE">Activ</option>
                                    <option value="INACTIVE">Inactiv</option>
                                    <option value="PENDING">În așteptare</option>
                                </select>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setIsCreateUserModalOpen(false)}
                                disabled={isCreatingUser}
                            >
                                Anulează
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={isCreatingUser}
                            >
                                {isCreatingUser ? 'Se creează...' : 'Creează utilizator'}
                            </Button>
                        </div>
                    </form>
                </FormModal>
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