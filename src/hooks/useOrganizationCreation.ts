import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createOrganizationSchema } from '@/schemas/organization.schema';
import organizationService from '@/services/organization.service';
import userService from '@/services/user.service';
import showToast from '@/components/ui/Toast';
import { toast } from 'react-hot-toast';
import { UserMeResponse } from '@/types/user.types';

export const useOrganizationCreation = () => {
    const [isCreateOrganizationModalOpen, setIsCreateOrganizationModalOpen] = useState(false);
    const [pendingAdminUsers, setPendingAdminUsers] = useState<UserMeResponse[]>([]);
    const [loadingPendingUsers, setLoadingPendingUsers] = useState(false);
    const [preselectedUser, setPreselectedUser] = useState<UserMeResponse | null>(null);

    const {
        register: registerOrg,
        handleSubmit: handleSubmitOrg,
        reset: resetOrg,
        control: controlOrg,
        formState: { errors: errorsOrg, isSubmitting: isSubmittingOrg }
    } = useForm({
        resolver: zodResolver(createOrganizationSchema),
        mode: 'onChange',
        defaultValues: {
            status: 'ACTIVE' as const,
            admin_user: preselectedUser?.id || ''
        }
    });

    const resetOrgForm = () => {
        resetOrg({
            status: 'ACTIVE' as const,
            admin_user: ''
        });
        showToast.formReset();
    };

    const resetOrgFormSilent = () => {
        resetOrg({
            status: 'ACTIVE' as const,
            admin_user: ''
        });
    };

    const loadPendingAdminUsers = async () => {
        try {
            setLoadingPendingUsers(true);
            const users = await userService.getPendingAdminUsers();
            
            const userArray = Array.isArray(users) ? users : [];
            setPendingAdminUsers(userArray);
            
            return userArray.length > 0;
        } catch (error) {
            setPendingAdminUsers([]);
            return false;
        } finally {
            setLoadingPendingUsers(false);
        }
    };

    const openCreateOrganizationModal = async () => {
        const hasUsers = await loadPendingAdminUsers();
        
        if (!hasUsers && !preselectedUser) {
            showToast.error('Nu există utilizatori administratori în așteptare pentru a crea o organizație.');
            return;
        }
        
        setIsCreateOrganizationModalOpen(true);
    };

    const openCreateOrganizationModalWithUser = async (
        user: UserMeResponse, 
        companyData?: { company_name: string; company_number: string }
    ) => {
        setPreselectedUser(user);
        await loadPendingAdminUsers();
        
        const formData: any = {
            status: 'ACTIVE' as const,
            admin_user: user.id
        };
        
        if (companyData) {
            formData.name = companyData.company_name;
            formData.unique_code = companyData.company_number;
        }
        
        resetOrg(formData);
        
        setIsCreateOrganizationModalOpen(true);
    };

    const onSubmitCreateOrganization = async (data: any) => {
        let loadingToast: string | undefined;
        
        try {
            loadingToast = showToast.creatingOrganization();
            
            const organizationData = {
                ...data,
                admin_user: data.admin_user
            };
            
            await organizationService.createOrganization(organizationData);
            
            if (data.admin_user) {
                try {
                    await userService.updateUserStatus(data.admin_user, 'ACTIVE');
                } catch (statusError) {
                    showToast.error('Organizația a fost creată, dar actualizarea statusului utilizatorului a eșuat.');
                }
            }
            
            if (loadingToast) {
                toast.dismiss(loadingToast);
            }
            showToast.organizationCreated();
            
            setIsCreateOrganizationModalOpen(false);
            setPreselectedUser(null);
            resetOrgFormSilent();
            
        } catch (error: any) {
            if (loadingToast) {
                toast.dismiss(loadingToast);
            }
            
            let errorMessage = 'A apărut o eroare la crearea organizației.';
            
            if (error?.message) {
                errorMessage = error.message;
            }
            
            if (errorMessage.toLowerCase().includes('duplicate') || errorMessage.toLowerCase().includes('există deja')) {
                showToast.duplicateEntry(errorMessage);
            } else if (errorMessage.toLowerCase().includes('obligatorii') || errorMessage.toLowerCase().includes('required')) {
                showToast.requiredFieldsMissing();
            } else if (errorMessage.toLowerCase().includes('validare') || errorMessage.toLowerCase().includes('validation')) {
                showToast.validationError(errorMessage);
            } else {
                showToast.organizationCreationFailed(errorMessage);
            }
        }
    };

    return {
        isCreateOrganizationModalOpen,
        setIsCreateOrganizationModalOpen,
        pendingAdminUsers,
        loadingPendingUsers,
        preselectedUser,
        registerOrg,
        controlOrg,
        handleSubmitOrg: handleSubmitOrg(onSubmitCreateOrganization),
        errorsOrg,
        isSubmittingOrg,
        resetOrgForm,
        resetOrgFormSilent,
        openCreateOrganizationModal,
        openCreateOrganizationModalWithUser,
        loadPendingAdminUsers
    };
};