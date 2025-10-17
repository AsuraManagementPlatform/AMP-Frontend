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

const OrganizationDetailsPage: React.FC = () => {
    const { user, hasAnyUserGroup } = useAuth();
    const [editMode, setEditMode] = useState(false);
    const [selectedTab, setSelectedTab] = useState('profile');
    const [loading, setLoading] = useState(true);
    const [organization, setOrganization] = useState<Organization | null>(null);
    
    const [teamSearchTerm, setTeamSearchTerm] = useState('');
    const [teamFilterType, setTeamFilterType] = useState<string>('all');
    const [teamFilterStatus, setTeamFilterStatus] = useState<string>('all');
    
    const [docsSearchTerm, setDocsSearchTerm] = useState('');
    const [docsFilterCategory, setDocsFilterCategory] = useState<string>('all');
    
    const [financialEditMode, setFinancialEditMode] = useState(false);

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
                                <span className="text-gray-500 text-sm">Total membri:</span>
                                <span className="font-bold text-blue-600">{organization?.member_statistics?.total_people || organization?.member_count || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500 text-sm">Angajați:</span>
                                <span className="font-bold text-green-600">{organization?.member_statistics?.employee_count || organization?.employee_count || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500 text-sm">Voluntari:</span>
                                <span className="font-bold text-orange-600">{organization?.member_statistics?.volunteer_count || organization?.volunteer_count || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500 text-sm">Membri (exclusiv angajați/voluntari):</span>
                                <span className="font-bold text-indigo-600">{organization?.member_statistics?.member_count || 0}</span>
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

    const renderTeamContent = () => {
        const mockMembers = [
            {
                id: '1',
                name: 'Ion Popescu',
                email: 'ion.popescu@example.com',
                phone: '0721234567',
                type: 'Angajat',
                role: 'Coordonator Proiect',
                status: 'Activ',
                joinDate: '2023-01-15',
                skills: 'Management, Comunicare',
                availability: '40 ore/săptămână'
            },
            {
                id: '2',
                name: 'Maria Ionescu',
                email: 'maria.ionescu@example.com',
                phone: '0731234567',
                type: 'Voluntar',
                role: 'Formator',
                status: 'Activ',
                joinDate: '2023-06-20',
                skills: 'Educație, Training',
                availability: '10 ore/săptămână'
            },
            {
                id: '3',
                name: 'Andrei Popa',
                email: 'andrei.popa@example.com',
                phone: '0741234567',
                type: 'Membru Cotizant',
                role: 'Membru',
                status: 'Activ',
                joinDate: '2022-03-10',
                skills: 'Contabilitate',
                availability: 'Disponibil pentru evenimente'
            },
            {
                id: '4',
                name: 'Elena Dumitrescu',
                email: 'elena.d@example.com',
                phone: '0751234567',
                type: 'Voluntar',
                role: 'Designer',
                status: 'Inactiv',
                joinDate: '2024-01-05',
                skills: 'Graphic Design, Social Media',
                availability: '5 ore/săptămână'
            }
        ];

        const getTypeColor = (type: string) => {
            const colors = {
                'Angajat': 'bg-blue-100 text-blue-800',
                'Voluntar': 'bg-green-100 text-green-800',
                'Membru Cotizant': 'bg-purple-100 text-purple-800'
            };
            return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
        };

        const getStatusColor = (status: string) => {
            return status === 'Activ' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800';
        };

        const filteredMembers = mockMembers.filter(member => {
            const matchesSearch = member.name.toLowerCase().includes(teamSearchTerm.toLowerCase()) ||
                                member.email.toLowerCase().includes(teamSearchTerm.toLowerCase()) ||
                                member.role.toLowerCase().includes(teamSearchTerm.toLowerCase());
            const matchesType = teamFilterType === 'all' || member.type === teamFilterType;
            const matchesStatus = teamFilterStatus === 'all' || member.status === teamFilterStatus;
            
            return matchesSearch && matchesType && matchesStatus;
        });

        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-semibold">Management echipă</h3>
                        <p className="text-sm text-gray-600">Gestionează membrii, voluntarii și angajații organizației</p>
                    </div>
                    <PrimaryActionButton variant="create" onClick={() => showToast.info("Funcționalitate în dezvoltare")}>
                        + Adaugă membru
                    </PrimaryActionButton>
                </div>

                <Card>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-600">Total Membri</div>
                            <div className="text-2xl font-bold text-blue-600">{mockMembers.length}</div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-600">Voluntari</div>
                            <div className="text-2xl font-bold text-green-600">
                                {mockMembers.filter(m => m.type === 'Voluntar').length}
                            </div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-600">Angajați</div>
                            <div className="text-2xl font-bold text-purple-600">
                                {mockMembers.filter(m => m.type === 'Angajat').length}
                            </div>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-600">Cotizanți</div>
                            <div className="text-2xl font-bold text-orange-600">
                                {mockMembers.filter(m => m.type === 'Membru Cotizant').length}
                            </div>
                        </div>
                    </div>

                    <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input
                            type="text"
                            placeholder="Caută după nume, email sau rol..."
                            value={teamSearchTerm}
                            onChange={(e) => setTeamSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                        <select
                            value={teamFilterType}
                            onChange={(e) => setTeamFilterType(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        >
                            <option value="all">Toate tipurile</option>
                            <option value="Angajat">Angajați</option>
                            <option value="Voluntar">Voluntari</option>
                            <option value="Membru Cotizant">Membri Cotizanți</option>
                        </select>
                        <select
                            value={teamFilterStatus}
                            onChange={(e) => setTeamFilterStatus(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        >
                            <option value="all">Toate statusurile</option>
                            <option value="Activ">Activ</option>
                            <option value="Inactiv">Inactiv</option>
                        </select>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nume</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tip</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data Aderării</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acțiuni</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredMembers.map((member) => (
                                    <tr key={member.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-gray-900">{member.name}</div>
                                            <div className="text-sm text-gray-500">{member.skills}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{member.email}</div>
                                            <div className="text-sm text-gray-500">{member.phone}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(member.type)}`}>
                                                {member.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {member.role}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(member.status)}`}>
                                                {member.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(member.joinDate).toLocaleDateString('ro-RO')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <button
                                                onClick={() => showToast.info("Funcționalitate în dezvoltare")}
                                                className="text-blue-600 hover:text-blue-800 mr-3"
                                            >
                                                Detalii
                                            </button>
                                            <button
                                                onClick={() => showToast.info("Funcționalitate în dezvoltare")}
                                                className="text-orange-600 hover:text-orange-800"
                                            >
                                                Editează
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredMembers.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            Nu au fost găsiți membri care să corespundă filtrelor selectate.
                        </div>
                    )}
                </Card>
            </div>
        );
    };

    const renderDocumentsContent = () => {
        const mockDocuments = [
            {
                id: '1',
                name: 'Statut organizație',
                category: 'Legal',
                uploadDate: '2023-01-10',
                fileSize: '2.5 MB',
                uploadedBy: 'Admin Organizație',
                status: 'Aprobat'
            },
            {
                id: '2',
                name: 'Certificat de înregistrare',
                category: 'Legal',
                uploadDate: '2023-01-10',
                fileSize: '1.2 MB',
                uploadedBy: 'Admin Organizație',
                status: 'Aprobat'
            },
            {
                id: '3',
                name: 'Raport financiar 2024',
                category: 'Financiar',
                uploadDate: '2024-12-15',
                fileSize: '3.8 MB',
                uploadedBy: 'Contabil Șef',
                status: 'Aprobat'
            },
            {
                id: '4',
                name: 'Proces verbal adunare generală',
                category: 'Administrativ',
                uploadDate: '2025-01-05',
                fileSize: '1.5 MB',
                uploadedBy: 'Secretar',
                status: 'În Revizuire'
            },
            {
                id: '5',
                name: 'Contract colaborare partener',
                category: 'Contracte',
                uploadDate: '2025-01-12',
                fileSize: '0.8 MB',
                uploadedBy: 'Coordonator Proiect',
                status: 'Aprobat'
            }
        ];

        const getCategoryColor = (category: string) => {
            const colors = {
                'Legal': 'bg-red-100 text-red-800',
                'Financiar': 'bg-green-100 text-green-800',
                'Administrativ': 'bg-blue-100 text-blue-800',
                'Contracte': 'bg-purple-100 text-purple-800'
            };
            return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
        };

        const getStatusColor = (status: string) => {
            const colors = {
                'Aprobat': 'bg-green-100 text-green-800',
                'În Revizuire': 'bg-yellow-100 text-yellow-800',
                'Respins': 'bg-red-100 text-red-800'
            };
            return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
        };

        const filteredDocuments = mockDocuments.filter(doc => {
            const matchesSearch = doc.name.toLowerCase().includes(docsSearchTerm.toLowerCase()) ||
                                doc.uploadedBy.toLowerCase().includes(docsSearchTerm.toLowerCase());
            const matchesCategory = docsFilterCategory === 'all' || doc.category === docsFilterCategory;
            
            return matchesSearch && matchesCategory;
        });

        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-semibold">Documente oficiale</h3>
                        <p className="text-sm text-gray-600">Gestionează documentele legale, financiare și administrative</p>
                    </div>
                    <PrimaryActionButton variant="create" onClick={() => showToast.info("Funcționalitate în dezvoltare")}>
                        📎 Încarcă document
                    </PrimaryActionButton>
                </div>

                <Card>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-red-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-600">Documente Legale</div>
                            <div className="text-2xl font-bold text-red-600">
                                {mockDocuments.filter(d => d.category === 'Legal').length}
                            </div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-600">Documente Financiare</div>
                            <div className="text-2xl font-bold text-green-600">
                                {mockDocuments.filter(d => d.category === 'Financiar').length}
                            </div>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-600">Administrative</div>
                            <div className="text-2xl font-bold text-blue-600">
                                {mockDocuments.filter(d => d.category === 'Administrativ').length}
                            </div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-600">Contracte</div>
                            <div className="text-2xl font-bold text-purple-600">
                                {mockDocuments.filter(d => d.category === 'Contracte').length}
                            </div>
                        </div>
                    </div>

                    <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Caută după nume document sau autor..."
                            value={docsSearchTerm}
                            onChange={(e) => setDocsSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                        <select
                            value={docsFilterCategory}
                            onChange={(e) => setDocsFilterCategory(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        >
                            <option value="all">Toate categoriile</option>
                            <option value="Legal">Legal</option>
                            <option value="Financiar">Financiar</option>
                            <option value="Administrativ">Administrativ</option>
                            <option value="Contracte">Contracte</option>
                        </select>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Document</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categorie</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data Încărcare</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Încărcat de</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acțiuni</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredDocuments.map((doc) => (
                                    <tr key={doc.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <span className="text-2xl mr-3">📄</span>
                                                <div>
                                                    <div className="font-medium text-gray-900">{doc.name}</div>
                                                    <div className="text-sm text-gray-500">{doc.fileSize}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(doc.category)}`}>
                                                {doc.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(doc.uploadDate).toLocaleDateString('ro-RO')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {doc.uploadedBy}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(doc.status)}`}>
                                                {doc.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <button
                                                onClick={() => showToast.info("Funcționalitate în dezvoltare")}
                                                className="text-blue-600 hover:text-blue-800 mr-3"
                                            >
                                                Descarcă
                                            </button>
                                            <button
                                                onClick={() => showToast.info("Funcționalitate în dezvoltare")}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                Șterge
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredDocuments.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            Nu au fost găsite documente care să corespundă filtrelor selectate.
                        </div>
                    )}
                </Card>
            </div>
        );
    };

    const renderFinancialContent = () => {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-semibold">Configurări financiare</h3>
                        <p className="text-sm text-gray-600">Setări cotizații, categorii bugetare și parametri financiari</p>
                    </div>
                    <SecondaryButton onClick={() => setFinancialEditMode(!financialEditMode)}>
                        {financialEditMode ? 'Anulează' : 'Editează setări'}
                    </SecondaryButton>
                </div>

                <Card title="Configurare Cotizații">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Cotizație Lunară
                            </label>
                            <input
                                type="number"
                                defaultValue="50"
                                disabled={!financialEditMode}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
                            />
                            <p className="text-xs text-gray-500 mt-1">Suma în RON</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Cotizație Anuală
                            </label>
                            <input
                                type="number"
                                defaultValue="500"
                                disabled={!editMode}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
                            />
                            <p className="text-xs text-gray-500 mt-1">Suma în RON (reducere 17%)</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Zi scadentă cotizație lunară
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="28"
                                defaultValue="10"
                                disabled={!editMode}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
                            />
                            <p className="text-xs text-gray-500 mt-1">Ziua din lună (1-28)</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Zile alertă înainte de scadență
                            </label>
                            <input
                                type="number"
                                defaultValue="7"
                                disabled={!editMode}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
                            />
                            <p className="text-xs text-gray-500 mt-1">Email automat cu X zile înainte</p>
                        </div>
                    </div>
                </Card>

                <Card title="Categorii Bugetare - Cheltuieli">
                    <div className="space-y-3">
                        {['Personal (salarii, onorarii)', 'Logistică (transport, cazare)', 'Materiale și echipamente', 'Promovare și comunicare', 'Administrare', 'Altele'].map((category, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center">
                                    <span className="text-lg mr-3">📊</span>
                                    <span className="font-medium">{category}</span>
                                </div>
                                {editMode && (
                                    <button
                                        onClick={() => showToast.info("Funcționalitate în dezvoltare")}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        Șterge
                                    </button>
                                )}
                            </div>
                        ))}
                        {editMode && (
                            <button
                                onClick={() => showToast.info("Funcționalitate în dezvoltare")}
                                className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-orange-500 hover:text-orange-500"
                            >
                                + Adaugă categorie nouă
                            </button>
                        )}
                    </div>
                </Card>

                <Card title="Categorii Bugetare - Venituri">
                    <div className="space-y-3">
                        {['Cotizații', 'Sponsorizări', 'Donații', 'Granturi', 'Autofinanțare', 'Altele'].map((category, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center">
                                    <span className="text-lg mr-3">💰</span>
                                    <span className="font-medium">{category}</span>
                                </div>
                                {editMode && (
                                    <button
                                        onClick={() => showToast.info("Funcționalitate în dezvoltare")}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        Șterge
                                    </button>
                                )}
                            </div>
                        ))}
                        {editMode && (
                            <button
                                onClick={() => showToast.info("Funcționalitate în dezvoltare")}
                                className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-orange-500 hover:text-orange-500"
                            >
                                + Adaugă categorie nouă
                            </button>
                        )}
                    </div>
                </Card>

                <Card title="Metode de Plată">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <div className="font-medium">Transfer bancar</div>
                                <div className="text-sm text-gray-600">IBAN: RO49AAAA1B31007593840000</div>
                            </div>
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                                Activ
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <div className="font-medium">Numerar</div>
                                <div className="text-sm text-gray-600">La sediul organizației</div>
                            </div>
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                                Activ
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <div className="font-medium">Plată online (Stripe)</div>
                                <div className="text-sm text-gray-600">Integrare plată cu card</div>
                            </div>
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                                În dezvoltare
                            </span>
                        </div>
                    </div>
                </Card>

                <Card title="Parametri Fiscali">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                CUI Organizație
                            </label>
                            <input
                                type="text"
                                defaultValue={organization?.cui || ''}
                                disabled={!editMode}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Cont bancar principal
                            </label>
                            <input
                                type="text"
                                defaultValue="RO49AAAA1B31007593840000"
                                disabled={!editMode}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
                            />
                        </div>
                    </div>
                </Card>

                {editMode && (
                    <div className="flex justify-end space-x-3">
                        <SecondaryButton onClick={() => setEditMode(false)}>
                            Anulează
                        </SecondaryButton>
                        <PrimaryActionButton onClick={() => {
                            setEditMode(false);
                            showToast.success("Configurările au fost salvate!");
                        }}>
                            Salvează modificările
                        </PrimaryActionButton>
                    </div>
                )}
            </div>
        );
    };

    const renderAuditContent = () => {
        const [filterType, setFilterType] = useState<string>('all');
        const [filterUser, setFilterUser] = useState<string>('all');

        const mockAuditLogs = [
            {
                id: '1',
                action: 'Creare proiect',
                description: 'A creat proiectul "Educație pentru copii"',
                user: 'Ion Popescu',
                type: 'Proiect',
                timestamp: '2025-01-15 10:30:00',
                status: 'Success'
            },
            {
                id: '2',
                action: 'Modificare buget',
                description: 'A modificat bugetul proiectului "Mediu curat" de la 50.000 RON la 60.000 RON',
                user: 'Maria Ionescu',
                type: 'Financiar',
                timestamp: '2025-01-14 15:45:00',
                status: 'Success'
            },
            {
                id: '3',
                action: 'Adăugare membru',
                description: 'A adăugat membrul "Andrei Popa" ca voluntar',
                user: 'Admin Organizație',
                type: 'Membru',
                timestamp: '2025-01-14 09:20:00',
                status: 'Success'
            },
            {
                id: '4',
                action: 'Încărcare document',
                description: 'A încărcat documentul "Raport financiar 2024.pdf"',
                user: 'Contabil Șef',
                type: 'Document',
                timestamp: '2025-01-13 16:10:00',
                status: 'Success'
            },
            {
                id: '5',
                action: 'Tentativă modificare setări',
                description: 'Tentativă de modificare setări financiare fără permisiuni',
                user: 'Elena Dumitrescu',
                type: 'Configurare',
                timestamp: '2025-01-13 11:30:00',
                status: 'Failed'
            },
            {
                id: '6',
                action: 'Aprobare cheltuială',
                description: 'A aprobat cheltuiala de 5.000 RON pentru "Logistică eveniment"',
                user: 'Ion Popescu',
                type: 'Financiar',
                timestamp: '2025-01-12 14:20:00',
                status: 'Success'
            }
        ];

        const getTypeColor = (type: string) => {
            const colors = {
                'Proiect': 'bg-blue-100 text-blue-800',
                'Financiar': 'bg-green-100 text-green-800',
                'Membru': 'bg-purple-100 text-purple-800',
                'Document': 'bg-yellow-100 text-yellow-800',
                'Configurare': 'bg-orange-100 text-orange-800'
            };
            return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
        };

        const getStatusIcon = (status: string) => {
            return status === 'Success' ? '✅' : '❌';
        };

        const filteredLogs = mockAuditLogs.filter(log => {
            const matchesType = filterType === 'all' || log.type === filterType;
            const matchesUser = filterUser === 'all' || log.user === filterUser;
            return matchesType && matchesUser;
        });

        const uniqueUsers = [...new Set(mockAuditLogs.map(log => log.user))];

        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-semibold">Audit și istoric activități</h3>
                        <p className="text-sm text-gray-600">Urmărește toate acțiunile efectuate în platformă</p>
                    </div>
                    <SecondaryButton onClick={() => showToast.info("Funcționalitate în dezvoltare")}>
                        📥 Export raport audit
                    </SecondaryButton>
                </div>

                <Card>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-600">Total Activități</div>
                            <div className="text-2xl font-bold text-blue-600">{mockAuditLogs.length}</div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-600">Acțiuni Reușite</div>
                            <div className="text-2xl font-bold text-green-600">
                                {mockAuditLogs.filter(l => l.status === 'Success').length}
                            </div>
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-600">Acțiuni Eșuate</div>
                            <div className="text-2xl font-bold text-red-600">
                                {mockAuditLogs.filter(l => l.status === 'Failed').length}
                            </div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-600">Utilizatori Activi</div>
                            <div className="text-2xl font-bold text-purple-600">{uniqueUsers.length}</div>
                        </div>
                    </div>

                    <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        >
                            <option value="all">Toate tipurile</option>
                            <option value="Proiect">Proiect</option>
                            <option value="Financiar">Financiar</option>
                            <option value="Membru">Membru</option>
                            <option value="Document">Document</option>
                            <option value="Configurare">Configurare</option>
                        </select>
                        <select
                            value={filterUser}
                            onChange={(e) => setFilterUser(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        >
                            <option value="all">Toți utilizatorii</option>
                            {uniqueUsers.map((user, index) => (
                                <option key={index} value={user}>{user}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-3">
                        {filteredLogs.map((log) => (
                            <div key={log.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-xl">{getStatusIcon(log.status)}</span>
                                            <div>
                                                <h4 className="font-semibold text-gray-900">{log.action}</h4>
                                                <p className="text-sm text-gray-600">{log.description}</p>
                                            </div>
                                        </div>
                                        <div className="ml-8 flex items-center gap-3 text-sm">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(log.type)}`}>
                                                {log.type}
                                            </span>
                                            <span className="text-gray-600">
                                                <span className="font-medium">{log.user}</span>
                                                {' · '}
                                                <span>{new Date(log.timestamp).toLocaleString('ro-RO')}</span>
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => showToast.info("Funcționalitate în dezvoltare")}
                                        className="text-blue-600 hover:text-blue-800 text-sm"
                                    >
                                        Detalii
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredLogs.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            Nu au fost găsite activități care să corespundă filtrelor selectate.
                        </div>
                    )}
                </Card>

                <Card title="Acțiuni rapide raportare">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button
                            onClick={() => showToast.info("Funcționalitate în dezvoltare")}
                            className="p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors"
                        >
                            <div className="text-2xl mb-2">📊</div>
                            <div className="font-medium text-gray-900">Raport activitate lunară</div>
                            <div className="text-sm text-gray-600">Ultimele 30 zile</div>
                        </button>
                        <button
                            onClick={() => showToast.info("Funcționalitate în dezvoltare")}
                            className="p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors"
                        >
                            <div className="text-2xl mb-2">💰</div>
                            <div className="font-medium text-gray-900">Raport financiar</div>
                            <div className="text-sm text-gray-600">Toate tranzacțiile</div>
                        </button>
                        <button
                            onClick={() => showToast.info("Funcționalitate în dezvoltare")}
                            className="p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors"
                        >
                            <div className="text-2xl mb-2">👥</div>
                            <div className="font-medium text-gray-900">Raport utilizatori</div>
                            <div className="text-sm text-gray-600">Activitate membrii</div>
                        </button>
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
