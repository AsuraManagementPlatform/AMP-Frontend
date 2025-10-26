import React, {useState} from 'react';
import {Modal} from '@/components/ui/Modal';
import {DynamicForm} from '@/components/forms/DynamicForm';
import {payProjectFundFormConfig} from '@/config/project-fund-pay.form.config';
import {
    getPayProjectFundDefaultValues,
    PayProjectFundData,
    payProjectFundSchema
} from '@/schemas/project-fund-pay.schema';
import projectFundService from '@/services/project-fund.service';
import showToast from '@/components/ui/Toast';
import {ProjectFund, ProjectFundPayRequest, ProjectFundStatus} from '@/types/index.types';
import {t} from 'i18next';

interface PayProjectFundModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    fund: ProjectFund;
}

export const PayProjectFundModal: React.FC<PayProjectFundModalProps> = ({
                                                                            isOpen,
                                                                            onClose,
                                                                            onSuccess,
                                                                            fund
                                                                        }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (data: PayProjectFundData) => {
        try {
            setIsSubmitting(true);

            const projectFundPayRequest: ProjectFundPayRequest = {
                id: data.id,
                amount: data.amount,
                date: data.date,
                status: ProjectFundStatus.PAID
            };

            await projectFundService.pay(projectFundPayRequest);
            showToast.success(t('toast.project_fund.payment_confirmed'));
            onSuccess();
            onClose();
        } catch (error: unknown) {
            if (error instanceof Error) {
                showToast.error(error.message);
            } else {
                showToast.error(t('toast.project_fund.payment_error'));
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const formConfig = payProjectFundFormConfig();
    const defaultValues = getPayProjectFundDefaultValues(fund);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`${t('label.project_fund.confirm_payment_title')} - ${fund.sourceName}`}
            size="md"
        >
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                    {t('label.project_fund.estimated_info')}
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-gray-600">{t('label.project_fund.estimated_amount')}:</span>
                        <p className="font-semibold">
                            {fund.estimatedAmount.toLocaleString('ro-RO', { minimumFractionDigits: 2 })} {fund.currency}
                        </p>
                    </div>
                    <div>
                        <span className="text-gray-600">{t('label.project_fund.receipt_date')}:</span>
                        <p className="font-semibold">{fund.estimatedDate}</p>
                    </div>
                </div>
            </div>

            <DynamicForm<PayProjectFundData>
                config={formConfig}
                schema={payProjectFundSchema}
                onSubmit={handleSubmit}
                onCancel={onClose}
                defaultValues={defaultValues}
                isSubmitting={isSubmitting}
            />
        </Modal>
    );
};