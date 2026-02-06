import React, { useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import Layout from '@/components/layout/Layout';
import { useAccessibility, initAccessibilityStyles } from '@/hooks/useAccessibility';

interface ToggleProps {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}

const Toggle: React.FC<ToggleProps> = ({ label, checked, onChange }) => (
    <label className="flex items-center justify-between py-2 cursor-pointer">
        <span className="text-gray-700">{label}</span>
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                checked ? 'bg-orange-500' : 'bg-gray-300'
            }`}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    checked ? 'translate-x-6' : 'translate-x-1'
                }`}
            />
        </button>
    </label>
);

export const SettingsPage: React.FC = () => {
    const {
        settings,
        updateSetting,
        resetSettings,
        increaseFontSize,
        decreaseFontSize,
    } = useAccessibility();

    useEffect(() => {
        initAccessibilityStyles();
    }, []);

    return (
        <Layout showNavigation={true}>
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Setări</h1>
                <p className="text-gray-600 mb-6">Personalizează-ți experiența în aplicație</p>

                <Card title="Accesibilitate" className="mb-6">
                <div className="space-y-6">
                    <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">Dimensiune Text</h4>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={decreaseFontSize}
                                disabled={settings.fontSize <= 80}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-bold text-lg"
                            >
                                A-
                            </button>
                            <span className="text-gray-700 font-medium min-w-[80px] text-center">
                                {settings.fontSize}%
                            </span>
                            <button
                                onClick={increaseFontSize}
                                disabled={settings.fontSize >= 150}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-bold text-lg"
                            >
                                A+
                            </button>
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">Text</h4>
                        <div className="space-y-1">
                            <Toggle
                                label="Evidențiază titlurile"
                                checked={settings.highlightTitles}
                                onChange={(v) => updateSetting('highlightTitles', v)}
                            />
                            <Toggle
                                label="Evidențiază legăturile"
                                checked={settings.highlightLinks}
                                onChange={(v) => updateSetting('highlightLinks', v)}
                            />
                            <Toggle
                                label="Font pentru dislexie"
                                checked={settings.dyslexicFont}
                                onChange={(v) => updateSetting('dyslexicFont', v)}
                            />
                            <Toggle
                                label="Spațiere litere"
                                checked={settings.letterSpacing}
                                onChange={(v) => updateSetting('letterSpacing', v)}
                            />
                            <Toggle
                                label="Înălțime linie"
                                checked={settings.lineHeight}
                                onChange={(v) => updateSetting('lineHeight', v)}
                            />
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">Vizualizare</h4>
                        <div className="space-y-1">
                            <Toggle
                                label="Mod întunecat"
                                checked={settings.darkMode}
                                onChange={(v) => updateSetting('darkMode', v)}
                            />
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">Instrumente</h4>
                        <div className="space-y-1">
                            <Toggle
                                label="Oprește animațiile"
                                checked={settings.reduceMotion}
                                onChange={(v) => updateSetting('reduceMotion', v)}
                            />
                            <Toggle
                                label="Cursor mare"
                                checked={settings.bigCursor}
                                onChange={(v) => updateSetting('bigCursor', v)}
                            />
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <button
                            onClick={resetSettings}
                            className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                        >
                            Resetare setări
                        </button>
                        <p className="text-xs text-gray-500 mt-2 text-center">
                            Preferințele sunt salvate local în acest browser.
                        </p>
                    </div>
                </div>
            </Card>
            </div>
        </Layout>
    );
};

export default SettingsPage;
