import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/components/ui/Modal';
import { ModalButton } from '@/components/ui/ModalButton';
import { BudgetItemsField } from '@/components/forms/BudgetItemsField';
import { createProjectBudgetSchema, CreateProjectBudgetData, getCreateProjectBudgetDefaultValues } from '@/schemas/budget.schema';
import { BudgetStatus } from '@/types/budget.types';
import showToast from '@/components/ui/Toast';
import budgetService from '@/services/budget.service';
import { ProjectBudgetCreateRequest } from '@/types/budget.types';

interface CreateBudgetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (budget: any) => void;
    organizationId?: string;
    availableProjects?: { id: string; name: string }[];
}

export const CreateBudgetModal: React.FC<CreateBudgetModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    availableProjects = []
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        control,
        handleSubmit,
        watch,
        register,
        reset,
        formState: { errors, isValid }
    } = useForm<CreateProjectBudgetData>({
        resolver: zodResolver(createProjectBudgetSchema),
        defaultValues: getCreateProjectBudgetDefaultValues(),
        mode: 'onChange'
    });

    useEffect(() => {
        if (!isOpen) {
            setIsSubmitting(false);
        }
    }, [isOpen]);

    const onSubmit: SubmitHandler<CreateProjectBudgetData> = async (data) => {
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);
            showToast.loading('Se creează bugetul...');

            const budgetData: ProjectBudgetCreateRequest = {
                ...data,
                projectId: data.projectId
            };

            const createdBudget = await budgetService.createProjectBudget(budgetData);
            
            showToast.success('Bugetul a fost creat cu succes!');
            
            if (onSuccess) {
                onSuccess(createdBudget);
            }
            
            onClose();
        } catch (error) {
            let errorMessage = 'A apărut o eroare la crearea bugetului.';
            
            if (error instanceof Error) {
                errorMessage = `Eroare la crearea bugetului: ${error.message}`;
            }
            
            showToast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getBudgetStatusOptions = () => [
        { value: BudgetStatus.DRAFT, label: 'Draft' },
        { value: BudgetStatus.APPROVED, label: 'Aprobat' },
        { value: BudgetStatus.ACTIVE, label: 'Activ' },
        { value: BudgetStatus.COMPLETED, label: 'Finalizat' },
        { value: BudgetStatus.CANCELLED, label: 'Anulat' }
    ];

    const getProjectOptions = () => [
        { value: '', label: 'Selectează proiect' },
        ...availableProjects.map(project => ({
            value: project.id,
            label: project.name
        }))
    ];

    const handleReset = () => {
        reset(getCreateProjectBudgetDefaultValues());
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Creează buget proiect"
            size="lg"
            showResetButton={true}
            onReset={handleReset}
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6"><div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Informații buget</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Proiect *
                            </label>
                            <select
                                {...register('projectId')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            >
                                {getProjectOptions().map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            {errors.projectId && (
                                <p className="text-red-500 text-sm mt-1">{errors.projectId.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Monedă *
                            </label>
                            <input
                                type="text"
                                {...register('currency')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="RON"
                                maxLength={3}
                                required
                            />
                            {errors.currency && (
                                <p className="text-red-500 text-sm mt-1">{errors.currency.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status *
                            </label>
                            <select
                                {...register('status')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            >
                                {getBudgetStatusOptions().map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            {errors.status && (
                                <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>
                            )}
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Note (opțional)
                            </label>
                            <textarea
                                {...register('notes')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
                                placeholder="Note despre buget..."
                                rows={3}
                                maxLength={1000}
                            />
                            {errors.notes && (
                                <p className="text-red-500 text-sm mt-1">{errors.notes.message}</p>
                            )}
                        </div>
                    </div>
                </div><div className="space-y-4">
                    <BudgetItemsField control={control} watch={watch} register={register} />
                    {errors.items && (
                        <p className="text-red-500 text-sm">{errors.items.message}</p>
                    )}
                </div><div className="flex justify-between items-center pt-6 border-t">
                    <ModalButton
                        type="button"
                        variant="cancel"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        Anulează
                    </ModalButton>

                    <ModalButton
                        type="submit"
                        variant="primary"
                        disabled={isSubmitting || !isValid}
                    >
                        {isSubmitting ? 'Se procesează...' : 'Creează buget'}
                    </ModalButton>
                </div>
            </form>
        </Modal>
    );
};
