import React, { useState, useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { DynamicForm } from '@/components/forms/DynamicForm';
import { processPaymentFormConfig, processPaymentSelfFormConfig } from '@/config/membershipFee.form.config';
import { 
    processPaymentSchema, 
    processPaymentSelfSchema,
    type ProcessPaymentData, 
    type ProcessPaymentSelfData,
    getProcessPaymentDefaultValues,
    getProcessPaymentSelfDefaultValues
} from '@/schemas/membershipFee.schema';
import { membershipFeeService } from '@/services/membershipFee.service';
import showToast from '@/components/ui/Toast';
import { MembershipFeePaymentRequest } from '@/types/membershipFee.types';
import { useAuth } from '@/hooks/useAuth';

interface ProcessPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    membershipFeeId: string;
    memberId: string;
    memberName: string;
    amount: number;
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

            const paymentRequest: MembershipFeePaymentRequest = {
                payment_method: data.paymentMethod,
                transaction_reference: data.transactionReference || undefined,
                payment_date: data.paymentDate || undefined,
                document_reference: 'documentReference' in data ? data.documentReference || undefined : undefined,
                processed_by_id: user?.id
            };

            await membershipFeeService.markAsPaid(membershipFeeId, paymentRequest);
            
            const successMessage = isOwnFee 
                ? `Plata ta de ${amount} ${currency} a fost trimisă pentru validare! Vei fi notificat când este confirmată.`
                : `Plata de ${amount} ${currency} pentru ${memberName} a fost confirmată!`;
            
            showToast.success(successMessage);
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
                <div className="mt-2 text-sm text-gray-600">Sumă de plată</div>
                <div className="text-2xl font-bold text-primary-600">{amount} {currency}</div>
                {isOwnFee && (
                    <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-xs text-blue-800">
                            ℹ️ Pentru plata personală, te rugăm să completezi toate câmpurile și să adaugi un link către dovada plății.
                        </p>
                    </div>
                )}
            </div>

            {isOwnFee ? (
                <DynamicForm<ProcessPaymentSelfData>
                    config={processPaymentSelfFormConfig()}
                    schema={processPaymentSelfSchema}
                    onSubmit={handleSubmit}
                    onCancel={onClose}
                    defaultValues={getProcessPaymentSelfDefaultValues()}
                    isSubmitting={isSubmitting}
                />
            ) : (
                <DynamicForm<ProcessPaymentData>
                    config={processPaymentFormConfig()}
                    schema={processPaymentSchema}
                    onSubmit={handleSubmit}
                    onCancel={onClose}
                    defaultValues={getProcessPaymentDefaultValues()}
                    isSubmitting={isSubmitting}
                />
            )}
        </Modal>
    );
};
