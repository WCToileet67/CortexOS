// ============================================================
// jadro/ustawieniaSystemowe.js – System Settings Core
// ============================================================

import { Core, saveSettings, applyTheme, showToast } from '../main.js';

export const SystemSettings = {
    get() {
        return Core.settings;
    },

    set(key, value) {
        Core.settings[key] = value;
        saveSettings();
        // Apply live
        if (key === 'theme') {
            applyTheme(value);
        }
        if (key === 'wallpaper') {
            const wall = document.getElementById('wallpaper');
            if (value && value !== 'default') {
                wall.style.backgroundImage = `url(${value})`;
                wall.style.backgroundSize = 'cover';
                wall.style.backgroundPosition = 'center';
            } else {
                wall.style.backgroundImage =
                    'linear-gradient(135deg, #0f0c29, #302b63, #24243e)';
                wall.style.backgroundSize = 'cover';
            }
        }
        showToast('⚙️', `Settings updated: ${key}`);
    },

    reset() {
        Core.settings = {
            theme: 'ciemny',
            wallpaper: 'default',
            language: 'en',
            password: 'admin',
        };
        saveSettings();
        applyTheme('ciemny');
        const wall = document.getElementById('wallpaper');
        wall.style.backgroundImage = 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)';
        wall.style.backgroundSize = 'cover';
        showToast('🔄', 'Settings reset to default');
    },
};