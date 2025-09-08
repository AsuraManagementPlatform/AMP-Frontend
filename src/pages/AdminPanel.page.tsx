import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Table, TableColumn } from '@/components/ui/Table';
import Layout from '@/components/layout/Layout';
import {
    CreateUserRequest,
    CreateUserModalProps
} from '@/types/adminPanel.types';
import userService from "@/services/user.service.ts";
import {Card} from "@/components/ui/Card.tsx";
import {Alert} from "@/components/ui/Alert.tsx";
import {Button} from "@/components/ui/Button.tsx";
import {UserMeResponse} from "@/types/api.types.ts";

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
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault();

        try {
            setIsSubmitting(true);
            setError(null);

            await userService.createUser(formData);

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
            console.error('Error creating user:', error);
            setError(error instanceof Error ? error.message : 'Failed to create user');
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Create New User</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-xl"
                        disabled={isSubmitting}
                    >
                        ×
                    </button>
                </div>

                {error && (
                    <Alert variant="error" className="mb-4">
                        {error}
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Username
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.username}
                                onChange={(e) => handleInputChange('username', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                disabled={isSubmitting}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                disabled={isSubmitting}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.full_name}
                                onChange={(e) => handleInputChange('full_name', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                disabled={isSubmitting}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                User Groups
                            </label>
                            <select
                                multiple
                                value={formData.group}
                                onChange={handleGroupChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                disabled={isSubmitting}
                            >
                                <option value="admin">Admin</option>
                                <option value="organization_admin">Organization Admin</option>
                                <option value="manager">Manager</option>
                                <option value="employee">Employee</option>
                                <option value="member">Member</option>
                                <option value="volunteer">Volunteer</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 mt-6">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            isLoading={isSubmitting}
                        >
                            Create User
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

// Main Admin Panel Component
const AdminPanel: React.FC = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState<UserMeResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async (): Promise<void> => {
        try {
            setLoading(true);
            setError(null);

            const data = await userService.getAllUsers();
            setUsers(data);

        } catch (error) {
            console.error('Error fetching users:', error);
            setError('Failed to load users. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId: string): Promise<void> => {
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }

        try {
            await userService.deleteUser(userId);
            await fetchUsers(); // Refresh the list
        } catch (error) {
            console.error('Error deleting user:', error);
            setError('Failed to delete user. Please try again.');
        }
    };

    const columns: TableColumn<UserMeResponse>[] = [
        {
            key: 'username',
            label: 'User',
            render: (email: string, user: UserMeResponse) => (
                <div>
                    <div className="font-medium text-gray-900">{email}</div>
                    <div className="text-sm text-gray-500">{user.full_name}</div>
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
            key: 'userGroups',
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
            render: (_, user: UserMeResponse) => (
                <div className="flex space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            // TODO: Implement edit functionality
                            console.log('Edit user:', user.id);
                        }}
                    >
                        Edit
                    </Button>
                    <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                    >
                        Delete
                    </Button>
                </div>
            )
        }
    ];

    return (
        <Layout>
            <div className="container mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Admin Panel</h1>
                    <p className="text-gray-600 mt-2">
                        Welcome, {user?.fullName || user?.username}
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
                            onClick={() => setIsCreateModalOpen(true)}
                            variant="primary"
                            disabled={loading}
                        >
                            Create User
                        </Button>
                    </div>

                    <Table
                        data={users}
                        columns={columns}
                        loading={loading}
                        emptyMessage="No users found. Create your first user to get started."
                    />
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <Card title="Total Users" className="text-center">
                        <div className="text-3xl font-bold text-blue-600">{users.length}</div>
                    </Card>

                    <Card title="Admin Users" className="text-center">
                        <div className="text-3xl font-bold text-orange-600">
                            {users.filter(u => u.groups.includes('admin')).length}
                        </div>
                    </Card>

                    <Card title="Organization Admins" className="text-center">
                        <div className="text-3xl font-bold text-green-600">
                            {users.filter(u => u.groups.includes('organization_admin')).length}
                        </div>
                    </Card>
                </div>

                <CreateUserModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSuccess={fetchUsers}
                />
            </div>
        </Layout>
    );
};

export default AdminPanel;