import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/layout/Layout';
import {Card} from "@/components/ui/Card.tsx";
import {Button} from "@/components/ui/Button.tsx";
import {AuthState, UserGroup} from "@/types/auth.types.ts";
import {LoadingSpinner} from "@/components/ui/LoadingSpinner.tsx";
import {DashboardStats} from "@/types/index.types.ts";
import { FormModal, ConfirmationModal } from '../components/ui/Modal';
import userService from '@/services/user.service';
import { createUserSchema } from '@/schemas/user.schema';
import { showToast } from '@/components/ui/Toast';

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
    const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
    const [isCreateOrgModalOpen, setIsCreateOrgModalOpen] = useState(false);
    const [createdUserData, setCreatedUserData] = useState<any>(null);
    const stats: DashboardStats = {
        recentActivities: 0,
        activeProjects: 0,
        totalStats: 0
    };

    const getUserDisplayName = (): string => {
        if (!user) return 'Utilizator';
        return user.fullName || user.username;
    };

    const isAdmin = checkUserGroup(UserGroup.ADMIN);
    const isOrgAdmin = checkUserGroup(UserGroup.ORGANIZATION_ADMIN);

    const getDefaultGroup = () => {
        if (isAdmin) return UserGroup.ORGANIZATION_ADMIN;
        return ''; 
    };

    const getDefaultStatus = (group?: string) => {
        // If admin is creating an organization admin, default to PENDING
        if (isAdmin && group === UserGroup.ORGANIZATION_ADMIN) {
            return 'PENDING';
        }
        return 'ACTIVE';
    };

    const getAvailableGroups = () => {
        if (isAdmin) {
            return [
                { value: UserGroup.ORGANIZATION_ADMIN, label: 'Administrator organizație' }
            ];
        } else if (isOrgAdmin) {
            return [
                { value: UserGroup.MANAGER, label: 'Manager' },
                { value: UserGroup.EMPLOYEE, label: 'Angajat' },
                { value: UserGroup.MEMBER, label: 'Membru' },
                { value: UserGroup.VOLUNTEER, label: 'Voluntar' }
            ];
        } else {
            return [
                { value: UserGroup.MEMBER, label: 'Membru' },
                { value: UserGroup.VOLUNTEER, label: 'Voluntar' }
            ];
        }
    };

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm({
        resolver: zodResolver(createUserSchema),
        defaultValues: {
            status: getDefaultStatus(getDefaultGroup()),
            group: getDefaultGroup()
        }
    });

    // Watch for group changes to update status accordingly
    const selectedGroup = watch('group');
    
    React.useEffect(() => {
        if (selectedGroup) {
            const newStatus = getDefaultStatus(selectedGroup);
            setValue('status', newStatus);
        }
    }, [selectedGroup, setValue]);

    const onSubmitCreateUser = async (data: any) => {
        try {
            const createdUser = await userService.createUser(data);
            setIsCreateUserModalOpen(false);
            setCreatedUserData({ ...data, ...createdUser });
            
            // If admin, ask if they want to create an organization for the user
            if (isAdmin) {
                setIsCreateOrgModalOpen(true);
            } else {
                // Show success message for non-admin users
                showToast.userCreated();
                resetForm();
            }
        } catch (error: any) {
            showToast.userCreationFailed(error.message);
        }
    };

    const resetForm = () => {
        reset({
            status: getDefaultStatus(getDefaultGroup()),
            group: getDefaultGroup(),
            full_name: '',
            email: '',
            personal_numerical_number: '',
            phone_number: '',
            company_number: '',
            company_name: ''
        });
    };

    const handleCreateOrganization = () => {
        setIsCreateOrgModalOpen(false);
        // TODO: Open organization creation modal
        showToast.info("Organisation creation modal starts here");
        resetForm();
        setCreatedUserData(null);
    };

    const handleSkipOrganization = () => {
        setIsCreateOrgModalOpen(false);
        showToast.userCreated();
        resetForm();
        setCreatedUserData(null);
    };

    const handleCloseModal = () => {
        setIsCreateUserModalOpen(false);
        resetForm();
    };

    return (
        <Layout showNavigation={true}>
            <div className="container mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Bine ai revenit, {getUserDisplayName()}!</h1>
                    <p className="text-gray-600">Iată ce se întâmplă cu proiectele și activitățile tale.</p>
                </div>

                {(isAdmin || isOrgAdmin) && (
                    <Card title="Acțiuni administrator" className="mb-6">
                        <div className="flex flex-wrap gap-4">
                                <Button
                                    variant="primary"
                                    onClick={() => setIsCreateUserModalOpen(true)}
                                >
                                    Creează utilizator nou
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

                {/* Create User Modal */}
                <FormModal
                    isOpen={isCreateUserModalOpen}
                    onClose={handleCloseModal}
                    title="Creează utilizator nou"
                    size="lg"
                >
                    <form onSubmit={handleSubmit(onSubmitCreateUser)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-group">
                                <label className="form-label">Nume complet *</label>
                                <input 
                                    type="text"
                                    {...register('full_name')}
                                    className={`form-input ${errors.full_name ? 'border-red-500' : ''}`}
                                    placeholder="Ex: Ion Popescu"
                                />
                                {errors.full_name && (
                                    <p className="text-red-500 text-sm mt-1">{errors.full_name.message}</p>
                                )}
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email *</label>
                                <input 
                                    type="email"
                                    {...register('email')}
                                    className={`form-input ${errors.email ? 'border-red-500' : ''}`}
                                    placeholder="utilizator@exemplu.com"
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-group">
                                <label className="form-label">CNP (Cod Numeric Personal) *</label>
                                <input 
                                    type="text"
                                    {...register('personal_numerical_number')}
                                    className={`form-input ${errors.personal_numerical_number ? 'border-red-500' : ''}`}
                                    placeholder="Ex: 1234567890123"
                                    maxLength={13}
                                />
                                {errors.personal_numerical_number && (
                                    <p className="text-red-500 text-sm mt-1">{errors.personal_numerical_number.message}</p>
                                )}
                            </div>
                            <div className="form-group">
                                <label className="form-label">Număr telefon</label>
                                <input 
                                    type="tel"
                                    {...register('phone_number')}
                                    className={`form-input ${errors.phone_number ? 'border-red-500' : ''}`}
                                    placeholder="Ex: +40712345678"
                                />
                                {errors.phone_number && (
                                    <p className="text-red-500 text-sm mt-1">{errors.phone_number.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-group">
                                <label className="form-label">Număr înregistrare companie</label>
                                <input 
                                    type="text"
                                    {...register('company_number')}
                                    className={`form-input ${errors.company_number ? 'border-red-500' : ''}`}
                                    placeholder="Ex: RO12345678 sau 12345678"
                                />
                                {errors.company_number && (
                                    <p className="text-red-500 text-sm mt-1">{errors.company_number.message}</p>
                                )}
                            </div>
                            <div className="form-group">
                                <label className="form-label">Numele companiei</label>
                                <input 
                                    type="text"
                                    {...register('company_name')}
                                    className={`form-input ${errors.company_name ? 'border-red-500' : ''}`}
                                    placeholder="Ex: SC Exemplu SRL"
                                />
                                {errors.company_name && (
                                    <p className="text-red-500 text-sm mt-1">{errors.company_name.message}</p>
                                )}
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-group">
                                <label className="form-label">Grup utilizator *</label>
                                <select 
                                    {...register('group')} 
                                    className={`form-select ${errors.group ? 'border-red-500' : ''}`}
                                    disabled={isAdmin}
                                >
                                    {!isAdmin && <option value="">Selectează grup</option>}
                                    {getAvailableGroups().map(group => (
                                        <option key={group.value} value={group.value}>
                                            {group.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.group && (
                                    <p className="text-red-500 text-sm mt-1">{errors.group.message}</p>
                                )}
                            </div>
                            <div className="form-group">
                                <label className="form-label">Status</label>
                                <select 
                                    {...register('status')} 
                                    className="form-select"
                                    disabled={isAdmin && selectedGroup === UserGroup.ORGANIZATION_ADMIN}
                                >
                                    <option value="ACTIVE">Activ</option>
                                    <option value="INACTIVE">Inactiv</option>
                                    <option value="PENDING">În așteptare</option>
                                </select>
                                {isAdmin && selectedGroup === UserGroup.ORGANIZATION_ADMIN && (
                                    <p className="text-blue-600 text-sm mt-1">
                                        Administratorii de organizație sunt creați cu statusul "În așteptare" în mod automat.
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="modal-footer">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={handleCloseModal}
                                disabled={isSubmitting}
                            >
                                Anulează
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Se creează...' : 'Creează utilizator'}
                            </Button>
                        </div>
                    </form>
                </FormModal>

                {/* Create Organization Confirmation Modal */}
                <ConfirmationModal
                    isOpen={isCreateOrgModalOpen}
                    onClose={handleSkipOrganization}
                    onConfirm={handleCreateOrganization}
                    title="Creează organizație"
                    message={`Utilizatorul ${createdUserData?.full_name || ''} a fost creat cu succes! Doriți să creați o organizație pentru acest utilizator?`}
                    confirmText="Da, creează organizație"
                    cancelText="Nu, doar utilizator"
                    variant="info"
                />
            </div>
        </Layout>
    );
};

const Home: React.FC = () => {
    const { authState, isAuthenticated, error } = useAuth();

    if (authState === AuthState.LOADING) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100">
                <LoadingSpinner size="lg" />
                <div className="ml-4">
                    <p className="text-gray-600">Se inițializează autentificarea...</p>
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