import React, { useState, useEffect } from 'react';
import { FormModal } from '@/components/ui/Modal';
import { DynamicForm } from '@/components/forms/DynamicForm';
import { Organization, OrganizationStatus, OrganizationType } from '@/types/organization.types';
import {
    updateOrganizationSchema,
    UpdateOrganizationData,
    prepareOrganizationDataForAPI,
    prepareOrganizationDataForForm
} from '@/schemas/organization.schema';
import { organizationService } from '@/services/organization.service';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { UserGroup } from '@/types/auth.types';
import { organizationDetailsFormConfig } from '@/config/organization.form.config';

interface OrganizationDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    organizationId: string;
    onUpdate?: (organization: Organization) => void;
}

interface OrganizationDetailsConfig {
    sections: Array<{
        title: string;
        columns: number;
        fields: Array<{
            name: string;
            label: string;
            value: any;
            type: 'text' | 'email' | 'tel' | 'url' | 'date' | 'number' | 'textarea' | 'select' | 'boolean';
            readonly?: boolean;
            options?: Array<{ value: any; label: string }>;
        }>;
    }>;
}

const getOrganizationDisplayConfig = (organization: Organization): OrganizationDetailsConfig => ({
    sections: [
        {
            title: "Informații de bază",
            columns: 2,
            fields: [
                { name: 'name', label: 'Nume organizație', value: organization.name, type: 'text' },
                { name: 'legal_name', label: 'Nume legal', value: organization.legal_name || '-', type: 'text' },
                { name: 'short_name', label: 'Nume scurt', value: organization.short_name || '-', type: 'text' },
                { name: 'organization_type', label: 'Tip organizație', value: organization.organization_type || '-', type: 'select',
                    options: [
                        { value: OrganizationType.NGO, label: 'ONG' },
                        { value: OrganizationType.ASSOCIATION, label: 'Asociație' },
                        { value: OrganizationType.FOUNDATION, label: 'Fundație' },
                        { value: OrganizationType.COMPANY, label: 'Companie' },
                        { value: OrganizationType.COOPERATIVE, label: 'Cooperativă' },
                        { value: OrganizationType.OTHER, label: 'Altul' }
                    ]
                },
                { name: 'status', label: 'Status', value: organization.status, type: 'select',
                    options: [
                        { value: OrganizationStatus.ACTIVE, label: 'Activ' },
                        { value: OrganizationStatus.INACTIVE, label: 'Inactiv' },
                        { value: OrganizationStatus.PENDING, label: 'În așteptare' }
                    ]
                }
            ]
        },
        {
            title: "Conformitate românească",
            columns: 2,
            fields: [
                { name: 'cui', label: 'CUI', value: organization.cui || '-', type: 'text' },
                { name: 'registration_number', label: 'Nr. înregistrare', value: organization.registration_number || '-', type: 'text' },
                { name: 'registration_date', label: 'Data înregistrării', value: organization.registration_date || '-', type: 'date' },
                { name: 'tax_exempt_status', label: 'Scutit de taxe', value: organization.tax_exempt_status, type: 'boolean' },
                {
                    name: 'tax_percentage',
                    label: 'Procentaj TVA',
                    value: organization.tax_percentage
                        ? `${(organization.tax_percentage * 100).toFixed(2)}%`
                        : '-',
                    type: 'text'
                },
                { name: 'is_verified', label: 'Verificat', value: organization.is_verified, type: 'boolean', readonly: true }
            ]
        },
        {
            title: "Informații de contact",
            columns: 2,
            fields: [
                { name: 'email', label: 'Email', value: organization.email, type: 'email' },
                { name: 'phone_number', label: 'Telefon', value: organization.phone_number || '-', type: 'tel' },
                { name: 'secondary_phone', label: 'Telefon secundar', value: organization.secondary_phone || '-', type: 'tel' },
                { name: 'fax_number', label: 'Fax', value: organization.fax_number || '-', type: 'tel' },
                { name: 'website', label: 'Website', value: organization.website || '-', type: 'url' }
            ]
        },
        {
            title: "Adresă",
            columns: 2,
            fields: [
                { name: 'address', label: 'Adresă', value: organization.address, type: 'textarea' },
                { name: 'address2', label: 'Adresă secundară', value: organization.address2 || '-', type: 'textarea' },
                { name: 'city', label: 'Oraș', value: organization.city || '-', type: 'text' },
                { name: 'county', label: 'Județ', value: organization.county || '-', type: 'text' },
                { name: 'postal_code', label: 'Cod poștal', value: organization.postal_code || '-', type: 'text' },
                { name: 'country', label: 'Țară', value: organization.country || 'Romania', type: 'text' }
            ]
        },
        {
            title: "Informații financiare și operaționale",
            columns: 2,
            fields: [
                { name: 'budget', label: 'Buget anual (RON)', value: organization.budget ? `${organization.budget.toLocaleString('ro-RO')} RON` : '-', type: 'number' },
                { name: 'industry_sector', label: 'Sector de activitate', value: organization.industry_sector || '-', type: 'text' },
                { name: 'employee_count', label: 'Nr. angajați', value: organization.employee_count || '-', type: 'number' },
                { name: 'volunteer_count', label: 'Nr. voluntari', value: organization.volunteer_count || '-', type: 'number' },
                { name: 'member_count', label: 'Nr. membri', value: organization.member_count || '-', type: 'number' },
                { name: 'description', label: 'Descriere', value: organization.description || '-', type: 'textarea' }
            ]
        }
    ]
});

