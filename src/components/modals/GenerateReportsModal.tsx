import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { ModalButton } from '@/components/ui/ModalButton';
import { Button } from '@/components/ui/Button';
import { Project } from '@/types/index.types';

interface GenerateReportsModalProps {
    project: Project | null;
    isOpen: boolean;
    onClose: () => void;
}

interface ReportTemplate {
    id: string;
    name: string;
    description: string;
    type: 'financial' | 'activity' | 'team' | 'impact' | 'general';
    format: 'pdf' | 'excel' | 'word';
    icon: string;
}

export const GenerateReportsModal: React.FC<GenerateReportsModalProps> = ({
    project,
    isOpen,
    onClose
}) => {
    const [selectedReports, setSelectedReports] = React.useState<string[]>([]);
    const [dateRange, setDateRange] = React.useState({ 
        startDate: '', 
        endDate: '' 
    });
    const [isGenerating, setIsGenerating] = React.useState(false);
    
    const reportTemplates: ReportTemplate[] = [
        {
            id: 'financial-summary',
            name: 'Raport financiar',
            description: 'Sumar complet al cheltuielilor și bugetului proiectului',
            type: 'financial',
            format: 'excel',
            icon: '💰'
        },
        {
            id: 'activity-progress',
            name: 'Progres activități',
            description: 'Raport detaliat despre progresul tuturor activităților',
            type: 'activity',
            format: 'pdf',
            icon: '📊'
        },
        {
            id: 'team-performance',
            name: 'Performanța echipei',
            description: 'Analiza contribuției și performanței membrilor echipei',
            type: 'team',
            format: 'pdf',
            icon: '👥'
        },
        {
            id: 'impact-assessment',
            name: 'Evaluarea impactului',
            description: 'Măsurarea impactului proiectului asupra comunității',
            type: 'impact',
            format: 'word',
            icon: '🎯'
        },
        {
            id: 'quarterly-report',
            name: 'Raport trimestrial',
            description: 'Raport complet pentru perioada selectată',
            type: 'general',
            format: 'pdf',
            icon: '📋'
        },
        {
            id: 'donor-report',
            name: 'Raport pentru donatori',
            description: 'Raport special pentru prezentarea către donatori și parteneri',
            type: 'general',
            format: 'pdf',
            icon: '🤝'
        }
    ];

    React.useEffect(() => {
        if (project) {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setMonth(startDate.getMonth() - 3);
            
            setDateRange({
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0]
            });
        }
    }, [project]);

    const handleReportToggle = (reportId: string) => {
        setSelectedReports(prev => 
            prev.includes(reportId) 
                ? prev.filter(id => id !== reportId)
                : [...prev, reportId]
        );
    };

    const handleSelectAll = () => {
        if (selectedReports.length === reportTemplates.length) {
            setSelectedReports([]);
        } else {
            setSelectedReports(reportTemplates.map(r => r.id));
        }
    };

    const handleGenerateReports = async () => {
        if (selectedReports.length === 0) {
            alert('Vă rugăm să selectați cel puțin un raport pentru generare.');
            return;
        }

        setIsGenerating(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            selectedReports.forEach(reportId => {
                const report = reportTemplates.find(r => r.id === reportId);
                if (report) {
                }
            });
            
            alert(`Au fost generate cu succes ${selectedReports.length} rapoarte pentru proiectul "${project?.name}"`);
            onClose();
        } catch (error) {
            alert('A apărut o eroare la generarea rapoartelor. Vă rugăm să încercați din nou.');
        } finally {
            setIsGenerating(false);
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'financial': return 'text-green-600 bg-green-100';
            case 'activity': return 'text-blue-600 bg-blue-100';
            case 'team': return 'text-purple-600 bg-purple-100';
            case 'impact': return 'text-orange-600 bg-orange-100';
            case 'general': return 'text-gray-600 bg-gray-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getFormatColor = (format: string) => {
        switch (format) {
            case 'pdf': return 'text-red-600 bg-red-100';
            case 'excel': return 'text-green-600 bg-green-100';
            case 'word': return 'text-blue-600 bg-blue-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    if (!project) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Generare rapoarte - ${project.name}`}
            size="lg"
        >
            <div className="space-y-6"><div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3">Perioada raportare</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Data început</label>
                            <input
                                type="date"
                                value={dateRange.startDate}
                                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Data sfârșit</label>
                            <input
                                type="date"
                                value={dateRange.endDate}
                                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div><div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Tipuri de rapoarte</h3>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSelectAll}
                        >
                            {selectedReports.length === reportTemplates.length ? 'Deselectează toate' : 'Selectează toate'}
                        </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {reportTemplates.map((report) => (
                            <div
                                key={report.id}
                                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                                    selectedReports.includes(report.id)
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                                onClick={() => handleReportToggle(report.id)}
                            >
                                <div className="flex items-start space-x-3">
                                    <div className="text-2xl">{report.icon}</div>
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-1">
                                            <h4 className="font-semibold">{report.name}</h4>
                                            <input
                                                type="checkbox"
                                                checked={selectedReports.includes(report.id)}
                                                onChange={() => handleReportToggle(report.id)}
                                                className="w-4 h-4 text-blue-600"
                                            />
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                                        <div className="flex space-x-2">
                                            <span className={`px-2 py-1 text-xs font-medium rounded ${getTypeColor(report.type)}`}>
                                                {report.type === 'financial' ? 'Financiar' :
                                                 report.type === 'activity' ? 'Activități' :
                                                 report.type === 'team' ? 'Echipă' :
                                                 report.type === 'impact' ? 'Impact' : 'General'}
                                            </span>
                                            <span className={`px-2 py-1 text-xs font-medium rounded ${getFormatColor(report.format)}`}>
                                                {report.format.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>{selectedReports.length > 0 && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-blue-900 mb-2">
                            Rapoarte selectate ({selectedReports.length})
                        </h4>
                        <div className="text-sm text-blue-800">
                            {selectedReports.map(reportId => {
                                const report = reportTemplates.find(r => r.id === reportId);
                                return report?.name;
                            }).join(', ')}
                        </div>
                    </div>
                )}<div className="flex justify-end space-x-3 pt-4 border-t">
                    <ModalButton variant="secondary" onClick={onClose} disabled={isGenerating}>
                        Anulează
                    </ModalButton>
                    <ModalButton 
                        variant="primary" 
                        onClick={handleGenerateReports}
                        disabled={isGenerating || selectedReports.length === 0}
                    >
                        {isGenerating ? (
                            <div className="flex items-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Generez rapoarte...</span>
                            </div>
                        ) : (
                            `Generează ${selectedReports.length} rapoarte`
                        )}
                    </ModalButton>
                </div>
            </div>
        </Modal>
    );
};

