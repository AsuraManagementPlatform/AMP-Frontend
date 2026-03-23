import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '@/components/ui/Modal.tsx';
import { Button } from '@/components/ui/Button.tsx';
import showToast from '@/components/ui/Toast.tsx';
import smartDeviceService from '@/services/smartDevice.service.ts';
import { SmartDevice, SmartDeviceAction } from '@/types/smart-device.types.ts';

interface SmartDeviceModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SmartDeviceModal: React.FC<SmartDeviceModalProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const [devices, setDevices] = useState<SmartDevice[]>([]);
    const [loading, setLoading] = useState(false);
    const [controllingId, setControllingId] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchDevices();
        }
    }, [isOpen]);

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
            await smartDeviceService.control(device.id, action);
            showToast.success(t('toast.smart_device.control_success'));
            setDevices(prev => prev.map(d => {
                if (d.id !== device.id) return d;
                const newOutput = action === 'on' ? true : action === 'off' ? false : !d.output;
                return { ...d, output: newOutput };
            }));
        } catch (error: any) {
            const message = error?.message || t('toast.smart_device.control_error');
            showToast.error(message.includes('.') ? t(message) : message);
        } finally {
            setControllingId(null);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={t('label.smart_device.modal_title')}
            size="xl"
        >
            <div className="space-y-4">
                <div className="flex justify-end">
                    <Button variant="secondary" onClick={fetchDevices} disabled={loading}>
                        {loading ? t('label.loading') : t('label.smart_device.refresh')}
                    </Button>
                </div>

                {loading ? (
                    <div className="text-center py-8 text-gray-500">{t('label.loading')}</div>
                ) : devices.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">{t('label.smart_device.no_devices')}</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-gray-50">
                                    <th className="text-left px-3 py-2 font-medium text-gray-700">{t('label.smart_device.col_name')}</th>
                                    <th className="text-left px-3 py-2 font-medium text-gray-700">{t('label.smart_device.col_status')}</th>
                                    <th className="text-right px-3 py-2 font-medium text-gray-700">{t('label.smart_device.col_power')}</th>
                                    <th className="text-right px-3 py-2 font-medium text-gray-700">{t('label.smart_device.col_voltage')}</th>
                                    <th className="text-right px-3 py-2 font-medium text-gray-700">{t('label.smart_device.col_current')}</th>
                                    <th className="text-right px-3 py-2 font-medium text-gray-700">{t('label.smart_device.col_energy')}</th>
                                    <th className="text-center px-3 py-2 font-medium text-gray-700">{t('label.smart_device.col_control')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {devices.map(device => (
                                    <tr key={device.id} className="border-b hover:bg-gray-50">
                                        <td className="px-3 py-3 font-medium text-gray-900">{device.name}</td>
                                        <td className="px-3 py-3">
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
                                        <td className="px-3 py-3 text-right text-gray-700">
                                            {device.apower != null ? `${device.apower.toFixed(1)} W` : '--'}
                                        </td>
                                        <td className="px-3 py-3 text-right text-gray-700">
                                            {device.voltage != null ? `${device.voltage.toFixed(1)} V` : '--'}
                                        </td>
                                        <td className="px-3 py-3 text-right text-gray-700">
                                            {device.current != null ? `${device.current.toFixed(2)} A` : '--'}
                                        </td>
                                        <td className="px-3 py-3 text-right text-gray-700">
                                            {device.aenergyTotal != null ? `${device.aenergyTotal.toFixed(1)} Wh` : '--'}
                                        </td>
                                        <td className="px-3 py-3">
                                            <div className="flex items-center justify-center gap-1">
                                                <Button
                                                    variant="primary"
                                                    className="text-xs px-2 py-1 border-green-500 text-green-600 hover:bg-green-500"
                                                    onClick={() => handleControl(device, 'on')}
                                                    disabled={controllingId === device.id || !device.online}
                                                >
                                                    {t('label.smart_device.action_on')}
                                                </Button>
                                                <Button
                                                    variant="primary"
                                                    className="text-xs px-2 py-1 border-gray-400 text-gray-600 hover:bg-gray-400"
                                                    onClick={() => handleControl(device, 'off')}
                                                    disabled={controllingId === device.id || !device.online}
                                                >
                                                    {t('label.smart_device.action_off')}
                                                </Button>
                                                <Button
                                                    variant="secondary"
                                                    className="text-xs px-2 py-1"
                                                    onClick={() => handleControl(device, 'toggle')}
                                                    disabled={controllingId === device.id || !device.online}
                                                >
                                                    {t('label.smart_device.action_toggle')}
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </Modal>
    );
};
