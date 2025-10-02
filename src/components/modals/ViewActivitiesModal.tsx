import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { ModalButton } from '@/components/ui/ModalButton';
import { Button } from '@/components/ui/Button';
import { Project } from '@/types/index.types';

interface ViewActivitiesModalProps {
    project: Project | null;
    isOpen: boolean;
    onClose: () => void;
}

interface Activity {
    id: string;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    status: 'not_started' | 'in_progress' | 'completed' | 'on_hold';
    priority: 'low' | 'medium' | 'high';
    assignedTo: string[];
    progress: number;
    budget: number;
    category: string;
}

export const ViewActivitiesModal: React.FC<ViewActivitiesModalProps> = ({
    project,
    isOpen,
    onClose
}) => {
    const [activities, setActivities] = React.useState<Activity[]>([]);
    const [filter, setFilter] = React.useState<string>('all');
    React.useEffect(() => {
        if (project) {
            setActivities([
                {
                    id: '1',
                    name: 'Workshop educațional pentru copii',
                    description: 'Organizare workshop pentru educația copiilor din comunități defavorizate',
                    startDate: '2024-10-15',
                    endDate: '2024-11-15',
                    status: 'in_progress',
                    priority: 'high',
                    assignedTo: ['Ana Popescu', 'Mihai Ionescu'],
                    progress: 65,
                    budget: 5000,
                    category: 'Educație'
                },
                {
                    id: '2',
                    name: 'Campanie de conștientizare',
                    description: 'Dezvoltarea și implementarea unei campanii de conștientizare în social media',
                    startDate: '2024-09-01',
                    endDate: '2024-12-31',
                    status: 'in_progress',
                    priority: 'medium',
                    assignedTo: ['Elena Dumitrescu', 'Radu Stoica'],
                    progress: 40,
                    budget: 3000,
                    category: 'Marketing'
                },
                {
                    id: '3',
                    name: 'Colectare fonduri',
                    description: 'Organizare evenimente pentru colectarea de fonduri pentru proiect',
                    startDate: '2024-11-01',
                    endDate: '2024-11-30',
                    status: 'not_started',
                    priority: 'high',
                    assignedTo: ['Ana Popescu'],
                    progress: 0,
                    budget: 2000,
                    category: 'Fundraising'
                },
                {
                    id: '4',
                    name: 'Evaluare impact',
                    description: 'Evaluarea impactului proiectului asupra comunității țintă',
                    startDate: '2024-12-01',
                    endDate: '2024-12-31',
                    status: 'not_started',
                    priority: 'medium',
                    assignedTo: ['Mihai Ionescu'],
                    progress: 0,
                    budget: 1500,
                    category: 'Evaluare'
                },
                {
                    id: '5',
                    name: 'Raport final',
                    description: 'Elaborarea raportului final al proiectului',
                    startDate: '2024-08-01',
                    endDate: '2024-09-15',
                    status: 'completed',
                    priority: 'low',
                    assignedTo: ['Ana Popescu', 'Elena Dumitrescu'],
                    progress: 100,
                    budget: 800,
                    category: 'Documentație'
                }
            ]);
        }
    }, [project]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'text-green-600 bg-green-100';
            case 'in_progress': return 'text-blue-600 bg-blue-100';
            case 'not_started': return 'text-gray-600 bg-gray-100';
            case 'on_hold': return 'text-yellow-600 bg-yellow-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'text-red-600 bg-red-100';
            case 'medium': return 'text-yellow-600 bg-yellow-100';
            case 'low': return 'text-green-600 bg-green-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'completed': return 'Completată';
            case 'in_progress': return 'În progres';
            case 'not_started': return 'Neîncepută';
            case 'on_hold': return 'Suspendată';
            default: return status;
        }
    };

    const getPriorityText = (priority: string) => {
        switch (priority) {
            case 'high': return 'Mare';
            case 'medium': return 'Medie';
            case 'low': return 'Scăzută';
            default: return priority;
        }
    };

    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat('ro-RO', {
            style: 'currency',
            currency: 'RON'
        }).format(amount);
    };

    const filteredActivities = activities.filter(activity => {
        if (filter === 'all') return true;
        return activity.status === filter;
    });

    const totalBudget = activities.reduce((sum, activity) => sum + activity.budget, 0);
    const completedActivities = activities.filter(a => a.status === 'completed').length;
    const averageProgress = activities.reduce((sum, activity) => sum + activity.progress, 0) / activities.length;

    if (!project) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Activități proiect - ${project.name}`}
            size="xl"
        >
            <div className="space-y-6"><div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{activities.length}</div>
                        <div className="text-sm text-gray-600">Total activități</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{completedActivities}</div>
                        <div className="text-sm text-gray-600">Completate</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{averageProgress.toFixed(0)}%</div>
                        <div className="text-sm text-gray-600">Progres mediu</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{formatAmount(totalBudget)}</div>
                        <div className="text-sm text-gray-600">Buget total</div>
                    </div>
                </div><div className="flex flex-wrap gap-2">
                    <Button
                        variant={filter === 'all' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setFilter('all')}
                    >
                        Toate ({activities.length})
                    </Button>
                    <Button
                        variant={filter === 'in_progress' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setFilter('in_progress')}
                    >
                        În progres ({activities.filter(a => a.status === 'in_progress').length})
                    </Button>
                    <Button
                        variant={filter === 'completed' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setFilter('completed')}
                    >
                        Completate ({activities.filter(a => a.status === 'completed').length})
                    </Button>
                    <Button
                        variant={filter === 'not_started' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setFilter('not_started')}
                    >
                        Neîncepute ({activities.filter(a => a.status === 'not_started').length})
                    </Button>
                </div><div className="space-y-4 max-h-96 overflow-y-auto">
                    {filteredActivities.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">Nu există activități pentru filtrul selectat</p>
                    ) : (
                        filteredActivities.map((activity) => (
                            <div key={activity.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-lg">{activity.name}</h4>
                                        <p className="text-gray-600 mt-1">{activity.description}</p>
                                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                            <span>Categorie: {activity.category}</span>
                                            <span>Buget: {formatAmount(activity.budget)}</span>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(activity.status)}`}>
                                            {getStatusText(activity.status)}
                                        </span>
                                        <span className={`px-2 py-1 text-xs font-medium rounded ${getPriorityColor(activity.priority)}`}>
                                            Prioritate {getPriorityText(activity.priority)}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                    <div>
                                        <span className="text-sm text-gray-600">Perioada:</span>
                                        <div className="font-medium">
                                            {new Date(activity.startDate).toLocaleDateString('ro-RO')} - {new Date(activity.endDate).toLocaleDateString('ro-RO')}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-600">Responsabili:</span>
                                        <div className="font-medium">{activity.assignedTo.join(', ')}</div>
                                    </div>
                                </div><div className="mb-3">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-medium">Progres activitate</span>
                                        <span className="text-sm text-gray-600">{activity.progress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                            className={`h-2 rounded-full transition-all duration-300 ${
                                                activity.progress === 100 ? 'bg-green-500' :
                                                activity.progress > 75 ? 'bg-blue-500' :
                                                activity.progress > 50 ? 'bg-yellow-500' : 'bg-orange-500'
                                            }`}
                                            style={{ width: `${activity.progress}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-2">
                                    <Button variant="outline" size="sm">
                                        Detalii
                                    </Button>
                                    <Button variant="outline" size="sm">
                                        Editează
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div><div className="flex justify-between pt-4 border-t">
                    <Button variant="outline">
                        Creează activitate nouă
                    </Button>
                    <ModalButton variant="secondary" onClick={onClose}>
                        Închide
                    </ModalButton>
                </div>
            </div>
        </Modal>
    );
};

