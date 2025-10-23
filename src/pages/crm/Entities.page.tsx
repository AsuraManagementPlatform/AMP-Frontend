import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import entityService from '@/services/entity.service';
import { Entity, EntityStatus, EngagementLevel, LegalType } from '@/types/entity.types';
import { CreateEntityModal } from '@/components/modals/entity/CreateEntityModal';
import { UpdateEntityModal } from '@/components/modals/entity/UpdateEntityModal';
import showToast from '@/components/ui/Toast';
import { ROUTES } from '@/utils/constants.utils';

const EntitiesPage: React.FC = () => {
    const navigate = useNavigate();
    const [entities, setEntities] = useState<Entity[]>([]);
    const [_isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterEngagement, setFilterEngagement] = useState<string>('all');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [selectedEntityId, setSelectedEntityId] = useState<string>('');

    useEffect(() => {
        loadEntities();
    }, []);

    const loadEntities = async () => {
        try {
            setIsLoading(true);
            const response = await entityService.getList();
            const entitiesData = response.results || [];
            setEntities(entitiesData);
        } catch (error) {
            showToast.error('Eroare la încărcarea entităților');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateSuccess = () => {
        loadEntities();
    };

    const handleUpdateSuccess = () => {
        loadEntities();
    };

    const handleEdit = (entityId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedEntityId(entityId);
        setIsUpdateModalOpen(true);
    };

    const handleRowClick = (entityId: string) => {
        navigate(ROUTES.CRM_ENTITY_DETAIL.replace(':id', entityId));
    };

    const getLegalTypeLabel = (legalType: string) => {
        return legalType === 'FIZICA' ? 'Persoană Fizică' : 'Persoană Juridică';
    };

    const getStatusBadge = (status: string) => {
        const badges = {
            activ: 'bg-green-100 text-green-800',
            inactiv: 'bg-gray-100 text-gray-800',
            potential: 'bg-blue-100 text-blue-800',
            blocat: 'bg-red-100 text-red-800'
        };
        const labels = {
            activ: 'Activ',
            inactiv: 'Inactiv',
            potential: 'Potențial',
            blocat: 'Blocat'
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badges[status as keyof typeof badges]}`}>
                {labels[status as keyof typeof labels]}
            </span>
        );
    };

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

    const filteredEntities = entities.filter(entity => {
        const matchesSearch = entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            entity.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            entity.identificationNumber.includes(searchTerm);
        const matchesType = filterType === 'all' || entity.type === filterType;
        const matchesStatus = filterStatus === 'all' || entity.status === filterStatus;
        const matchesEngagement = filterEngagement === 'all' || entity.engagementLevel === filterEngagement;
        
        return matchesSearch && matchesType && matchesStatus && matchesEngagement;
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
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                    >
                        + Adaugă Entitate
                    </Button>
                </div>

                <Card className="mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-600">Total Entități</div>
                            <div className="text-2xl font-bold text-blue-600">{entities.length}</div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-600">Active</div>
                            <div className="text-2xl font-bold text-green-600">
                                {entities.filter(e => e.status === EntityStatus.ACTIV).length}
                            </div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-600">Persoane Juridice</div>
                            <div className="text-2xl font-bold text-purple-600">
                                {entities.filter(e => e.legalType === LegalType.JURIDICA).length}
                            </div>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-600">Engagement Total</div>
                            <div className="text-2xl font-bold text-orange-600">
                                {entities.filter(e => e.engagementLevel === EngagementLevel.TOTAL).length}
                            </div>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="mb-4 grid grid-cols-1 md:grid-cols-5 gap-4">
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
                                <option value="donor">Donator</option>
                                <option value="sponsor">Sponsor</option>
                                <option value="partner">Partener</option>
                                <option value="voluntar">Voluntar</option>
                                <option value="beneficiar">Beneficiar</option>
                                <option value="altul">Altul</option>
                            </select>
                        </div>
                        <div>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            >
                                <option value="all">Toate statusurile</option>
                                <option value="activ">Activ</option>
                                <option value="inactiv">Inactiv</option>
                                <option value="potential">Potențial</option>
                                <option value="blocat">Blocat</option>
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
                                        CUI
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Nume
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Tip Persoană
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Tip Entitate
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Contact
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Engagement
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Acțiuni
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredEntities.length > 0 ? (
                                    filteredEntities.map((entity) => (
                                        <tr 
                                            key={entity.id} 
                                            className="hover:bg-gray-50 transition-colors cursor-pointer"
                                            onClick={() => handleRowClick(entity.id)}
                                        >
                                            <td className="px-4 py-4">
                                                <div className="text-sm text-gray-700">{entity.identificationNumber}</div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="font-medium text-gray-900">{entity.name}</div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-sm text-gray-700">{getLegalTypeLabel(entity.legalType)}</span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-sm text-gray-700">{entity.type}</span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="text-sm text-gray-700">{entity.email}</div>
                                                <div className="text-sm text-gray-500">{entity.phone}</div>
                                            </td>
                                            <td className="px-4 py-4">
                                                {getStatusBadge(entity.status)}
                                            </td>
                                            <td className="px-4 py-4">
                                                {getEngagementBadge(entity.engagementLevel || 'deloc')}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex gap-2">
                                                    <Button
                                                        onClick={(e) => handleEdit(entity.id, e)}
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        Editează
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                                            Nu au fost găsite entități care să corespundă filtrelor selectate.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            <CreateEntityModal 
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={handleCreateSuccess}
            />

            <UpdateEntityModal 
                isOpen={isUpdateModalOpen}
                onClose={() => setIsUpdateModalOpen(false)}
                entityId={selectedEntityId}
                onSuccess={handleUpdateSuccess}
            />
        </Layout>
    );
};

export default EntitiesPage;
