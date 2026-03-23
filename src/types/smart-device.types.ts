export interface SmartDeviceSchedule {
    onTime: string;
    offTime: string;
    days: string[];
    inverted?: boolean;
}

export interface SmartDevice {
    id: string;
    name: string;
    shellyDeviceId: string;
    isActive: boolean;
    addedAt: string;
    online: boolean;
    output: boolean | null;
    apower: number | null;
    voltage: number | null;
    current: number | null;
    aenergyTotal: number | null;
    schedule: SmartDeviceSchedule | null;
    scheduleExpectedOutput: boolean | null;
}

export type SmartDeviceAction = 'on' | 'off' | 'toggle';
