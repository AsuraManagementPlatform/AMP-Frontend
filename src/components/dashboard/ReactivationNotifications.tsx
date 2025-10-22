import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PendingReactivationUser, userReactivationService } from '@/services/userReactivation.service';
import UserReactivationApprovalModal from '@/components/modals/user/UserReactivationApprovalModal';

export const ReactivationNotifications: React.FC = () => {
    const [pendingUsers, setPendingUsers] = useState<PendingReactivationUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<PendingReactivationUser | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const loadPendingReactivations = async () => {
        try {
            setLoading(true);
            const response = await userReactivationService.getPendingReactivations();
            setPendingUsers(response.users);
        } catch (error) {
            console.error('Error loading pending reactivations:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPendingReactivations();
    }, []);

    const handleOpenModal = (user: PendingReactivationUser) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
    };

    const handleRefresh = () => {
        loadPendingReactivations();
    };

    if (loading || pendingUsers.length === 0) {
        return null;
    }

    return (
        <>
            <Card className="mb-6 bg-yellow-50 border-yellow-200">
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-yellow-900 mb-1">
                                Cereri de Reactivare în Așteptare
                            </h3>
                            <p className="text-sm text-yellow-800 mb-3">
                                {pendingUsers.length} {pendingUsers.length === 1 ? 'membru a plătit' : 'membri au plătit'} cotizația restantă și solicită reactivarea contului.
                            </p>
                            <div className="space-y-2">
                                {pendingUsers.map((user) => (
                                    <div
                                        key={user.id}
                                        className="flex items-center justify-between bg-white rounded-lg p-3 border border-yellow-200"
                                    >
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">{user.full_name}</p>
                                            <p className="text-sm text-gray-600">{user.email}</p>
                                            {user.reactivation_requested_at && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Cerere din {new Date(user.reactivation_requested_at).toLocaleDateString('ro-RO')}
                                                </p>
                                            )}
                                        </div>
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={() => handleOpenModal(user)}
                                        >
                                            Revizuiește
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            <UserReactivationApprovalModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                user={selectedUser}
                onRefresh={handleRefresh}
            />
        </>
    );
};
