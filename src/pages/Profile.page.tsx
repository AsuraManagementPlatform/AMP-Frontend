import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import Layout from '@/components/layout/Layout';
import { User } from '@/types/index.types';
import { userService } from '@/services/user.service';
import { organizationMemberService } from '@/services/organization-member.service';
import { toast } from 'react-hot-toast';
import { getUserRoleLabel } from '@/utils/dashboardUtils';
import { useAuth } from '@/context/Auth.context';
import { ActionIcons } from '@/components/ui/ActionIcons';
import { DocumentList } from '@/components/tables/DocumentList';
import { DocumentCategoryEnum } from '@/types/document.types';
import { UploadMemberDocumentModal } from '@/components/modals/member/UploadMemberDocumentModal';

export const ProfilePage: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const { user: currentUser, fetchUserData } = useAuth();
    const [user, setUser] = useState<User | null>(null);
    const [userProjects, setUserProjects] = useState<any[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<Partial<User>>({});
    const [isUploadDocumentModalOpen, setIsUploadDocumentModalOpen] = useState(false);
    const [documentRefreshKey, setDocumentRefreshKey] = useState(0);
    
    const isViewingOtherUser = !!userId;

    useEffect(() => {
        loadUserData();
    }, [userId, currentUser]);

    const loadUserData = async () => {
        try {
            setLoading(true);
            let userData: User;
            
            if (userId) {
                userData = await userService.getById(userId);
            } else {
                if (!currentUser) return;
                userData = currentUser;
            }
            
            setUser(userData);
            setFormData(userData);
            
            if (userData.id) {
                await loadUserProjectsAndActivities(userData.id);
            }
        } catch (error) {
            toast.error('Eroare la încărcarea profilului');
        } finally {
            setLoading(false);
        }
    };

    const loadUserProjectsAndActivities = async (targetUserId: string) => {
        try {
            const response = await organizationMemberService.getList();
            const membersList = (response as any).organizationMembersList || response.organizationMembersList || [];
            
            const memberData = membersList.find((m: any) => m.member === targetUserId);
            
            if (memberData) {
                const projects = memberData.currentProjects || memberData.current_projects || [];
                setUserProjects(projects);
            }
        } catch (error) {
        }
    };

    const handleInputChange = (field: keyof User, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = async () => {
        if (!user) return;

        try {
            setSaving(true);
            await userService.updateCurrentUser(formData);
            await fetchUserData();
            toast.success('Profil actualizat cu succes!');
            setIsEditing(false);
            await loadUserData();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Eroare la salvarea profilului');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData(user || {});
        setIsEditing(false);
    };

    if (loading) {
        return (
            <Layout showNavigation={true}>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="animate-pulse text-gray-500">Încărcare profil...</div>
                </div>
            </Layout>
        );
    }

    if (!user) {
        return (
            <Layout showNavigation={true}>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-red-500">Nu s-au putut încărca datele profilului</div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout showNavigation={true}>
            <div className="container mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            {isViewingOtherUser ? `Profil Membru: ${user.fullName}` : 'Profilul Meu'}
                        </h1>
                        <p className="text-gray-600">Informații personale și proiecte</p>
                    </div>
                    {isViewingOtherUser ? (
                        <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
                            Vizualizare Read-Only
                        </div>
                    ) : !isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                        >
                            <ActionIcons.Edit />
                            <span>Editează Profilul</span>
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button
                                onClick={handleCancel}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                                disabled={saving}
                            >
                                Anulează
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                disabled={saving}
                            >
                                {saving ? 'Se salvează...' : 'Salvează'}
                            </button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <Card className="col-span-1 bg-gradient-to-br from-orange-50 to-white">
                        <div className="flex flex-col items-center text-center p-6">
                            <div className="w-32 h-32 bg-orange-500 rounded-full flex items-center justify-center text-white text-4xl font-bold mb-4">
                                {user.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">{user.fullName}</h2>
                        <p className="text-gray-600 mb-4">{user.email}</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                            {user.groups?.map((group, idx) => (
                                <span
                                    key={idx}
                                    className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium"
                                >
                                    {getUserRoleLabel(group)}
                                </span>
                            ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200 w-full">
                            <div className="text-sm text-gray-600">
                                <div className="flex justify-between mb-2">
                                    <span>Status:</span>
                                    <span className={`font-semibold ${user.status === 'ACTIVE' ? 'text-green-600' : 'text-gray-600'}`}>
                                        {user.status}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Membru din:</span>
                                    <span className="font-semibold">
                                        {user.registrationDate ? new Date(user.registrationDate).toLocaleDateString('ro-RO') : 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card title="Informații Personale" className="col-span-1 md:col-span-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nume Complet</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={formData.fullName || ''}
                                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            ) : (
                                <p className="text-gray-900 py-2">{user.fullName || 'N/A'}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <p className="text-gray-900 py-2 bg-gray-50 px-3 rounded-lg">{user.email}</p>
                            <span className="text-xs text-gray-500">Email-ul nu poate fi modificat</span>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Prenume</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={formData.firstName || ''}
                                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            ) : (
                                <p className="text-gray-900 py-2">{user.firstName || 'N/A'}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nume</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={formData.lastName || ''}
                                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            ) : (
                                <p className="text-gray-900 py-2">{user.lastName || 'N/A'}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                            {isEditing ? (
                                <input
                                    type="tel"
                                    value={formData.phoneNumber || ''}
                                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            ) : (
                                <p className="text-gray-900 py-2">{user.phoneNumber || 'N/A'}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Telefon Secundar</label>
                            {isEditing ? (
                                <input
                                    type="tel"
                                    value={formData.secondaryPhone || ''}
                                    onChange={(e) => handleInputChange('secondaryPhone', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            ) : (
                                <p className="text-gray-900 py-2">{user.secondaryPhone || 'N/A'}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">CNP / Cod Numeric Personal</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={formData.personalNumericalNumber || ''}
                                    onChange={(e) => handleInputChange('personalNumericalNumber', e.target.value)}
                                    maxLength={13}
                                    placeholder="Ex: 1234567890123"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            ) : (
                                <p className="text-gray-900 py-2">{user.personalNumericalNumber || 'N/A'}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Profesie</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={formData.profession || ''}
                                    onChange={(e) => handleInputChange('profession', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            ) : (
                                <p className="text-gray-900 py-2">{user.profession || 'N/A'}</p>
                            )}
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                        {isEditing ? (
                            <textarea
                                value={formData.bio || ''}
                                onChange={(e) => handleInputChange('bio', e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                placeholder="Scrie câteva cuvinte despre tine..."
                            />
                        ) : (
                            <p className="text-gray-900 py-2">{user.bio || 'Nu ați adăugat încă o descriere'}</p>
                        )}
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Zonă de interes</label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={formData.interestArea || ''}
                                onChange={(e) => handleInputChange('interestArea', e.target.value)}
                                maxLength={255}
                                placeholder="Ex: IT, Marketing, Juridic, HR, Financiar..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                        ) : (
                            <p className="text-gray-900 py-2">{user.interestArea || 'Nu ați specificat o zonă de interes'}</p>
                        )}
                    </div>
                </Card>
            </div>

            <Card title="Adresă și Contact" className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Adresă</label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={formData.address || ''}
                                onChange={(e) => handleInputChange('address', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                        ) : (
                            <p className="text-gray-900 py-2">{user.address || 'N/A'}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Oraș</label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={formData.city || ''}
                                onChange={(e) => handleInputChange('city', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                        ) : (
                            <p className="text-gray-900 py-2">{user.city || 'N/A'}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Județ</label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={formData.county || ''}
                                onChange={(e) => handleInputChange('county', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                        ) : (
                            <p className="text-gray-900 py-2">{user.county || 'N/A'}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cod Poștal</label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={formData.postalCode || ''}
                                onChange={(e) => handleInputChange('postalCode', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                        ) : (
                            <p className="text-gray-900 py-2">{user.postalCode || 'N/A'}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Țară</label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={formData.country || 'Romania'}
                                onChange={(e) => handleInputChange('country', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                        ) : (
                            <p className="text-gray-900 py-2">{user.country || 'Romania'}</p>
                        )}
                    </div>
                </div>
            </Card>

            {user.id && user.organizationId && (
                <Card title="Documente Membru" className="mb-6">
                    {!isViewingOtherUser && (
                        <div className="mb-4">
                            <button
                                onClick={() => setIsUploadDocumentModalOpen(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                                <span>Încarcă document</span>
                            </button>
                        </div>
                    )}
                    <DocumentList 
                        key={documentRefreshKey}
                        filters={{ 
                            category: DocumentCategoryEnum.MEMBRI,
                            userId: user.id
                        }}
                        showActions={true}
                    />
                </Card>
            )}

            {!isViewingOtherUser && (
                <UploadMemberDocumentModal
                    isOpen={isUploadDocumentModalOpen}
                    onClose={() => setIsUploadDocumentModalOpen(false)}
                    onSuccess={() => {
                        setDocumentRefreshKey(prev => prev + 1);
                        setIsUploadDocumentModalOpen(false);
                    }}
                    userId={user.id!}
                />
            )}

            {userProjects.length > 0 && (
                <Card title="Proiecte" className="mb-6">
                    <div className="space-y-2">
                        {userProjects.map((project: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-200">
                                <div>
                                    <span className="font-medium text-gray-900">{project.name}</span>
                                    <span className="text-sm text-gray-600 ml-2">• {project.role}</span>
                                </div>
                                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">Proiect</span>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {(user.companyName || user.companyNumber || user.cui) && (
                <Card title="Informații Companie" className="mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nume Companie</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={formData.companyName || ''}
                                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            ) : (
                                <p className="text-gray-900 py-2">{user.companyName || 'N/A'}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Număr Înregistrare</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={formData.companyNumber || ''}
                                    onChange={(e) => handleInputChange('companyNumber', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            ) : (
                                <p className="text-gray-900 py-2">{user.companyNumber || 'N/A'}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">CUI</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={formData.cui || ''}
                                    onChange={(e) => handleInputChange('cui', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            ) : (
                                <p className="text-gray-900 py-2">{user.cui || 'N/A'}</p>
                            )}
                        </div>
                    </div>
                </Card>
            )}
            </div>
        </Layout>
    );
};

export default ProfilePage;
