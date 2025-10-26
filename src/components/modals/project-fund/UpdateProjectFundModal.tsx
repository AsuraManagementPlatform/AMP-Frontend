import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { DynamicForm } from '@/components/forms/DynamicForm';
import { updateProjectFundFormConfig } from '@/config/project-fund.form.config';
import { updateProjectFundSchema, UpdateProjectFundData } from '@/schemas/project-fund.schema';
import projectFundService from '@/services/project-fund.service';
import showToast from '@/components/ui/Toast';
import { ProjectFund, ProjectFundUpdateRequest } from '@/types/project-fund.types';

interface UpdateProjectFundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  fund: ProjectFund;
  project: string;
}

export const UpdateProjectFundModal: React.FC<UpdateProjectFundModalProps> = ({
                                                                                isOpen,
                                                                                onClose,
                                                                                onSuccess,
                                                                                fund,
                                                                                project
                                                                              }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: UpdateProjectFundData) => {
    try {
        setIsSubmitting(true);

        const projectFundUpdateRequest: ProjectFundUpdateRequest = {
            id: data.id,
            project: data.project,
            estimatedAmount: data.estimatedAmount,
            source: data.source,
            category: data.category,
            sourceName: data.sourceName,
            currency: data.currency,
            estimatedDate: data.estimatedDate,
            paymentMethod: data.paymentMethod,
            scope: data.scope,
            documentReference: data.documentReference,
            notes: data.notes,
        };

        await projectFundService.update(fund.id, projectFundUpdateRequest);
        showToast.success('Finanțarea a fost actualizată cu succes!');
        onSuccess();
        onClose();
    } catch (error: any) {
      const errorMessage = error?.message || 'Eroare la actualizarea finanțării';
      showToast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formConfig = updateProjectFundFormConfig();

    const defaultValues: UpdateProjectFundData = {
        id: fund.id,
        project: fund.project || project,
        estimatedAmount: fund.estimatedAmount,
        source: fund.source || '',
        category: fund.category || '',
        sourceName: fund.sourceName || '',
        currency: fund.currency || 'RON',
        estimatedDate: fund.estimatedDate || '',
        paymentMethod: fund.paymentMethod || '',
        scope: fund.scope || '',
        documentReference: fund.documentReference || '',
        notes: fund.notes || ''
    };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Actualizează sursă de finanțare"
      size="lg"
    >
      <DynamicForm<UpdateProjectFundData>
        config={formConfig}
        schema={updateProjectFundSchema}
        onSubmit={handleSubmit}
        onCancel={onClose}
        defaultValues={defaultValues}
        isSubmitting={isSubmitting}
      />
    </Modal>
  );
};