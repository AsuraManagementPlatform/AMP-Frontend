import React from 'react';
import {Modal} from '@/components/ui/Modal';
import {useTranslation} from "react-i18next";

export interface ViewSection {
    title?: string;
    fields: ViewField[];
    columns?: 1 | 2 | 3 | 4;
}

export interface ViewField {
    label: string;
    value: any;
    render?: (value: any) => React.ReactNode;
    show?: boolean;
    fullWidth?: boolean;
}

export interface ViewDataConfig {
    sections: ViewSection[];
    closeButtonText?: string;
}

interface ViewDataModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    config: ViewDataConfig;
    size?: 'sm' | 'md' | 'lg' | 'xl' ;
}

export const ViewDataModal: React.FC<ViewDataModalProps> = ({
                                                                isOpen,
                                                                onClose,
                                                                title,
                                                                config,
                                                                size = 'lg'
                                                            }) => {
    const { t } = useTranslation();

    const getGridClasses = (columns?: number): string => {
        switch (columns) {
            case 1: return 'grid grid-cols-1 gap-4';
            case 2: return 'grid grid-cols-1 md:grid-cols-2 gap-4';
            case 3: return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';
            case 4: return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4';
            default: return 'grid grid-cols-1 md:grid-cols-2 gap-4';
        }
    };

    const renderValue = (field: ViewField) => {
        if (field.render) {
            return field.render(field.value);
        }

        if (field.value === null || field.value === undefined || field.value === '') {
            return <span className="text-gray-400">-</span>;
        }

        if (typeof field.value === 'boolean') {
            return field.value ? 'Da' : 'Nu';
        }

        return field.value;
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            size={size}
        >
            <div className="space-y-6">
                {config.sections.map((section, sectionIndex) => {
                    const visibleFields = section.fields.filter(field => field.show !== false);

                    if (visibleFields.length === 0) return null;

                    return (
                        <div key={sectionIndex} className="border-b last:border-b-0 pb-4 last:pb-0">
                            {section.title && (
                                <h3 className="text-lg font-semibold mb-4">{section.title}</h3>
                            )}

                            <div className={getGridClasses(section.columns)}>
                                {visibleFields.map((field, fieldIndex) => (
                                    <div
                                        key={fieldIndex}
                                        className={field.fullWidth ? 'col-span-full' : ''}
                                    >
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {field.label}
                                        </label>
                                        <div className="text-gray-900">
                                            {renderValue(field)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}

                <div className="flex justify-end pt-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                    >
                        {config.closeButtonText || t('action.close')}
                    </button>
                </div>
            </div>
        </Modal>
    );
};