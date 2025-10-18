import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/layout/Layout";
import { Card } from "@/components/ui/Card";
import { PrimaryActionButton } from "@/components/ui/PrimaryActionButton";
import { CreateMembershipFeeModal } from "@/components/modals/membershipFee/CreateMembershipFeeModal";
import { MembershipFeeList } from "@/components/tables/MembershipFeeList";
import { UserGroup } from "@/types/index.types";

const MembershipFeesPage: React.FC = () => {
    const { user, hasAnyUserGroup } = useAuth();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [refreshTable, setRefreshTable] = useState(0);

    const isOrgAdmin = hasAnyUserGroup([UserGroup.ORGANIZATION_ADMIN]);
    const hasOrganization = user?.organizationId;

    const canManageFees = isOrgAdmin && hasOrganization;

    const handleOpenCreateModal = () => {
        setIsCreateModalOpen(true);
    };

    const handleCloseCreateModal = () => {
        setIsCreateModalOpen(false);
    };

    const handleFeeCreated = () => {
        setRefreshTable(prev => prev + 1);
    };

    return (
        <Layout showNavigation={true}>
            <div className="container mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Cotizații membri</h1>
                    <p className="text-gray-600">Gestionează cotizațiile și contribuțiile membrilor organizației</p>
                </div>

                {canManageFees && (
                    <Card
                        title="Acțiuni rapide"
                        className="mb-6"
                        headerActions={
                            <div className="flex gap-4">
                                <PrimaryActionButton
                                    variant="create"
                                    onClick={handleOpenCreateModal}
                                    title="Adaugă o nouă cotizație pentru un membru"
                                >
                                    Adaugă cotizație
                                </PrimaryActionButton>
                            </div>
                        }
                    >
                    </Card>
                )}

                <Card title="Lista cotizații" className="mb-6">
                    <MembershipFeeList
                        organizationId={user?.organizationId}
                        refreshTrigger={refreshTable}
                        className="flex gap-4 flex-col"
                    />
                </Card>

                {canManageFees && (
                    <CreateMembershipFeeModal
                        isOpen={isCreateModalOpen}
                        onClose={handleCloseCreateModal}
                        onSuccess={handleFeeCreated}
                    />
                )}
            </div>
        </Layout>
    );
};

export default MembershipFeesPage;
