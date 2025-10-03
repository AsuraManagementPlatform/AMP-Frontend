import React, { useState } from "react";
import { Activity } from "@/types/index.types";
import showToast from "@/components/ui/Toast";
import IconEdit from "@/assets/icons/iconmonstr-edit.svg?react";
import IconDelete from "@/assets/icons/iconmonstr-delete.svg?react";
import IconEye from "@/assets/icons/iconmonstr-eye.svg?react";
import IconActivity from "@/assets/icons/iconmonstr-activity.svg?react";
import IconGroup from "@/assets/icons/iconmonstr-group.svg?react";
import IconChart from "@/assets/icons/iconmonstr-chart.svg?react";
import IconWallet from "@/assets/icons/iconmonstr-wallet.svg?react";

interface ActivityListProps {
    onEdit?: (activity: Activity) => void;
    onView?: (activity: Activity) => void;
    onDelete?: (activity: Activity) => void;
    onRowClick?: (activity: Activity) => void;
    canDeleteActivity?: (activity: Activity) => boolean;
    className?: string;
    pageSize?: number;
}

const ActivityList: React.FC<ActivityListProps> = ({
    onEdit,
    onView,
    onDelete,
    onRowClick,
    canDeleteActivity = () => true,
    className = ""
}) => {
    const [progressModalOpen, setProgressModalOpen] = useState(false);
    const [teamModalOpen, setTeamModalOpen] = useState(false);
    const [budgetModalOpen, setBudgetModalOpen] = useState(false);
    const [reportsModalOpen, setReportsModalOpen] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
    const mockActivities: Activity[] = [
        {
            id: "1",
            title: "Workshop Educație pentru Mediu",
            type: "WORKSHOP",
            status: "IN_PROGRESS",
            startDate: "2025-10-01",
            endDate: "2025-10-15",
            projectId: "proj1",
            assignedTo: ["user1", "user2", "user3"],
            estimatedHours: 20,
            actualHours: 8,
            createdAt: "2025-09-28T10:00:00Z",
            updatedAt: "2025-09-30T15:30:00Z"
        },
        {
            id: "2", 
            title: "Întâlnire de planificare strategică",
            type: "MEETING",
            status: "COMPLETED",
            startDate: "2025-09-28",
            endDate: "2025-09-28",
            projectId: "proj1",
            assignedTo: ["user1", "user2"],
            estimatedHours: 2,
            actualHours: 2,
            createdAt: "2025-09-25T09:00:00Z",
            updatedAt: "2025-09-28T17:00:00Z"
        },
        {
            id: "3",
            title: "Event Fundraising Comunitar",
            type: "EVENT", 
            status: "PLANNED",
            startDate: "2025-11-01",
            endDate: "2025-11-03",
            projectId: "proj2",
            assignedTo: ["user1", "user2", "user3", "user4"],
            estimatedHours: 40,
            actualHours: 0,
            createdAt: "2025-09-20T14:00:00Z",
            updatedAt: "2025-09-29T11:15:00Z"
        }
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PLANNED': return 'bg-yellow-100 text-yellow-800';
            case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
            case 'COMPLETED': return 'bg-green-100 text-green-800';
            case 'CANCELLED': return 'bg-red-100 text-red-800';
            case 'POSTPONED': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'PLANNED': return 'Planificat';
            case 'IN_PROGRESS': return 'În progres';
            case 'COMPLETED': return 'Finalizat';
            case 'CANCELLED': return 'Anulat';
            case 'POSTPONED': return 'Amânat';
            default: return status;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'MEETING': return 'bg-blue-100 text-blue-800';
            case 'WORKSHOP': return 'bg-green-100 text-green-800';
            case 'EVENT': return 'bg-purple-100 text-purple-800';
            case 'TASK': return 'bg-orange-100 text-orange-800';
            case 'MILESTONE': return 'bg-red-100 text-red-800';
            case 'REVIEW': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'MEETING': return 'Întâlnire';
            case 'WORKSHOP': return 'Workshop';
            case 'EVENT': return 'Eveniment';
            case 'TASK': return 'Sarcină';
            case 'MILESTONE': return 'Milestone';
            case 'REVIEW': return 'Evaluare';
            default: return type;
        }
    };

    return (
        <div className={`space-y-4 ${className}`}><div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <div className="flex items-center">
                        <IconActivity className="w-5 h-5 text-orange-600 mr-2" />
                        <div>
                            <div className="text-lg font-semibold text-orange-700">
                                {mockActivities.length}
                            </div>
                            <div className="text-xs text-orange-600">Activități totale</div>
                        </div>
                    </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center">
                        <IconGroup className="w-5 h-5 text-blue-600 mr-2" />
                        <div>
                            <div className="text-lg font-semibold text-blue-700">
                                {mockActivities.reduce((sum, activity) => sum + (activity.assignedTo?.length || 0), 0)}
                            </div>
                            <div className="text-xs text-blue-600">Persoane asignate</div>
                        </div>
                    </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center">
                        <IconChart className="w-5 h-5 text-green-600 mr-2" />
                        <div>
                            <div className="text-lg font-semibold text-green-700">
                                {mockActivities.filter(a => a.status === 'COMPLETED').length}
                            </div>
                            <div className="text-xs text-green-600">Activități complete</div>
                        </div>
                    </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <div className="flex items-center">
                        <IconWallet className="w-5 h-5 text-purple-600 mr-2" />
                        <div>
                            <div className="text-lg font-semibold text-purple-700">
                                {mockActivities.reduce((sum, activity) => sum + (activity.estimatedHours || 0), 0)}
                            </div>
                            <div className="text-xs text-purple-600">Ore estimate total</div>
                        </div>
                    </div>
                </div>
            </div>{mockActivities.map((activity) => (
                <div
                    key={activity.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => onRowClick?.(activity)}
                >
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                                <h3 className="font-semibold text-lg text-gray-900 flex-1">{activity.title}</h3>
                                <div className="flex gap-2 ml-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(activity.type)}`}>
                                        {getTypeLabel(activity.type)}
                                    </span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                                        {getStatusLabel(activity.status)}
                                    </span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm text-gray-500">
                                <div>
                                    <span className="font-medium">Data început:</span>
                                    <div>{activity.startDate ? new Date(activity.startDate).toLocaleDateString('ro-RO') : 'N/A'}</div>
                                </div>
                                <div>
                                    <span className="font-medium">Data sfârșit:</span>
                                    <div>{activity.endDate ? new Date(activity.endDate).toLocaleDateString('ro-RO') : 'N/A'}</div>
                                </div>
                                <div>
                                    <span className="font-medium">Persoane asignate:</span>
                                    <div className="font-semibold text-blue-600">{activity.assignedTo?.length || 0}</div>
                                </div>
                                <div>
                                    <span className="font-medium">Ore estimate:</span>
                                    <div className="font-semibold text-purple-600">{activity.estimatedHours || 0}h</div>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2 flex-wrap ml-4">
                            {onView && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onView(activity);
                                    }}
                                    className="p-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                                    title="Vezi detalii activitate"
                                >
                                    <IconEye className="w-4 h-4" />
                                </button>
                            )}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedActivity(activity);
                                    setProgressModalOpen(true);
                                }}
                                className="p-2 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                                title="Progres activitate"
                            >
                                <IconChart className="w-4 h-4" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedActivity(activity);
                                    setTeamModalOpen(true);
                                }}
                                className="p-2 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
                                title="Gestionează echipa"
                            >
                                <IconGroup className="w-4 h-4" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedActivity(activity);
                                    setBudgetModalOpen(true);
                                }}
                                className="p-2 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition-colors"
                                title="Gestionează buget"
                            >
                                <IconWallet className="w-4 h-4" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedActivity(activity);
                                    setReportsModalOpen(true);
                                }}
                                className="p-2 bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors"
                                title="Generează rapoarte"
                            >
                                <IconActivity className="w-4 h-4" />
                            </button>
                            {onEdit && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit(activity);
                                    }}
                                    className="p-2 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors"
                                    title="Editează activitate"
                                >
                                    <IconEdit className="w-4 h-4" />
                                </button>
                            )}
                            {onDelete && canDeleteActivity(activity) && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(activity);
                                    }}
                                    className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                                    title="Șterge activitate"
                                >
                                    <IconDelete className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            ))}{progressModalOpen && selectedActivity && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Progres - {selectedActivity.title}</h2>
                            <button 
                                onClick={() => setProgressModalOpen(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-blue-50 p-3 rounded">
                                    <div className="text-2xl font-bold text-blue-600">{selectedActivity.estimatedHours || 0}h</div>
                                    <div className="text-sm text-blue-600">Ore estimate</div>
                                </div>
                                <div className="bg-green-50 p-3 rounded">
                                    <div className="text-2xl font-bold text-green-600">{selectedActivity.actualHours || 0}h</div>
                                    <div className="text-sm text-green-600">Ore lucrate</div>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-2">Progres activitate (%)</label>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div 
                                        className="bg-blue-600 h-3 rounded-full" 
                                        style={{ width: selectedActivity.status === 'COMPLETED' ? '100%' : selectedActivity.status === 'IN_PROGRESS' ? '45%' : '0%' }}
                                    ></div>
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                    {selectedActivity.status === 'COMPLETED' ? '100' : selectedActivity.status === 'IN_PROGRESS' ? '45' : '0'}% completat
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Note progres</label>
                                <textarea 
                                    className="w-full border border-gray-300 rounded p-2 h-20"
                                    placeholder="Adaugă note despre progresul activității..."
                                    defaultValue="Activitatea progresează conform planului. Echipa este productivă și respectă termenele."
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-4">
                            <button 
                                onClick={() => setProgressModalOpen(false)}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                            >
                                Închide
                            </button>
                            <button 
                                onClick={() => {
                                    setProgressModalOpen(false);
                                    showToast.success('Progresul a fost actualizat!');
                                }}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                Salvează progres
                            </button>
                        </div>
                    </div>
                </div>
            )}{teamModalOpen && selectedActivity && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Echipa - {selectedActivity.title}</h2>
                            <button 
                                onClick={() => setTeamModalOpen(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>
                        
                        <div className="mb-4">
                            <button className="px-3 py-1 bg-blue-500 text-white rounded text-sm">+ Asignează persoană</button>
                        </div>

                        <div className="space-y-3">
                            <div className="border border-gray-200 rounded-lg p-3">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h4 className="font-semibold">Maria Ionescu</h4>
                                        <p className="text-sm text-gray-600">Coordonator activitate</p>
                                        <p className="text-sm text-gray-500">maria.ionescu@email.com</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Activ</span>
                                        <button className="text-red-500 hover:text-red-700">🗑️</button>
                                    </div>
                                </div>
                            </div>
                            <div className="border border-gray-200 rounded-lg p-3">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h4 className="font-semibold">Alexandru Popescu</h4>
                                        <p className="text-sm text-gray-600">Participant</p>
                                        <p className="text-sm text-gray-500">alex.popescu@email.com</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Activ</span>
                                        <button className="text-red-500 hover:text-red-700">🗑️</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end mt-4">
                            <button 
                                onClick={() => setTeamModalOpen(false)}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                            >
                                Închide
                            </button>
                        </div>
                    </div>
                </div>
            )}{budgetModalOpen && selectedActivity && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Buget activitate - {selectedActivity.title}</h2>
                            <button 
                                onClick={() => setBudgetModalOpen(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-blue-50 p-3 rounded">
                                    <div className="text-2xl font-bold text-blue-600">2.500 RON</div>
                                    <div className="text-sm text-blue-600">Buget alocat</div>
                                </div>
                                <div className="bg-red-50 p-3 rounded">
                                    <div className="text-2xl font-bold text-red-600">1.850 RON</div>
                                    <div className="text-sm text-red-600">Cheltuieli</div>
                                </div>
                            </div>
                            
                            <div>
                                <h3 className="font-semibold mb-2">Categorii de cheltuieli</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                        <span>Materiale</span>
                                        <span className="font-semibold">800 RON</span>
                                    </div>
                                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                        <span>Transport</span>
                                        <span className="font-semibold">350 RON</span>
                                    </div>
                                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                        <span>Catering</span>
                                        <span className="font-semibold">700 RON</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                            <button 
                                onClick={() => setBudgetModalOpen(false)}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                            >
                                Închide
                            </button>
                            <button 
                                onClick={() => {
                                    setBudgetModalOpen(false);
                                    showToast.success('Bugetul activității a fost actualizat!');
                                }}
                                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                            >
                                Salvează
                            </button>
                        </div>
                    </div>
                </div>
            )}{reportsModalOpen && selectedActivity && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Rapoarte - {selectedActivity.title}</h2>
                            <button 
                                onClick={() => setReportsModalOpen(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Tip raport</label>
                                <select className="w-full border border-gray-300 rounded p-2">
                                    <option>Raport progres</option>
                                    <option>Raport participanți</option>
                                    <option>Raport cheltuieli</option>
                                    <option>Raport complet</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-2">Format export</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center">
                                        <input type="radio" name="format" value="pdf" defaultChecked className="mr-2" />
                                        PDF
                                    </label>
                                    <label className="flex items-center">
                                        <input type="radio" name="format" value="excel" className="mr-2" />
                                        Excel
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                            <button 
                                onClick={() => setReportsModalOpen(false)}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                            >
                                Anulează
                            </button>
                            <button 
                                onClick={() => {
                                    setReportsModalOpen(false);
                                    showToast.success('Raportul pentru activitate se generează!');
                                }}
                                className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                            >
                                📊 Generează
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ActivityList;

