import React, {useState, useRef} from 'react';
import {Modal} from '@/components/ui/Modal';
import {DynamicForm} from '@/components/forms/DynamicForm';
import projectFundService from '@/services/project-fund.service';
import { documentService } from '@/services/document.service';
import showToast from '@/components/ui/Toast';
import {ProjectFund, ProjectFundPayRequest} from '@/types/project-fund.types.ts';
import { DocumentCategoryEnum } from '@/types/document.types';
import {t} from 'i18next';
import {payProjectFundFormConfig} from "@/config/project-fund.form.config.ts";
import {
    getPayProjectFundDefaultValues,
    PayProjectFundData,
    payProjectFundSchema
} from "@/schemas/project-fund.schema.ts";

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
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (data: PayProjectFundData) => {
        if (!selectedFile) {
            showToast.error(t('toast.project_fund.document_required'));
            return;
        }

        try {
            setIsSubmitting(true);

            const uploadedDoc = await documentService.upload({
                file: selectedFile,
                category: DocumentCategoryEnum.PROIECTE,
                projectId: fund.project,
                isTemporal: false
            });

            const projectFundPayRequest: ProjectFundPayRequest = {
                id: data.id,
                amount: data.amount,
                date: data.date,
                documentId: uploadedDoc.id
            };

            try {
                await projectFundService.pay(projectFundPayRequest);
                showToast.success(t('toast.project_fund.payment_confirmed'));
                onSuccess();
                onClose();
            } catch (payError: any) {
                try {
                    await documentService.delete(uploadedDoc.id);
                } catch (deleteError) {
                }
                throw payError;
            }
        } catch (error: any) {
            const message = error?.message || t('toast.project_fund.payment_error');
            const translatedMessage = message.includes('.') ? t(message) : message;
            showToast.error(translatedMessage);
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
                            {fund.estimatedAmount.toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {fund.currency}
                        </p>
                    </div>
                    <div>
                        <span className="text-gray-600">{t('label.project_fund.estimated_date')}:</span>
                        <p className="font-semibold">{new Date(fund.estimatedDate).toLocaleDateString('ro-RO')}</p>
                    </div>
                </div>
            </div>

            <div className="mb-4 p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('label.project_fund.payment_proof')} <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-500 mb-3">
                    {t('label.project_fund.payment_proof_description')}
                </p>
                <div className="flex items-center gap-3">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        {selectedFile ? t('action.change_file') : t('action.select_file')}
                    </button>
                    {selectedFile && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="font-medium">{selectedFile.name}</span>
                            <span className="text-gray-400">
                                ({(selectedFile.size / 1024).toFixed(2)} KB)
                            </span>
                        </div>
                    )}
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