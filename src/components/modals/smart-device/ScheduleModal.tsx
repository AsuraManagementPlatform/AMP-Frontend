import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '@/components/ui/Modal.tsx';
import { Button } from '@/components/ui/Button.tsx';
import showToast from '@/components/ui/Toast.tsx';
import smartDeviceService from '@/services/smartDevice.service.ts';
import { SmartDevice } from '@/types/smart-device.types.ts';

const DAY_CODES = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] as const;

interface ScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    device: SmartDevice;
    onScheduleSaved: (device: SmartDevice) => void;
    onScheduleDeleted: (device: SmartDevice) => void;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
    isOpen,
    onClose,
    device,
    onScheduleSaved,
    onScheduleDeleted,
}) => {
    const { t } = useTranslation();
    const [onTime, setOnTime] = useState('');
    const [offTime, setOffTime] = useState('');
    const [selectedDays, setSelectedDays] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [inverted, setInverted] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (device.schedule) {
                setOnTime(device.schedule.onTime);
                setOffTime(device.schedule.offTime);
                setSelectedDays(device.schedule.days);
                setInverted(device.schedule.inverted ?? false);
            } else {
                setOnTime('');
                setOffTime('');
                setSelectedDays([]);
                setInverted(false);
            }
        }
    }, [isOpen, device]);

    const toggleDay = (day: string) => {
        setSelectedDays(prev =>
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        );
    };

    const timePattern = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;

    const handleTimeChange = (value: string, setter: (v: string) => void) => {
        const digits = value.replace(/\D/g, '').slice(0, 4);
        if (digits.length <= 2) {
            setter(digits);
        } else {
            setter(`${digits.slice(0, 2)}:${digits.slice(2)}`);
        }
    };

    const isTimeInvalid = (val: string) => val.length === 5 && !timePattern.test(val);

    const handleSave = async () => {
        if (!timePattern.test(onTime) || !timePattern.test(offTime)) {
            showToast.error(t('toast.smart_device.schedule_invalid_times'));
            return;
        }
        try {
            setSaving(true);
            await smartDeviceService.setSchedule(device.id, {
                onTime,
                offTime,
                days: selectedDays,
                inverted,
            });
            showToast.success(t('toast.smart_device.schedule_saved'));
            onScheduleSaved({
                ...device,
                schedule: { onTime, offTime, days: selectedDays, inverted },
                scheduleExpectedOutput: null,
            });
            onClose();
        } catch (error: any) {
            const message = error?.message || t('toast.smart_device.schedule_save_error');
            showToast.error(message.includes('.') ? t(message) : message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            setDeleting(true);
            await smartDeviceService.deleteSchedule(device.id);
            showToast.success(t('toast.smart_device.schedule_deleted'));
            onScheduleDeleted({ ...device, schedule: null, scheduleExpectedOutput: null });
            onClose();
        } catch (error: any) {
            const message = error?.message || t('toast.smart_device.schedule_delete_error');
            showToast.error(message.includes('.') ? t(message) : message);
        } finally {
            setDeleting(false);
        }
    };

    const dayLabel = (day: string) =>
        t(`label.smart_device.day_${day.toLowerCase()}`);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={t('label.smart_device.schedule_modal_title')}
            size="md"
        >
            <div className="space-y-6 px-1">
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2">
                            {t('label.smart_device.schedule_on_time')}
                        </label>
                        <input
                            type="text"
                            value={onTime}
                            onChange={e => handleTimeChange(e.target.value, setOnTime)}
                            placeholder="HH:MM"
                            maxLength={5}
                            className={`w-full border rounded-lg px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:border-transparent ${
                                isTimeInvalid(onTime)
                                    ? 'border-red-400 focus:ring-red-400'
                                    : 'border-gray-300 focus:ring-orange-400'
                            }`}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2">
                            {t('label.smart_device.schedule_off_time')}
                        </label>
                        <input
                            type="text"
                            value={offTime}
                            onChange={e => handleTimeChange(e.target.value, setOffTime)}
                            placeholder="HH:MM"
                            maxLength={5}
                            className={`w-full border rounded-lg px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:border-transparent ${
                                isTimeInvalid(offTime)
                                    ? 'border-red-400 focus:ring-red-400'
                                    : 'border-gray-300 focus:ring-orange-400'
                            }`}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-3">
                        {t('label.smart_device.schedule_days')}
                    </label>
                    <div className="flex gap-2 flex-wrap">
                        {DAY_CODES.map(day => (
                            <button
                                key={day}
                                type="button"
                                onClick={() => toggleDay(day)}
                                className={`w-12 py-2 rounded-lg text-xs font-semibold border-2 transition-all duration-150 ${
                                    selectedDays.includes(day)
                                        ? 'bg-orange-500 border-orange-500 text-white shadow-sm'
                                        : 'bg-white border-gray-200 text-gray-500 hover:border-orange-300 hover:text-orange-500'
                                }`}
                            >
                                {dayLabel(day)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center justify-between py-2.5 px-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-sm font-medium text-gray-700">
                        {inverted ? t('label.smart_device.schedule_mode_off') : t('label.smart_device.schedule_mode_on')}
                    </span>
                    <button
                        type="button"
                        onClick={() => setInverted(prev => !prev)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            inverted ? 'bg-gray-400' : 'bg-orange-500'
                        }`}
                    >
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${inverted ? 'translate-x-0' : 'translate-x-5'}`} />
                    </button>
                </div>

                <div className="flex justify-between items-center pt-1 border-t border-gray-100">
                    <div>
                        {device.schedule && (
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={handleDelete}
                                disabled={deleting || saving}
                            >
                                {deleting ? t('label.loading') : t('label.smart_device.schedule_remove')}
                            </Button>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <Button variant="secondary" size="sm" onClick={onClose} disabled={saving || deleting}>
                            {t('label.smart_device.schedule_cancel')}
                        </Button>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={handleSave}
                            disabled={!onTime || !offTime || selectedDays.length === 0 || saving || deleting}
                        >
                            {saving ? t('label.loading') : t('label.smart_device.schedule_save')}
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
