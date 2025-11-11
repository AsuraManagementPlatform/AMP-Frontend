import React, { useState, useEffect } from 'react';
import { FormModal } from '@/components/ui/Modal';
import { DynamicForm } from '@/components/forms/DynamicForm';
import { Organization, OrganizationStatus, OrganizationType } from '@/types/organization.types';
import { updateOrganizationSchema, UpdateOrganizationData } from '@/schemas/organization.schema';
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
                { name: 'legal_name', label: 'Nume legal', value: organization.legalName || '-', type: 'text' },
                { name: 'short_name', label: 'Nume scurt', value: organization.shortName || '-', type: 'text' },
                { name: 'organization_type', label: 'Tip organizație', value: organization.organizationType || '-', type: 'select',
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
                { name: 'registration_number', label: 'Nr. înregistrare', value: organization.registrationNumber || '-', type: 'text' },
                { name: 'registration_date', label: 'Data înregistrării', value: organization.registrationDate || '-', type: 'date' },
                { name: 'tax_exempt_status', label: 'Scutit de taxe', value: organization.taxExemptStatus, type: 'boolean' },
                { name: 'is_verified', label: 'Verificat', value: organization.isVerified, type: 'boolean', readonly: true }
            ]
        },
        {
            title: "Informații de contact",
            columns: 2,
            fields: [
                { name: 'email', label: 'Email', value: organization.email, type: 'email' },
                { name: 'phone_number', label: 'Telefon', value: organization.phoneNumber || '-', type: 'tel' },
                { name: 'secondary_phone', label: 'Telefon secundar', value: organization.secondaryPhone || '-', type: 'tel' },
                { name: 'fax_number', label: 'Fax', value: organization.faxNumber || '-', type: 'tel' },
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
                { name: 'postal_code', label: 'Cod poștal', value: organization.postalCode || '-', type: 'text' },
                { name: 'country', label: 'Țară', value: organization.country || 'Romania', type: 'text' }
            ]
        },
        {
            title: "Informații financiare și operaționale",
            columns: 2,
            fields: [
                { name: 'budget', label: 'Buget anual (RON)', value: organization.budget ? `${organization.budget.toLocaleString('ro-RO')} RON` : '-', type: 'number' },
                { name: 'industry_sector', label: 'Sector de activitate', value: organization.industrySector || '-', type: 'text' },
                { name: 'employee_count', label: 'Nr. angajați', value: organization.employeeCount || '-', type: 'number' },
                { name: 'volunteer_count', label: 'Nr. voluntari', value: organization.volunteerCount || '-', type: 'number' },
                { name: 'member_count', label: 'Nr. membri', value: organization.memberCount || '-', type: 'number' },
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
            const updatedOrg = await organizationService.update(organization.id, data);
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

        return {
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
            budget: organization.budget || undefined,
            funding_sources: organization.fundingSources || [],
            tax_exempt_status: organization.taxExemptStatus || false,
            employee_count: organization.employeeCount || undefined,
            volunteer_count: organization.volunteerCount || undefined,
            member_count: organization.memberCount || undefined,
            registration_date: organization.registrationDate || '',
            status: organization.status,
            admin_user: organization.adminUser,
            is_verified: organization.isVerified || false,
            social_media_links: organization.socialMediaLinks || {}
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
                <div className="space-y-6">{canEdit && (
                        <div className="flex justify-end border-b pb-4">
                            <Button onClick={handleEdit} variant="primary">
                                Editează
                            </Button>
                        </div>
                    )}{getOrganizationDisplayConfig(organization).sections.map((section, sectionIndex) => (
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
                    ))}<div className="border-t pt-4 text-sm text-gray-500">
                        <p>Creat la: {new Date(organization.createdAt).toLocaleString('ro-RO')}</p>
                        <p>Ultima actualizare: {new Date(organization.updatedAt).toLocaleString('ro-RO')}</p>
                        {organization.verificationDate && (
                            <p>Verificat la: {new Date(organization.verificationDate).toLocaleString('ro-RO')}</p>
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

