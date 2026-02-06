import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '@/components/ui/Modal';
import { DynamicForm } from '@/components/forms/DynamicForm';
import { updateMembershipFeeFormConfig } from '@/config/membershipFee.form.config';
import { updateMembershipFeeSchema, type UpdateMembershipFeeData } from '@/schemas/membershipFee.schema';
import { membershipFeeService } from '@/services/membershipFee.service';
import { userService } from '@/services/user.service';
import { organizationService } from '@/services/organization.service';
import showToast from '@/components/ui/Toast';
import { MembershipFeeUpdateRequest, MembershipFee, RateType, MembershipFeeStatus, RenewPeriod } from '@/types/membershipFee.types';
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
    const { t } = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [formConfig, setFormConfig] = useState<any>(null);
    const [currentFee, setCurrentFee] = useState<MembershipFee | null>(null);
    const [organization, setOrganization] = useState<any>(null);
    const { user } = useAuth();

    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);

                const [feeResponse, membersResponse, orgResponse] = await Promise.all([
                    membershipFeeService.getById(membershipFeeId),
                    userService.getList(),
                    organizationService.getById(user?.organizationId || '')
                ]);

                const fee = (feeResponse as any).membershipFee || (feeResponse as any).membership_fee || feeResponse;
                setCurrentFee(fee);

                const org = (orgResponse as any).organization || orgResponse;
                setOrganization(org);

                const members = membersResponse.results || [];
                const memberOptions = members.map((member: any) => ({
                    value: member.id,
                    label: `${member.fullName} (${member.email})`
                }));

                const memberGroups = fee.memberGroups || [];
                const isAdmin = memberGroups.includes('organization_admin') || memberGroups.includes('ORGANIZATION_ADMIN');
                
                const rateOptions = [];
                
                if (!isAdmin) {
                    const isEmployee = memberGroups.includes('EMPLOYEE');
                    const isVolunteer = memberGroups.includes('VOLUNTEER');
                    const isMember = memberGroups.includes('MEMBER');
                    
                    if (isEmployee && org.membershipFeeEmployee) {
                        const monthlyRate = (org.membershipFeeEmployee / 12).toFixed(2);
                        rateOptions.push({
                            value: RateType.EMPLOYEE,
                            label: `Angajat - ${monthlyRate} ${org.currency || 'RON'}/lună`
                        });
                    }
                    
                    if (isVolunteer && org.membershipFeeVolunteer) {
                        const monthlyRate = (org.membershipFeeVolunteer / 12).toFixed(2);
                        rateOptions.push({
                            value: RateType.VOLUNTEER,
                            label: `Voluntar - ${monthlyRate} ${org.currency || 'RON'}/lună`
                        });
                    }
                    
                    if (isMember && org.membershipFeeMember) {
                        const monthlyRate = (org.membershipFeeMember / 12).toFixed(2);
                        rateOptions.push({
                            value: RateType.MEMBER,
                            label: `Membru - ${monthlyRate} ${org.currency || 'RON'}/lună`
                        });
                    }
                }
                
                rateOptions.push({
                    value: RateType.CUSTOM,
                    label: 'Sumă personalizată'
                });

                const config = updateMembershipFeeFormConfig(rateOptions);
                const memberField = config.sections[0].fields.find(f => f.name === 'memberId');
                if (memberField && 'options' in memberField) {
                    memberField.options = memberOptions;
                }
                
                const findField = (fieldName: string) => {
                    for (const section of config.sections) {
                        const field = section.fields.find(f => f.name === fieldName);
                        if (field) return field;
                    }
                    return null;
                };
                
                const startDateField = findField('startedFrom');
                if (startDateField) {
                    startDateField.disabled = true;
                    startDateField.helperText = 'Data de început nu poate fi modificată';
                }
                
                const rateTypeField = findField('rateType');
                if (rateTypeField) {
                    rateTypeField.disabled = true;
                    rateTypeField.helperText = 'Tipul cotizației nu poate fi modificat';
                }
                
                const customAmountField = findField('customAmount');
                if (customAmountField && fee.status === MembershipFeeStatus.PAID) {
                    customAmountField.disabled = true;
                    customAmountField.helperText = 'Suma nu poate fi modificată pentru cotizațiile plătite';
                }
                
                setFormConfig(config);
            } catch (error) {
                showToast.error(t('label.membership_fee.load_error'));
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

            const multiplier = 
                data.renewPeriod === RenewPeriod.MONTHLY ? 1 :
                data.renewPeriod === RenewPeriod.QUARTERLY ? 3 :
                data.renewPeriod === RenewPeriod.SEMI_ANNUAL ? 6 :
                data.renewPeriod === RenewPeriod.ANNUAL ? 12 : 1;
            
            const monthlyAmount = data.customAmount || (data.amount / multiplier);
            const totalAmount = monthlyAmount * multiplier;

            const updateRequest: MembershipFeeUpdateRequest = {
                amount: totalAmount,
                currency: data.currency || 'RON',
                renew_period: data.renewPeriod,
                payment_method: data.paymentMethod,
                auto_renew: data.autoRenew,
                notes: data.notes
            };

            await membershipFeeService.update(membershipFeeId, updateRequest);
            showToast.success(t('toast.membership_fee.update_success'));
            onSuccess();
            onClose();
        } catch (error: any) {
            const errorMessage = error?.message || t('toast.membership_fee.update_error');
            showToast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const calculateRateType = (): 'EMPLOYEE' | 'VOLUNTEER' | 'MEMBER' | 'CUSTOM' => {
        if (!currentFee || !organization) return RateType.CUSTOM;
        
        const memberGroups = currentFee.memberGroups || [];
        const isEmployee = memberGroups.includes('EMPLOYEE');
        const isVolunteer = memberGroups.includes('VOLUNTEER');
        const isMember = memberGroups.includes('MEMBER');
        
        const multiplier = 
            currentFee.renewPeriod === RenewPeriod.MONTHLY ? 1 :
            currentFee.renewPeriod === RenewPeriod.QUARTERLY ? 3 :
            currentFee.renewPeriod === RenewPeriod.SEMI_ANNUAL ? 6 :
            currentFee.renewPeriod === RenewPeriod.ANNUAL ? 12 : 1;
        
        const monthlyAmount = currentFee.amount / multiplier;
        
        if (isEmployee && organization.membershipFeeEmployee) {
            const monthlyRate = organization.membershipFeeEmployee / 12;
            if (Math.abs(monthlyAmount - monthlyRate) < 0.01) {
                return RateType.EMPLOYEE;
            }
        }
        if (isVolunteer && organization.membershipFeeVolunteer) {
            const monthlyRate = organization.membershipFeeVolunteer / 12;
            if (Math.abs(monthlyAmount - monthlyRate) < 0.01) {
                return RateType.VOLUNTEER;
            }
        }
        if (isMember && organization.membershipFeeMember) {
            const monthlyRate = organization.membershipFeeMember / 12;
            if (Math.abs(monthlyAmount - monthlyRate) < 0.01) {
                return RateType.MEMBER;
            }
        }
        
        return RateType.CUSTOM;
    };

    const calculateMonthlyRate = (fee: MembershipFee): number => {
        const multiplier = 
            fee.renewPeriod === RenewPeriod.MONTHLY ? 1 :
            fee.renewPeriod === RenewPeriod.QUARTERLY ? 3 :
            fee.renewPeriod === RenewPeriod.SEMI_ANNUAL ? 6 :
            fee.renewPeriod === RenewPeriod.ANNUAL ? 12 : 1;
        
        return fee.amount / multiplier;
    };

    const defaultValues: UpdateMembershipFeeData | undefined = currentFee ? {
        memberId: currentFee.memberId,
        organizationId: currentFee.organizationId || user?.organizationId,
        rateType: calculateRateType(),
        customAmount: calculateRateType() === RateType.CUSTOM ? calculateMonthlyRate(currentFee) : undefined,
        amount: currentFee.amount,
        currency: currentFee.currency,
        renewPeriod: currentFee.renewPeriod,
        startedFrom: currentFee.startedFrom,
        endedAt: currentFee.endedAt,
        autoRenew: currentFee.autoRenew,
        paymentMethod: currentFee.paymentMethod || undefined,
        notes: currentFee.notes || undefined
    } : undefined;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={t('label.membership_fee.edit_title')}
            size="lg"
        >
            {isLoading || !formConfig ? (
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