export const OrganizationDetailsModal: React.FC<OrganizationDetailsModalProps> = ({
                                                                                      isOpen,
                                                                                      onClose,
                                                                                      organizationId,
                                                                                      onUpdate
                                                                                  }) => {
    const [organization, setOrganization] = useState<Organization | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { user } = useAuth();
    const canEdit = user?.groups?.includes(UserGroup.ADMIN) || user?.groups?.includes(UserGroup.ORGANIZATION_ADMIN);

    useEffect(() => {
        if (isOpen && organizationId) {
            loadOrganization();
        }
    }, [isOpen, organizationId]);

    const loadOrganization = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const orgData = await organizationService.getById(organizationId);
            setOrganization(orgData);
        } catch (err) {
            setError('Eroare la încărcarea datelor organizației');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
    };

    const handleSubmit = async (data: UpdateOrganizationData) => {
        if (!organization) return;

        setIsSubmitting(true);
        try {
            const apiData = prepareOrganizationDataForAPI(data as any);
            const updatedOrg = await organizationService.update(organization.id, apiData);
            setOrganization(updatedOrg);
            setIsEditing(false);
            onUpdate?.(updatedOrg);
        } catch (err) {
            setError('Eroare la actualizarea organizației');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getFormDefaultValues = (): UpdateOrganizationData => {
        if (!organization) return {} as UpdateOrganizationData;

        const formData = prepareOrganizationDataForForm(organization);

        return {
            name: formData.name,
            legal_name: formData.legal_name || '',
            short_name: formData.short_name || '',
            cui: formData.cui || '',
            registration_number: formData.registration_number || '',
            email: formData.email,
            phone_number: formData.phone_number || '',
            secondary_phone: formData.secondary_phone || '',
            fax_number: formData.fax_number || '',
            website: formData.website || '',
            address: formData.address,
            address2: formData.address2 || '',
            city: formData.city || '',
            county: formData.county || '',
            postal_code: formData.postal_code || '',
            country: formData.country || 'Romania',
            organization_type: formData.organization_type || OrganizationType.NGO,
            industry_sector: formData.industry_sector || '',
            description: formData.description || '',
            budget: formData.budget || undefined,
            funding_sources: formData.funding_sources || [],
            tax_exempt_status: formData.tax_exempt_status || false,
            tax_percentage: formData.tax_percentage,
            employee_count: formData.employee_count || undefined,
            volunteer_count: formData.volunteer_count || undefined,
            member_count: formData.member_count || undefined,
            registration_date: formData.registration_date || '',
            status: formData.status,
            admin_user: formData.admin_user,
            is_verified: formData.is_verified || false,
            social_media_links: formData.social_media_links || {}
        };
    };

    if (isLoading) {
        return (
            <FormModal isOpen={isOpen} onClose={onClose} title="Detalii organizație" size="lg">
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            </FormModal>
        );
    }

    if (error) {
        return (
            <FormModal isOpen={isOpen} onClose={onClose} title="Detalii organizație" size="lg">
                <div className="text-center py-8">
                    <p className="text-red-600 mb-4">{error}</p>
                    <Button onClick={loadOrganization} variant="outline">
                        Încearcă din nou
                    </Button>
                </div>
            </FormModal>
        );
    }

    if (!organization) {
        return (
            <FormModal isOpen={isOpen} onClose={onClose} title="Detalii organizație" size="lg">
                <div className="text-center py-8">
                    <p className="text-gray-600">Organizația nu a fost găsită</p>
                </div>
            </FormModal>
        );
    }

    return (
        <FormModal
            isOpen={isOpen}
            onClose={onClose}
            title={`Detalii organizație: ${organization.name}`}
            size="xl"
        >
            {!isEditing ? (
                <div className="space-y-6">
                    {canEdit && (
                        <div className="flex justify-end border-b pb-4">
                            <Button onClick={handleEdit} variant="primary">
                                Editează
                            </Button>
                        </div>
                    )}
                    {getOrganizationDisplayConfig(organization).sections.map((section, sectionIndex) => (
                        <div key={sectionIndex} className="border rounded-lg p-4">
                            <h3 className="font-semibold text-lg mb-4 text-gray-800">{section.title}</h3>
                            <div className={`grid grid-cols-${section.columns} gap-4`}>
                                {section.fields.map((field, fieldIndex) => (
                                    <div key={fieldIndex} className="space-y-1">
                                        <label className="block text-sm font-medium text-gray-700">
                                            {field.label}
                                        </label>
                                        <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded border min-h-[2.5rem] flex items-center">
                                            {field.type === 'boolean' ? (
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    field.value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {field.value ? 'Da' : 'Nu'}
                                                </span>
                                            ) : field.type === 'url' && field.value !== '-' ? (
                                                <a
                                                    href={field.value}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    {field.value}
                                                </a>
                                            ) : (
                                                <span>{field.value}</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    <div className="border-t pt-4 text-sm text-gray-500">
                        <p>Creat la: {new Date(organization.created_at).toLocaleString('ro-RO')}</p>
                        <p>Ultima actualizare: {new Date(organization.updated_at).toLocaleString('ro-RO')}</p>
                        {organization.verification_date && (
                            <p>Verificat la: {new Date(organization.verification_date).toLocaleString('ro-RO')}</p>
                        )}
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="border-b pb-4">
                        <h3 className="font-semibold text-lg text-gray-800">Editare organizație</h3>
                        <p className="text-sm text-gray-600">Modificați informațiile organizației și salvați modificările.</p>
                    </div>

                    <DynamicForm<UpdateOrganizationData>
                        config={organizationDetailsFormConfig}
                        schema={updateOrganizationSchema}
                        onSubmit={handleSubmit}
                        onCancel={handleCancelEdit}
                        defaultValues={getFormDefaultValues()}
                        isSubmitting={isSubmitting}
                    />
                </div>
            )}
        </FormModal>
    );
};