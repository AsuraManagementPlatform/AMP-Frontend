import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const DonationsPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [filterProject, setFilterProject] = useState<string>('all');

    const mockDonations = [
        {
            id: '1',
            entity_name: 'Fundația Pentru Copii',
            entity_type: 'Persoană Juridică',
            amount: 25000,
            currency: 'RON',
            type: 'Donație',
            project: 'Educație pentru Copii',
            activity: 'Tabără de Vară 2025',
            date: '2025-01-10',
            status: 'Finalizat',
            payment_method: 'Transfer Bancar'
        },
        {
            id: '2',
            entity_name: 'Ion Popescu',
            entity_type: 'Persoană Fizică',
            amount: 5000,
            currency: 'RON',
            type: 'Sponsorizare',
            project: 'Susținere Comunitate',
            activity: null,
            date: '2024-12-15',
            status: 'Finalizat',
            payment_method: 'Card'
        },
        {
            id: '3',
            entity_name: 'SC Tech Solutions SRL',
            entity_type: 'Persoană Juridică',
            amount: 10000,
            currency: 'RON',
            type: 'Parteneriat',
            project: 'Digitalizare ONG',
            activity: 'Website Development',
            date: '2025-01-05',
            status: 'În Proces',
            payment_method: 'Factură'
        },
        {
            id: '4',
            entity_name: 'Maria Ionescu',
            entity_type: 'Persoană Fizică',
            amount: 8500,
            currency: 'RON',
            type: 'Donație',
            project: 'Sănătate pentru Toți',
            activity: 'Campanie Preventie',
            date: '2024-11-20',
            status: 'Finalizat',
            payment_method: 'Cash'
        }
    ];

    const getTotalDonations = () => {
        return mockDonations.reduce((sum, d) => sum + d.amount, 0);
    };

    const getStatusBadge = (status: string) => {
        const badges = {
            'Finalizat': 'bg-green-100 text-green-800',
            'În Proces': 'bg-yellow-100 text-yellow-800',
            'Anulat': 'bg-red-100 text-red-800'
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badges[status as keyof typeof badges]}`}>
                {status}
            </span>
        );
    };

    const getTypeBadge = (type: string) => {
        const badges = {
            'Donație': 'bg-blue-100 text-blue-800',
            'Sponsorizare': 'bg-purple-100 text-purple-800',
            'Parteneriat': 'bg-indigo-100 text-indigo-800'
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badges[type as keyof typeof badges]}`}>
                {type}
            </span>
        );
    };

    const filteredDonations = mockDonations.filter(donation => {
        const matchesSearch = donation.entity_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            donation.project.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || donation.type === filterType;
        const matchesProject = filterProject === 'all' || donation.project === filterProject;
        
        return matchesSearch && matchesType && matchesProject;
    });

    const uniqueProjects = Array.from(new Set(mockDonations.map(d => d.project)));

    return (
        <Layout showNavigation={true}>
            <div className="container mx-auto">
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Donații & Sponsorizări</h1>
                        <p className="text-gray-600 mt-1">Istoric complet al contribuțiilor financiare</p>
                    </div>
                    <Button
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                    >
                        + Înregistrează Donație
                    </Button>
                </div>

                <Card className="mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-600">Total Donații</div>
                            <div className="text-2xl font-bold text-blue-600">{getTotalDonations().toLocaleString()} RON</div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-600">Finalizate</div>
                            <div className="text-2xl font-bold text-green-600">
                                {mockDonations.filter(d => d.status === 'Finalizat').length}
                            </div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-600">Contribuții Unice</div>
                            <div className="text-2xl font-bold text-purple-600">
                                {new Set(mockDonations.map(d => d.entity_name)).size}
                            </div>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-600">Medie Donație</div>
                            <div className="text-2xl font-bold text-orange-600">
                                {Math.round(getTotalDonations() / mockDonations.length).toLocaleString()} RON
                            </div>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                            <input
                                type="text"
                                placeholder="Caută după entitate sau proiect..."
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
                                <option value="Donație">Donație</option>
                                <option value="Sponsorizare">Sponsorizare</option>
                                <option value="Parteneriat">Parteneriat</option>
                            </select>
                        </div>
                        <div>
                            <select
                                value={filterProject}
                                onChange={(e) => setFilterProject(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            >
                                <option value="all">Toate proiectele</option>
                                {uniqueProjects.map(project => (
                                    <option key={project} value={project}>{project}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b-2 border-gray-200">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Entitate
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Tip
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Sumă
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Proiect
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Dată
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Acțiuni
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredDonations.length > 0 ? (
                                    filteredDonations.map((donation) => (
                                        <tr key={donation.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-4">
                                                <div className="font-medium text-gray-900">{donation.entity_name}</div>
                                                <div className="text-sm text-gray-500">{donation.entity_type}</div>
                                            </td>
                                            <td className="px-4 py-4">
                                                {getTypeBadge(donation.type)}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="text-sm font-semibold text-gray-900">
                                                    {donation.amount.toLocaleString()} {donation.currency}
                                                </div>
                                                <div className="text-xs text-gray-500">{donation.payment_method}</div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="text-sm text-gray-700">{donation.project}</div>
                                                {donation.activity && (
                                                    <div className="text-xs text-gray-500">{donation.activity}</div>
                                                )}
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-sm text-gray-700">{donation.date}</span>
                                            </td>
                                            <td className="px-4 py-4">
                                                {getStatusBadge(donation.status)}
                                            </td>
                                            <td className="px-4 py-4">
                                                <Button
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
                                        <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                                            Nu au fost găsite donații care să corespundă filtrelor selectate.
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

export default DonationsPage;
