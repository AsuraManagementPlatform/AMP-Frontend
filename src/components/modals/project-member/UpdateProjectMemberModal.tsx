import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '@/components/ui/Modal';
import { DynamicForm } from '@/components/forms/DynamicForm';
import projectMemberService from '@/services/project-member.service.ts';
import userService from '@/services/user.service.ts';
import showToast from '@/components/ui/Toast';
import { updateProjectMemberFormConfig } from "@/config/project-member.form.config.ts";
import {
    UpdateProjectMemberData,
    updateProjectMemberSchema
} from "@/schemas/project-member.schema.ts";
import { User } from "@/types/user.types.ts";
import {
    ProjectMember,
    ProjectMemberStatus,
    ProjectMemberType,
    ProjectMemberUpdateRequest
} from "@/types/project-member.types.ts";

interface UpdateProjectMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    member: ProjectMember;
    organizationId: string;
}

export const UpdateProjectMemberModal: React.FC<UpdateProjectMemberModalProps> = ({
                                                                                      isOpen,
                                                                                      onClose,
                                                                                      onSuccess,
                                                                                      member,
                                                                                      organizationId
                                                                                  }) => {
    const { t } = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [organizationUsers, setOrganizationUsers] = useState<User[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);

    useEffect(() => {
        const loadUsers = async () => {
            try {
                setLoadingUsers(true);
                const response = await userService.getList({
                    pageSize: 100,
                    filters: {
                        organization_id: organizationId
                    }
                });
                setOrganizationUsers(response.results || []);
            } catch (error) {
                showToast.error(t('toast.project_member.load_error'));
            } finally {
                setLoadingUsers(false);
            }
        };

        if (isOpen) {
            loadUsers();
        }
    }, [isOpen, organizationId]);

    const handleSubmit = async (data: UpdateProjectMemberData) => {
        try {
            setIsSubmitting(true);

            const status = data.status as ProjectMemberStatus ?? undefined;
            const type = data.type as ProjectMemberType ?? undefined;
            const projectMemberUpdateRequest: ProjectMemberUpdateRequest = {
                id: data.id,
                project: data.project,
                member: data.member,
                userRole: data.userRole,
                addedToProject: data.addedToProject,
                status: status,
                type: type,
                contractualDocumentNumber: data.contractualDocumentNumber,
                activeFrom: data.activeFrom,
                activeTo: data.activeTo,
            }

            await projectMemberService.update(member.id, projectMemberUpdateRequest);
            showToast.success(t('toast.project_member.update_success'));
            onSuccess();
            onClose();
        } catch (error: any) {
            const errorMessage = error?.message || t('toast.project_member.update_error');
            showToast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formConfig = updateProjectMemberFormConfig(organizationUsers);

    const defaultValues: UpdateProjectMemberData = {
        id: member.id,
        project: member.project,
        member: member.member,
        userRole: member.userRole,
        addedToProject: member.addedToProject,
        status: member.status,
        type: member.type,
        contractualDocumentNumber: member.contractualDocumentNumber || '',
        activeFrom: member.activeFrom,
        activeTo: member.activeTo
    };

    if (loadingUsers) {
        return (
            <Modal isOpen={isOpen} onClose={onClose} title={t('label.project_member.edit_title')} size="lg">
                <div className="flex justify-center items-center py-8">
                    <div className="text-gray-600">{t('label.project_member.loading')}</div>
                </div>
            </Modal>
        );
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={t('label.project_member.edit_title')}
            size="lg"
        >
            <DynamicForm<UpdateProjectMemberData>
                config={formConfig}
                schema={updateProjectMemberSchema}
                onSubmit={handleSubmit}
                onCancel={onClose}
                defaultValues={defaultValues}
                isSubmitting={isSubmitting}
            />
        </Modal>
    );
};