import React, {useState} from "react";
import {useAuth} from "@/hooks/useAuth.ts";
import Layout from "@/components/layout/Layout.tsx";
import {t} from "i18next";
import {UserGroup} from "@/types/auth.types.ts";
import {Card} from "@/components/ui/Card.tsx";
import {PrimaryActionButton} from "@/components/ui";
import VatList from "@/components/tables/VatList.tsx";
import {CreateVatModal} from "@/components/modals/vat/CreateVatModal.tsx";

const VatsPage: React.FC = () => {
    const { hasAnyUserGroup } = useAuth();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [refreshVats, setRefreshVatsTable] = useState(0);

    const handleOpenCreateVat = () => {
        setIsCreateModalOpen(true);
    };
    const handleCloseCreateVat = () => {
        setIsCreateModalOpen(false);
    }

    const handleVatCreated = () => {
        setRefreshVatsTable(prev => prev + 1);
    }

    return (
        <Layout showNavigation={true}>
            <div className="container mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">{t('label.vat.vats_page_title')}</h1>
                </div>

                {hasAnyUserGroup([UserGroup.ADMIN]) && (
                    <Card
                        title={t('label.quick_actions')}
                        className="mb-6"
                        headerActions={
                            <div className="flex gap-4">
                                <PrimaryActionButton variant="create" onClick={handleOpenCreateVat} title={t('label.vat.create_vat')}>
                                    {t('label.vat.create_vat')}
                                </PrimaryActionButton>
                            </div>
                        }
                    />
                )}

                <Card title={t('label.vat.vat_list')} className="mb-6">
                    <VatList
                        refreshTrigger={refreshVats}
                    />
                </Card>

                <CreateVatModal
                    isOpen={isCreateModalOpen}
                    onClose={handleCloseCreateVat}
                    onSuccess={handleVatCreated}
                />
            </div>
        </Layout>
    );
};

export default VatsPage;