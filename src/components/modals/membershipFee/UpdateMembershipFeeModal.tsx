import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { DynamicForm } from '@/components/forms/DynamicForm';
import { updateMembershipFeeFormConfig } from '@/config/membershipFee.form.config';
import { updateMembershipFeeSchema, type UpdateMembershipFeeData } from '@/schemas/membershipFee.schema';
import { membershipFeeService } from '@/services/membershipFee.service';
import { userService } from '@/services/user.service';
import showToast from '@/components/ui/Toast';
import { MembershipFeeUpdateRequest, MembershipFee } from '@/types/membershipFee.types';
import { useAuth } from '@/hooks/useAuth';

interface UpdateMembershipFeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    membershipFeeId: string;
}

export const UpdateMembershipFeeModal: React.FC<UpdateMembershipFeeModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    membershipFeeId
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [formConfig, setFormConfig] = useState(updateMembershipFeeFormConfig());
    const [currentFee, setCurrentFee] = useState<MembershipFee | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);

                const [feeResponse, membersResponse] = await Promise.all([
                    membershipFeeService.getById(membershipFeeId),
                    userService.getList()
                ]);

                const fee = (feeResponse as any).membershipFee || (feeResponse as any).membership_fee || feeResponse;
                setCurrentFee(fee);

                const members = membersResponse.results || [];
                const memberOptions = members.map((member: any) => ({
                    value: member.id,
                    label: `${member.fullName} (${member.email})`
                }));

                const config = updateMembershipFeeFormConfig();
                const memberField = config.sections[0].fields.find(f => f.name === 'memberId');
                if (memberField && 'options' in memberField) {
                    memberField.options = memberOptions;
                }
                
                if (fee.status === 'PAID') {
                    const amountField = config.sections[1].fields.find(f => f.name === 'amount');
                    if (amountField) {
                        amountField.disabled = true;
                        amountField.helperText = 'Suma nu poate fi modificată pentru cotizațiile plătite';
                    }
                }
                
                setFormConfig(config);
            } catch (error) {
                console.error('Error loading data:', error);
                showToast.error('Eroare la încărcarea datelor');
            } finally {
                setIsLoading(false);
            }
        };

        if (isOpen && membershipFeeId) {
            loadData();
        }
    }, [isOpen, membershipFeeId]);

    const handleSubmit = async (data: UpdateMembershipFeeData) => {
        try {
            setIsSubmitting(true);

            const updateRequest: MembershipFeeUpdateRequest = {
                member: data.memberId,
                amount: data.amount,
                currency: data.currency || 'RON',
                renew_period: data.renewPeriod,
                started_from: data.startedFrom,
                ended_at: data.endedAt,
                payment_method: data.paymentMethod,
                auto_renew: data.autoRenew,
                notes: data.notes
            };

            await membershipFeeService.update(membershipFeeId, updateRequest);
            showToast.success('Cotizația a fost actualizată cu succes!');
            onSuccess();
            onClose();
        } catch (error: any) {
            const errorMessage = error?.message || 'Eroare la actualizarea cotizației';
            showToast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const defaultValues: UpdateMembershipFeeData | undefined = currentFee ? {
        memberId: currentFee.memberId,
        organizationId: currentFee.organizationId || user?.organizationId,
        amount: currentFee.amount,
        currency: currentFee.currency,
        renewPeriod: currentFee.renewPeriod,
        startedFrom: currentFee.startedFrom,
        endedAt: currentFee.endedAt,
        autoRenew: currentFee.autoRenew,
        paymentMethod: currentFee.paymentMethod,
        notes: currentFee.notes
    } : undefined;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Actualizează cotizație"
            size="lg"
        >
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
            ) : (
                <DynamicForm<UpdateMembershipFeeData>
                    config={formConfig}
                    schema={updateMembershipFeeSchema}
                    onSubmit={handleSubmit}
                    onCancel={onClose}
                    defaultValues={defaultValues}
                    isSubmitting={isSubmitting}
                />
            )}
        </Modal>
    );
};
