import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/utils/constants.utils';

const EntitiesPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [filterEngagement, setFilterEngagement] = useState<string>('all');

    // Mock data
    const mockEntities = [
        {
            id: '1',
            name: 'Fundația Pentru Copii',
            type: 'Persoană Juridică',
            cui: 'RO12345678',
            email: 'contact@fundatiapentr ucopii.ro',
            phone: '0722 123 456',
            engagement_level: 'total',
            total_donations: 25000,
            donation_count: 8,
            last_contact: '2025-01-10',
            status: 'Activ'
        },
        {
            id: '2',
            name: 'Ion Popescu',
            type: 'Persoană Fizică',
            cui: '1234567890123',
            email: 'ion.popescu@email.com',
            phone: '0733 234 567',
            engagement_level: 'partial',
            total_donations: 5000,
            donation_count: 3,
            last_contact: '2024-12-15',
            status: 'Activ'
        },
        {
            id: '3',
            name: 'SC Tech Solutions SRL',
            type: 'Persoană Juridică',
            cui: 'RO98765432',
            email: 'partnerships@techsolutions.ro',
            phone: '0744 345 678',
            engagement_level: 'deloc',
            total_donations: 500,
            donation_count: 1,
            last_contact: '2024-06-20',
            status: 'Inactiv'
        },
        {
            id: '4',
            name: 'Maria Ionescu',
            type: 'Persoană Fizică',
            cui: '2987654321098',
            email: 'maria.ionescu@gmail.com',
            phone: '0755 456 789',
            engagement_level: 'partial',
            total_donations: 8500,
            donation_count: 5,
            last_contact: '2025-01-05',
            status: 'Activ'
        }
    ];

    const getEngagementBadge = (level: string) => {
        const badges = {
            total: 'bg-green-100 text-green-800',
            partial: 'bg-yellow-100 text-yellow-800',
            deloc: 'bg-gray-100 text-gray-800'
        };
        const labels = {
            total: 'Total',
            partial: 'Parțial',
            deloc: 'Deloc'
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badges[level as keyof typeof badges]}`}>
                {labels[level as keyof typeof labels]}
            </span>
        );
    };

    const filteredEntities = mockEntities.filter(entity => {
        const matchesSearch = entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            entity.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            entity.cui.includes(searchTerm);
        const matchesType = filterType === 'all' || entity.type === filterType;
        const matchesEngagement = filterEngagement === 'all' || entity.engagement_level === filterEngagement;
        
        return matchesSearch && matchesType && matchesEngagement;
    });

    return (
        <Layout showNavigation={true}>
            <div className="container mx-auto">
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Entități (CRM)</h1>
                        <p className="text-gray-600 mt-1">Gestionează donatori, sponsori și parteneri</p>
                    </div>
                    <Button
                        onClick={() => navigate(ROUTES.CRM_ENTITY_CREATE)}
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                    >
                        + Adaugă Entitate
                    </Button>
                </div>

                <Card className="mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-600">Total Entități</div>
                            <div className="text-2xl font-bold text-blue-600">{mockEntities.length}</div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-600">Active</div>
                            <div className="text-2xl font-bold text-green-600">
                                {mockEntities.filter(e => e.status === 'Activ').length}
                            </div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-600">Total Donații</div>
                            <div className="text-2xl font-bold text-purple-600">
                                {mockEntities.reduce((sum, e) => sum + e.total_donations, 0).toLocaleString()} RON
                            </div>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-600">Engagement Total</div>
                            <div className="text-2xl font-bold text-orange-600">
                                {mockEntities.filter(e => e.engagement_level === 'total').length}
                            </div>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                            <input
                                type="text"
                                placeholder="Caută după nume, email sau CUI..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            >
                                <option value="all">Toate tipurile</option>
                                <option value="Persoană Fizică">Persoană Fizică</option>
                                <option value="Persoană Juridică">Persoană Juridică</option>
                            </select>
                        </div>
                        <div>
                            <select
                                value={filterEngagement}
                                onChange={(e) => setFilterEngagement(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            >
                                <option value="all">Toate nivelurile</option>
                                <option value="total">Total</option>
                                <option value="partial">Parțial</option>
                                <option value="deloc">Deloc</option>
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b-2 border-gray-200">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Nume
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Tip
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Contact
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Engagement
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Donații
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Acțiuni
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredEntities.length > 0 ? (
                                    filteredEntities.map((entity) => (
                                        <tr key={entity.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-4">
                                                <div className="font-medium text-gray-900">{entity.name}</div>
                                                <div className="text-sm text-gray-500">{entity.cui}</div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-sm text-gray-700">{entity.type}</span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="text-sm text-gray-700">{entity.email}</div>
                                                <div className="text-sm text-gray-500">{entity.phone}</div>
                                            </td>
                                            <td className="px-4 py-4">
                                                {getEngagementBadge(entity.engagement_level)}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="text-sm font-semibold text-gray-900">
                                                    {entity.total_donations.toLocaleString()} RON
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {entity.donation_count} donații
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <Button
                                                    onClick={() => navigate(`/crm/entities/${entity.id}`)}
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    Detalii
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                                            Nu au fost găsite entități care să corespundă filtrelor selectate.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </Layout>
    );
};

export default EntitiesPage;
