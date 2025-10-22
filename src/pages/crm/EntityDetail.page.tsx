import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/layout/Layout";
import { Card } from "@/components/ui/Card";
import { PrimaryActionButton } from "@/components/ui/PrimaryActionButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import Table from "@/components/ui/Table.tsx";
import showToast from "@/components/ui/Toast";
import { UserGroup, TableColumn, TableAction } from "@/types/index.types";
import IconEdit from "@/assets/icons/iconmonstr-edit.svg?react";
import IconDelete from "@/assets/icons/iconmonstr-delete.svg?react";
import { Entity, EntityStatus, EngagementLevel, LegalType, EntityType } from "@/types/entity.types";
import { EntityDonation } from "@/types/donation.types";
import { EntityCommunication, CommunicationType, CommunicationStatus } from "@/types/communication.types";
import { entityService } from "@/services/entity.service";
import { donationService } from "@/services/donation.service";
import { communicationService } from "@/services/communication.service";
import { UpdateEntityModal } from "@/components/modals/entity/UpdateEntityModal";
import { CreateCommunicationModal } from "@/components/modals/entity/CreateCommunicationModal";
import { UpdateCommunicationModal } from "@/components/modals/entity/UpdateCommunicationModal";
import { ROUTES } from "@/utils/constants.utils";

const EntityDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { hasAnyUserGroup } = useAuth();
    const [selectedTab, setSelectedTab] = useState('info');
    const [loading, setLoading] = useState(true);
    const [entity, setEntity] = useState<Entity | null>(null);
    const [donations, setDonations] = useState<EntityDonation[]>([]);
    const [communications, setCommunications] = useState<EntityCommunication[]>([]);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isCreateCommunicationModalOpen, setIsCreateCommunicationModalOpen] = useState(false);
    const [isUpdateCommunicationModalOpen, setIsUpdateCommunicationModalOpen] = useState(false);
    const [selectedCommunicationId, setSelectedCommunicationId] = useState<string>('');
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const isOrgAdmin = hasAnyUserGroup([UserGroup.ORGANIZATION_ADMIN]);

    useEffect(() => {
        const loadEntityData = async () => {
            if (!id) {
                navigate(ROUTES.CRM_ENTITIES);
                return;
            }

            try {
                setLoading(true);
                
                const [entityData, donationsData, communicationsData] = await Promise.all([
                    entityService.getById(id),
                    donationService.getList({ search: '', entityId: id } as any),
                    communicationService.getByEntity(id)
                ]);
                
                setEntity(entityData);
                setDonations(donationsData.results || []);
                setCommunications(communicationsData.results || []);
            } catch (error) {
                showToast.error("Nu s-au putut încărca datele entității");
                navigate(ROUTES.CRM_ENTITIES);
            } finally {
                setLoading(false);
            }
        };

        loadEntityData();
    }, [id, navigate, refreshTrigger]);

    if (!isOrgAdmin) {
        return (
            <Layout>
                <div className="container mx-auto">
                    <div className="text-center py-12">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Acces interzis</h1>
                        <p className="text-gray-600">Nu aveți permisiunea să vizualizați această pagină.</p>
                    </div>
                </div>
            </Layout>
        );
    }

    if (loading) {
        return (
            <Layout>
                <div className="container mx-auto">
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                        <span className="ml-3 text-gray-600">Se încarcă datele entității...</span>
                    </div>
                </div>
            </Layout>
        );
    }

    if (!entity) {
        return (
            <Layout>
                <div className="container mx-auto">
                    <div className="text-center py-12">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Entitatea nu a fost găsită</h1>
                        <p className="text-gray-600">Nu s-au putut încărca datele entității.</p>
                        <SecondaryButton 
                            onClick={() => navigate(ROUTES.CRM_ENTITIES)}
                            className="mt-4"
                        >
                            Înapoi la lista entităților
                        </SecondaryButton>
                    </div>
                </div>
            </Layout>
        );
    }

    const tabs = [
        { id: 'info', name: 'Informații', icon: '📋' },
        { id: 'donations', name: 'Donații', icon: '💰' },
        { id: 'communications', name: 'Comunicări', icon: '💬' },
        { id: 'history', name: 'Istoric', icon: '📜' }
    ];

    const getLegalTypeLabel = (legalType: LegalType): string => {
        const labels = {
            [LegalType.FIZICA]: 'Persoană fizică',
            [LegalType.JURIDICA]: 'Persoană juridică'
        };
        return labels[legalType] || legalType;
    };

    const getEntityTypeLabel = (entityType: EntityType): string => {
        const labels = {
            [EntityType.DONOR]: 'Donator',
            [EntityType.SPONSOR]: 'Sponsor',
            [EntityType.PARTNER]: 'Partener',
            [EntityType.VOLUNTEER]: 'Voluntar',
            [EntityType.BENEFICIARY]: 'Beneficiar',
            [EntityType.OTHER]: 'Altul'
        };
        return labels[entityType] || entityType;
    };

    const getStatusBadge = (status: EntityStatus) => {
        const config = {
            [EntityStatus.ACTIV]: { text: 'Activ', className: 'bg-green-100 text-green-800' },
            [EntityStatus.INACTIV]: { text: 'Inactiv', className: 'bg-gray-100 text-gray-800' },
            [EntityStatus.POTENTIAL]: { text: 'Potențial', className: 'bg-yellow-100 text-yellow-800' },
            [EntityStatus.BLOCAT]: { text: 'Blocat', className: 'bg-red-100 text-red-800' }
        };
        
        const statusConfig = config[status] || { text: status, className: 'bg-gray-100 text-gray-800' };
        
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.className}`}>
                {statusConfig.text}
            </span>
        );
    };

    const getEngagementBadge = (level: EngagementLevel) => {
        const config = {
            [EngagementLevel.DELOC]: { text: 'Deloc', className: 'bg-red-100 text-red-800' },
            [EngagementLevel.PARTIAL]: { text: 'Parțial', className: 'bg-yellow-100 text-yellow-800' },
            [EngagementLevel.TOTAL]: { text: 'Total', className: 'bg-green-100 text-green-800' }
        };
        
        const engagementConfig = config[level] || { text: level, className: 'bg-gray-100 text-gray-800' };
        
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${engagementConfig.className}`}>
                {engagementConfig.text}
            </span>
        );
    };

    const handleDelete = async () => {
        if (!entity?.id || !window.confirm('Sunteți sigur că doriți să ștergeți această entitate?')) {
            return;
        }

        try {
            await entityService.delete(entity.id);
            showToast.success('Entitatea a fost ștearsă cu succes');
            navigate(ROUTES.CRM_ENTITIES);
        } catch (error) {
            showToast.error('Nu s-a putut șterge entitatea');
        }
    };

    const handleUpdateSuccess = () => {
        setRefreshTrigger(prev => prev + 1);
        setIsUpdateModalOpen(false);
    };

    const handleCommunicationCreateSuccess = () => {
        setRefreshTrigger(prev => prev + 1);
        setIsCreateCommunicationModalOpen(false);
    };

    const handleCommunicationUpdateSuccess = () => {
        setRefreshTrigger(prev => prev + 1);
        setIsUpdateCommunicationModalOpen(false);
    };

    const handleEditCommunication = (communicationId: string) => {
        setSelectedCommunicationId(communicationId);
        setIsUpdateCommunicationModalOpen(true);
    };

    const handleDeleteCommunication = async (communicationId: string) => {
        if (!window.confirm('Sunteți sigur că doriți să ștergeți această comunicare?')) {
            return;
        }

        try {
            await communicationService.delete(communicationId);
            showToast.success('Comunicarea a fost ștearsă cu succes');
            setRefreshTrigger(prev => prev + 1);
        } catch (error) {
            showToast.error('Nu s-a putut șterge comunicarea');
        }
    };

    const calculateTotalDonations = (): number => {
        return donations.reduce((total, donation) => total + donation.amount, 0);
    };

    const getCommunicationTypeBadge = (type: CommunicationType) => {
        const config = {
            email: { text: 'Email', className: 'bg-blue-100 text-blue-800' },
            phone: { text: 'Telefon', className: 'bg-green-100 text-green-800' },
            meeting: { text: 'Întâlnire', className: 'bg-purple-100 text-purple-800' },
            letter: { text: 'Scrisoare', className: 'bg-yellow-100 text-yellow-800' },
            newsletter: { text: 'Newsletter', className: 'bg-orange-100 text-orange-800' },
            other: { text: 'Altul', className: 'bg-gray-100 text-gray-800' }
        };
        
        const typeConfig = config[type] || { text: type, className: 'bg-gray-100 text-gray-800' };
        
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeConfig.className}`}>
                {typeConfig.text}
            </span>
        );
    };

    const getCommunicationStatusBadge = (status: CommunicationStatus) => {
        const config = {
            planned: { text: 'Planificat', className: 'bg-yellow-100 text-yellow-800' },
            completed: { text: 'Finalizat', className: 'bg-green-100 text-green-800' },
            cancelled: { text: 'Anulat', className: 'bg-red-100 text-red-800' }
        };
        
        const statusConfig = config[status] || { text: status, className: 'bg-gray-100 text-gray-800' };
        
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.className}`}>
                {statusConfig.text}
            </span>
        );
    };

    const renderInfoTab = () => (
        <div className="space-y-6">
            <Card title="Informații generale" className="p-6">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{entity.name}</h1>
                        <p className="text-gray-600 mt-1">{entity.identificationNumber}</p>
                    </div>
                    <div className="flex gap-2">
                        <PrimaryActionButton
                            onClick={() => setIsUpdateModalOpen(true)}
                            size="sm"
                        >
                            Editează
                        </PrimaryActionButton>
                        <SecondaryButton
                            onClick={handleDelete}
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                        >
                            Șterge
                        </SecondaryButton>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tip legal</label>
                        <p className="text-gray-900">{getLegalTypeLabel(entity.legalType)}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tip entitate</label>
                        <p className="text-gray-900">{getEntityTypeLabel(entity.type)}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        {getStatusBadge(entity.status)}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nivel engagement</label>
                        {entity.engagementLevel ? getEngagementBadge(entity.engagementLevel) : <span className="text-gray-400">Nu este setat</span>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <p className="text-gray-900">{entity.email}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                        <p className="text-gray-900">{entity.phone}</p>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Adresă</label>
                        <p className="text-gray-900">{entity.address}</p>
                        {entity.address2 && (
                            <p className="text-gray-600 mt-1">{entity.address2}</p>
                        )}
                    </div>
                    {entity.observation && (
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Observații</label>
                            <p className="text-gray-900">{entity.observation}</p>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );

    const getDonationColumns = (): TableColumn<EntityDonation>[] => [
        {
            key: 'type',
            label: 'Tip',
            sortable: true,
            filterable: true,
            filterType: 'text',
            render: (type: string) => type
        },
        {
            key: 'scope',
            label: 'Scop',
            sortable: true,
            filterable: true,
            filterType: 'text',
            render: (scope: string) => scope
        },
        {
            key: 'amount',
            label: 'Sumă',
            sortable: true,
            render: (amount: number, row: EntityDonation) => `${amount.toLocaleString()} ${row.currency}`
        },
        {
            key: 'destination',
            label: 'Destinație',
            sortable: false,
            render: (_: any, row: EntityDonation) => row.projectId ? 'Proiect' : (row.activityId ? 'Activitate' : '-')
        },
        {
            key: 'date',
            label: 'Dată',
            sortable: true,
            render: (date: string) => new Date(date).toLocaleDateString('ro-RO')
        }
    ];

    const renderDonationsTab = () => {
        const totalDonations = calculateTotalDonations();

        return (
            <div className="space-y-6">
                <Card title={`Donații (Total: ${totalDonations.toLocaleString()} RON)`} className="p-6">
                    {donations.length > 0 ? (
                        <Table<EntityDonation>
                            data={donations}
                            columns={getDonationColumns()}
                            showSearch={false}
                            showFilters={false}
                            showPagination={false}
                        />
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500">Nu există donații înregistrate pentru această entitate</p>
                        </div>
                    )}
                </Card>
            </div>
        );
    };

    const getCommunicationColumns = (): TableColumn<EntityCommunication>[] => [
        {
            key: 'type',
            label: 'Tip',
            sortable: true,
            filterable: true,
            filterType: 'select',
            filterOptions: [
                { label: 'Email', value: 'email' },
                { label: 'Telefon', value: 'phone' },
                { label: 'Întâlnire', value: 'meeting' },
                { label: 'Scrisoare', value: 'letter' },
                { label: 'Newsletter', value: 'newsletter' },
                { label: 'Altul', value: 'other' }
            ],
            render: (type: CommunicationType) => getCommunicationTypeBadge(type)
        },
        {
            key: 'subject',
            label: 'Subiect',
            sortable: true,
            filterable: true,
            filterType: 'text',
            render: (subject: string) => subject
        },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
            filterable: true,
            filterType: 'select',
            filterOptions: [
                { label: 'Planificat', value: 'planned' },
                { label: 'Finalizat', value: 'completed' },
                { label: 'Anulat', value: 'cancelled' }
            ],
            render: (status: CommunicationStatus) => getCommunicationStatusBadge(status)
        },
        {
            key: 'date',
            label: 'Dată',
            sortable: true,
            render: (date: string) => new Date(date).toLocaleDateString('ro-RO')
        },
        {
            key: 'contactPerson',
            label: 'Contact',
            sortable: true,
            filterable: true,
            filterType: 'text',
            render: (contactPerson: string | null) => contactPerson || '-'
        }
    ];

    const getCommunicationActions = (): TableAction<EntityCommunication>[] => [
        {
            label: 'Edit',
            variant: 'primary',
            onClick: (communication: EntityCommunication) => handleEditCommunication(communication.id),
            icon: <IconEdit />
        },
        {
            label: 'Delete',
            variant: 'danger',
            onClick: (communication: EntityCommunication) => handleDeleteCommunication(communication.id),
            icon: <IconDelete />
        }
    ];

    const renderCommunicationsTab = () => {
        return (
            <div className="space-y-6">
                <Card title="Comunicări" className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">Lista comunicărilor</h3>
                        <PrimaryActionButton
                            onClick={() => setIsCreateCommunicationModalOpen(true)}
                            size="sm"
                        >
                            Adaugă Comunicare
                        </PrimaryActionButton>
                    </div>
                    
                    {communications.length > 0 ? (
                        <Table<EntityCommunication>
                            data={communications}
                            columns={getCommunicationColumns()}
                            actions={getCommunicationActions()}
                            showSearch={false}
                            showFilters={true}
                            showPagination={false}
                        />
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500">Nu există comunicări înregistrate pentru această entitate</p>
                            <PrimaryActionButton
                                onClick={() => setIsCreateCommunicationModalOpen(true)}
                                size="sm"
                                className="mt-2"
                            >
                                Adaugă Prima Comunicare
                            </PrimaryActionButton>
                        </div>
                    )}
                </Card>
            </div>
        );
    };

    const renderHistoryTab = () => (
        <div className="space-y-6">
            <Card title="Istoric activitate" className="p-6">
                <div className="text-center py-8">
                    <p className="text-gray-500">Istoricul activității va fi disponibil în curând</p>
                </div>
            </Card>
        </div>
    );

    const renderTabContent = () => {
        switch (selectedTab) {
            case 'info':
                return renderInfoTab();
            case 'donations':
                return renderDonationsTab();
            case 'communications':
                return renderCommunicationsTab();
            case 'history':
                return renderHistoryTab();
            default:
                return renderInfoTab();
        }
    };

    return (
        <Layout>
            <div className="container mx-auto">
                <div className="mb-6">
                    <div className="flex items-center gap-4 mb-4">
                        <SecondaryButton
                            onClick={() => navigate(ROUTES.CRM_ENTITIES)}
                            size="sm"
                        >
                            ← Înapoi
                        </SecondaryButton>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Detalii entitate: {entity.name}
                        </h1>
                    </div>

                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setSelectedTab(tab.id)}
                                    className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                                        selectedTab === tab.id
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <span>{tab.icon}</span>
                                    {tab.name}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {renderTabContent()}

                {isUpdateModalOpen && entity && (
                    <UpdateEntityModal
                        isOpen={isUpdateModalOpen}
                        onClose={() => setIsUpdateModalOpen(false)}
                        onSuccess={handleUpdateSuccess}
                        entityId={entity.id}
                    />
                )}

                {isCreateCommunicationModalOpen && entity && (
                    <CreateCommunicationModal
                        isOpen={isCreateCommunicationModalOpen}
                        onClose={() => setIsCreateCommunicationModalOpen(false)}
                        onSuccess={handleCommunicationCreateSuccess}
                        entities={[{ value: entity.id, label: entity.name }]}
                        entityId={entity.id}
                    />
                )}

                {isUpdateCommunicationModalOpen && selectedCommunicationId && (
                    <UpdateCommunicationModal
                        isOpen={isUpdateCommunicationModalOpen}
                        onClose={() => setIsUpdateCommunicationModalOpen(false)}
                        onSuccess={handleCommunicationUpdateSuccess}
                        communicationId={selectedCommunicationId}
                        entities={entity ? [{ value: entity.id, label: entity.name }] : []}
                    />
                )}
            </div>
        </Layout>
    );
};

export default EntityDetailPage;