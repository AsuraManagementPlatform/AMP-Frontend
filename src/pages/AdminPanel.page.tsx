import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/layout/Layout';
import {Card} from "@/components/ui/Card.tsx";
import {Alert} from "@/components/ui/Alert.tsx";
import {Button} from "@/components/ui/Button.tsx";
import userService from "@/services/user.service.ts";
import organizationService from "@/services/organization.service.ts";
import {User, UserMeResponse} from "@/types/user.types.ts";
import {PaginatedResponse, TableColumn} from "@/types/index.types.ts";
import Table from "@/components/ui/Table.tsx";
import { CreateUserModal } from "@/components/modals/user/CreateUserModal.tsx";
import { EditUserModal } from "@/components/modals/user/EditUserModal.tsx";
import { PasswordResetConfirmModal } from "@/components/modals/user/PasswordResetConfirmModal.tsx";
import { LinkOrganizationModal } from "@/components/modals/organization/LinkOrganizationModal.tsx";
import { OrganizationCreationModal } from "@/components/organization/OrganizationCreationModal.tsx";
import { UserCreateRequest } from "@/schemas/user.schema.ts";
import { CreateOrganizationData } from "@/schemas/organization.schema.ts";
import showToast from "@/components/ui/Toast.tsx";

const AdminPanel: React.FC = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState<PaginatedResponse<User>>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
    const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
    const [isPasswordResetModalOpen, setIsPasswordResetModalOpen] = useState(false);
    const [isLinkOrgModalOpen, setIsLinkOrgModalOpen] = useState(false);
    const [isCreateOrgModalOpen, setIsCreateOrgModalOpen] = useState(false);
    const [createdUser, setCreatedUser] = useState<UserMeResponse | null>(null);
    const [selectedUser, setSelectedUser] = useState<UserMeResponse | null>(null);
    const [isSubmittingOrg, setIsSubmittingOrg] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async (): Promise<void> => {
        try {
            setLoading(true);
            setError(null);

            const data = await userService.getList();
            setUsers(data);

        } catch (error) {
            setError('Failed to load users. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreateUser = () => {
        setIsCreateUserModalOpen(true);
    };

    const handleCloseCreateUser = () => {
        setIsCreateUserModalOpen(false);
    };

    const handleCreateUser = async (data: UserCreateRequest): Promise<void> => {
        const newUser = await userService.create(data);
        showToast.success('Utilizator creat cu succes!');
        await fetchUsers();

        if (data.isLegalEntity) {
            setCreatedUser(newUser as UserMeResponse);
            setIsLinkOrgModalOpen(true);
        }
    };

    const handleCloseLinkOrgModal = () => {
        setIsLinkOrgModalOpen(false);
        setCreatedUser(null);
    };

    const handleConfirmLinkOrg = () => {
        setIsLinkOrgModalOpen(false);
        setIsCreateOrgModalOpen(true);
    };

    const handleCloseOrgModal = () => {
        setIsCreateOrgModalOpen(false);
        setCreatedUser(null);
    };

    const handleCreateOrganization = async (data: CreateOrganizationData): Promise<void> => {
        try {
            setIsSubmittingOrg(true);
            await organizationService.create(data);
            showToast.success('Organizație creată cu succes!');
            setIsCreateOrgModalOpen(false);
            setCreatedUser(null);
        } catch (error) {
            showToast.error('Eroare la crearea organizației');
            throw error;
        } finally {
            setIsSubmittingOrg(false);
        }
    };

    const handleEditUser = (user: UserMeResponse) => {
        setSelectedUser(user);
        setIsEditUserModalOpen(true);
    };

    const handleCloseEditUser = () => {
        setIsEditUserModalOpen(false);
        setSelectedUser(null);
    };

    const handleUpdateUser = async (data: UserCreateRequest): Promise<void> => {
        if (!selectedUser) return;

        await userService.update(selectedUser.id, data);
        showToast.success('Utilizator actualizat cu succes!');
        await fetchUsers();
        setIsEditUserModalOpen(false);
        setIsPasswordResetModalOpen(true);
    };

    const handleClosePasswordResetModal = () => {
        setIsPasswordResetModalOpen(false);
        setSelectedUser(null);
    };

    const handleConfirmPasswordReset = async () => {
        if (!selectedUser) return;

        try {
            const result = await userService.resetPassword(selectedUser.id);
            showToast.success(`Email de resetare parolă trimis cu succes la ${result.email}!`);
            setIsPasswordResetModalOpen(false);
            setSelectedUser(null);
        } catch (error) {
            showToast.error('Eroare la trimiterea emailului de resetare parolă');
        }
    };

    const handleResetPassword = async (userId: string): Promise<void> => {
        if (!window.confirm('Sigur doriți să resetați parola acestui utilizator? Va primi un email cu o parolă temporară.')) {
            return;
        }

        try {
            const result = await userService.resetPassword(userId);
            showToast.success(`Email de resetare parolă trimis cu succes la ${result.email}!`);
        } catch (error) {
            showToast.error('Eroare la trimiterea emailului de resetare parolă');
        }
    };

    const columns: TableColumn<UserMeResponse>[] = [
        {
            key: 'email',
            label: 'User',
            render: (email: string, user: UserMeResponse) => (
                <div>
                    <div className="font-medium text-gray-900">{email}</div>
                    <div className="text-sm text-gray-500">{user.fullName}</div>
                </div>
            )
        },
        {
            key: 'id',
            label: 'ID',
            render: (id: string) => (
                <span className="text-xs text-gray-500 font-mono">
          {id.substring(0, 8)}...
        </span>
            )
        },
        {
            key: 'groups',
            label: 'Groups',
            render: (groups: string[]) => (
                <div className="flex flex-wrap gap-1">
                    {groups.length > 0 ? (
                        groups.map((group) => (
                            <span
                                key={group}
                                className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                            >
                {group}
              </span>
                        ))
                    ) : (
                        <span className="text-gray-400 text-sm">No groups</span>
                    )}
                </div>
            )
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (_, _user: UserMeResponse) => {
                const isCurrentUser = _user.id === user?.id;
                
                if (isCurrentUser) {
                    return <span className="text-sm text-gray-500 italic">Current user</span>;
                }
                
                return (
                    <div className="flex space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditUser(_user)}
                        >
                            Edit
                        </Button>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleResetPassword(_user.id)}
                        >
                            Resetare Parolă
                        </Button>
                    </div>
                );
            }
        }
    ];

    return (
        <Layout>
            <div className="container mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Admin Panel</h1>
                    <p className="text-gray-600 mt-2">
                        Welcome, {user?.fullName || user?.email}
                    </p>
                </div>

                {error && (
                    <Alert
                        variant="error"
                        title="Error"
                        dismissible
                        onDismiss={() => setError(null)}
                        className="mb-6"
                    >
                        {error}
                    </Alert>
                )}

                <Card>
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-xl font-semibold">User Management</h2>
                            <p className="text-gray-600 text-sm mt-1">
                                Manage users, their groups, and permissions
                            </p>
                        </div>
                        <Button
                            variant="primary"
                            disabled={loading}
                            onClick={handleOpenCreateUser}
                        >
                            Create User
                        </Button>
                    </div>

                    <Table
                        endpoint="user/list"
                        columns={columns}
                        emptyMessage="Nu au fost găsiți utilizatori. Creează primul utilizator pentru a începe."
                    />
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <Card title="Total Users" className="text-center">
                        <div className="text-3xl font-bold text-blue-600">{users?.count}</div>
                    </Card>

                    <Card title="Admin Users" className="text-center">
                        <div className="text-3xl font-bold text-orange-600">
                            {users?.results.filter(u => u.groups.includes('admin')).length}
                        </div>
                    </Card>

                    <Card title="Organization Admins" className="text-center">
                        <div className="text-3xl font-bold text-green-600">
                            {users?.results.filter(u => u.groups.includes('organization_admin')).length}
                        </div>
                    </Card>
                </div>

                <CreateUserModal
                    isOpen={isCreateUserModalOpen}
                    onClose={handleCloseCreateUser}
                    onSubmit={handleCreateUser}
                    isAdmin={true}
                />

                <EditUserModal
                    isOpen={isEditUserModalOpen}
                    onClose={handleCloseEditUser}
                    onSubmit={handleUpdateUser}
                    user={selectedUser}
                    isAdmin={true}
                />

                <PasswordResetConfirmModal
                    isOpen={isPasswordResetModalOpen}
                    onClose={handleClosePasswordResetModal}
                    onConfirm={handleConfirmPasswordReset}
                    userEmail={selectedUser?.email || ''}
                />

                <LinkOrganizationModal
                    isOpen={isLinkOrgModalOpen}
                    onClose={handleCloseLinkOrgModal}
                    onConfirm={handleConfirmLinkOrg}
                    user={createdUser}
                />

                <OrganizationCreationModal
                    isOpen={isCreateOrgModalOpen}
                    onClose={handleCloseOrgModal}
                    onSubmit={handleCreateOrganization}
                    isSubmitting={isSubmittingOrg}
                    pendingAdminUsers={[]}
                    loadingPendingUsers={false}
                    preselectedUser={createdUser}
                />

            </div>
        </Layout>
    );
};

export default AdminPanel;
