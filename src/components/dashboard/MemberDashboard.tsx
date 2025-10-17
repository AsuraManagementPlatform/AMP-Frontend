import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Project, Activity, User } from '@/types/index.types';
import toast from 'react-hot-toast';

interface MemberDashboardProps {
    user: User | null;
    projects: Project[];
    activities: Activity[];
    projectsLoading: boolean;
    activitiesLoading: boolean;
}

const MOCK_MEMBERSHIP_FEES = [
    { id: '1', period: 'Ian 2025', amount: 50, status: 'PAID', paymentDate: '2025-01-15', method: 'Transfer bancar' },
    { id: '2', period: 'Feb 2025', amount: 50, status: 'PAID', paymentDate: '2025-02-10', method: 'Cash' },
    { id: '3', period: 'Mar 2025', amount: 50, status: 'PENDING', dueDate: '2025-03-31', method: '-' },
];

const MOCK_SURVEYS = [
    { id: '1', title: 'Sondaj satisfacție membri 2025', deadline: '2025-03-30', status: 'ACTIVE', completed: false },
    { id: '2', title: 'Feedback proiect X', deadline: '2025-03-25', status: 'ACTIVE', completed: false },
];

const MOCK_MESSAGES = [
    { id: '1', subject: 'Întrebare despre cotizație', date: '2025-03-10', status: 'RĂSPUNS', from: 'Tu' },
    { id: '2', subject: 'Sugestie eveniment', date: '2025-03-05', status: 'ÎN AȘTEPTARE', from: 'Tu' },
];

