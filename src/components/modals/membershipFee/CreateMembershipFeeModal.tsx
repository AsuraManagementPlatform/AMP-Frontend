import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/components/ui/Modal';
import { DynamicFormField } from '@/components/forms/DynamicFormField';
import { ModalButton } from '@/components/ui/ModalButton';
import { createMembershipFeeFormConfig } from '@/config/membershipFee.form.config';
import { createMembershipFeeSchema, type CreateMembershipFeeData, getCreateMembershipFeeDefaultValues } from '@/schemas/membershipFee.schema';
import { membershipFeeService } from '@/services/membershipFee.service';
import { userService } from '@/services/user.service';
import { organizationService } from '@/services/organization.service';
import showToast from '@/components/ui/Toast';
import toast from 'react-hot-toast';
import { MembershipFeeCreateRequest, RateType } from '@/types/membershipFee.types';
import { useAuth } from '@/hooks/useAuth';

interface CreateMembershipFeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    memberId?: string;
    isAdvancePayment?: boolean;
}

export const CreateMembershipFeeModal: React.FC<CreateMembershipFeeModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    memberId
}) => {
    const { t } = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [members, setMembers] = useState<any[]>([]);
    const [organizationData, setOrganizationData] = useState<any>(null);
    const { user } = useAuth();

    const defaultValues = getCreateMembershipFeeDefaultValues(memberId, user?.organizationId);
    
    const {
        control,
        handleSubmit: handleFormSubmit,
        formState: { errors },
        watch,
        setValue
    } = useForm<CreateMembershipFeeData>({
        resolver: zodResolver(createMembershipFeeSchema) as any,
        defaultValues,
        mode: 'onChange'
    });

    const selectedMemberId = watch('memberId');
    const renewPeriod = watch('renewPeriod');
    const startedFrom = watch('startedFrom');
    const selectedMember = members.find(m => m.id === selectedMemberId);

    useEffect(() => {
        if (organizationData?.defaultRenewPeriod) {
            setValue('renewPeriod', organizationData.defaultRenewPeriod);
        }
    }, [organizationData, setValue]);

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
                if (!user?.organizationId) return;

                const [membersResponse, orgData] = await Promise.all([
                    userService.getList(),
                    organizationService.getById(user.organizationId)
                ]);
                
                const membersList = membersResponse.results || [];
                const organization = (orgData as any).organization || orgData;
                
                setMembers(membersList);
                setOrganizationData(organization);
            } catch (error) {
                showToast.error(t('label.membership_fee.load_error'));
            }
        };

        if (isOpen) {
            loadData();
        }
    }, [isOpen, user?.organizationId]);

    const getRateOptionsForMember = () => {
        if (!selectedMember || !organizationData) {
            return [{
                value: RateType.CUSTOM,
                label: 'Sumă personalizată'
            }];
        }

        const memberGroups = (selectedMember.groups || []).map((g: string) => g.toUpperCase());
        const isAdmin = memberGroups.includes('ORGANIZATION_ADMIN') || selectedMember.groups?.includes('organization_admin');
        const rateOptions = [];
        
        if (!isAdmin) {
            const employeeFee = parseFloat(organizationData.membershipFeeEmployee || '0');
            const volunteerFee = parseFloat(organizationData.membershipFeeVolunteer || '0');
            const memberFee = parseFloat(organizationData.membershipFeeMember || '0');

            if (memberGroups.includes('EMPLOYEE') && employeeFee > 0) {
                const monthlyRate = (employeeFee / 12).toFixed(2);
                rateOptions.push({
                    value: RateType.EMPLOYEE,
                    label: `Angajat - ${monthlyRate} RON/lună`
                });
            }
            
            if (memberGroups.includes('VOLUNTEER') && volunteerFee > 0) {
                const monthlyRate = (volunteerFee / 12).toFixed(2);
                rateOptions.push({
                    value: RateType.VOLUNTEER,
                    label: `Voluntar - ${monthlyRate} RON/lună`
                });
            }
            
            if (memberGroups.includes('MEMBER') && memberFee > 0) {
                const monthlyRate = (memberFee / 12).toFixed(2);
                rateOptions.push({
                    value: RateType.MEMBER,
                    label: `Membru - ${monthlyRate} RON/lună`
                });
            }
        }

        rateOptions.push({
            value: RateType.CUSTOM,
            label: 'Sumă personalizată'
        });
        
        return rateOptions;
    };

    const formConfig = createMembershipFeeFormConfig(
        getRateOptionsForMember()
    );
    
    const memberField = formConfig.sections[0].fields.find(f => f.name === 'memberId');
    if (memberField && 'options' in memberField) {
        memberField.options = members.map((member: any) => ({
            value: member.id,
            label: `${member.fullName} (${member.email})`
        }));
    }

    const handleSubmit = async (data: CreateMembershipFeeData) => {
        let loadingToast: string | undefined;
        
        try {
            setIsSubmitting(true);
            
            loadingToast = showToast.creatingMembershipFee();

            const [year, month] = data.startedFrom.split('-').map(Number);
            const startDate = new Date(year, month - 1, 1);
            const startedFromDate = startDate.toISOString().split('T')[0];

            const membershipFeeCreateRequest: MembershipFeeCreateRequest = {
                member: data.memberId,
                rateType: data.rateType,
                amount: data.rateType === RateType.CUSTOM ? data.customAmount : undefined,
                currency: data.currency || 'RON',
                renewPeriod: data.renewPeriod,
                startedFrom: startedFromDate,
                endedAt: data.endedAt,
                autoRenew: data.autoRenew || false,
                paymentMethod: data.paymentMethod,
                notes: data.notes
            };

            await membershipFeeService.create(membershipFeeCreateRequest);
            
            if (loadingToast) {
                toast.remove(loadingToast);
            }
            
            showToast.membershipFeeCreated();
            onSuccess();
            onClose();
        } catch (error: any) {
            if (loadingToast) {
                toast.remove(loadingToast);
            }
            
            const errorMessage = error?.message || 'Eroare la adăugarea cotizației';
            showToast.membershipFeeCreationFailed(errorMessage);
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
            title={t('label.membership_fee.create_title')}
            size="lg"
        >
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
                                        error={errors[field.name as keyof CreateMembershipFeeData]?.message as string}
                                        formValues={formValues}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <ModalButton variant="secondary" onClick={onClose} disabled={isSubmitting}>
                        {formConfig.cancelButtonText || t('label.button.cancel')}
                    </ModalButton>
                    <ModalButton type="submit" variant="primary" disabled={isSubmitting}>
                        {isSubmitting ? t('label.membership_fee.processing') : (formConfig.submitButtonText || t('label.button.save'))}
                    </ModalButton>
                </div>
            </form>
        </Modal>
    );
};
