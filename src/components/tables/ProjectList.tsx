import React, {useState} from 'react';
import {Project} from '@/types/index.types';
import showToast from '@/components/ui/Toast';
import {useTableData} from "@/hooks/useTableData";
import IconActivity from "@/assets/icons/iconmonstr-activity.svg?react";
import IconGroup from "@/assets/icons/iconmonstr-group.svg?react";
import IconWallet from "@/assets/icons/iconmonstr-wallet.svg?react";

interface ProjectListProps {
    onEdit?: (project: Project) => void;
    onView?: (project: Project) => void;
    onDelete?: (project: Project) => void;
    onRowClick?: (project: Project) => void;
    refreshTrigger?: number;
    canDeleteProject?: (project: Project) => boolean;
    className?: string;
    pageSize?: number;
}

const ProjectList: React.FC<ProjectListProps> = ({
    onRowClick,
    className = ''
}) => {
    const [budgetModalOpen, setBudgetModalOpen] = useState(false);
    const [activitiesModalOpen, setActivitiesModalOpen] = useState(false);
    const [teamModalOpen, setTeamModalOpen] = useState(false);
    const [reportsModalOpen, setReportsModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const { data: projects = [], loading, error } = useTableData<Project>({
        endpoint: "project/list",
        initialPageSize: 20
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="text-gray-600">Se încarcă proiectele...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-red-600">Eroare la încărcarea proiectelor: {error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-2 text-blue-600 hover:text-blue-800 underline"
                >
                    Încearcă din nou
                </button>
            </div>
        );
    }

    return (
        <div className={`space-y-4 ${className}`}>
            {projects.map((project) => (
                <div
                    key={project.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => onRowClick?.(project)}
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-semibold text-lg text-gray-900">{project.name}</h3>
                            <p className="text-gray-600 text-sm mt-1">{project.description}</p>
                            <div className="flex gap-4 mt-2 text-sm text-gray-500">
                                <span>Status: {project.status}</span>
                                <span>Buget: {project.budget?.toLocaleString()} RON</span>
                            </div>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedProject(project);
                                    setBudgetModalOpen(true);
                                }}
                                className="p-2 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                                title="Gestionează buget"
                            >
                                <IconWallet className="w-4 h-4" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedProject(project);
                                    setActivitiesModalOpen(true);
                                }}
                                className="p-2 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
                                title="Vezi activități"
                            >
                                <IconActivity className="w-4 h-4" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedProject(project);
                                    setTeamModalOpen(true);
                                }}
                                className="p-2 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition-colors"
                                title="Gestionează echipa"
                            >
                                <IconGroup className="w-4 h-4" />
                            </button>
                            {/*<button*/}
                            {/*    onClick={(e) => {*/}
                            {/*        e.stopPropagation();*/}
                            {/*        setSelectedProject(project);*/}
                            {/*        setReportsModalOpen(true);*/}
                            {/*    }}*/}
                            {/*    className="p-2 bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors"*/}
                            {/*    title="Generează rapoarte"*/}
                            {/*>*/}
                            {/*    <IconChart className="w-4 h-4" />*/}
                            {/*</button>*/}
                        </div>
                    </div>
                </div>
            ))}{budgetModalOpen && selectedProject && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Gestionarea bugetului - {selectedProject.name}</h2>
                        <button 
                            onClick={() => setBudgetModalOpen(false)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            ✕
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">5.000,00 RON</div>
                            <div className="text-sm text-gray-600">Buget proiect</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">25.000,00 RON</div>
                            <div className="text-sm text-gray-600">Finanțare</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">20.706,00 RON</div>
                            <div className="text-sm text-gray-600">Cheltuieli</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">4.294,00 RON</div>
                            <div className="text-sm text-gray-600">Diferența</div>
                        </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                        <div className="flex items-center">
                            <span className="text-yellow-600 mr-2">⚠️</span>
                            <span className="text-sm">Atenție: Cheltuielile planificate (20.706,00 RON) depășesc bugetul proiectului (5.000,00 RON)!</span>
                        </div>
                    </div>

                    <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-semibold">Intrări buget</h3>
                            <div className="flex gap-2">
                                <button className="px-3 py-1 bg-blue-500 text-white rounded text-sm">+ Adaugă cheltuială</button>
                                <button className="px-3 py-1 bg-green-500 text-white rounded text-sm">💰 Adaugă finanțare</button>
                            </div>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full border border-gray-200 rounded">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="border p-2 text-left">Tip</th>
                                        <th className="border p-2 text-left">Denumirea produselor sau serviciilor</th>
                                        <th className="border p-2 text-left">U.M.</th>
                                        <th className="border p-2 text-left">Cantitatea</th>
                                        <th className="border p-2 text-left">Preț unitar (fără T.V.A.)</th>
                                        <th className="border p-2 text-left">Valoarea - lei T.V.A.</th>
                                        <th className="border p-2 text-left">Valoarea - lei</th>
                                        <th className="border p-2 text-left">Activitate</th>
                                        <th className="border p-2 text-left">Acțiuni</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="border p-2"><span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">Cheltuială</span></td>
                                        <td className="border p-2">Servicii de consultanță IT</td>
                                        <td className="border p-2">oră</td>
                                        <td className="border p-2">100</td>
                                        <td className="border p-2">150,00 RON</td>
                                        <td className="border p-2">15.000,00 RON</td>
                                        <td className="border p-2">2.850,00 RON</td>
                                        <td className="border p-2">Dezvoltare sistem</td>
                                        <td className="border p-2">
                                            <button className="text-red-500 hover:text-red-700">🗑️</button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="border p-2"><span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Finanțare</span></td>
                                        <td className="border p-2">Grant Fonduri Europene</td>
                                        <td className="border p-2">buc</td>
                                        <td className="border p-2">1</td>
                                        <td className="border p-2">25.000,00 RON</td>
                                        <td className="border p-2">25.000,00 RON</td>
                                        <td className="border p-2">0,00 RON</td>
                                        <td className="border p-2">-</td>
                                        <td className="border p-2">
                                            <button className="text-red-500 hover:text-red-700">🗑️</button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="border p-2"><span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">Cheltuială</span></td>
                                        <td className="border p-2">Echipamente de birou</td>
                                        <td className="border p-2">set</td>
                                        <td className="border p-2">2</td>
                                        <td className="border p-2">1.200,00 RON</td>
                                        <td className="border p-2">2.400,00 RON</td>
                                        <td className="border p-2">456,00 RON</td>
                                        <td className="border p-2">Setup birou</td>
                                        <td className="border p-2">
                                            <button className="text-red-500 hover:text-red-700">🗑️</button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Note buget</label>
                        <textarea 
                            className="w-full border border-gray-300 rounded p-2 h-20"
                            placeholder="Planificare buget pentru implementarea proiectului..."
                            defaultValue="Planificare buget pentru implementarea proiectului..."
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <button 
                            onClick={() => setBudgetModalOpen(false)}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                        >
                            Anulează
                        </button>
                        <button 
                            onClick={() => {
                                setBudgetModalOpen(false);
                                showToast.success('Bugetul a fost salvat cu succes!');
                            }}
                            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                        >
                            Salvează bugetul
                        </button>
                    </div>
                </div>
            </div>
        )}{activitiesModalOpen && selectedProject && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Activități - {selectedProject.name}</h2>
                        <button 
                            onClick={() => setActivitiesModalOpen(false)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            ✕
                        </button>
                    </div>
                    
                    {/* @TODO List activitati */}

                    <div className="flex justify-end mt-4">
                        <button 
                            onClick={() => setActivitiesModalOpen(false)}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                        >
                            Închide
                        </button>
                    </div>
                </div>
            </div>
        )}{teamModalOpen && selectedProject && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Echipa proiectului - {selectedProject.name}</h2>
                        <button 
                            onClick={() => setTeamModalOpen(false)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            ✕
                        </button>
                    </div>
                    
                    <div className="mb-4">
                        <button className="px-3 py-1 bg-blue-500 text-white rounded text-sm">+ Adaugă membru</button>
                    </div>

                    {/* @TODO Lista membri deja adaugati */}

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
        )}{reportsModalOpen && selectedProject && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Generează rapoarte - {selectedProject.name}</h2>
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
                                <option>Raport financiar</option>
                                <option>Raport activități</option>
                                <option>Raport echipă</option>
                                <option>Raport complet</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium mb-2">Perioada</label>
                            <div className="grid grid-cols-2 gap-2">
                                <input type="date" className="border border-gray-300 rounded p-2" defaultValue="2025-09-01" />
                                <input type="date" className="border border-gray-300 rounded p-2" defaultValue="2025-12-31" />
                            </div>
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
                                showToast.success('Raportul se generează și va fi descărcat în curând!');
                            }}
                            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                        >
                            📊 Generează raport
                        </button>
                    </div>
                </div>
            </div>
        )}
        </div>
    );
};

export default ProjectList;

