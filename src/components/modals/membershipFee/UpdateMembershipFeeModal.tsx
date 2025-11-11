import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/components/ui/Modal';
import { DynamicFormField } from '@/components/forms/DynamicFormField';
import { ModalButton } from '@/components/ui/ModalButton';
import { updateMembershipFeeFormConfig } from '@/config/membershipFee.form.config';
import { updateMembershipFeeSchema, type UpdateMembershipFeeData } from '@/schemas/membershipFee.schema';
import { membershipFeeService } from '@/services/membershipFee.service';
import { userService } from '@/services/user.service';
import { organizationService } from '@/services/organization.service';
import showToast from '@/components/ui/Toast';
import toast from 'react-hot-toast';
import { MembershipFeeUpdateRequest, MembershipFee, RateType } from '@/types/membershipFee.types';
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
    const [currentFee, setCurrentFee] = useState<MembershipFee | null>(null);
    const [members, setMembers] = useState<any[]>([]);
    const [organizationData, setOrganizationData] = useState<any>(null);
    const { user } = useAuth();

    const {
        control,
        handleSubmit: handleFormSubmit,
        formState: { errors },
        watch,
        setValue,
        reset
    } = useForm<UpdateMembershipFeeData>({
        resolver: zodResolver(updateMembershipFeeSchema) as any,
        mode: 'onChange'
    });

    const selectedMemberId = watch('memberId');
    const renewPeriod = watch('renewPeriod');
    const startedFrom = watch('startedFrom');
    const rateType = watch('rateType');
    const selectedMember = members.find(m => m.id === selectedMemberId);

    useEffect(() => {
        if (!rateType || !organizationData) return;

        if (rateType === RateType.CUSTOM) return;

        const employeeFee = parseFloat(organizationData.membershipFeeEmployee || '0');
        const volunteerFee = parseFloat(organizationData.membershipFeeVolunteer || '0');
        const memberFee = parseFloat(organizationData.membershipFeeMember || '0');

        let calculatedAmount = 0;
        switch (rateType) {
            case RateType.EMPLOYEE:
                calculatedAmount = employeeFee;
                break;
            case RateType.VOLUNTEER:
                calculatedAmount = volunteerFee;
                break;
            case RateType.MEMBER:
                calculatedAmount = memberFee;
                break;
        }

        if (calculatedAmount > 0) {
            setValue('amount', calculatedAmount);
        }
    }, [rateType, organizationData, setValue]);

    useEffect(() => {
        if (!startedFrom || !renewPeriod) return;

        const [year, month] = startedFrom.split('-').map(Number);
        const startDate = new Date(year, month - 1, 1);
        
        let endDate = new Date(startDate);

        switch (renewPeriod) {
            case 'MONTHLY':
                endDate.setMonth(endDate.getMonth() + 1);
                break;
            case 'QUARTERLY':
                endDate.setMonth(endDate.getMonth() + 3);
                break;
            case 'SEMI_ANNUAL':
                endDate.setMonth(endDate.getMonth() + 6);
                break;
            case 'ANNUAL':
                endDate.setMonth(endDate.getMonth() + 12);
                break;
            case 'ONE_TIME':
                endDate.setMonth(endDate.getMonth() + 1);
                break;
        }

        endDate.setDate(0);

        setValue('endedAt', endDate.toISOString().split('T')[0]);
    }, [renewPeriod, startedFrom, setValue]);

    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);

                if (!user?.organizationId) return;

                const [feeResponse, membersResponse, orgData] = await Promise.all([
                    membershipFeeService.getById(membershipFeeId),
                    userService.getList(),
                    organizationService.getById(user.organizationId)
                ]);

                const fee = (feeResponse as any).membershipFee || (feeResponse as any).membership_fee || feeResponse;
                const membersList = membersResponse.results || [];
                const organization = (orgData as any).organization || orgData;
                
                setCurrentFee(fee);
                setMembers(membersList);
                setOrganizationData(organization);

                const determinedRateType = determineRateType(fee, membersList, organization);
                
                const startedFromMonth = fee.startedFrom.substring(0, 7);
                
                reset({
                    memberId: fee.memberId,
                    organizationId: fee.organizationId || user?.organizationId,
                    rateType: determinedRateType,
                    customAmount: determinedRateType === RateType.CUSTOM ? fee.amount : undefined,
                    amount: fee.amount,
                    currency: fee.currency,
                    renewPeriod: fee.renewPeriod,
                    startedFrom: startedFromMonth,
                    endedAt: fee.endedAt,
                    autoRenew: fee.autoRenew,
                    paymentMethod: fee.paymentMethod,
                    notes: fee.notes
                });

            } catch (error) {
                showToast.error('Eroare la încărcarea datelor');
            } finally {
                setIsLoading(false);
            }
        };

        if (isOpen && membershipFeeId) {
            loadData();
        }
    }, [isOpen, membershipFeeId, user?.organizationId, reset]);

    const determineRateType = (fee: MembershipFee, membersList: any[], organization: any): RateType => {
        const member = membersList.find(m => m.id === fee.memberId);
        if (!member || !organization) return RateType.CUSTOM;

        const memberGroups = (member.groups || []).map((g: string) => g.toUpperCase());
        const employeeFee = parseFloat(organization.membershipFeeEmployee || '0');
        const volunteerFee = parseFloat(organization.membershipFeeVolunteer || '0');
        const memberFee = parseFloat(organization.membershipFeeMember || '0');

        if (memberGroups.includes('EMPLOYEE') && Math.abs(fee.amount - employeeFee) < 0.01) {
            return RateType.EMPLOYEE;
        }
        if (memberGroups.includes('VOLUNTEER') && Math.abs(fee.amount - volunteerFee) < 0.01) {
            return RateType.VOLUNTEER;
        }
        if (memberGroups.includes('MEMBER') && Math.abs(fee.amount - memberFee) < 0.01) {
            return RateType.MEMBER;
        }

        return RateType.CUSTOM;
    };

    const getRateOptionsForMember = () => {
        if (!selectedMember || !organizationData) {
            return [{
                value: RateType.CUSTOM,
                label: 'Sumă personalizată'
            }];
        }

        const memberGroups = (selectedMember.groups || []).map((g: string) => g.toUpperCase());
        const rateOptions = [];
        
        const employeeFee = parseFloat(organizationData.membershipFeeEmployee || '0');
        const volunteerFee = parseFloat(organizationData.membershipFeeVolunteer || '0');
        const memberFee = parseFloat(organizationData.membershipFeeMember || '0');

        if (memberGroups.includes('EMPLOYEE') && employeeFee > 0) {
            rateOptions.push({
                value: RateType.EMPLOYEE,
                label: `Angajat - ${employeeFee.toFixed(2)} RON/lună`
            });
        }
        
        if (memberGroups.includes('VOLUNTEER') && volunteerFee > 0) {
            rateOptions.push({
                value: RateType.VOLUNTEER,
                label: `Voluntar - ${volunteerFee.toFixed(2)} RON/lună`
            });
        }
        
        if (memberGroups.includes('MEMBER') && memberFee > 0) {
            rateOptions.push({
                value: RateType.MEMBER,
                label: `Membru - ${memberFee.toFixed(2)} RON/lună`
            });
        }

        rateOptions.push({
            value: RateType.CUSTOM,
            label: 'Sumă personalizată'
        });
        
        return rateOptions;
    };

    const formConfig = updateMembershipFeeFormConfig(getRateOptionsForMember());
    
    const memberField = formConfig.sections[0].fields.find(f => f.name === 'memberId');
    if (memberField && 'options' in memberField) {
        memberField.options = members.map((member: any) => ({
            value: member.id,
            label: `${member.fullName} (${member.email})`
        }));
    }

    if (currentFee?.status === 'PAID') {
        const amountField = formConfig.sections[1].fields.find(f => f.name === 'customAmount');
        if (amountField) {
            amountField.disabled = true;
            amountField.helperText = 'Suma nu poate fi modificată pentru cotizațiile plătite';
        }
    }

    const handleSubmit = async (data: UpdateMembershipFeeData) => {
        let loadingToast: string | undefined;
        
        try {
            setIsSubmitting(true);
            
            loadingToast = toast.loading('Se actualizează cotizația...');

            const [year, month] = data.startedFrom.split('-').map(Number);
            const startDate = new Date(year, month - 1, 1);
            const startedFromDate = startDate.toISOString().split('T')[0];

            const updateRequest: MembershipFeeUpdateRequest = {
                member: data.memberId,
                amount: data.rateType === RateType.CUSTOM ? data.customAmount : data.amount,
                currency: data.currency || 'RON',
                renew_period: data.renewPeriod,
                started_from: startedFromDate,
                ended_at: data.endedAt,
                payment_method: data.paymentMethod,
                auto_renew: data.autoRenew,
                notes: data.notes
            };

            await membershipFeeService.update(membershipFeeId, updateRequest);
            
            if (loadingToast) {
                toast.remove(loadingToast);
            }
            
            showToast.success('Cotizația a fost actualizată cu succes!');
            onSuccess();
            onClose();
        } catch (error: any) {
            if (loadingToast) {
                toast.remove(loadingToast);
            }
            
            const errorMessage = error?.message || 'Eroare la actualizarea cotizației';
            showToast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formValues = watch();

    const getGridClasses = (columns?: number): string => {
        switch (columns) {
            case 1: return 'grid grid-cols-1 gap-4';
            case 2: return 'grid grid-cols-1 md:grid-cols-2 gap-4';
            case 3: return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';
            case 4: return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4';
            default: return 'grid grid-cols-1 md:grid-cols-2 gap-4';
        }
    };

    const shouldShowField = (field: any): boolean => {
        if (!field.condition) return true;
        if (typeof field.condition === 'function') {
            return field.condition(formValues);
        }
        return true;
    };

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
                <form onSubmit={handleFormSubmit(handleSubmit as any)} className="space-y-6">
                    {formConfig.sections.map((section, sectionIndex) => {
                        const shouldShowSection = !section.hidden && (!section.condition || section.condition(formValues));
                        if (!shouldShowSection) return null;

                        const visibleFields = section.fields.filter(shouldShowField);
                        if (visibleFields.length === 0) return null;

                        return (
                            <div key={sectionIndex} className="space-y-4">
                                {section.title && (
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900">{section.title}</h3>
                                        {section.description && (
                                            <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                                        )}
                                    </div>
                                )}

                                <div className={getGridClasses(section.columns)}>
                                    {visibleFields.map((field) => (
                                        <DynamicFormField
                                            key={field.name}
                                            field={field}
                                            control={control}
                                            error={errors[field.name as keyof UpdateMembershipFeeData]?.message as string}
                                            formValues={formValues}
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })}

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <ModalButton variant="secondary" onClick={onClose} disabled={isSubmitting}>
                            {formConfig.cancelButtonText || 'Anulează'}
                        </ModalButton>
                        <ModalButton type="submit" variant="primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Se procesează...' : (formConfig.submitButtonText || 'Salvează')}
                        </ModalButton>
                    </div>
                </form>
            )}
        </Modal>
    );
};
