import {z} from "zod";
import {DefaultValues, FieldValues, SubmitHandler, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {DynamicFormField} from "@/components/forms/DynamicFormField.tsx";
import {Button} from "@/components/ui/Button.tsx";
import {DynamicFormConfig} from "@/types/form.types.ts";


interface DynamicFormProps<TFormData extends object> {
    config: DynamicFormConfig;
    schema: z.ZodSchema<TFormData>;
    onSubmit: SubmitHandler<TFormData>;
    onCancel?: () => void;
    onReset?: () => void;
    defaultValues?: Partial<TFormData>;
    isSubmitting?: boolean;
    className?: string;
}

export function DynamicForm<TFormData extends FieldValues>({
                                                               config,
                                                               schema,
                                                               onSubmit,
                                                               onCancel,
                                                               onReset,
                                                               defaultValues,
                                                               isSubmitting = false,
                                                               className = ''
                                                           }: DynamicFormProps<TFormData>) {
    const {
        control,
        handleSubmit,
        formState: { errors, isValid },
        reset,
        watch
    } = useForm<TFormData>({
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        resolver: zodResolver(schema),
        defaultValues: defaultValues as DefaultValues<TFormData>,
        mode: 'onChange'
    });

    const formValues = watch();

    const getGridClasses = (columns?: number): string => {
        switch (columns) {
            case 1: return 'grid grid-cols-1 gap-4';
            case 2: return 'grid grid-cols-1 md:grid-cols-2 gap-4';
            case 3: return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';
            case 4: return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4';
            default: return 'grid grid-cols-1 md:grid-cols-2 gap-4';
        }
    };

    const handleFormSubmit = (data: TFormData) => {
        onSubmit(data);
    };

    const handleReset = () => {
        reset(defaultValues as DefaultValues<TFormData>);
        if (onReset) {
            onReset();
        }
    };

    const shouldShowField = (field: any): boolean => {
        if (!field.condition) return true;

        if (typeof field.condition === 'function') {
            return field.condition(formValues);
        }

        return true;
    };

    return (
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        <form onSubmit={handleSubmit(handleFormSubmit)} className={`space-y-6 ${className}`}>
            {config.sections.map((section, sectionIndex) => {
                const shouldShowSection = !section.hidden && (!section.condition || section.condition(formValues));
                if (!shouldShowSection) return null;

                const visibleFields = section.fields.filter(shouldShowField);

                if (visibleFields.length === 0) return null;

                return (
                    <div key={sectionIndex} className="space-y-4">
                        {section.title && (
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">{section.title}</h3>
                                {section.description && (
                                    <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                                )}
                            </div>
                        )}

                        <div className={getGridClasses(section.columns)}>
                            {visibleFields.map((field) => (
                                <DynamicFormField
                                    key={field.name}
                                    field={field}
                                    control={control}
                                    error={errors[field.name as keyof TFormData]?.message as string}
                                    formValues={formValues}
                                />
                            ))}
                        </div>
                    </div>
                );
            })}

            <div className="modal-footer flex justify-between items-center pt-6">
                <div className="flex gap-2">
                    {onCancel && (
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onCancel}
                            disabled={isSubmitting}
                        >
                            {config.cancelButtonText || 'Anulează'}
                        </Button>
                    )}
                </div>

                <div className="flex gap-2">
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={isSubmitting || !isValid}
                    >
                        {isSubmitting
                            ? 'Se procesează...'
                            : config.submitButtonText || 'Salvează'
                        }
                    </Button>
                </div>
            </div>
        </form>
    );
}