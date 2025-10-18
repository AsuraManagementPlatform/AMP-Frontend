import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { DynamicForm } from '@/components/forms/DynamicForm';
import { createMembershipFeeFormConfig } from '@/config/membershipFee.form.config';
import { createMembershipFeeSchema, type CreateMembershipFeeData, getCreateMembershipFeeDefaultValues } from '@/schemas/membershipFee.schema';
import { membershipFeeService } from '@/services/membershipFee.service';
import { userService } from '@/services/user.service';
import showToast from '@/components/ui/Toast';
import toast from 'react-hot-toast';
import { MembershipFeeCreateRequest } from '@/types/membershipFee.types';
import { useAuth } from '@/hooks/useAuth';

interface CreateMembershipFeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    memberId?: string;
}

export const CreateMembershipFeeModal: React.FC<CreateMembershipFeeModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    memberId
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formConfig, setFormConfig] = useState(createMembershipFeeFormConfig());
    const { user } = useAuth();

    useEffect(() => {
        const loadMembers = async () => {
            try {
                if (!user?.organizationId) return;

                const response = await userService.getList();
                const members = response.results || [];
                const memberOptions = members.map((member: any) => ({
                    value: member.id,
                    label: `${member.fullName} (${member.email})`
                }));

                const config = createMembershipFeeFormConfig();
                const memberField = config.sections[0].fields.find(f => f.name === 'memberId');
                if (memberField && 'options' in memberField) {
                    memberField.options = memberOptions;
                }
                setFormConfig(config);
            } catch (error) {
                console.error('Error loading members:', error);
                showToast.error('Eroare la încărcarea membrilor');
            }
        };

        if (isOpen) {
            loadMembers();
        }
    }, [isOpen, user?.organizationId]);

    const handleSubmit = async (data: CreateMembershipFeeData) => {
        let loadingToast: string | undefined;
        
        try {
            setIsSubmitting(true);
            
            loadingToast = showToast.creatingMembershipFee();

            const membershipFeeCreateRequest: MembershipFeeCreateRequest = {
                member: data.memberId,
                amount: data.amount,
                currency: data.currency || 'RON',
                renew_period: data.renewPeriod,
                started_from: data.startedFrom,
                ended_at: data.endedAt,
                auto_renew: data.autoRenew || false,
                payment_method: data.paymentMethod,
                notes: data.notes
            };

            await membershipFeeService.create(membershipFeeCreateRequest);
            
            if (loadingToast) {
                toast.dismiss(loadingToast);
            }
            
            showToast.membershipFeeCreated();
            onSuccess();
            onClose();
        } catch (error: any) {
            if (loadingToast) {
                toast.dismiss(loadingToast);
            }
            
            const errorMessage = error?.message || 'Eroare la adăugarea cotizației';
            showToast.membershipFeeCreationFailed(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const defaultValues = getCreateMembershipFeeDefaultValues(memberId, user?.organizationId);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Adaugă cotizație membru"
            size="lg"
        >
            <DynamicForm<CreateMembershipFeeData>
                config={formConfig}
                schema={createMembershipFeeSchema}
                onSubmit={handleSubmit}
                onCancel={onClose}
                defaultValues={defaultValues}
                isSubmitting={isSubmitting}
            />
        </Modal>
    );
};
