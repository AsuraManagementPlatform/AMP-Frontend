import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/layout/Layout";
import { Card } from "@/components/ui/Card";
import { PrimaryActionButton } from "@/components/ui/PrimaryActionButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import showToast from "@/components/ui/Toast";
import { UserGroup } from "@/types/index.types";
import { Organization } from "@/types/organization.types";
import { UpdateOrganizationData } from "@/schemas/organization.schema";
import { organizationService } from "@/services/organization.service";
import { OrganizationEditForm } from "@/components/forms/OrganizationEditForm";
import { OrganizationDocumentList } from "@/components/tables/OrganizationDocumentList";
import { CreateOrganizationDocumentModal } from "@/components/modals/organization/CreateOrganizationDocumentModal";
import { TeamManagementContent } from "@/components/organization/TeamManagementContent";

const OrganizationDetailsPage: React.FC = () => {
    const { user, hasAnyUserGroup } = useAuth();
    const [editMode, setEditMode] = useState(false);
    const [selectedTab, setSelectedTab] = useState('profile');
    const [loading, setLoading] = useState(true);
    const [organization, setOrganization] = useState<Organization | null>(null);
    const [isCreateDocumentModalOpen, setIsCreateDocumentModalOpen] = useState(false);
    const [documentRefreshTrigger, setDocumentRefreshTrigger] = useState(0);

    const [vatSettings, setVatSettings] = useState({
        standardRate: 19,
        reducedRate: 9,
        superReducedRate: 5
    });

    const [membershipFees, setMembershipFees] = useState({
        employee: 0,
        volunteer: 0,
        member: 50
    });

    const [gracePeriodDays, setGracePeriodDays] = useState(30);

    const isOrgAdmin = hasAnyUserGroup([UserGroup.ORGANIZATION_ADMIN]);

    useEffect(() => {
        const loadOrganizationData = async () => {
            if (!user || !user.organizationId) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const orgData = await organizationService.getById(user.organizationId);
                
                const organization = (orgData as any).organization || orgData;
                setOrganization(organization);
                
                if (organization.membershipFeeEmployee !== undefined) {
                    setMembershipFees({
                        employee: organization.membershipFeeEmployee || 0,
                        volunteer: organization.membershipFeeVolunteer || 0,
                        member: organization.membershipFeeMember || 50
                    });
                }
                
                if (organization.feeGracePeriodDays !== undefined) {
                    setGracePeriodDays(organization.feeGracePeriodDays);
                }
            } catch (error) {
                const errorMenssage = error instanceof Error ? error.message : 'Nu s-au putut încărca datele organizației';
                showToast.error(errorMenssage);
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
        { id: 'documents', name: 'Documente oficiale', icon: '📄' },
        { id: 'financial', name: 'Configurări financiare', icon: '💰' }
    ];

    const handleSave = async (formData: UpdateOrganizationData) => {
        if (!user?.organizationId) {
            showToast.error("Nu aveți o organizație asociată");
            return;
        }

        try {
            const cleanedData = Object.entries(formData).reduce((acc, [key, value]) => {
                if (key === 'employee_count' || key === 'volunteer_count' || key === 'member_count') {
                    return acc;
                }
                if (value !== null && value !== undefined && value !== '') {
                    acc[key] = value;
                }
                return acc;
            }, {} as any);

            if (cleanedData.tax_exempt_status === false && !cleanedData.tax_percentage) {
                cleanedData.tax_percentage = 0.19;
            }

            const updatedOrg = await organizationService.update(user.organizationId, cleanedData);
            
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
                                    <div className="font-medium">{organization?.registrationNumber || '-'}</div>
                                </div>
                                <div>
                                    <span className="text-gray-500">Înființată:</span>
                                    <div className="font-medium">
                                        {organization?.registrationDate ? new Date(organization.registrationDate).toLocaleDateString('ro-RO') : '-'}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-gray-500">Tip:</span>
                                    <div className="font-medium">
                                        {organization?.organizationType === 'NGO' ? 'NGO' :
                                         organization?.organizationType === 'FOUNDATION' ? 'Fundație' :
                                         organization?.organizationType === 'ASSOCIATION' ? 'Asociație' :
                                         organization?.organizationType === 'COMPANY' ? 'Companie' :
                                         organization?.organizationType === 'COOPERATIVE' ? 'Cooperativă' :
                                         organization?.organizationType || '-'}
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
                            <div className="font-medium">{organization?.phoneNumber || '-'}</div>
                        </div>
                        <div>
                            <span className="text-gray-500 text-sm">Telefon secundar:</span>
                            <div className="font-medium">{organization?.secondaryPhone || '-'}</div>
                        </div>
                        <div>
                            <span className="text-gray-500 text-sm">Fax:</span>
                            <div className="font-medium">{organization?.faxNumber || '-'}</div>
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
                                <div className="font-medium">{organization?.registrationNumber || '-'}</div>
                            </div>
                            <div>
                                <span className="text-gray-500 text-sm">Data înregistrării:</span>
                                <div className="font-medium">
                                    {organization?.registrationDate ? new Date(organization.registrationDate).toLocaleDateString('ro-RO') : '-'}
                                </div>
                            </div>
                            <div>
                                <span className="text-gray-500 text-sm">Scutit de taxe:</span>
                                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                                    organization?.taxExemptStatus ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                    {organization?.taxExemptStatus ? 'Da' : 'Nu'}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-500 text-sm">Verificat:</span>
                                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                                    organization?.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {organization?.isVerified ? 'Da' : 'Nu'}
                                </span>
                            </div>
                        </div>
                    </Card>

                    <Card title="Statistici organizație">
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-gray-500 text-sm">Total membri:</span>
                                <span className="font-bold text-blue-600">{organization?.memberStatistics?.totalPeople || organization?.memberCount || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500 text-sm">Angajați:</span>
                                <span className="font-bold text-green-600">{organization?.memberStatistics?.employeeCount || organization?.employeeCount || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500 text-sm">Voluntari:</span>
                                <span className="font-bold text-orange-600">{organization?.memberStatistics?.volunteerCount || organization?.volunteerCount || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500 text-sm">Membri (exclusiv angajați/voluntari):</span>
                                <span className="font-bold text-indigo-600">{organization?.memberStatistics?.memberCount || 0}</span>
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
                            <div className="font-medium">{organization?.industrySector || '-'}</div>
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
                            <div className="font-medium">{organization?.postalCode || '-'}</div>
                        </div>
                    </div>
                </Card>
            </div>
        );
    };

    const renderTeamContent = () => {
        if (!organization) return null;
        
        return <TeamManagementContent organizationId={organization.id} />;
    };

    const renderDocumentsContent = () => {
        const handleDocumentSuccess = () => {
            setDocumentRefreshTrigger(prev => prev + 1);
        };

        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Documente oficiale</h3>
                    <PrimaryActionButton variant="create" onClick={() => setIsCreateDocumentModalOpen(true)}>
                        Încarcă document
                    </PrimaryActionButton>
                </div>
                <Card>
                    <OrganizationDocumentList 
                        organization={organization!.id} 
                        refreshTrigger={documentRefreshTrigger}
                        pageSize={10}
                    />
                </Card>

                <CreateOrganizationDocumentModal
                    isOpen={isCreateDocumentModalOpen}
                    onClose={() => setIsCreateDocumentModalOpen(false)}
                    onSuccess={handleDocumentSuccess}
                    organization={organization!.id}
                />
            </div>
        );
    };

    const handleVatSave = async () => {
        if (!organization) return;
        
        try {
            await organizationService.update(organization.id, {
                taxExemptStatus: false
            });
            showToast.success("Configurările TVA au fost salvate");
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Eroare la salvarea configurărilor TVA'
            showToast.error(errorMessage);
        }
    };

    const handleMembershipFeesSave = async () => {
        if (!organization) return;
        
        try {
            await organizationService.update(organization.id, {
                membershipFeeEmployee: membershipFees.employee,
                membershipFeeVolunteer: membershipFees.volunteer,
                membershipFeeMember: membershipFees.member,
                feeGracePeriodDays: gracePeriodDays
            });
            showToast.success("Cotizațiile membrilor au fost salvate");
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Eroare la salvarea cotizațiilor'
            showToast.error(errorMessage);
        }
    };

    const renderFinancialContent = () => {
        return (
            <div className="space-y-6">
                <Card title="Configurări TVA România">
                    <div className="space-y-6">
                        <p className="text-sm text-gray-600 mb-4">
                            Configurează cotele TVA conform legislației române. Valorile implicite sunt setate conform normelor actuale.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    TVA Standard (%)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    value={vatSettings.standardRate}
                                    onChange={(e) => setVatSettings({...vatSettings, standardRate: parseFloat(e.target.value)})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Produse și servicii standard
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    TVA Redus (%)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    value={vatSettings.reducedRate}
                                    onChange={(e) => setVatSettings({...vatSettings, reducedRate: parseFloat(e.target.value)})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Alimente, medicamente, cărți, cazare
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    TVA Super-Redus (%)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    value={vatSettings.superReducedRate}
                                    onChange={(e) => setVatSettings({...vatSettings, superReducedRate: parseFloat(e.target.value)})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Locuințe sociale, manuale școlare
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <PrimaryActionButton onClick={handleVatSave}>
                                Salvează configurări TVA
                            </PrimaryActionButton>
                        </div>
                    </div>
                </Card>

                <Card title="Cotizații Membri Organizație">
                    <div className="space-y-6">
                        <p className="text-sm text-gray-600 mb-4">
                            Configurează cotizațiile anuale pentru fiecare tip de utilizator din organizație. Aceste valori vor fi folosite pentru facturare și raportare.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <label className="block text-sm font-medium text-blue-900 mb-2">
                                    💼 Angajat
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={membershipFees.employee}
                                        onChange={(e) => setMembershipFees({...membershipFees, employee: parseFloat(e.target.value)})}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <span className="text-gray-700 font-medium">RON/an</span>
                                </div>
                                <p className="text-xs text-gray-600 mt-2">
                                    Cotizație pentru angajații organizației
                                </p>
                            </div>

                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <label className="block text-sm font-medium text-green-900 mb-2">
                                    🤝 Voluntar
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={membershipFees.volunteer}
                                        onChange={(e) => setMembershipFees({...membershipFees, volunteer: parseFloat(e.target.value)})}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                    <span className="text-gray-700 font-medium">RON/an</span>
                                </div>
                                <p className="text-xs text-gray-600 mt-2">
                                    Cotizație pentru voluntarii organizației
                                </p>
                            </div>

                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                <label className="block text-sm font-medium text-purple-900 mb-2">
                                    👥 Membru
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={membershipFees.member}
                                        onChange={(e) => setMembershipFees({...membershipFees, member: parseFloat(e.target.value)})}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                    <span className="text-gray-700 font-medium">RON/an</span>
                                </div>
                                <p className="text-xs text-gray-600 mt-2">
                                    Cotizație pentru membrii organizației
                                </p>
                            </div>
                        </div>

                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                            <label className="block text-sm font-medium text-orange-900 mb-2">
                                ⏰ Perioadă de grație pentru cotizații restante
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min="0"
                                    max="365"
                                    step="1"
                                    value={gracePeriodDays}
                                    onChange={(e) => setGracePeriodDays(parseInt(e.target.value))}
                                    className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                                <span className="text-gray-700 font-medium">zile</span>
                            </div>
                            <p className="text-xs text-gray-600 mt-2">
                                Numărul de zile după care contul unui membru cu cotizație neplătită va fi dezactivat automat. Valoarea implicită este 30 zile.
                            </p>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <h4 className="font-semibold text-yellow-900 mb-3">📊 Estimare venituri anuale din cotizații</h4>
                            <p className="text-sm text-gray-600 mb-4">
                                Exemplu de calcul bazat pe 20 angajați, 15 voluntari și 30 membri:
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-600">20 angajați × {membershipFees.employee} RON:</p>
                                    <p className="font-semibold text-blue-900">{(membershipFees.employee * 20).toFixed(2)} RON</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">15 voluntari × {membershipFees.volunteer} RON:</p>
                                    <p className="font-semibold text-green-900">{(membershipFees.volunteer * 15).toFixed(2)} RON</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">30 membri × {membershipFees.member} RON:</p>
                                    <p className="font-semibold text-purple-900">{(membershipFees.member * 30).toFixed(2)} RON</p>
                                </div>
                                <div>
                                    <p className="text-gray-600 font-semibold">Total estimat anual:</p>
                                    <p className="text-lg font-bold text-yellow-900">
                                        {(
                                            membershipFees.employee * 20 + 
                                            membershipFees.volunteer * 15 + 
                                            membershipFees.member * 30
                                        ).toFixed(2)} RON
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <PrimaryActionButton onClick={handleMembershipFeesSave}>
                                Confirmă configurări
                            </PrimaryActionButton>
                        </div>
                    </div>
                </Card>

                <Card title="Informații suplimentare">
                    <div className="space-y-4 text-sm text-gray-600">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h5 className="font-semibold text-gray-900 mb-2">Note importante:</h5>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Tipurile de utilizatori corespund exact categoriilor din sistem: Angajat, Voluntar, Membru</li>
                                <li>Cotizațiile sunt anuale și se percep de la data aderării</li>
                                <li>Puteți seta cotizația la 0 RON pentru utilizatorii care nu plătesc cotizație</li>
                                <li>De obicei, angajații nu plătesc cotizație (0 RON)</li>
                                <li>Voluntarii pot avea cotizație zero sau redusă</li>
                                <li>Membrii standard plătesc cotizație de membru</li>
                                <li>Conturile cu cotizații restante vor fi dezactivate automat după perioada de grație configurată</li>
                                <li>Reactivarea conturilor necesită plata cotizației restante și aprobarea administratorului organizației</li>
                                <li>TVA standard (19%) se aplică pentru majoritatea serviciilor organizației</li>
                                <li>TVA redus (9%) pentru activități educaționale și culturale</li>
                            </ul>
                        </div>
                    </div>
                </Card>
            </div>
        );
    };

    const renderTabContent = () => {
        switch (selectedTab) {
            case 'profile':
                return renderProfileContent();
            case 'team':
                return renderTeamContent();
            case 'documents':
                return renderDocumentsContent();
            case 'financial':
                return renderFinancialContent();
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
