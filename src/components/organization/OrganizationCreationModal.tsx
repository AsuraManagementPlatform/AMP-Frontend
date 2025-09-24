import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { UserMeResponse } from '@/types/user.types';
import { useWatch } from 'react-hook-form';

interface OrganizationCreationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: () => void;
    onReset?: () => void;
    register: any;
    errors: any;
    isSubmitting: boolean;
    pendingAdminUsers: UserMeResponse[];
    loadingPendingUsers: boolean;
    control: any;
    preselectedUser?: UserMeResponse | null;
}

export const OrganizationCreationModal: React.FC<OrganizationCreationModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    onReset,
    register,
    errors,
    isSubmitting,
    pendingAdminUsers,
    loadingPendingUsers,
    control,
    preselectedUser
}) => {
    const [formKey, setFormKey] = useState(0);
    const [isFormValid, setIsFormValid] = useState(false);

    const watchedFields = useWatch({
        control,
        name: ['name', 'email', 'unique_code', 'address', 'status', 'admin_user']
    });

    const [name, email, unique_code, address, status, admin_user] = watchedFields || [];

    useEffect(() => {
        const requiredFieldsFilled = !!(
            name && 
            email && 
            unique_code && 
            address && 
            status && 
            admin_user
        );

        const noRequiredFieldErrors = !(
            errors.name || 
            errors.email || 
            errors.unique_code || 
            errors.address || 
            errors.status || 
            errors.admin_user
        );

        setIsFormValid(requiredFieldsFilled && noRequiredFieldErrors);
    }, [name, email, unique_code, address, status, admin_user, errors]);

    const handleReset = () => {
        if (onReset) {
            onReset();
        }
        setFormKey(prev => prev + 1);
    };
    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title="Înregistrează organizație"
            size="md"
            showResetButton={true}
            onReset={handleReset}
        >
            <form key={formKey} onSubmit={onSubmit} className="space-y-6">
                <div className="space-y-4">
                    <div className="form-group">
                    <label className="form-label">Nume organizație *</label>
                    <input 
                        {...register('name')} 
                        className={`form-input ${errors.name ? 'border-red-500' : ''}`}
                        placeholder="ex: Asociația Asura"
                    />
                    {errors.name && (
                        <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                    )}
                </div>

                <div className="form-group">
                    <label className="form-label">Email organizație *</label>
                    <input 
                        {...register('email')} 
                        type="email" 
                        className={`form-input ${errors.email ? 'border-red-500' : ''}`}
                        placeholder="ex: contact@asociatia-asura.ro"
                    />
                    {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                    )}
                </div>

                <div className="form-group">
                    <label className="form-label">Cod unic *</label>
                    <input 
                        {...register('unique_code')} 
                        className={`form-input ${errors.unique_code ? 'border-red-500' : ''}`}
                        placeholder="ex: CIF123456789"
                    />
                    {errors.unique_code && (
                        <p className="text-red-500 text-sm mt-1">{errors.unique_code.message}</p>
                    )}
                </div>

                <div className="form-group">
                    <label className="form-label">Telefon</label>
                    <input 
                        {...register('phone_number')} 
                        className={`form-input ${errors.phone_number ? 'border-red-500' : ''}`}
                        placeholder="ex: +40729669208"
                    />
                    {errors.phone_number && (
                        <p className="text-red-500 text-sm mt-1">{errors.phone_number.message}</p>
                    )}
                </div>

                <div className="form-group">
                    <label className="form-label">Adresă *</label>
                    <textarea 
                        {...register('address')} 
                        className={`form-input ${errors.address ? 'border-red-500' : ''}`}
                        placeholder="ex: Strada Matei Basarab, nr. 59A"
                        rows={3}
                    />
                    {errors.address && (
                        <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                    )}
                </div>

                <div className="form-group">
                    <label className="form-label">Adresă secundară</label>
                    <textarea 
                        {...register('address2')} 
                        className={`form-input ${errors.address2 ? 'border-red-500' : ''}`}
                        placeholder="Informații suplimentare despre adresă (opțional)"
                        rows={2}
                    />
                    {errors.address2 && (
                        <p className="text-red-500 text-sm mt-1">{errors.address2.message}</p>
                    )}
                </div>

                <div className="form-group">
                    <label className="form-label">Status *</label>
                    <select 
                        {...register('status')} 
                        className={`form-select ${errors.status ? 'border-red-500' : ''}`}
                    >
                        <option value="ACTIVE">Activ</option>
                        <option value="INACTIVE">Inactiv</option>
                        <option value="PENDING">În așteptare</option>
                    </select>
                    {errors.status && (
                        <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>
                    )}
                </div>

                <div className="form-group">
                    <label className="form-label">Administrator organizație *</label>
                    {preselectedUser ? (
                        <div>
                            <input 
                                type="text"
                                value={`${preselectedUser.full_name} (${preselectedUser.email})`}
                                className="form-input bg-gray-100 cursor-not-allowed"
                                disabled={true}
                                readOnly={true}
                            />
                            <input 
                                type="hidden"
                                {...register('admin_user')}
                                value={preselectedUser.id}
                            />
                        </div>
                    ) : (
                        <select 
                            {...register('admin_user')} 
                            className={`form-select ${errors.admin_user ? 'border-red-500' : ''}`}
                            disabled={loadingPendingUsers}
                        >
                            <option value="">
                                {loadingPendingUsers ? 'Se încarcă...' : 'Selectează administrator'}
                            </option>
                            {Array.isArray(pendingAdminUsers) && pendingAdminUsers.map((admin) => (
                                <option key={admin.id} value={admin.id}>
                                    {admin.full_name} ({admin.email})
                                </option>
                            ))}
                        </select>
                    )}
                    {errors.admin_user && (
                        <p className="text-red-500 text-sm mt-1">{errors.admin_user.message}</p>
                    )}
                </div>
                </div>

                <div className="modal-footer">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
                        Anulează
                    </Button>
                    <Button type="submit" disabled={isSubmitting || !isFormValid}>
                        {isSubmitting ? <LoadingSpinner size="sm" /> : 'Creează organizație'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};