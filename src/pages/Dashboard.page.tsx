import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { DashboardStats } from "@/types/dashboard.types";
import { UserGroup } from "@/types/auth.types";
import { CreateUserFormData } from "@/schemas/user.schema";
import userService from "@/services/user.service";
import Layout from "@/components/layout/Layout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ConfirmationModal } from "@/components/ui/Modal";
import showToast from "@/components/ui/Toast";
import {CreateUserModal} from "@/components/user/CreateUserModal.tsx";

const DashboardPage: React.FC = () => {
    const { user, hasAnyUserGroup } = useAuth();
    const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
    const [isCreateOrgModalOpen, setIsCreateOrgModalOpen] = useState(false);
    const [createdUserData, setCreatedUserData] = useState<CreateUserFormData | null>(null);

    const stats: DashboardStats = {
        recentActivities: 0,
        activeProjects: 0,
        totalStats: 0
    };

    const getUserDisplayName = (): string => {
        if (!user) return 'Utilizator';
        return user.fullName || user.username;
    };

    const isAdmin = hasAnyUserGroup([UserGroup.ADMIN]);
    const isOrgAdmin = hasAnyUserGroup([UserGroup.ORGANIZATION_ADMIN]);

    const handleCreateUser = async (data: CreateUserFormData) => {
        try {
            const createdUser = await userService.createUser(data);
            setIsCreateUserModalOpen(false);
            setCreatedUserData({ ...data, ...createdUser });

            if (isAdmin && data.group === UserGroup.ORGANIZATION_ADMIN) {
                setIsCreateOrgModalOpen(true);
            } else {
                showToast.success('Utilizator creat cu succes!');
                setCreatedUserData(null);
            }
        } catch (error) {
            console.error('Error creating user:', error);

            if (error instanceof Error) {
                showToast.error(`Eroare la crearea utilizatorului: ${error.message}`);
            } else {
                showToast.error('A apărut o eroare necunoscută.');
            }
        }
    };

    const handleCreateOrganization = () => {
        setIsCreateOrgModalOpen(false);
        // TODO: Implement organization creation modal
        showToast.info("Modalul pentru crearea organizației va fi implementat aici");
        setCreatedUserData(null);
    };

    const handleSkipOrganization = () => {
        setIsCreateOrgModalOpen(false);
        showToast.success('Utilizator creat cu succes!');
        setCreatedUserData(null);
    };

    const handleOpenCreateUser = () => {
        setIsCreateUserModalOpen(true);
    };

    const handleCloseCreateUser = () => {
        setIsCreateUserModalOpen(false);
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
                                onClick={handleOpenCreateUser}
                            >
                                Creează utilizator nou
                            </Button>
                            {isAdmin && (
                                <Button
                                    variant="outline"
                                    onClick={() => showToast.info("Funcționalitate în dezvoltare")}
                                >
                                    Gestionează organizații
                                </Button>
                            )}
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
                        <Button
                            variant="outline"
                            onClick={() => showToast.info("Funcționalitate în dezvoltare")}
                        >
                            Creează proiect nou
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => showToast.info("Funcționalitate în dezvoltare")}
                        >
                            Vezi calendarul
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => showToast.info("Funcționalitate în dezvoltare")}
                        >
                            Generează raport
                        </Button>
                    </div>
                </Card>

                <CreateUserModal
                    isOpen={isCreateUserModalOpen}
                    onClose={handleCloseCreateUser}
                    onSubmit={handleCreateUser}
                    isAdmin={isAdmin}
                />

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

export default DashboardPage;