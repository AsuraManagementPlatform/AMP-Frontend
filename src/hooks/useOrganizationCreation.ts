import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createOrganizationSchema } from '@/schemas/organization.schema';
import organizationService from '@/services/organization.service';
import userService from '@/services/user.service';
import showToast from '@/components/ui/Toast';
import { UserMeResponse } from '@/types/user.types';

export const useOrganizationCreation = () => {
    const [isCreateOrganizationModalOpen, setIsCreateOrganizationModalOpen] = useState(false);
    const [pendingAdminUsers, setPendingAdminUsers] = useState<UserMeResponse[]>([]);
    const [loadingPendingUsers, setLoadingPendingUsers] = useState(false);

    const {
        register: registerOrg,
        handleSubmit: handleSubmitOrg,
        reset: resetOrg,
        formState: { errors: errorsOrg, isSubmitting: isSubmittingOrg }
    } = useForm({
        resolver: zodResolver(createOrganizationSchema),
        defaultValues: {
            status: 'ACTIVE' as const,
            admin_user: ''
        }
    });

    const resetOrgForm = () => {
        resetOrg({
            status: 'ACTIVE' as const,
            admin_user: ''
        });
    };

    const loadPendingAdminUsers = async () => {
        try {
            setLoadingPendingUsers(true);
            const users = await userService.getPendingAdminUsers();
            console.log('Pending admin users response:', users);
            
            const userArray = Array.isArray(users) ? users : [];
            setPendingAdminUsers(userArray);
            
            return userArray.length > 0;
        } catch (error) {
            console.error('Error loading pending admin users:', error);
            setPendingAdminUsers([]);
            return false;
        } finally {
            setLoadingPendingUsers(false);
        }
    };

    const openCreateOrganizationModal = async () => {
        const hasUsers = await loadPendingAdminUsers();
        
        if (!hasUsers) {
            showToast.error('Nu există utilizatori administratori în așteptare pentru a crea o organizație.');
            return;
        }
        
        setIsCreateOrganizationModalOpen(true);
    };

    const onSubmitCreateOrganization = async (data: any) => {
        try {
            const organizationData = {
                ...data,
                admin_user: data.admin_user
            };
            
            const createdOrganization = await organizationService.createOrganization(organizationData);
            setIsCreateOrganizationModalOpen(false);
            
            showToast.success(`Organizația "${createdOrganization.name}" a fost creată cu succes!`);
            resetOrgForm();
        } catch (error: any) {
            showToast.error(`Eroare la crearea organizației: ${error.message}`);
        }
    };

    return {
        isCreateOrganizationModalOpen,
        setIsCreateOrganizationModalOpen,
        pendingAdminUsers,
        loadingPendingUsers,
        registerOrg,
        handleSubmitOrg: handleSubmitOrg(onSubmitCreateOrganization),
        errorsOrg,
        isSubmittingOrg,
        resetOrgForm,
        openCreateOrganizationModal,
        loadPendingAdminUsers
    };
};