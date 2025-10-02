import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { ModalButton } from '@/components/ui/ModalButton';
import { Button } from '@/components/ui/Button';
import { Project } from '@/types/index.types';

interface ManageTeamModalProps {
    project: Project | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: TeamManagementData) => void;
}

interface TeamMember {
    id: string;
    name: string;
    role: string;
    email: string;
    skills: string[];
    availability: 'available' | 'busy' | 'unavailable';
}

interface TeamManagementData {
    projectId: string;
    members: TeamMember[];
    roles: string[];
}

export const ManageTeamModal: React.FC<ManageTeamModalProps> = ({
    project,
    isOpen,
    onClose,
    onSave
}) => {
    const [teamMembers, setTeamMembers] = React.useState<TeamMember[]>([]);
    const [availableUsers, setAvailableUsers] = React.useState<TeamMember[]>([]);
    React.useEffect(() => {
        if (project) {
            setTeamMembers([
                {
                    id: '1',
                    name: 'Ana Popescu',
                    role: 'Project Manager',
                    email: 'ana.popescu@ong.ro',
                    skills: ['Management', 'Comunicare'],
                    availability: 'available'
                },
                {
                    id: '2',
                    name: 'Mihai Ionescu',
                    role: 'Coordinator Activități',
                    email: 'mihai.ionescu@ong.ro',
                    skills: ['Coordonare', 'Planificare'],
                    availability: 'busy'
                }
            ]);
            
            setAvailableUsers([
                {
                    id: '3',
                    name: 'Elena Dumitrescu',
                    role: 'Voluntar',
                    email: 'elena.dumitrescu@ong.ro',
                    skills: ['Design', 'Social Media'],
                    availability: 'available'
                },
                {
                    id: '4',
                    name: 'Radu Stoica',
                    role: 'Specialist Comunicare',
                    email: 'radu.stoica@ong.ro',
                    skills: ['Comunicare', 'PR'],
                    availability: 'available'
                }
            ]);
        }
    }, [project]);

    const handleAddMember = (user: TeamMember) => {
        setTeamMembers([...teamMembers, user]);
        setAvailableUsers(availableUsers.filter(u => u.id !== user.id));
    };

    const handleRemoveMember = (memberId: string) => {
        const member = teamMembers.find(m => m.id === memberId);
        if (member) {
            setAvailableUsers([...availableUsers, member]);
            setTeamMembers(teamMembers.filter(m => m.id !== memberId));
        }
    };

    const handleSave = () => {
        if (project) {
            const data: TeamManagementData = {
                projectId: project.id,
                members: teamMembers,
                roles: [...new Set(teamMembers.map(m => m.role))]
            };
            onSave(data);
            onClose();
        }
    };

    const getAvailabilityColor = (availability: string) => {
        switch (availability) {
            case 'available': return 'text-green-600';
            case 'busy': return 'text-yellow-600';
            case 'unavailable': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    if (!project) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Gestionarea echipei - ${project.name}`}
            size="lg"
        >
            <div className="space-y-6"><div>
                    <h3 className="text-lg font-semibold mb-4">Membrii echipei curente</h3>
                    {teamMembers.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">Nu există membri în echipă</p>
                    ) : (
                        <div className="space-y-3">
                            {teamMembers.map((member) => (
                                <div key={member.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3">
                                            <div>
                                                <h4 className="font-medium">{member.name}</h4>
                                                <p className="text-sm text-gray-600">{member.role}</p>
                                                <p className="text-sm text-gray-500">{member.email}</p>
                                            </div>
                                        </div>
                                        <div className="mt-2 flex items-center space-x-4">
                                            <div className="flex flex-wrap gap-1">
                                                {member.skills.map((skill, index) => (
                                                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                            <span className={`text-sm font-medium ${getAvailabilityColor(member.availability)}`}>
                                                {member.availability === 'available' ? 'Disponibil' : 
                                                 member.availability === 'busy' ? 'Ocupat' : 'Indisponibil'}
                                            </span>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleRemoveMember(member.id)}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        Elimină
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div><div>
                    <h3 className="text-lg font-semibold mb-4">Utilizatori disponibili</h3>
                    {availableUsers.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">Nu există utilizatori disponibili</p>
                    ) : (
                        <div className="space-y-3">
                            {availableUsers.map((user) => (
                                <div key={user.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3">
                                            <div>
                                                <h4 className="font-medium">{user.name}</h4>
                                                <p className="text-sm text-gray-600">{user.role}</p>
                                                <p className="text-sm text-gray-500">{user.email}</p>
                                            </div>
                                        </div>
                                        <div className="mt-2 flex items-center space-x-4">
                                            <div className="flex flex-wrap gap-1">
                                                {user.skills.map((skill, index) => (
                                                    <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                            <span className={`text-sm font-medium ${getAvailabilityColor(user.availability)}`}>
                                                {user.availability === 'available' ? 'Disponibil' : 
                                                 user.availability === 'busy' ? 'Ocupat' : 'Indisponibil'}
                                            </span>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleAddMember(user)}
                                        disabled={user.availability === 'unavailable'}
                                        className="text-blue-600 hover:text-blue-700 disabled:text-gray-400"
                                    >
                                        Adaugă
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div><div className="flex justify-end space-x-3 pt-4 border-t">
                    <ModalButton variant="secondary" onClick={onClose}>
                        Anulează
                    </ModalButton>
                    <ModalButton variant="primary" onClick={handleSave}>
                        Salvează echipa
                    </ModalButton>
                </div>
            </div>
        </Modal>
    );
};

