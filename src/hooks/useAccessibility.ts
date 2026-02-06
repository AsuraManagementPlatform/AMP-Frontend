import { useState, useEffect, useCallback } from 'react';

export interface AccessibilitySettings {
    fontSize: number;
    highlightTitles: boolean;
    highlightLinks: boolean;
    dyslexicFont: boolean;
    letterSpacing: boolean;
    lineHeight: boolean;
    darkMode: boolean;
    reduceMotion: boolean;
    bigCursor: boolean;
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
    fontSize: 100,
    highlightTitles: false,
    highlightLinks: false,
    dyslexicFont: false,
    letterSpacing: false,
    lineHeight: false,
    darkMode: false,
    reduceMotion: false,
    bigCursor: false,
};

const STORAGE_KEY = 'amp-accessibility-settings';

const applyAccessibilityStyles = (settings: AccessibilitySettings) => {
    const html = document.documentElement;
    
    html.style.fontSize = `${settings.fontSize}%`;
    
    html.classList.toggle('acc-highlight-titles', settings.highlightTitles);
    html.classList.toggle('acc-highlight-links', settings.highlightLinks);
    html.classList.toggle('acc-dyslexic-font', settings.dyslexicFont);
    html.classList.toggle('acc-letter-spacing', settings.letterSpacing);
    html.classList.toggle('acc-line-height', settings.lineHeight);
    html.classList.toggle('acc-dark-mode', settings.darkMode);
    html.classList.toggle('acc-reduce-motion', settings.reduceMotion);
    html.classList.toggle('acc-big-cursor', settings.bigCursor);
};

export const useAccessibility = () => {
    const [settings, setSettings] = useState<AccessibilitySettings>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
            }
        } catch {
            // Ignore parse errors
        }
        return DEFAULT_SETTINGS;
    });

    useEffect(() => {
        applyAccessibilityStyles(settings);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        } catch {
            // Ignore storage errors
        }
    }, [settings]);

    useEffect(() => {
        applyAccessibilityStyles(settings);
    }, []);

    const updateSetting = useCallback(<K extends keyof AccessibilitySettings>(
        key: K,
        value: AccessibilitySettings[K]
    ) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    }, []);

    const resetSettings = useCallback(() => {
        setSettings(DEFAULT_SETTINGS);
    }, []);

    const increaseFontSize = useCallback(() => {
        setSettings(prev => ({
            ...prev,
            fontSize: Math.min(150, prev.fontSize + 10)
        }));
    }, []);

    const decreaseFontSize = useCallback(() => {
        setSettings(prev => ({
            ...prev,
            fontSize: Math.max(80, prev.fontSize - 10)
        }));
    }, []);

    return {
        settings,
        updateSetting,
        resetSettings,
        increaseFontSize,
        decreaseFontSize,
    };
};

export const initAccessibilityStyles = () => {
    const styleId = 'amp-accessibility-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        /* Highlight Titles */
        html.acc-highlight-titles h1,
        html.acc-highlight-titles h2,
        html.acc-highlight-titles h3,
        html.acc-highlight-titles h4,
        html.acc-highlight-titles h5,
        html.acc-highlight-titles h6 {
            background-color: #fef3c7 !important;
            padding: 2px 4px !important;
            border-radius: 2px !important;
        }

        /* Highlight Links */
        html.acc-highlight-links a {
            background-color: #dbeafe !important;
            text-decoration: underline !important;
            padding: 1px 2px !important;
            border-radius: 2px !important;
        }

        /* Dyslexic Font - OpenDyslexic */
        @font-face {
            font-family: 'OpenDyslexic';
            src: url('https://widget.alaturidevoi.ro/fonts/OpenDyslexic-Regular.woff2') format('woff2');
            font-weight: normal;
            font-style: normal;
        }

        html.acc-dyslexic-font,
        html.acc-dyslexic-font * {
            font-family: 'OpenDyslexic', sans-serif !important;
        }

        /* Letter Spacing */
        html.acc-letter-spacing,
        html.acc-letter-spacing * {
            letter-spacing: 0.12em !important;
            word-spacing: 0.16em !important;
        }

        /* Line Height */
        html.acc-line-height,
        html.acc-line-height * {
            line-height: 2 !important;
        }

        /* Dark Mode - Soft dark theme */
        html.acc-dark-mode {
            filter: invert(0.9) hue-rotate(180deg) brightness(1.05);
        }
        html.acc-dark-mode img,
        html.acc-dark-mode video,
        html.acc-dark-mode picture,
        html.acc-dark-mode svg,
        html.acc-dark-mode [style*="background-image"],
        html.acc-dark-mode .logo,
        html.acc-dark-mode canvas {
            filter: invert(1) hue-rotate(180deg);
        }

        /* Reduce Motion */
        html.acc-reduce-motion,
        html.acc-reduce-motion * {
            animation: none !important;
            transition: none !important;
        }

        /* Big Cursor */
        html.acc-big-cursor,
        html.acc-big-cursor * {
            cursor: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="%23000" stroke="%23fff" stroke-width="1" d="M5 3l14 9-7 2-3 7z"/></svg>') 0 0, auto !important;
        }
    `;
    document.body.appendChild(style);
};

export const loadAccessibilitySettings = () => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const settings = { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
            applyAccessibilityStyles(settings);
        }
    } catch {
        // Ignore parse errors
    }
};
