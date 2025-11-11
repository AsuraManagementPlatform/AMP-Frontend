import React from 'react';
import { useForm, FieldError } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateOrganizationSchema, UpdateOrganizationData } from '@/schemas/organization.schema';
import { Organization, OrganizationType, OrganizationStatus } from '@/types/organization.types';
import { Card } from '@/components/ui/Card';
import { PrimaryActionButton } from '@/components/ui/PrimaryActionButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';

interface OrganizationEditFormProps {
    organization: Organization;
    onSave: (data: UpdateOrganizationData) => Promise<void>;
    onCancel: () => void;
    isSubmitting?: boolean;
}

export const OrganizationEditForm: React.FC<OrganizationEditFormProps> = ({
    organization,
    onSave,
    onCancel,
    isSubmitting = false
}) => {
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<UpdateOrganizationData>({
        resolver: zodResolver(updateOrganizationSchema) as any,
        defaultValues: {
            name: organization.name,
            legal_name: organization.legalName || '',
            short_name: organization.shortName || '',
            cui: organization.cui || '',
            registration_number: organization.registrationNumber || '',
            email: organization.email,
            phone_number: organization.phoneNumber || '',
            secondary_phone: organization.secondaryPhone || '',
            fax_number: organization.faxNumber || '',
            website: organization.website || '',
            address: organization.address,
            address2: organization.address2 || '',
            city: organization.city || '',
            county: organization.county || '',
            postal_code: organization.postalCode || '',
            country: organization.country || 'Romania',
            organization_type: organization.organizationType || OrganizationType.NGO,
            industry_sector: organization.industrySector || '',
            description: organization.description || '',
            budget: organization.budget,
            funding_sources: organization.fundingSources || [],
            registration_date: organization.registrationDate || '',
            tax_exempt_status: organization.taxExemptStatus || false,
            employee_count: organization.employeeCount,
            volunteer_count: organization.volunteerCount,
            member_count: organization.memberCount,
            status: organization.status,
            admin_user: organization.adminUser,
            is_verified: organization.isVerified || false,
            social_media_links: organization.socialMediaLinks || {}
        },
        mode: 'onChange'
    });

    const onSubmit = async (data: UpdateOrganizationData) => {
        await onSave(data);
    };

    const renderFormField = (
        name: keyof UpdateOrganizationData,
        label: string,
        type: 'text' | 'email' | 'tel' | 'url' | 'date' | 'number' | 'textarea' | 'select' | 'checkbox' = 'text',
        options?: Array<{ value: string; label: string }>,
        placeholder?: string,
        required?: boolean,
        disabled?: boolean,
        helperText?: string
    ) => {
        const error = errors[name] as FieldError | undefined;
        const baseClassName = "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
        const errorClassName = error ? "border-red-300" : "border-gray-300";
        const disabledClassName = disabled ? "bg-gray-100 cursor-not-allowed" : "";
        
        return (
            <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
                
                {type === 'textarea' ? (
                    <textarea
                        {...register(name)}
                        className={`${baseClassName} ${errorClassName} ${disabledClassName} resize-y`}
                        placeholder={placeholder}
                        rows={3}
                        disabled={disabled}
                    />
                ) : type === 'select' && options ? (
                    <select
                        {...register(name)}
                        className={`${baseClassName} ${errorClassName} ${disabledClassName}`}
                        disabled={disabled}
                    >
                        {options.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                ) : type === 'checkbox' ? (
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            {...register(name)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            disabled={disabled}
                        />
                        <span className="ml-2 text-sm text-gray-700">{placeholder}</span>
                    </div>
                ) : type === 'number' ? (
                    <input
                        type="number"
                        {...register(name, { valueAsNumber: true })}
                        className={`${baseClassName} ${errorClassName} ${disabledClassName}`}
                        placeholder={placeholder}
                        min="0"
                        step={name === 'budget' ? '0.01' : '1'}
                        disabled={disabled}
                    />
                ) : (
                    <input
                        type={type}
                        {...register(name)}
                        className={`${baseClassName} ${errorClassName} ${disabledClassName}`}
                        placeholder={placeholder}
                        disabled={disabled}
                    />
                )}
                
                {helperText && (
                    <p className="text-gray-500 text-xs">
                        {helperText}
                    </p>
                )}
                
                {error && (
                    <p className="text-red-500 text-sm">
                        {error.message}
                    </p>
                )}
            </div>
        );
    };

    const organizationTypeOptions = [
        { value: OrganizationType.NGO, label: 'NGO' },
        { value: OrganizationType.ASSOCIATION, label: 'Asociație' },
        { value: OrganizationType.FOUNDATION, label: 'Fundație' },
        { value: OrganizationType.COMPANY, label: 'Companie' },
        { value: OrganizationType.COOPERATIVE, label: 'Cooperativă' },
        { value: OrganizationType.OTHER, label: 'Altul' }
    ];

    const statusOptions = [
        { value: OrganizationStatus.ACTIVE, label: 'Activ' },
        { value: OrganizationStatus.INACTIVE, label: 'Inactiv' },
        { value: OrganizationStatus.PENDING, label: 'În așteptare' }
    ];

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Card>
                <div className="flex items-start gap-6">
                    <div className="flex-shrink-0">
                        <div className="w-20 h-20 bg-blue-500 text-white rounded-lg flex items-center justify-center text-2xl font-bold">
                            {organization.name?.split(' ').map(word => word[0]).join('').toUpperCase() || '?'}
                        </div>
                    </div>
                    <div className="flex-1 space-y-4">
                        {renderFormField('name', 'Nume organizație', 'text', undefined, 'Numele organizației', true)}
                        
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {renderFormField('cui', 'CUI', 'text', undefined, 'ex: RO12345678')}
                            {renderFormField('registration_number', 'Nr. înregistrare', 'text', undefined, 'Numărul de înregistrare')}
                            {renderFormField('registration_date', 'Data înregistrării', 'date', undefined, 'YYYY-MM-DD')}
                            {renderFormField('organization_type', 'Tip organizație', 'select', organizationTypeOptions)}
                            {renderFormField('status', 'Status', 'select', statusOptions)}
                        </div>
                    </div>
                </div>
            </Card>

            <Card title="Informații de contact">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderFormField('email', 'Email', 'email', undefined, 'contact@organizatie.ro', true)}
                    {renderFormField('phone_number', 'Telefon principal', 'tel', undefined, '+40712345678')}
                    {renderFormField('secondary_phone', 'Telefon secundar', 'tel', undefined, '+40712345678')}
                    {renderFormField('fax_number', 'Fax', 'tel', undefined, '+40212345678')}
                    {renderFormField('website', 'Website', 'url', undefined, 'https://organizatia.ro')}
                    <div className="md:col-span-2">
                        {renderFormField('address', 'Adresă principală', 'textarea', undefined, 'Strada, numărul...', true)}
                    </div>
                    {renderFormField('address2', 'Adresă secundară', 'textarea', undefined, 'Adresă suplimentară (opțional)')}
                </div>
            </Card>

            <Card title="Despre organizație">
                <div>
                    {renderFormField('description', 'Misiune și descriere', 'textarea', undefined, 'Descrieți misiunea și activitățile organizației...')}
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title="Conformitate românească">
                    <div className="space-y-4">
                        {renderFormField('legal_name', 'Nume legal', 'text', undefined, 'Numele legal al organizației')}
                        {renderFormField('short_name', 'Nume scurt', 'text', undefined, 'Numele scurt/acronim')}
                        {renderFormField('tax_exempt_status', 'Scutit de taxe', 'checkbox', undefined, 'Organizația este scutită de taxe')}
                    </div>
                </Card>

                <Card title="Statistici organizație">
                    <div className="space-y-4">
                        {renderFormField('member_count', 'Nr. membri', 'number', undefined, '0', false, true, 'Calculat automat din numărul utilizatorilor cu rol de membru')}
                        {renderFormField('employee_count', 'Nr. angajați', 'number', undefined, '0', false, true, 'Calculat automat din numărul utilizatorilor cu rol de angajat')}
                        {renderFormField('volunteer_count', 'Nr. voluntari', 'number', undefined, '0', false, true, 'Calculat automat din numărul utilizatorilor cu rol de voluntar')}
                        {renderFormField('budget', 'Buget anual (RON)', 'number', undefined, '0')}
                    </div>
                </Card>
            </div>

            <Card title="Informații administrative">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderFormField('industry_sector', 'Sector de activitate', 'text', undefined, 'ex: Educație, Sănătate')}
                    {renderFormField('country', 'Țară', 'text', undefined, 'Romania')}
                    {renderFormField('city', 'Oraș', 'text', undefined, 'București')}
                    {renderFormField('county', 'Județ', 'text', undefined, 'Ilfov')}
                    {renderFormField('postal_code', 'Cod poștal', 'text', undefined, '123456')}
                </div>
            </Card>

            <div className="flex justify-end space-x-3 pt-6 border-t">
                <SecondaryButton onClick={onCancel} disabled={isSubmitting}>
                    Anulează
                </SecondaryButton>
                <PrimaryActionButton 
                    type="submit" 
                    variant="create" 
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Se salvează...' : 'Salvează modificările'}
                </PrimaryActionButton>
            </div>
        </form>
    );
};
