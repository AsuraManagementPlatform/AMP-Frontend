import React, { useState } from 'react';
import { FormModal } from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { UserMeResponse } from '@/types/user.types';

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
    loadingPendingUsers
}) => {
    const [formKey, setFormKey] = useState(0);

    const handleReset = () => {
        if (onReset) {
            onReset();
        }
        setFormKey(prev => prev + 1);
    };
    return (
        <FormModal 
            isOpen={isOpen} 
            onClose={onClose} 
            title="Înregistrează organizație"
            onReset={handleReset}
        >
            <form key={formKey} onSubmit={onSubmit} className="space-y-4">
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
                    {errors.admin_user && (
                        <p className="text-red-500 text-sm mt-1">{errors.admin_user.message}</p>
                    )}
                </div>

                <div className="modal-footer">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
                        Anulează
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? <LoadingSpinner size="sm" /> : 'Creează organizație'}
                    </Button>
                </div>
            </form>
        </FormModal>
    );
};