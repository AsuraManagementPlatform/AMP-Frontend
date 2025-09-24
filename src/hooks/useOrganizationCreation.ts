import {useState} from 'react';
import organizationService from '@/services/organization.service';
import userService from '@/services/user.service';
import showToast from '@/components/ui/Toast';
import {toast} from 'react-hot-toast';
import {User, UserMeResponse, UserStatus} from '@/types/user.types';
import {CreateOrganizationData} from '@/schemas/organization.schema';

export const useOrganizationCreation = () => {
    const [isCreateOrganizationModalOpen, setIsCreateOrganizationModalOpen] = useState(false);
    const [pendingAdminUsers, setPendingAdminUsers] = useState<User[]>([]);
    const [loadingPendingUsers, setLoadingPendingUsers] = useState(false);
    const [preselectedUser, setPreselectedUser] = useState<UserMeResponse | null>(null);

    const [isSubmittingOrg, setIsSubmittingOrg] = useState(false);

    const loadPendingAdminUsers = async () => {
        try {
            setLoadingPendingUsers(true);
            const users = await userService.getList({filters:{status: UserStatus.DRAFT}});
            
            setPendingAdminUsers(users.results);
            
            return users.count > 0;
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
            showToast.noPendingAdminUsers();
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
        
        setIsCreateOrganizationModalOpen(true);
    };

    const onSubmitCreateOrganization = async (data: CreateOrganizationData) => {
        let loadingToast: string | undefined;
        
        try {
            setIsSubmittingOrg(true);
            loadingToast = showToast.creatingOrganization();
            
            const organizationData = {
                ...data,
                admin_user: data.admin_user
            };
            
            await organizationService.create(organizationData);
            
            if (loadingToast) {
                toast.dismiss(loadingToast);
            }
            showToast.organizationCreated();
            
            setIsCreateOrganizationModalOpen(false);
            setPreselectedUser(null);
            
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
        } finally {
            setIsSubmittingOrg(false);
        }
    };

    return {
        isCreateOrganizationModalOpen,
        setIsCreateOrganizationModalOpen,
        pendingAdminUsers,
        loadingPendingUsers,
        preselectedUser,
        handleSubmitOrg: onSubmitCreateOrganization,
        isSubmittingOrg,
        openCreateOrganizationModal,
        openCreateOrganizationModalWithUser,
        loadPendingAdminUsers
    };
};