export const MemberDashboard: React.FC<MemberDashboardProps> = ({
    user,
    projects,
    activities,
    projectsLoading,
    activitiesLoading
}) => {
    const [showSponsorshipModal, setShowSponsorshipModal] = useState(false);
    const [showProposalModal, setShowProposalModal] = useState(false);
    const [showMessageModal, setShowMessageModal] = useState(false);

    const handleDownloadCertificate = () => {
        toast.success('Certificatul va fi descărcat în curând...');
    };

    const handleUploadCV = () => {
        toast('Funcția de încărcare CV va fi disponibilă în curând', { icon: 'ℹ️' });
    };

    const handleSponsor = () => {
        setShowSponsorshipModal(true);
    };

    const handlePropose = () => {
        setShowProposalModal(true);
    };

    const handleSendMessage = () => {
        setShowMessageModal(true);
    };

    return (
        <>
            <div className="mb-6">
                <Card title="Tablou informativ - Proiectele și activitățile mele" className="mb-6">
                    <div className="space-y-4">
                        <div className="text-sm text-gray-600 mb-4">
                            Vezi aici toate proiectele și activitățile la care participi
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-3">Proiectele mele</h4>
                                <div className="border rounded-lg overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left">Proiect</th>
                                                <th className="px-4 py-2 text-left">Status</th>
                                                <th className="px-4 py-2 text-left">Progres</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {projectsLoading ? (
                                                <tr>
                                                    <td colSpan={3} className="px-4 py-6 text-center text-gray-500">
                                                        <div className="animate-pulse">Încărcare proiecte...</div>
                                                    </td>
                                                </tr>
                                            ) : projects.length > 0 ? (
                                                projects.map((project, index) => (
                                                    <tr key={project.id || index} className="hover:bg-gray-50">
                                                        <td className="px-4 py-3 font-medium">{project.name}</td>
                                                        <td className="px-4 py-3">
                                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                                project.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                            }`}>
                                                                {project.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={3} className="px-4 py-6 text-center text-gray-500">
                                                        Nu participi la niciun proiect în acest moment
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-3">Activitățile mele</h4>
                                <div className="border rounded-lg overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left">Activitate</th>
                                                <th className="px-4 py-2 text-left">Status</th>
                                                <th className="px-4 py-2 text-left">Deadline</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {activitiesLoading ? (
                                                <tr>
                                                    <td colSpan={3} className="px-4 py-6 text-center text-gray-500">
                                                        <div className="animate-pulse">Încărcare activități...</div>
                                                    </td>
                                                </tr>
                                            ) : activities.length > 0 ? (
                                                activities.map((activity, index) => (
                                                    <tr key={activity.id || index} className="hover:bg-gray-50">
                                                        <td className="px-4 py-3 font-medium">{activity.title}</td>
                                                        <td className="px-4 py-3">
                                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                                activity.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                            }`}>
                                                                {activity.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-600">
                                                            {activity.endDate || activity.startDate || 'N/A'}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={3} className="px-4 py-6 text-center text-gray-500">
                                                        Nu ai activități asignate în acest moment
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="mt-4 flex items-center justify-between bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-800 mb-1">Ai o idee pentru o nouă activitate?</p>
                                        <p className="text-xs text-gray-600">Contribuie cu propuneri creative care vor fi revizuite de echipa administrativă</p>
                                    </div>
                                    <button 
                                        onClick={handlePropose}
                                        className="ml-4 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 hover:shadow-lg transition-all text-base font-semibold flex items-center gap-2 whitespace-nowrap shadow-md"
                                    >
                                        <span className="text-xl">💡</span>
                                        Propune activitate
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-semibold text-blue-800 mb-2">Informații despre mine</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-600">Nume:</span> 
                                    <span className="ml-2 font-medium">{user?.full_name || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Email:</span> 
                                    <span className="ml-2 font-medium">{user?.email || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Organizație:</span> 
                                    <span className="ml-2 font-medium">N/A</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Status:</span> 
                                    <span className="ml-2 font-medium">{user?.status || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {/* 1. Membership Fees */}
                <Card title="💳 Cotizații" className="hover:shadow-lg transition-shadow">
                    <div className="space-y-3">
                        <p className="text-sm text-gray-600">Istoric plăți cotizații</p>
                        <div className="space-y-2">
                            {MOCK_MEMBERSHIP_FEES.slice(0, 2).map((fee) => (
                                <div key={fee.id} className="flex justify-between items-center text-sm border-b pb-2">
                                    <span className="font-medium">{fee.period}</span>
                                    <span className={`px-2 py-1 rounded text-xs ${
                                        fee.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {fee.status === 'PAID' ? 'Plătit' : 'Restant'}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <button 
                            onClick={() => toast.success('Pagina de cotizații va fi disponibilă în curând')}
                            className="w-full mt-3 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
                        >
                            Vezi istoricul complet
                        </button>
                    </div>
                </Card>

                {/* 2. Direct Sponsorship */}
                <Card title="🎁 Sponsorizare" className="hover:shadow-lg transition-shadow">
                    <div className="space-y-3">
                        <p className="text-sm text-gray-600">Susține financiar ONG-ul sau un proiect specific</p>
                        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-4 rounded-lg">
                            <div className="text-center">
                                <div className="text-3xl mb-2">❤️</div>
                                <p className="text-xs text-gray-600">Fă o donație</p>
                            </div>
                        </div>
                        <button 
                            onClick={handleSponsor}
                            className="w-full px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-colors text-sm font-medium"
                        >
                            Sponsorizează acum
                        </button>
                    </div>
                </Card>

                {/* 3. Surveys & Voting */}
                <Card title="📊 Sondaje & Voturi" className="hover:shadow-lg transition-shadow">
                    <div className="space-y-3">
                        <p className="text-sm text-gray-600">Sondaje active care așteaptă răspunsul tău</p>
                        <div className="bg-purple-50 p-3 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">{MOCK_SURVEYS.length}</div>
                            <div className="text-xs text-gray-600">sondaje active</div>
                        </div>
                        <div className="space-y-2">
                            {MOCK_SURVEYS.slice(0, 1).map((survey) => (
                                <div key={survey.id} className="text-sm p-2 bg-gray-50 rounded">
                                    <div className="font-medium">{survey.title}</div>
                                    <div className="text-xs text-gray-600">Deadline: {survey.deadline}</div>
                                </div>
                            ))}
                        </div>
                        <button 
                            onClick={() => toast.success('Modulul de sondaje va fi disponibil în curând')}
                            className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium"
                        >
                            Participă la sondaje
                        </button>
                    </div>
                </Card>

                {/* 4. Certificate Download */}
                <Card title="📜 Adeverințe" className="hover:shadow-lg transition-shadow">
                    <div className="space-y-3">
                        <p className="text-sm text-gray-600">Descarcă adeverințe membru sau voluntar</p>
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg text-center">
                            <div className="text-4xl mb-2">🎓</div>
                            <p className="text-xs text-gray-600">Membru activ din 2024</p>
                        </div>
                        <div className="space-y-2">
                            <button 
                                onClick={handleDownloadCertificate}
                                className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                            >
                                📄 Adeverință Membru
                            </button>
                            <button 
                                onClick={handleDownloadCertificate}
                                className="w-full px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium"
                            >
                                🤝 Adeverință Voluntar
                            </button>
                        </div>
                    </div>
                </Card>

                {/* 5. CV/Skills Upload */}
                <Card title="📋 CV & Competențe" className="hover:shadow-lg transition-shadow">
                    <div className="space-y-3">
                        <p className="text-sm text-gray-600">Încarcă CV-ul și competențele tale</p>
                        <div className="bg-indigo-50 p-4 rounded-lg">
                            <div className="text-center">
                                <div className="text-3xl mb-2">💼</div>
                                <p className="text-xs text-gray-600">Profilul tău profesional</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <button 
                                onClick={handleUploadCV}
                                className="w-full px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors text-sm font-medium"
                            >
                                📁 Încarcă CV
                            </button>
                            <button 
                                onClick={() => toast('Gestionare competențe în curând')}
                                className="w-full px-4 py-2 bg-indigo-400 text-white rounded-lg hover:bg-indigo-500 transition-colors text-sm font-medium"
                            >
                                ⚡ Adaugă Competențe
                            </button>
                        </div>
                    </div>
                </Card>

                {/* 6. Messages/Requests */}
                <Card title="✉️ Mesaje" className="hover:shadow-lg transition-shadow">
                    <div className="space-y-3">
                        <p className="text-sm text-gray-600">Trimite solicitări către ONG</p>
                        <div className="space-y-2">
                            {MOCK_MESSAGES.slice(0, 2).map((msg) => (
                                <div key={msg.id} className="text-sm border-b pb-2">
                                    <div className="font-medium">{msg.subject}</div>
                                    <div className="flex justify-between items-center mt-1">
                                        <span className="text-xs text-gray-600">{msg.date}</span>
                                        <span className={`text-xs px-2 py-1 rounded ${
                                            msg.status === 'RĂSPUNS' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {msg.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button 
                            onClick={handleSendMessage}
                            className="w-full px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors text-sm font-medium"
                        >
                            ✍️ Trimite mesaj nou
                        </button>
                    </div>
                </Card>
            </div>

            {/* Sponsorship Modal */}
            {showSponsorshipModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h3 className="text-xl font-bold mb-4">Sponsorizare Directă</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Destinație</label>
                                <select className="w-full px-3 py-2 border rounded-lg">
                                    <option>ONG General</option>
                                    <option>Proiect X</option>
                                    <option>Proiect Y</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Sumă (RON)</label>
                                <input type="number" className="w-full px-3 py-2 border rounded-lg" placeholder="100" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Metodă de plată</label>
                                <select className="w-full px-3 py-2 border rounded-lg">
                                    <option>Transfer bancar</option>
                                    <option>Cash</option>
                                    <option>Online (viitor)</option>
                                </select>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => {
                                        toast.success('Sponsorizare înregistrată! Mulțumim pentru susținere!');
                                        setShowSponsorshipModal(false);
                                    }}
                                    className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                                >
                                    Confirmă
                                </button>
                                <button 
                                    onClick={() => setShowSponsorshipModal(false)}
                                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                                >
                                    Anulează
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Activity Proposal Modal */}
            {showProposalModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h3 className="text-xl font-bold mb-4">Propunere Activitate Nouă</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Titlu Activitate</label>
                                <input type="text" className="w-full px-3 py-2 border rounded-lg" placeholder="Ex: Workshop Web Design" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Descriere</label>
                                <textarea className="w-full px-3 py-2 border rounded-lg" rows={4} placeholder="Descrie activitatea propusă..."></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Proiect Asociat (opțional)</label>
                                <select className="w-full px-3 py-2 border rounded-lg">
                                    <option>Fără asociere</option>
                                    <option>Proiect X</option>
                                    <option>Proiect Y</option>
                                </select>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => {
                                        toast.success('Propunere trimisă! Va fi revizuită de echipa administrativă.');
                                        setShowProposalModal(false);
                                    }}
                                    className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                                >
                                    Trimite Propunerea
                                </button>
                                <button 
                                    onClick={() => setShowProposalModal(false)}
                                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                                >
                                    Anulează
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Message Modal */}
            {showMessageModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h3 className="text-xl font-bold mb-4">Trimite Mesaj către ONG</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Tip Mesaj</label>
                                <select className="w-full px-3 py-2 border rounded-lg">
                                    <option>Întrebare</option>
                                    <option>Sugestie</option>
                                    <option>Reclamație</option>
                                    <option>Altele</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Subiect</label>
                                <input type="text" className="w-full px-3 py-2 border rounded-lg" placeholder="Subiectul mesajului" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Mesaj</label>
                                <textarea className="w-full px-3 py-2 border rounded-lg" rows={5} placeholder="Scrie mesajul tău aici..."></textarea>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => {
                                        toast.success('Mesaj trimis! Vei primi un răspuns în cel mai scurt timp.');
                                        setShowMessageModal(false);
                                    }}
                                    className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
                                >
                                    Trimite Mesaj
                                </button>
                                <button 
                                    onClick={() => setShowMessageModal(false)}
                                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                                >
                                    Anulează
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};