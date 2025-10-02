import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/layout/Layout";
import { Card } from "@/components/ui/Card";
import { PrimaryActionButton } from "@/components/ui/PrimaryActionButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import showToast from "@/components/ui/Toast";
import Calendar from "@/components/calendar/Calendar";
import { UserGroup } from "@/types/index.types";
import { Organization } from "@/types/organization.types";
import { UpdateOrganizationData } from "@/schemas/organization.schema";
import { organizationService } from "@/services/organization.service";
import { OrganizationEditForm } from "@/components/forms/OrganizationEditForm";

const OrganizationDetailsPage: React.FC = () => {
    const { user, hasAnyUserGroup } = useAuth();
    const [editMode, setEditMode] = useState(false);
    const [selectedTab, setSelectedTab] = useState('profile');
    const [loading, setLoading] = useState(true);
    const [organization, setOrganization] = useState<Organization | null>(null);

    const isOrgAdmin = hasAnyUserGroup([UserGroup.ORGANIZATION_ADMIN]);

    useEffect(() => {
        const loadOrganizationData = async () => {
            if (!user || !user.organization_id) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const orgData = await organizationService.getById(user.organization_id);
                
                const organization = (orgData as any).organization || orgData;
                setOrganization(organization);
            } catch (error) {
                showToast.error("Nu s-au putut încărca datele organizației");
            } finally {
                setLoading(false);
            }
        };

        if (user !== undefined) {
            loadOrganizationData();
        }
    }, [user]);

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
                        <span className="ml-3 text-gray-600">Se încarcă datele organizației...</span>
                    </div>
                </div>
            </Layout>
        );
    }

    if (!organization) {
        return (
            <Layout>
                <div className="container mx-auto">
                    <div className="text-center py-12">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Organizația nu a fost găsită</h1>
                        <p className="text-gray-600">Nu s-au putut încărca datele organizației.</p>
                    </div>
                </div>
            </Layout>
        );
    }

    const tabs = [
        { id: 'profile', name: 'Profil organizațional', icon: '🏢' },
        { id: 'team', name: 'Management echipă', icon: '👥' },
        { id: 'calendar', name: 'Calendar și întâlniri', icon: '📅' },
        { id: 'documents', name: 'Documente oficiale', icon: '📄' },
        { id: 'financial', name: 'Configurări financiare', icon: '💰' },
        { id: 'audit', name: 'Audit și istoric', icon: '📋' }
    ];

    const handleSave = async (formData: UpdateOrganizationData) => {
        if (!user?.organization_id) {
            showToast.error("Nu aveți o organizație asociată");
            return;
        }

        try {
            const updatedOrg = await organizationService.update(user.organization_id, formData);
            
            const orgToSet = (updatedOrg as any).organization || updatedOrg;
            
            setOrganization(orgToSet);
            
            setTimeout(() => {
                window.location.reload();
            }, 500);
            
            setEditMode(false);
            showToast.success("Modificările au fost salvate cu succes!");
        } catch (error) {
            
            if (error && typeof error === 'object' && 'response' in error) {
                const apiError = error as any;
                if (apiError.response?.status === 400) {
                    showToast.error("Datele introduse nu sunt valide. Verificați câmpurile obligatorii.");
                } else if (apiError.response?.status === 403) {
                    showToast.error("Nu aveți permisiunea să modificați această organizație.");
                } else if (apiError.response?.status === 404) {
                    showToast.error("Organizația nu a fost găsită.");
                } else {
                    showToast.error("A apărut o eroare la salvare. Încercați din nou.");
                }
            } else {
                showToast.error("A apărut o eroare la salvare. Încercați din nou.");
            }
            throw error;
        }
    };

    const renderProfileContent = () => {
        if (editMode && organization) {
            return (
                <OrganizationEditForm
                    organization={organization}
                    onSave={handleSave}
                    onCancel={() => setEditMode(false)}
                />
            );
        }
        
        return (
            <div className="space-y-6">
                <Card>
                    <div className="flex items-start gap-6">
                        <div className="flex-shrink-0">
                            <div className="w-20 h-20 bg-blue-500 text-white rounded-lg flex items-center justify-center text-2xl font-bold">
                                {organization?.name?.split(' ').map(word => word[0]).join('').toUpperCase() || '?'}
                            </div>
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">{organization?.name || 'Nume organizație'}</h2>
                            
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-500">CUI:</span>
                                    <div className="font-medium">{organization?.cui || '-'}</div>
                                </div>
                                <div>
                                    <span className="text-gray-500">Nr. înregistrare:</span>
                                    <div className="font-medium">{organization?.registration_number || '-'}</div>
                                </div>
                                <div>
                                    <span className="text-gray-500">Înființată:</span>
                                    <div className="font-medium">
                                        {organization?.registration_date ? new Date(organization.registration_date).toLocaleDateString('ro-RO') : '-'}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-gray-500">Tip:</span>
                                    <div className="font-medium">
                                        {organization?.organization_type === 'NGO' ? 'NGO' :
                                         organization?.organization_type === 'FOUNDATION' ? 'Fundație' :
                                         organization?.organization_type === 'ASSOCIATION' ? 'Asociație' :
                                         organization?.organization_type === 'COMPANY' ? 'Companie' :
                                         organization?.organization_type === 'COOPERATIVE' ? 'Cooperativă' :
                                         organization?.organization_type || '-'}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-gray-500">Status:</span>
                                    <div className="font-medium text-green-600">
                                        {organization?.status === 'active' ? 'Active' : 
                                         organization?.status === 'inactive' ? 'Inactive' : 
                                         organization?.status === 'pending' ? 'Pending' : organization?.status || '-'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card title="Informații de contact">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <span className="text-gray-500 text-sm">Email:</span>
                            <div className="font-medium">{organization?.email || '-'}</div>
                        </div>
                        <div>
                            <span className="text-gray-500 text-sm">Telefon principal:</span>
                            <div className="font-medium">{organization?.phone_number || '-'}</div>
                        </div>
                        <div>
                            <span className="text-gray-500 text-sm">Telefon secundar:</span>
                            <div className="font-medium">{organization?.secondary_phone || '-'}</div>
                        </div>
                        <div>
                            <span className="text-gray-500 text-sm">Fax:</span>
                            <div className="font-medium">{organization?.fax_number || '-'}</div>
                        </div>
                        <div>
                            <span className="text-gray-500 text-sm">Website:</span>
                            <div className="font-medium">
                                {organization?.website ? (
                                    <a href={organization.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                        {organization.website}
                                    </a>
                                ) : '-'}
                            </div>
                        </div>
                        <div>
                            <span className="text-gray-500 text-sm">Adresă principală:</span>
                            <div className="font-medium">{organization?.address || '-'}</div>
                        </div>
                        {organization?.address2 && (
                            <div>
                                <span className="text-gray-500 text-sm">Adresă secundară:</span>
                                <div className="font-medium">{organization.address2}</div>
                            </div>
                        )}
                    </div>
                </Card>

                <Card title="Despre organizație">
                    <div>
                        <span className="text-gray-500 text-sm">Misiune și descriere:</span>
                        <div className="font-medium mt-1">{organization?.description || '-'}</div>
                    </div>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card title="Conformitate românească">
                        <div className="space-y-4">
                            <div>
                                <span className="text-gray-500 text-sm">CUI:</span>
                                <div className="font-medium">{organization?.cui || '-'}</div>
                            </div>
                            <div>
                                <span className="text-gray-500 text-sm">Nr. înregistrare:</span>
                                <div className="font-medium">{organization?.registration_number || '-'}</div>
                            </div>
                            <div>
                                <span className="text-gray-500 text-sm">Data înregistrării:</span>
                                <div className="font-medium">
                                    {organization?.registration_date ? new Date(organization.registration_date).toLocaleDateString('ro-RO') : '-'}
                                </div>
                            </div>
                            <div>
                                <span className="text-gray-500 text-sm">Scutit de taxe:</span>
                                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                                    organization?.tax_exempt_status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                    {organization?.tax_exempt_status ? 'Da' : 'Nu'}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-500 text-sm">Verificat:</span>
                                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                                    organization?.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {organization?.is_verified ? 'Da' : 'Nu'}
                                </span>
                            </div>
                        </div>
                    </Card>

                    <Card title="Statistici organizație">
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-gray-500 text-sm">Membri:</span>
                                <span className="font-bold text-blue-600">{organization?.member_count || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500 text-sm">Angajați:</span>
                                <span className="font-bold text-green-600">{organization?.employee_count || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500 text-sm">Voluntari:</span>
                                <span className="font-bold text-orange-600">{organization?.volunteer_count || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500 text-sm">Buget anual:</span>
                                <span className="font-bold text-purple-600">
                                    {organization?.budget ? `${organization.budget.toLocaleString('ro-RO')} RON` : '-'}
                                </span>
                            </div>
                        </div>
                    </Card>
                </div>

                <Card title="Informații administrative">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <span className="text-gray-500 text-sm">Sector de activitate:</span>
                            <div className="font-medium">{organization?.industry_sector || '-'}</div>
                        </div>
                        <div>
                            <span className="text-gray-500 text-sm">Țară:</span>
                            <div className="font-medium">{organization?.country || 'Romania'}</div>
                        </div>
                        <div>
                            <span className="text-gray-500 text-sm">Oraș:</span>
                            <div className="font-medium">{organization?.city || '-'}</div>
                        </div>
                        <div>
                            <span className="text-gray-500 text-sm">Județ:</span>
                            <div className="font-medium">{organization?.county || '-'}</div>
                        </div>
                        <div>
                            <span className="text-gray-500 text-sm">Cod poștal:</span>
                            <div className="font-medium">{organization?.postal_code || '-'}</div>
                        </div>
                    </div>
                </Card>
            </div>
        );
    };

    const renderTeamContent = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Membri organizație</h3>
                <PrimaryActionButton variant="create" onClick={() => showToast.info("Funcționalitate în dezvoltare")}>
                    Adaugă membru
                </PrimaryActionButton>
            </div>
            <Card>
                <div className="text-center py-8 text-gray-500">
                    <p>Managementul echipei va fi implementat în versiunea următoare.</p>
                </div>
            </Card>
        </div>
    );

    const renderCalendarContent = () => {
        const sampleEvents = [
            {
                id: '1',
                title: 'Adunarea generală',
                date: new Date(2025, 9, 15),
                type: 'meeting' as const,
                time: '10:00',
                description: 'Adunarea generală anuală a organizației'
            },
            {
                id: '2',
                title: 'Vot buget 2026',
                date: new Date(2025, 9, 22),
                type: 'voting' as const,
                time: '14:00',
                description: 'Votarea bugetului pentru anul 2026'
            },
            {
                id: '3',
                title: 'Eveniment strângere fonduri',
                date: new Date(2025, 9, 30),
                type: 'event' as const,
                time: '18:00',
                description: 'Eveniment pentru strângerea de fonduri'
            }
        ];

        const handleEventClick = (event: any) => {
            showToast.info(`Eveniment: ${event.title} - ${event.time || 'Oră nedefinită'}`);
        };

        const handleDateClick = (date: Date) => {
            showToast.info(`Ați selectat data: ${date.toLocaleDateString('ro-RO')}`);
        };

        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-semibold">Calendar organizație</h3>
                        <p className="text-sm text-gray-600">Programează întâlniri, voturi și evenimente</p>
                    </div>
                    <div className="flex space-x-3">
                        <SecondaryButton onClick={() => showToast.info("Funcționalitate în dezvoltare")}>
                            Adaugă eveniment
                        </SecondaryButton>
                        <PrimaryActionButton variant="create" onClick={() => showToast.info("Funcționalitate în dezvoltare")}>
                            Programează vot
                        </PrimaryActionButton>
                    </div>
                </div>
                
                <Calendar 
                    events={sampleEvents}
                    onEventClick={handleEventClick}
                    onDateClick={handleDateClick}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card title="Evenimente următoare">
                        <div className="space-y-3">
                            {sampleEvents.slice(0, 3).map((event) => (
                                <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <div className="font-medium">{event.title}</div>
                                        <div className="text-sm text-gray-600">
                                            {event.date.toLocaleDateString('ro-RO')} {event.time && `• ${event.time}`}
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 text-xs rounded ${
                                        event.type === 'voting' 
                                            ? 'bg-red-100 text-red-800'
                                            : event.type === 'meeting'
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-green-100 text-green-800'
                                    }`}>
                                        {event.type === 'voting' ? 'Vot' : event.type === 'meeting' ? 'Întâlnire' : 'Eveniment'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card title="Acțiuni rapide">
                        <div className="space-y-3">
                            <button 
                                onClick={() => showToast.info("Funcționalitate în dezvoltare")}
                                className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                            >
                                <div className="font-medium text-blue-900">📋 Programează adunare generală</div>
                                <div className="text-sm text-blue-700">Organizează o întâlnire oficială</div>
                            </button>
                            <button 
                                onClick={() => showToast.info("Funcționalitate în dezvoltare")}
                                className="w-full text-left p-3 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                            >
                                <div className="font-medium text-red-900">🗳️ Inițiază procedură de vot</div>
                                <div className="text-sm text-red-700">Creează o sesiune de votare</div>
                            </button>
                            <button 
                                onClick={() => showToast.info("Funcționalitate în dezvoltare")}
                                className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                            >
                                <div className="font-medium text-green-900">🎉 Adaugă eveniment</div>
                                <div className="text-sm text-green-700">Programează un eveniment social</div>
                            </button>
                        </div>
                    </Card>
                </div>
            </div>
        );
    };

    const renderDocumentsContent = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Documente oficiale</h3>
                <PrimaryActionButton variant="create" onClick={() => showToast.info("Funcționalitate în dezvoltare")}>
                    Încarcă document
                </PrimaryActionButton>
            </div>
            <Card>
                <div className="text-center py-8 text-gray-500">
                    <p>Managementul documentelor va fi implementat în versiunea următoare.</p>
                </div>
            </Card>
        </div>
    );

    const renderFinancialContent = () => (
        <div className="space-y-6">
            <Card title="Configurări financiare">
                <div className="text-center py-8 text-gray-500">
                    <p>Configurările financiare vor fi implementate în versiunea următoare.</p>
                </div>
            </Card>
        </div>
    );

    const renderAuditContent = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Istoric activități</h3>
                <SecondaryButton variant="outline" onClick={() => showToast.info("Funcționalitate în dezvoltare")}>
                    Export raport audit
                </SecondaryButton>
            </div>
            <Card>
                <div className="text-center py-8 text-gray-500">
                    <p>Auditul și istoricul vor fi implementate în versiunea următoare.</p>
                </div>
            </Card>
        </div>
    );

    const renderTabContent = () => {
        switch (selectedTab) {
            case 'profile':
                return renderProfileContent();
            case 'team':
                return renderTeamContent();
            case 'calendar':
                return renderCalendarContent();
            case 'documents':
                return renderDocumentsContent();
            case 'financial':
                return renderFinancialContent();
            case 'audit':
                return renderAuditContent();
            default:
                return renderProfileContent();
        }
    };

    return (
        <Layout showNavigation={true}>
            <div className="container mx-auto">
                <div className="mb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">Detalii organizație</h1>
                            <p className="text-gray-600">Gestionează informațiile și setările organizației tale</p>
                        </div>
                        <div className="flex gap-3">
                            {editMode ? (
                                <>
                                    <SecondaryButton onClick={() => setEditMode(false)}>
                                        Anulează
                                    </SecondaryButton>
                                </>
                            ) : (
                                <PrimaryActionButton variant="action" onClick={() => setEditMode(true)}>
                                    Editează
                                </PrimaryActionButton>
                            )}
                        </div>
                    </div>
                </div>

                <div className="border-b border-gray-200 mb-6">
                    <nav className="-mb-px flex space-x-8">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setSelectedTab(tab.id)}
                                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                                    selectedTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <span className="mr-2">{tab.icon}</span>
                                {tab.name}
                            </button>
                        ))}
                    </nav>
                </div>

                {renderTabContent()}
            </div>
        </Layout>
    );
};

export default OrganizationDetailsPage;
