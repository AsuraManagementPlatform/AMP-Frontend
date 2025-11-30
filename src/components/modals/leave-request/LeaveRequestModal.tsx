import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { createLeaveRequestSchema, CreateLeaveRequestFormData } from '@/schemas/leave-request.schema';
import { LeaveRequest } from '@/types/leave-request.types';
import Modal from '@/components/ui/Modal';
import { ModalButton } from '@/components/ui/ModalButton';

interface LeaveRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateLeaveRequestFormData) => Promise<void>;
    onDelete?: (id: string) => Promise<void>;
    leaveRequest?: LeaveRequest | null;
    defaultDate?: Date;
    isOwner?: boolean;
}

export const LeaveRequestModal: React.FC<LeaveRequestModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    onDelete,
    leaveRequest,
    defaultDate,
    isOwner = true
}) => {
    const { t } = useTranslation();
    
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        setValue
    } = useForm<CreateLeaveRequestFormData>({
        resolver: zodResolver(createLeaveRequestSchema),
        defaultValues: {
            date: '',
            endDate: '',
            notes: ''
        }
    });

    useEffect(() => {
        if (leaveRequest) {
            reset({
                date: leaveRequest.date.split('T')[0],
                endDate: leaveRequest.endDate?.split('T')[0] || '',
                notes: leaveRequest.notes || ''
            });
        } else if (defaultDate) {
            const year = defaultDate.getFullYear();
            const month = String(defaultDate.getMonth() + 1).padStart(2, '0');
            const day = String(defaultDate.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;
            
            setValue('date', dateStr);
            setValue('endDate', dateStr);
        }
    }, [leaveRequest, defaultDate, reset, setValue]);

    const handleFormSubmit = async (data: CreateLeaveRequestFormData) => {
        await onSubmit(data);
        reset();
    };

    const handleDelete = async () => {
        if (leaveRequest && onDelete && confirm(t('label.leave_request.confirm_delete'))) {
            await onDelete(leaveRequest.id);
            reset();
        }
    };

    const isEditMode = !!leaveRequest;
    const canEdit = !isEditMode || isOwner;
    const canDelete = isOwner && leaveRequest?.status === 'PENDING';

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditMode ? t('label.leave_request.edit_title') : t('label.leave_request.create_title')}
            size="md"
        >
            <form onSubmit={handleSubmit(handleFormSubmit)}>
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('label.leave_request.start_date')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                {...register('date')}
                                disabled={!canEdit}
                                className={`w-full rounded-md border ${
                                    errors.date ? 'border-red-500' : 'border-gray-300'
                                } shadow-sm focus:border-orange-500 focus:ring-orange-500 px-3 py-2 ${!canEdit ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                            />
                            {errors.date && (
                                <p className="mt-1 text-sm text-red-600">{t(errors.date.message || '')}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('label.leave_request.end_date')}
                            </label>
                            <input
                                type="date"
                                {...register('endDate')}
                                disabled={!canEdit}
                                className={`w-full rounded-md border ${
                                    errors.endDate ? 'border-red-500' : 'border-gray-300'
                                } shadow-sm focus:border-orange-500 focus:ring-orange-500 px-3 py-2 ${!canEdit ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                            />
                            {errors.endDate && (
                                <p className="mt-1 text-sm text-red-600">{t(errors.endDate.message || '')}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('label.leave_request.notes')}
                        </label>
                        <textarea
                            {...register('notes')}
                            rows={3}
                            disabled={!canEdit}
                            className={`w-full rounded-md border ${
                                errors.notes ? 'border-red-500' : 'border-gray-300'
                            } shadow-sm focus:border-orange-500 focus:ring-orange-500 px-3 py-2 ${!canEdit ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                            placeholder={t('label.leave_request.notes_placeholder')}
                        />
                        {errors.notes && (
                            <p className="mt-1 text-sm text-red-600">{t(errors.notes.message || '')}</p>
                        )}
                    </div>

                    {isEditMode && leaveRequest && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">
                                {t('label.leave_request.status_info')}
                            </h4>
                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    leaveRequest.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                    leaveRequest.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                    leaveRequest.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                    {t(`label.leave_request.status_${leaveRequest.status.toLowerCase()}`)}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200">
                    {canDelete && onDelete && (
                        <ModalButton
                            type="button"
                            variant="danger"
                            size="sm"
                            onClick={handleDelete}
                        >
                            {t('label.button.delete')}
                        </ModalButton>
                    )}
                    <ModalButton
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={onClose}
                    >
                        {t('label.button.cancel')}
                    </ModalButton>
                    {canEdit && (
                        <ModalButton
                            type="submit"
                            variant="primary"
                            size="sm"
                            isLoading={isSubmitting}
                            disabled={isSubmitting}
                        >
                            {isEditMode ? t('label.button.update') : t('label.button.submit')}
                        </ModalButton>
                    )}
                </div>
            </form>
        </Modal>
    );
};
