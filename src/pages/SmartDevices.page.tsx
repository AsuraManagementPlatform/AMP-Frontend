import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import showToast from '@/components/ui/Toast';
import smartDeviceService from '@/services/smartDevice.service';
import { SmartDevice, SmartDeviceAction } from '@/types/smart-device.types';
import { ScheduleModal } from '@/components/modals/smart-device/ScheduleModal';
import { ClockIcon } from '@heroicons/react/24/outline';

const SmartDevicesPage: React.FC = () => {
    const { t } = useTranslation();
    const [devices, setDevices] = useState<SmartDevice[]>([]);
    const [loading, setLoading] = useState(false);
    const [controllingId, setControllingId] = useState<string | null>(null);
    const [scheduleModalDevice, setScheduleModalDevice] = useState<SmartDevice | null>(null);

    useEffect(() => {
        fetchDevices();
    }, []);

    const fetchDevices = async () => {
        try {
            setLoading(true);
            const data = await smartDeviceService.getList();
            setDevices(data);
        } catch (error: any) {
            const message = error?.message || t('toast.smart_device.load_error');
            showToast.error(message.includes('.') ? t(message) : message);
        } finally {
            setLoading(false);
        }
    };

    const handleControl = async (device: SmartDevice, action: SmartDeviceAction) => {
        try {
            setControllingId(device.id);
            const result = await smartDeviceService.control(device.id, action);
            if (result.scheduleCleared) {
                showToast.info(t('label.smart_device.schedule_cleared_warning'));
            } else {
                showToast.success(t('toast.smart_device.control_success'));
            }
            setDevices(prev => prev.map(d => {
                if (d.id !== device.id) return d;
                const newOutput = action === 'on' ? true : action === 'off' ? false : !d.output;
                return { ...d, output: newOutput, ...(result.scheduleCleared ? { schedule: null, scheduleExpectedOutput: null } : {}) };
            }));
        } catch (error: any) {
            const message = error?.message || t('toast.smart_device.control_error');
            showToast.error(message.includes('.') ? t(message) : message);
        } finally {
            setControllingId(null);
        }
    };

    const handleScheduleSaved = (updated: SmartDevice) => {
        setDevices(prev => prev.map(d => d.id === updated.id ? { ...d, schedule: updated.schedule, scheduleExpectedOutput: updated.scheduleExpectedOutput } : d));
    };

    const handleScheduleDeleted = (updated: SmartDevice) => {
        setDevices(prev => prev.map(d => d.id === updated.id ? { ...d, schedule: null, scheduleExpectedOutput: null } : d));
    };


    return (
        <Layout showNavigation={true}>
            <div className="container mx-auto">
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">{t('label.smart_device.modal_title')}</h1>
                        <Button variant="secondary" onClick={fetchDevices} disabled={loading}>
                            {loading ? t('label.loading') : t('label.smart_device.refresh')}
                        </Button>
                    </div>

                    {loading ? (
                        <div className="text-center py-12 text-gray-500">{t('label.loading')}</div>
                    ) : devices.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">{t('label.smart_device.no_devices')}</div>
                    ) : (
                        <div className="bg-white rounded-lg shadow overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-gray-50">
                                        <th className="text-left px-4 py-3 font-medium text-gray-700">{t('label.smart_device.col_name')}</th>
                                        <th className="text-left px-4 py-3 font-medium text-gray-700">{t('label.smart_device.col_status')}</th>
                                        <th className="text-right px-4 py-3 font-medium text-gray-700">{t('label.smart_device.col_power')}</th>
                                        <th className="text-right px-4 py-3 font-medium text-gray-700">{t('label.smart_device.col_voltage')}</th>
                                        <th className="text-right px-4 py-3 font-medium text-gray-700">{t('label.smart_device.col_current')}</th>
                                        <th className="text-right px-4 py-3 font-medium text-gray-700">{t('label.smart_device.col_energy')}</th>
                                        <th className="text-center px-4 py-3 font-medium text-gray-700">{t('label.smart_device.col_schedule')}</th>
                                        <th className="text-center px-4 py-3 font-medium text-gray-700">{t('label.smart_device.col_control')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {devices.map(device => (
                                        <tr key={device.id} className="border-b hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium text-gray-900">{device.name}</td>
                                            <td className="px-4 py-3">
                                                {device.online ? (
                                                    device.output ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                            {t('label.smart_device.status_on')}
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                                            {t('label.smart_device.status_off')}
                                                        </span>
                                                    )
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                                                        {t('label.smart_device.status_offline')}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right text-gray-700">
                                                {device.apower != null ? `${device.apower.toFixed(1)} W` : 'â€”'}
                                            </td>
                                            <td className="px-4 py-3 text-right text-gray-700">
                                                {device.voltage != null ? `${device.voltage.toFixed(1)} V` : 'â€”'}
                                            </td>
                                            <td className="px-4 py-3 text-right text-gray-700">
                                                {device.current != null ? `${device.current.toFixed(2)} A` : 'â€”'}
                                            </td>
                                            <td className="px-4 py-3 text-right text-gray-700">
                                                {device.aenergyTotal != null ? `${device.aenergyTotal.toFixed(1)} Wh` : 'â€”'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-center">
                                                    {device.schedule ? (
                                                        <button
                                                            onClick={() => setScheduleModalDevice(device)}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-orange-500 border border-orange-500 text-white hover:bg-orange-600 hover:border-orange-600 transition-colors"
                                                        >
                                                            {t('label.smart_device.schedule_active')}
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => setScheduleModalDevice(device)}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-50 border border-gray-200 text-gray-500 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600 transition-colors"
                                                        >
                                                            <ClockIcon className="w-3.5 h-3.5 flex-shrink-0 text-gray-900" />
                                                            {t('label.smart_device.schedule_btn')}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-center gap-3">
                                                    <button
                                                        onClick={() => handleControl(device, 'toggle')}
                                                        disabled={controllingId === device.id || !device.online}
                                                        className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                                            !device.online
                                                                ? 'cursor-not-allowed bg-gray-200'
                                                                : device.output
                                                                    ? 'cursor-pointer bg-blue-500'
                                                                    : 'cursor-pointer bg-gray-400'
                                                        } ${controllingId === device.id ? 'opacity-50' : ''}`}
                                                        role="switch"
                                                        aria-checked={device.output ?? false}
                                                    >
                                                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${device.output ? 'translate-x-5' : 'translate-x-0'}`} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {scheduleModalDevice && (
                <ScheduleModal
                    isOpen={true}
                    onClose={() => setScheduleModalDevice(null)}
                    device={scheduleModalDevice}
                    onScheduleSaved={handleScheduleSaved}
                    onScheduleDeleted={handleScheduleDeleted}
                />
            )}
        </Layout>
    );
};

export default SmartDevicesPage;
