import React from 'react';
import { Control, useFieldArray, UseFormWatch, UseFormRegister } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { BudgetCategory } from '@/types/budget.types';
import { CreateProjectBudgetData } from '@/schemas/budget.schema';

interface ExpenseItemsFieldProps {
    control: Control<CreateProjectBudgetData>;
    watch: UseFormWatch<CreateProjectBudgetData>;
    register: UseFormRegister<CreateProjectBudgetData>;
}

const getExpenseCategoryOptions = () => [
    { value: BudgetCategory.PERSONNEL, label: 'Personal' },
    { value: BudgetCategory.EQUIPMENT, label: 'Echipamente' },
    { value: BudgetCategory.MATERIALS, label: 'Materiale' },
    { value: BudgetCategory.SERVICES, label: 'Servicii' },
    { value: BudgetCategory.TRAVEL, label: 'Călătorii' },
    { value: BudgetCategory.OVERHEAD, label: 'Cheltuieli generale' },
    { value: BudgetCategory.OTHER, label: 'Altele' }
];

export const ExpenseItemsField: React.FC<ExpenseItemsFieldProps> = ({ control, watch, register }) => {
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'items'
    });

    const currency = watch('currency') || 'RON';

    const addExpenseItem = () => {
        append({
            category: BudgetCategory.OTHER,
            description: '',
            plannedAmount: 0,
            actualAmount: undefined,
            currency: currency,
            notes: ''
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-700">
                    Elemente cheltuieli ({fields.length})
                </h4>
            </div>

            {fields.length === 0 && (
                <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                    <p>Nu există elemente în cheltuieli</p>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addExpenseItem}
                        className="mt-2"
                    >
                        Adaugă primul element
                    </Button>
                </div>
            )}

            <div className="space-y-4">
                {fields.map((field, index) => (
                    <div key={field.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-3">
                            <h5 className="text-sm font-medium text-gray-700">
                                Element {index + 1}
                            </h5>
                            {fields.length > 1 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => remove(index)}
                                    className="text-red-600 hover:text-red-700 hover:border-red-300"
                                >
                                    Șterge
                                </Button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Categorie *
                                </label>
                                <select
                                    {...register(`items.${index}.category` as const)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                >
                                    {getExpenseCategoryOptions().map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Sumă planificată ({currency}) *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    {...register(`items.${index}.plannedAmount` as const, {
                                        valueAsNumber: true
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="0.00"
                                    required
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Descriere *
                                </label>
                                <input
                                    type="text"
                                    {...control.register(`items.${index}.description` as const)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Descrierea elementului de cheltuială"
                                    maxLength={500}
                                    required
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Note (opțional)
                                </label>
                                <textarea
                                    {...register(`items.${index}.notes` as const)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
                                    placeholder="Note suplimentare..."
                                    rows={2}
                                    maxLength={500}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {fields.length > 0 && (
                <div className="flex justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addExpenseItem}
                    >
                        Adaugă încă un element
                    </Button>
                </div>
            )}
        </div>
    );
};