import {useState} from 'react';
import organizationService from '@/services/organization.service';
import userService from '@/services/user.service';
import showToast from '@/components/ui/Toast';
import {toast} from 'react-hot-toast';
import {User, UserMeResponse, UserStatus} from '@/types/user.types';
import {CreateOrganizationData} from '@/schemas/organization.schema';
import {useTableData} from "@/hooks/useTableData.ts";

export const useOrganizationCreation = (onOrganizationCreated?: () => void) => {
    const [isCreateOrganizationModalOpen, setIsCreateOrganizationModalOpen] = useState(false);
    const [pendingAdminUsers, setPendingAdminUsers] = useState<User[]>([]);
    const [loadingPendingUsers, setLoadingPendingUsers] = useState(false);
    const [preselectedUser, setPreselectedUser] = useState<UserMeResponse | null>(null);
    const [companyData, setCompanyData] = useState<{ company_name: string; company_number: string } | null>(null);
    const {refresh} = useTableData({
        endpoint:"user/list",
        initialPageSize: 20,
        initialFilters:[{field: 'status', operator: 'exact', value: UserStatus.DRAFT}],
        initialSort:{ field: 'email', direction: 'asc' },
        autoFetch: true,
    })
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
        setCompanyData(companyData || null);
        await loadPendingAdminUsers();
        setIsCreateOrganizationModalOpen(true);
    };

    const onSubmitCreateOrganization = async (data: CreateOrganizationData) => {
        let loadingToast: string | undefined;
        
        try {
            setIsSubmittingOrg(true);
            loadingToast = showToast.creatingOrganization();
            
            let organizationData: any = {
                ...data,
                admin_user: data.admin_user
            };

            if (data.cui && data.cui.toUpperCase().startsWith('RO')) {
                organizationData.tax_exempt_status = false;
                organizationData.tax_percentage = 0.19;
            } else {
                organizationData.tax_exempt_status = true;
                delete organizationData.tax_percentage;
            }
            
            await organizationService.create(organizationData);
            if (preselectedUser && preselectedUser.status === UserStatus.DRAFT) {
                try {
                    await userService.update(preselectedUser.id, { 
                        status: UserStatus.ACTIVE 
                    });
                } catch (userUpdateError) {
                }
            }
            
            if (loadingToast) {
                toast.dismiss(loadingToast);
            }
            showToast.organizationCreated();
            
            setIsCreateOrganizationModalOpen(false);
            setPreselectedUser(null);
            setCompanyData(null);
            if (onOrganizationCreated) {
                onOrganizationCreated();
            }
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
            await refresh()
        }
    };

    return {
        isCreateOrganizationModalOpen,
        setIsCreateOrganizationModalOpen,
        pendingAdminUsers,
        loadingPendingUsers,
        preselectedUser,
        companyData,
        handleSubmitOrg: onSubmitCreateOrganization,
        isSubmittingOrg,
        openCreateOrganizationModal,
        openCreateOrganizationModalWithUser,
        loadPendingAdminUsers
    };
};
