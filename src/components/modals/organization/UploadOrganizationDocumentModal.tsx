import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '@/components/ui/Modal';
import { documentService } from '@/services/document.service';
import { DocumentCategoryEnum } from '@/types/document.types';
import { PrimaryActionButton } from '@/components/ui/PrimaryActionButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import showToast from '@/components/ui/Toast';

interface UploadOrganizationDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const UploadOrganizationDocumentModal: React.FC<UploadOrganizationDocumentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      showToast.error(t('label.document.select_file_required'));
      return;
    }

    try {
      setIsSubmitting(true);

      await documentService.upload({
        file: selectedFile,
        category: DocumentCategoryEnum.ORGANIZATIE,
        subcategory: subcategory || undefined,
        description: description || undefined,
      });

      showToast.success(t('label.document.upload_success'));
      onSuccess();
      handleClose();
    } catch (error: any) {
      const message = error?.message || t('label.document.upload_error');
      showToast.error(message.includes('.') ? t(message) : message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setDescription('');
    setSubcategory('');
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t('label.document.upload_title')} size="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('label.document.file_label')} <span className="text-red-500">*</span>
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
              cursor-pointer"
            disabled={isSubmitting}
          />
          {selectedFile && (
            <p className="mt-2 text-sm text-gray-600">
              {t('label.document.file_selected')}: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('label.document.category_label')}
          </label>
          <select
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting}
          >
            <option value="">{t('label.document.category_general')}</option>
            <option value="acte_constitutive">{t('label.document.category_acte_constitutive')}</option>
            <option value="acte_identitate">{t('label.document.category_acte_identitate')}</option>
            <option value="autorizatii">{t('label.document.category_autorizatii')}</option>
            <option value="licente">{t('label.document.category_licente')}</option>
            <option value="certificate">{t('label.document.category_certificate')}</option>
            <option value="contracte">{t('label.document.category_contracte')}</option>
            <option value="hotarari">{t('label.document.category_hotarari')}</option>
            <option value="procese_verbale">{t('label.document.category_procese_verbale')}</option>
            <option value="rapoarte_anuale">{t('label.document.category_rapoarte_anuale')}</option>
            <option value="altele">{t('label.document.category_altele')}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('label.document.description_label')}
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={t('label.document.description_placeholder')}
            disabled={isSubmitting}
          />
        </div>

        <div className="flex gap-3 justify-end">
          <SecondaryButton onClick={handleClose} disabled={isSubmitting}>
            {t('label.common.cancel')}
          </SecondaryButton>
          <PrimaryActionButton
            variant="create"
            type="submit"
            disabled={isSubmitting || !selectedFile}
          >
            {isSubmitting ? t('label.document.uploading') : t('label.document.upload_button')}
          </PrimaryActionButton>
        </div>
      </form>
    </Modal>
  );
};
