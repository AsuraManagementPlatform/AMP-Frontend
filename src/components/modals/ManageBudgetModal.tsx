import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { ModalButton } from '@/components/ui/ModalButton';
import { Button } from '@/components/ui/Button';
import { Project } from '@/types/index.types';

interface ManageBudgetModalProps {
    project: Project | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: BudgetManagementData) => void;
}

interface BudgetEntry {
    id: string;
    type: 'expense' | 'funding';
    sequenceNumber: number;
    productServiceName: string;
    unitOfMeasure: string;
    quantity: number;
    unitPriceWithoutVat: number;
    totalValueLei: number;
    vatValueLei: number;
    currency: 'LEI' | 'EUR';
    activity?: string;
    status: 'draft' | 'approved' | 'rejected';
    notes?: string;
}

interface BudgetManagementData {
    projectId: string;
    entries: BudgetEntry[];
    notes: string;
}

export const ManageBudgetModal: React.FC<ManageBudgetModalProps> = ({
    project,
    isOpen,
    onClose,
    onSave
}) => {
    const [entries, setEntries] = React.useState<BudgetEntry[]>([]);
    const [notes, setNotes] = React.useState<string>('');
    const [showAddEntry, setShowAddEntry] = React.useState(false);
    const [entryType, setEntryType] = React.useState<'expense' | 'funding'>('expense');
    const [newEntry, setNewEntry] = React.useState<Partial<BudgetEntry>>({
        type: 'expense',
        productServiceName: '',
        unitOfMeasure: 'buc',
        quantity: 1,
        unitPriceWithoutVat: 0,
        currency: 'LEI',
        status: 'draft'
    });
    React.useEffect(() => {
        if (project) {
            setEntries([
                {
                    id: '1',
                    type: 'expense',
                    sequenceNumber: 1,
                    productServiceName: 'Servicii de consultanță IT',
                    unitOfMeasure: 'oră',
                    quantity: 100,
                    unitPriceWithoutVat: 150,
                    totalValueLei: 15000,
                    vatValueLei: 2850,
                    currency: 'LEI',
                    activity: 'Dezvoltare sistem',
                    status: 'approved'
                },
                {
                    id: '2',
                    type: 'funding',
                    sequenceNumber: 2,
                    productServiceName: 'Grant Fonduri Europene',
                    unitOfMeasure: 'buc',
                    quantity: 1,
                    unitPriceWithoutVat: 25000,
                    totalValueLei: 25000,
                    vatValueLei: 0,
                    currency: 'LEI',
                    status: 'approved'
                },
                {
                    id: '3',
                    type: 'expense',
                    sequenceNumber: 3,
                    productServiceName: 'Echipamente de birou',
                    unitOfMeasure: 'set',
                    quantity: 2,
                    unitPriceWithoutVat: 1200,
                    totalValueLei: 2400,
                    vatValueLei: 456,
                    currency: 'LEI',
                    activity: 'Setup birou',
                    status: 'draft'
                }
            ]);
            setNotes('Planificare buget pentru implementarea proiectului.');
        }
    }, [project]);

    const handleAddEntry = () => {
        if (newEntry.productServiceName && newEntry.unitPriceWithoutVat && newEntry.quantity) {
            const totalValue = (newEntry.quantity || 0) * (newEntry.unitPriceWithoutVat || 0);
            const vatValue = totalValue * 0.19;
            
            const entry: BudgetEntry = {
                id: Date.now().toString(),
                type: entryType,
                sequenceNumber: entries.length + 1,
                productServiceName: newEntry.productServiceName || '',
                unitOfMeasure: newEntry.unitOfMeasure || 'buc',
                quantity: newEntry.quantity || 1,
                unitPriceWithoutVat: newEntry.unitPriceWithoutVat || 0,
                totalValueLei: totalValue,
                vatValueLei: vatValue,
                currency: newEntry.currency || 'LEI',
                activity: newEntry.activity,
                status: 'draft'
            };
            
            setEntries([...entries, entry]);
            setNewEntry({
                type: entryType,
                productServiceName: '',
                unitOfMeasure: 'buc',
                quantity: 1,
                unitPriceWithoutVat: 0,
                currency: 'LEI',
                status: 'draft'
            });
            setShowAddEntry(false);
        }
    };

    const handleDeleteEntry = (id: string) => {
        setEntries(entries.filter(e => e.id !== id));
    };

    const handleSave = () => {
        if (project) {
            const data: BudgetManagementData = {
                projectId: project.id,
                entries,
                notes
            };
            onSave(data);
            onClose();
        }
    };

    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat('ro-RO', {
            style: 'currency',
            currency: 'RON'
        }).format(amount);
    };

    const totalExpenses = entries
        .filter(e => e.type === 'expense')
        .reduce((sum, entry) => sum + entry.totalValueLei + entry.vatValueLei, 0);
    
    const totalFunding = entries
        .filter(e => e.type === 'funding')
        .reduce((sum, entry) => sum + entry.totalValueLei, 0);
    
    const projectBudget = project?.budget || 0;

    if (!project) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Gestionarea bugetului - ${project.name}`}
            size="xl"
        >
            <div className="space-y-6"><div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{formatAmount(projectBudget)}</div>
                        <div className="text-sm text-gray-600">Buget proiect</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{formatAmount(totalFunding)}</div>
                        <div className="text-sm text-gray-600">Finanțare</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{formatAmount(totalExpenses)}</div>
                        <div className="text-sm text-gray-600">Cheltuieli</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{formatAmount(totalFunding - totalExpenses)}</div>
                        <div className="text-sm text-gray-600">Diferență</div>
                    </div>
                </div>{totalExpenses > projectBudget && (
                    <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        Atenție: Cheltuielile planificate ({formatAmount(totalExpenses)}) depășesc bugetul proiectului ({formatAmount(projectBudget)})!
                    </div>
                )}<div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Intrări buget</h3>
                    <div className="flex space-x-2">
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                                setEntryType('expense');
                                setNewEntry({...newEntry, type: 'expense'});
                                setShowAddEntry(true);
                            }}
                        >
                            Adaugă cheltuială
                        </Button>
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                                setEntryType('funding');
                                setNewEntry({...newEntry, type: 'funding'});
                                setShowAddEntry(true);
                            }}
                        >
                            Adaugă finanțare
                        </Button>
                    </div>
                </div>{showAddEntry && (
                    <div className="p-4 border border-gray-300 rounded-lg bg-gray-50">
                        <h4 className="font-medium mb-3">
                            Adaugă {entryType === 'expense' ? 'cheltuială' : 'finanțare'}
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium mb-1">Denumirea produselor/serviciilor</label>
                                <input
                                    type="text"
                                    value={newEntry.productServiceName || ''}
                                    onChange={(e) => setNewEntry({...newEntry, productServiceName: e.target.value})}
                                    className="w-full p-2 border border-gray-300 rounded"
                                    placeholder="ex: Servicii consultanță IT"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">U.M.</label>
                                <select
                                    value={newEntry.unitOfMeasure || 'buc'}
                                    onChange={(e) => setNewEntry({...newEntry, unitOfMeasure: e.target.value})}
                                    className="w-full p-2 border border-gray-300 rounded"
                                >
                                    <option value="buc">buc</option>
                                    <option value="oră">oră</option>
                                    <option value="zi">zi</option>
                                    <option value="lună">lună</option>
                                    <option value="kg">kg</option>
                                    <option value="set">set</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Cantitatea</label>
                                <input
                                    type="number"
                                    value={newEntry.quantity || 1}
                                    onChange={(e) => setNewEntry({...newEntry, quantity: Number(e.target.value)})}
                                    className="w-full p-2 border border-gray-300 rounded"
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Preț unitar (fără T.V.A.)</label>
                                <input
                                    type="number"
                                    value={newEntry.unitPriceWithoutVat || 0}
                                    onChange={(e) => setNewEntry({...newEntry, unitPriceWithoutVat: Number(e.target.value)})}
                                    className="w-full p-2 border border-gray-300 rounded"
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                            {entryType === 'expense' && (
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium mb-1">Activitate asignată</label>
                                    <input
                                        type="text"
                                        value={newEntry.activity || ''}
                                        onChange={(e) => setNewEntry({...newEntry, activity: e.target.value})}
                                        className="w-full p-2 border border-gray-300 rounded"
                                        placeholder="ex: Dezvoltare sistem"
                                    />
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end space-x-2 mt-3">
                            <Button variant="outline" size="sm" onClick={() => setShowAddEntry(false)}>
                                Anulează
                            </Button>
                            <Button variant="primary" size="sm" onClick={handleAddEntry}>
                                Adaugă
                            </Button>
                        </div>
                    </div>
                )}<div className="max-h-96 overflow-y-auto">
                    <table className="w-full border-collapse border border-gray-300">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border border-gray-300 p-2 text-left">Nr. crt.</th>
                                <th className="border border-gray-300 p-2 text-left">Tip</th>
                                <th className="border border-gray-300 p-2 text-left">Denumirea produselor sau serviciilor</th>
                                <th className="border border-gray-300 p-2 text-left">U.M.</th>
                                <th className="border border-gray-300 p-2 text-left">Cantitatea</th>
                                <th className="border border-gray-300 p-2 text-left">Preț unitar (fără T.V.A.)</th>
                                <th className="border border-gray-300 p-2 text-left">Valoarea - lei -</th>
                                <th className="border border-gray-300 p-2 text-left">Valoarea T.V.A. - lei -</th>
                                <th className="border border-gray-300 p-2 text-left">Activitate</th>
                                <th className="border border-gray-300 p-2 text-left">Acțiuni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {entries.map((entry) => (
                                <tr key={entry.id} className={entry.type === 'funding' ? 'bg-green-50' : ''}>
                                    <td className="border border-gray-300 p-2">{entry.sequenceNumber}</td>
                                    <td className="border border-gray-300 p-2">
                                        <span className={`px-2 py-1 text-xs rounded ${
                                            entry.type === 'expense' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                        }`}>
                                            {entry.type === 'expense' ? 'Cheltuială' : 'Finanțare'}
                                        </span>
                                    </td>
                                    <td className="border border-gray-300 p-2">{entry.productServiceName}</td>
                                    <td className="border border-gray-300 p-2">{entry.unitOfMeasure}</td>
                                    <td className="border border-gray-300 p-2">{entry.quantity}</td>
                                    <td className="border border-gray-300 p-2">{formatAmount(entry.unitPriceWithoutVat)}</td>
                                    <td className="border border-gray-300 p-2">{formatAmount(entry.totalValueLei)}</td>
                                    <td className="border border-gray-300 p-2">{formatAmount(entry.vatValueLei)}</td>
                                    <td className="border border-gray-300 p-2">{entry.activity || '-'}</td>
                                    <td className="border border-gray-300 p-2">
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => handleDeleteEntry(entry.id)}
                                            className="text-red-600 hover:bg-red-50"
                                        >
                                            Șterge
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div><div>
                    <label className="block text-sm font-medium mb-2">Note buget</label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                        placeholder="Adaugă note despre managementul bugetului..."
                    />
                </div><div className="flex justify-end space-x-3 pt-4 border-t">
                    <ModalButton variant="secondary" onClick={onClose}>
                        Anulează
                    </ModalButton>
                    <ModalButton variant="primary" onClick={handleSave}>
                        Salvează bugetul
                    </ModalButton>
                </div>
            </div>
        </Modal>
    );
};

