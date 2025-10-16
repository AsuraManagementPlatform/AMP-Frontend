import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const CommunicationsPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    const mockCommunications = [
        {
            id: '1',
            entity_name: 'Fundația Pentru Copii',
            type: 'Email',
            subject: 'Mulțumiri pentru contribuție',
            content: 'Vă mulțumim pentru donația de 25.000 RON către proiectul...',
            date: '2025-01-11',
            status: 'Trimis',
            sent_by: 'Admin Organizație'
        },
        {
            id: '2',
            entity_name: 'Ion Popescu',
            type: 'SMS',
            subject: 'Reminder sponsorizare anuală',
            content: 'Vă reamintim despre posibilitatea reînnoirii sponsorizării...',
            date: '2025-01-08',
            status: 'Trimis',
            sent_by: 'Sistem Automat'
        },
        {
            id: '3',
            entity_name: 'SC Tech Solutions SRL',
            type: 'Email',
            subject: 'Raport impact parteneriat',
            content: 'Raportul detaliat privind impactul parteneriatului 2024...',
            date: '2025-01-06',
            status: 'Citit',
            sent_by: 'Admin Organizație'
        },
        {
            id: '4',
            entity_name: 'Maria Ionescu',
            type: 'Notificare',
            subject: 'Follow-up donație',
            content: 'Programat follow-up pentru donația din noiembrie...',
            date: '2025-01-15',
            status: 'Programat',
            sent_by: 'Sistem Automat'
        },
        {
            id: '5',
            entity_name: 'Fundația Pentru Copii',
            type: 'Telefon',
            subject: 'Discuție parteneriat 2025',
            content: 'Convorbire telefonică despre planurile de colaborare...',
            date: '2025-01-03',
            status: 'Finalizat',
            sent_by: 'Coordonator Proiect'
        }
    ];

    const getStatusBadge = (status: string) => {
        const badges = {
            'Trimis': 'bg-blue-100 text-blue-800',
            'Citit': 'bg-green-100 text-green-800',
            'Programat': 'bg-yellow-100 text-yellow-800',
            'Finalizat': 'bg-gray-100 text-gray-800',
            'Eșuat': 'bg-red-100 text-red-800'
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badges[status as keyof typeof badges]}`}>
                {status}
            </span>
        );
    };

    const getTypeIcon = (type: string) => {
        const icons = {
            'Email': '📧',
            'SMS': '💬',
            'Telefon': '📞',
            'Notificare': '🔔'
        };
        return icons[type as keyof typeof icons] || '📄';
    };

    const filteredCommunications = mockCommunications.filter(comm => {
        const matchesSearch = comm.entity_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            comm.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            comm.content.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || comm.type === filterType;
        const matchesStatus = filterStatus === 'all' || comm.status === filterStatus;
        
        return matchesSearch && matchesType && matchesStatus;
    });

    return (
        <Layout showNavigation={true}>
            <div className="container mx-auto">
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Comunicări</h1>
                        <p className="text-gray-600 mt-1">Istoric al comunicărilor cu entitățile</p>
                    </div>
                    <Button
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                    >
                        + Nouă Comunicare
                    </Button>
                </div>

                <Card className="mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-600">Total Comunicări</div>
                            <div className="text-2xl font-bold text-blue-600">{mockCommunications.length}</div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-600">Trimise</div>
                            <div className="text-2xl font-bold text-green-600">
                                {mockCommunications.filter(c => c.status === 'Trimis' || c.status === 'Citit').length}
                            </div>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-600">Programate</div>
                            <div className="text-2xl font-bold text-yellow-600">
                                {mockCommunications.filter(c => c.status === 'Programat').length}
                            </div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-600">Entități Contactate</div>
                            <div className="text-2xl font-bold text-purple-600">
                                {new Set(mockCommunications.map(c => c.entity_name)).size}
                            </div>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                            <input
                                type="text"
                                placeholder="Caută după entitate, subiect sau conținut..."
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
                                <option value="Email">Email</option>
                                <option value="SMS">SMS</option>
                                <option value="Telefon">Telefon</option>
                                <option value="Notificare">Notificare</option>
                            </select>
                        </div>
                        <div>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            >
                                <option value="all">Toate statusurile</option>
                                <option value="Trimis">Trimis</option>
                                <option value="Citit">Citit</option>
                                <option value="Programat">Programat</option>
                                <option value="Finalizat">Finalizat</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {filteredCommunications.length > 0 ? (
                            filteredCommunications.map((comm) => (
                                <div key={comm.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="text-2xl">{getTypeIcon(comm.type)}</span>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">{comm.subject}</h3>
                                                    <p className="text-sm text-gray-600">
                                                        <span className="font-medium">{comm.entity_name}</span>
                                                        {' · '}
                                                        <span>{comm.date}</span>
                                                        {' · '}
                                                        <span className="text-gray-500">{comm.sent_by}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-700 ml-11 mb-3">
                                                {comm.content}
                                            </p>
                                            <div className="ml-11 flex items-center gap-3">
                                                {getStatusBadge(comm.status)}
                                                <span className="text-xs text-gray-500">{comm.type}</span>
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                            >
                                                Detalii
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                Nu au fost găsite comunicări care să corespundă filtrelor selectate.
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </Layout>
    );
};

export default CommunicationsPage;
