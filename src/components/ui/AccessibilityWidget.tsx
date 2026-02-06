import React, { useState, useEffect, useRef } from 'react';
import { useAccessibility, initAccessibilityStyles } from '@/hooks/useAccessibility';

interface ToggleProps {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}

const Toggle: React.FC<ToggleProps> = ({ label, checked, onChange }) => (
    <label className="flex items-center justify-between py-2 cursor-pointer">
        <span className="text-sm text-gray-700">{label}</span>
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                checked ? 'bg-orange-500' : 'bg-gray-300'
            }`}
        >
            <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    checked ? 'translate-x-5' : 'translate-x-1'
                }`}
            />
        </button>
    </label>
);

export const AccessibilityWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    
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

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                panelRef.current &&
                buttonRef.current &&
                !panelRef.current.contains(event.target as Node) &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <>
            <button
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 focus:outline-none focus:ring-4 focus:ring-orange-300"
                aria-label="Opțiuni de accesibilitate"
                title="Accesibilitate"
            >
                <svg 
                    className="w-7 h-7" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                >
                    <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9H15V22H13V16H11V22H9V9H3V7H21V9Z"/>
                </svg>
            </button>

            {isOpen && (
                <div
                    ref={panelRef}
                    className="fixed bottom-24 right-6 z-50 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
                >
                    <div className="bg-orange-500 text-white px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9H15V22H13V16H11V22H9V9H3V7H21V9Z"/>
                            </svg>
                            <span className="font-semibold">Accesibilitate</span>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white hover:text-gray-200 transition-colors"
                            aria-label="Închide"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="p-4 max-h-[60vh] overflow-y-auto">
                        <div className="mb-4">
                            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Dimensiune Text</h4>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={decreaseFontSize}
                                    disabled={settings.fontSize <= 80}
                                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-bold"
                                >
                                    A-
                                </button>
                                <span className="text-gray-700 font-medium text-sm flex-1 text-center">
                                    {settings.fontSize}%
                                </span>
                                <button
                                    onClick={increaseFontSize}
                                    disabled={settings.fontSize >= 150}
                                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-bold"
                                >
                                    A+
                                </button>
                            </div>
                        </div>

                        <div className="border-t pt-3 mb-3">
                            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Text</h4>
                            <div className="space-y-0.5">
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

                        <div className="border-t pt-3 mb-3">
                            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Vizualizare</h4>
                            <div className="space-y-0.5">
                                <Toggle
                                    label="Mod întunecat"
                                    checked={settings.darkMode}
                                    onChange={(v) => updateSetting('darkMode', v)}
                                />
                            </div>
                        </div>

                        <div className="border-t pt-3 mb-3">
                            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Instrumente</h4>
                            <div className="space-y-0.5">
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

                        <div className="border-t pt-3">
                            <button
                                onClick={resetSettings}
                                className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-lg transition-colors"
                            >
                                Resetare setări
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AccessibilityWidget;
