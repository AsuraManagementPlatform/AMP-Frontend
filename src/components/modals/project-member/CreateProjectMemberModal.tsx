import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { DynamicForm } from '@/components/forms/DynamicForm';
import projectMemberService from '@/services/project-member.service.ts';
import userService from '@/services/user.service.ts';
import showToast from '@/components/ui/Toast';
import { createProjectMemberFormConfig } from "@/config/project-member.form.config.ts";
import {
    CreateProjectMemberData,
    createProjectMemberSchema,
    getCreateProjectMemberDefaultValues
} from "@/schemas/project-member.schema.ts";
import { User } from "@/types/user.types.ts";

interface CreateProjectMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    projectId: string;
    organizationId: string;
}

export const CreateProjectMemberModal: React.FC<CreateProjectMemberModalProps> = ({
                                                                                      isOpen,
                                                                                      onClose,
                                                                                      onSuccess,
                                                                                      projectId,
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

    const handleSubmit = async (data: CreateProjectMemberData) => {
        try {
            setIsSubmitting(true);
            await projectMemberService.create(data as any);
            showToast.success('Membrul a fost adăugat cu succes!');
            onSuccess();
            onClose();
        } catch (error: any) {
            const errorMessage = error?.message || 'Eroare la adăugarea membrului';
            showToast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formConfig = createProjectMemberFormConfig(organizationUsers);
    const defaultValues = getCreateProjectMemberDefaultValues(projectId);

    if (loadingUsers) {
        return (
            <Modal isOpen={isOpen} onClose={onClose} title="Adaugă membru" size="lg">
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
            title="Adaugă membru în proiect"
            size="lg"
        >
            <DynamicForm<CreateProjectMemberData>
                config={formConfig}
                schema={createProjectMemberSchema}
                onSubmit={handleSubmit}
                onCancel={onClose}
                defaultValues={defaultValues}
                isSubmitting={isSubmitting}
            />
        </Modal>
    );
};