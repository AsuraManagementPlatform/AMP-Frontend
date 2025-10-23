import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EntityDonation, DonationType, DonationScope, PaymentMethod } from '@/types/donation.types';
import { Entity } from '@/types/entity.types';
import { donationService } from '@/services/donation.service';
import { entityService } from '@/services/entity.service';
import { CreateDonationModal } from '@/components/modals/donation/CreateDonationModal';
import { UpdateDonationModal } from '@/components/modals/donation/UpdateDonationModal';
import showToast from '@/components/ui/Toast';

const DonationsPage: React.FC = () => {
    const [donations, setDonations] = useState<EntityDonation[]>([]);
    const [entities, setEntities] = useState<Entity[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [filterScope, setFilterScope] = useState<string>('all');
    const [filterPayment, setFilterPayment] = useState<string>('all');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [selectedDonationId, setSelectedDonationId] = useState<string>('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const [donationsData, entitiesData] = await Promise.all([
                donationService.getList(),
                entityService.getList()
            ]);
            
            setDonations(donationsData.results || []);
            setEntities(entitiesData.results || []);
        } catch (error) {
            showToast.error('Eroare la încărcarea datelor');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateSuccess = () => {
        loadData();
        setIsCreateModalOpen(false);
    };

    const handleUpdateSuccess = () => {
        loadData();
        setIsUpdateModalOpen(false);
    };

    const handleEdit = (donationId: string) => {
        setSelectedDonationId(donationId);
        setIsUpdateModalOpen(true);
    };

    const handleDelete = async (donationId: string) => {
        if (!window.confirm('Sunteți sigur că doriți să ștergeți această donație?')) {
            return;
        }

        try {
            await donationService.delete(donationId);
            showToast.success('Donația a fost ștearsă cu succes');
            loadData();
        } catch (error) {
            showToast.error('Nu s-a putut șterge donația');
        }
    };

    const getTotalDonations = (): number => {
        return filteredDonations.reduce((sum, d) => sum + d.amount, 0);
    };

    const getEntityName = (entityId: string): string => {
        const entity = entities.find(e => e.id === entityId);
        return entity?.name || 'Entitate necunoscută';
    };

    const getDonationTypeBadge = (type: DonationType) => {
        const config = {
            [DonationType.MONETARY]: { text: 'Monetar', className: 'bg-green-100 text-green-800' },
            [DonationType.IN_KIND]: { text: 'În natură', className: 'bg-blue-100 text-blue-800' },
            [DonationType.SERVICE]: { text: 'Servicii', className: 'bg-purple-100 text-purple-800' },
            [DonationType.SPONSORSHIP]: { text: 'Sponsorizare', className: 'bg-yellow-100 text-yellow-800' },
            [DonationType.OTHER]: { text: 'Altul', className: 'bg-gray-100 text-gray-800' }
        };
        
        const typeConfig = config[type] || { text: type, className: 'bg-gray-100 text-gray-800' };
        
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeConfig.className}`}>
                {typeConfig.text}
            </span>
        );
    };

    const getScopeBadge = (scope: DonationScope) => {
        const config = {
            [DonationScope.GENERAL]: { text: 'General', className: 'bg-gray-100 text-gray-800' },
            [DonationScope.PROJECT]: { text: 'Proiect', className: 'bg-blue-100 text-blue-800' },
            [DonationScope.ACTIVITY]: { text: 'Activitate', className: 'bg-purple-100 text-purple-800' },
            [DonationScope.EMERGENCY]: { text: 'Urgență', className: 'bg-red-100 text-red-800' }
        };
        
        const scopeConfig = config[scope] || { text: scope, className: 'bg-gray-100 text-gray-800' };
        
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${scopeConfig.className}`}>
                {scopeConfig.text}
            </span>
        );
    };

    const filteredDonations = donations.filter(donation => {
        const entityName = getEntityName(donation.entityId).toLowerCase();
        const matchesSearch = searchTerm === '' || entityName.includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || donation.type === filterType;
        const matchesScope = filterScope === 'all' || donation.scope === filterScope;
        const matchesPayment = filterPayment === 'all' || donation.paymentMethod === filterPayment;
        
        return matchesSearch && matchesType && matchesScope && matchesPayment;
    });

    if (isLoading) {
        return (
            <Layout>
                <div className="container mx-auto">
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                        <span className="ml-3 text-gray-600">Se încarcă datele...</span>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="container mx-auto">
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-2xl font-bold text-gray-900">Gestiune Donații</h1>
                        <Button onClick={() => setIsCreateModalOpen(true)}>
                            Adaugă Donație
                        </Button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <Card className="p-4">
                            <div className="text-2xl font-bold text-gray-900">{getTotalDonations().toLocaleString()} RON</div>
                            <div className="text-sm text-gray-600">Total Donații</div>
                        </Card>
                        <Card className="p-4">
                            <div className="text-2xl font-bold text-gray-900">{filteredDonations.length}</div>
                            <div className="text-sm text-gray-600">Număr Donații</div>
                        </Card>
                        <Card className="p-4">
                            <div className="text-2xl font-bold text-gray-900">
                                {new Set(filteredDonations.map(d => d.entityId)).size}
                            </div>
                            <div className="text-sm text-gray-600">Entități Unice</div>
                        </Card>
                        <Card className="p-4">
                            <div className="text-2xl font-bold text-gray-900">
                                {filteredDonations.length > 0 ? Math.round(getTotalDonations() / filteredDonations.length).toLocaleString() : 0} RON
                            </div>
                            <div className="text-sm text-gray-600">Medie Donație</div>
                        </Card>
                    </div>

                    {/* Filters */}
                    <Card title="Filtre" className="mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Caută după entitate</label>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Nume entitate..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tip</label>
                                <select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">Toate</option>
                                    <option value={DonationType.MONETARY}>Monetar</option>
                                    <option value={DonationType.IN_KIND}>În natură</option>
                                    <option value={DonationType.SERVICE}>Servicii</option>
                                    <option value={DonationType.SPONSORSHIP}>Sponsorizare</option>
                                    <option value={DonationType.OTHER}>Altul</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Scop</label>
                                <select
                                    value={filterScope}
                                    onChange={(e) => setFilterScope(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">Toate</option>
                                    <option value={DonationScope.GENERAL}>General</option>
                                    <option value={DonationScope.PROJECT}>Proiect</option>
                                    <option value={DonationScope.ACTIVITY}>Activitate</option>
                                    <option value={DonationScope.EMERGENCY}>Urgență</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Plată</label>
                                <select
                                    value={filterPayment}
                                    onChange={(e) => setFilterPayment(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">Toate</option>
                                    <option value={PaymentMethod.CASH}>Numerar</option>
                                    <option value={PaymentMethod.BANK_TRANSFER}>Transfer bancar</option>
                                    <option value={PaymentMethod.CARD}>Card</option>
                                    <option value={PaymentMethod.OTHER}>Altul</option>
                                </select>
                            </div>
                        </div>
                    </Card>

                    {/* Donations Table */}
                    <Card title={`Donații (${filteredDonations.length})`}>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Entitate
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Tip
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Scop
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Sumă
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Destinație
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Dată
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
                                                    <div className="font-medium text-gray-900">{getEntityName(donation.entityId)}</div>
                                                    <div className="text-sm text-gray-500">{donation.entityId}</div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    {getDonationTypeBadge(donation.type)}
                                                </td>
                                                <td className="px-4 py-4">
                                                    {getScopeBadge(donation.scope)}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="font-medium text-gray-900">
                                                        {donation.amount.toLocaleString()} {donation.currency}
                                                    </div>
                                                    <div className="text-sm text-gray-500">{donation.paymentMethod}</div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="text-sm text-gray-700">
                                                        {donation.projectName || donation.activityName || '-'}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="text-sm text-gray-700">
                                                        {new Date(donation.date).toLocaleDateString('ro-RO')}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex gap-2">
                                                        <Button
                                                            onClick={() => handleEdit(donation.id)}
                                                            variant="outline"
                                                            size="sm"
                                                        >
                                                            Editează
                                                        </Button>
                                                        <Button
                                                            onClick={() => handleDelete(donation.id)}
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-red-600 hover:text-red-700"
                                                        >
                                                            Șterge
                                                        </Button>
                                                    </div>
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

                <CreateDonationModal 
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSuccess={handleCreateSuccess}
                    entities={entities.map(e => ({ value: e.id, label: e.name }))}
                    projects={[]} // TODO: Load projects when needed
                    activities={[]} // TODO: Load activities when needed
                />

                <UpdateDonationModal 
                    isOpen={isUpdateModalOpen}
                    onClose={() => setIsUpdateModalOpen(false)}
                    onSuccess={handleUpdateSuccess}
                    donationId={selectedDonationId}
                    entities={entities.map(e => ({ value: e.id, label: e.name }))}
                    projects={[]} // TODO: Load projects when needed
                    activities={[]} // TODO: Load activities when needed
                />
            </div>
        </Layout>
    );
};

export default DonationsPage;