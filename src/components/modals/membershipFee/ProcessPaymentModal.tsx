import React, { useState, useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { DynamicForm } from '@/components/forms/DynamicForm';
import { processPaymentFormConfig, processPaymentSelfFormConfig } from '@/config/membershipFee.form.config';
import { 
    createProcessPaymentSchema,
    createProcessPaymentSelfSchema,
    type ProcessPaymentData, 
    type ProcessPaymentSelfData,
    getProcessPaymentDefaultValues,
    getProcessPaymentSelfDefaultValues
} from '@/schemas/membershipFee.schema';
import { membershipFeeService } from '@/services/membershipFee.service';
import showToast from '@/components/ui/Toast';
import { MembershipFeePaymentCreateRequest } from '@/types/membershipFee.types';
import { useAuth } from '@/hooks/useAuth';

interface ProcessPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    membershipFeeId: string;
    memberId: string;
    memberName: string;
    amount: number;
    remainingAmount: number;
    currency: string;
}

export const ProcessPaymentModal: React.FC<ProcessPaymentModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    membershipFeeId,
    memberId,
    memberName,
    amount,
    remainingAmount,
    currency
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user } = useAuth();
    
    const isOwnFee = useMemo(() => {
        return user?.id === memberId;
    }, [user?.id, memberId]);

    const handleSubmit = async (data: ProcessPaymentData | ProcessPaymentSelfData) => {
        try {
            setIsSubmitting(true);

            const paymentDate = data.paymentDate || new Date().toISOString().split('T')[0];

            if (isOwnFee) {
                const selfData = data as ProcessPaymentSelfData;
                
                const notesWithProof = selfData.documentReference 
                    ? `${selfData.notes || ''}\n\nDovadă plată: ${selfData.documentReference}`.trim()
                    : selfData.notes;
                
                const paymentRequest: MembershipFeePaymentCreateRequest = {
                    amount: selfData.amount,
                    paymentDate: paymentDate,
                    paymentMethod: selfData.paymentMethod,
                    notes: notesWithProof || undefined
                };

                await membershipFeeService.createPayment(membershipFeeId, paymentRequest);
                showToast.success(`Plata ta de ${selfData.amount} ${currency} a fost trimisă pentru validare! Vei fi notificat când este confirmată.`);
            } else {
                const adminData = data as ProcessPaymentData;
                
                const notesWithProof = adminData.documentReference 
                    ? `${adminData.notes || ''}\n\nDovadă plată: ${adminData.documentReference}`.trim()
                    : adminData.notes;
                
                const paymentRequest: MembershipFeePaymentCreateRequest = {
                    amount: adminData.amount,
                    paymentDate: paymentDate,
                    paymentMethod: adminData.paymentMethod,
                    notes: notesWithProof || undefined
                };

                await membershipFeeService.createPayment(membershipFeeId, paymentRequest);
                showToast.success(`Plata de ${adminData.amount} ${currency} pentru ${memberName} a fost înregistrată!`);
            }
            
            onSuccess();
            onClose();
        } catch (error: any) {
            const errorMessage = error?.message || 'Eroare la procesarea plății';
            showToast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isOwnFee ? `Confirmă plata ta - ${amount} ${currency}` : `Confirmă plata - ${memberName}`}
            size="md"
        >
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Membru</div>
                <div className="text-lg font-semibold text-gray-900">{memberName}</div>
                <div className="mt-2 text-sm text-gray-600">Sumă totală</div>
                <div className="text-2xl font-bold text-gray-900">{Number(amount).toFixed(2)} {currency}</div>
                <div className="mt-2 text-sm text-gray-600">Rest de plată</div>
                <div className="text-2xl font-bold text-primary-600">{Number(remainingAmount).toFixed(2)} {currency}</div>
                {isOwnFee && (
                    <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-xs text-blue-800">
                            Pentru plata personală, te rugăm să completezi toate câmpurile și să adaugi un link către dovada plății.
                        </p>
                    </div>
                )}
            </div>

            {isOwnFee ? (
                <DynamicForm<ProcessPaymentSelfData>
                    config={processPaymentSelfFormConfig()}
                    schema={createProcessPaymentSelfSchema(remainingAmount)}
                    onSubmit={handleSubmit}
                    onCancel={onClose}
                    defaultValues={getProcessPaymentSelfDefaultValues()}
                    isSubmitting={isSubmitting}
                />
            ) : (
                <DynamicForm<ProcessPaymentData>
                    config={processPaymentFormConfig()}
                    schema={createProcessPaymentSchema(remainingAmount)}
                    onSubmit={handleSubmit}
                    onCancel={onClose}
                    defaultValues={getProcessPaymentDefaultValues()}
                    isSubmitting={isSubmitting}
                />
            )}
        </Modal>
    );
};
