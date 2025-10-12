import React, { useState, useEffect } from 'react';
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
import { ProjectMember } from "@/types/project-member.types.ts";

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
                showToast.error('Eroare la încărcarea utilizatorilor');
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
            await projectMemberService.update(member.id, data as any);
            showToast.success('Membrul a fost actualizat cu succes!');
            onSuccess();
            onClose();
        } catch (error: any) {
            const errorMessage = error?.message || 'Eroare la actualizarea membrului';
            showToast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formConfig = updateProjectMemberFormConfig(organizationUsers);

    const defaultValues: UpdateProjectMemberData = {
        project: member.project,
        member: member.member,
        user_role: member.user_role,
        added_to_project: member.added_to_project,
        status: member.status,
        type: member.type,
        contractual_document_number: member.contractual_document_number || '',
        active_from: member.active_from,
        active_to: member.active_to
    };

    if (loadingUsers) {
        return (
            <Modal isOpen={isOpen} onClose={onClose} title="Actualizează membru" size="lg">
                <div className="flex justify-center items-center py-8">
                    <div className="text-gray-600">Se încarcă...</div>
                </div>
            </Modal>
        );
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Actualizează membru"
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