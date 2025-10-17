import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { User } from '@/types/index.types';
import { userService } from '@/services/user.service';
import { toast } from 'react-hot-toast';
import { getUserRoleLabel } from '@/utils/dashboardUtils';
import { ROUTES } from '@/utils/constants.utils';

export const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<Partial<User>>({});

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            setLoading(true);
            const userData = await userService.getCurrentUser();
            setUser(userData);
            setFormData(userData);
        } catch (error) {
            toast.error('Eroare la încărcarea profilului');
        } finally {
            setLoading(false);
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
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-pulse text-gray-500">Încărcare profil...</div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-red-500">Nu s-au putut încărca datele profilului</div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-4">
                <button
                    onClick={() => navigate(ROUTES.DASHBOARD)}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-orange-500 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    Înapoi la pagina principală
                </button>
            </div>

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Profilul Meu</h1>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                        ✏️ Editează Profilul
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
                            {saving ? 'Se salvează...' : '💾 Salvează'}
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

                <Card title="📋 Informații Personale" className="col-span-1 md:col-span-2">
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
                </Card>
            </div>

            <Card title="📍 Adresă și Contact" className="mb-6">
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

            {(user.companyName || user.companyNumber || user.cui) && (
                <Card title="🏢 Informații Companie" className="mb-6">
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
    );
};

export default ProfilePage;
