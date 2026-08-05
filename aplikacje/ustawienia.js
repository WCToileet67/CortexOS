// ============================================================
// aplikacje/ustawienia.js – Settings App
// ============================================================

import { SystemSettings } from '../jadro/ustawieniaSystemowe.js';
import { showToast } from '../main.js';

export default function Settings() {
    const container = document.createElement('div');
    container.style.cssText = 'padding:8px;max-width:480px;margin:0 auto;';

    const settings = SystemSettings.get();

    // Theme
    const themeGroup = document.createElement('div');
    themeGroup.className = 'settings-group';
    themeGroup.innerHTML = `
        <label>Theme</label>
        <select id="settingsTheme">
            <option value="ciemny" ${settings.theme === 'ciemny' ? 'selected' : ''}>Dark</option>
            <option value="jasny" ${settings.theme === 'jasny' ? 'selected' : ''}>Light</option>
            <option value="niebieski" ${settings.theme === 'niebieski' ? 'selected' : ''}>Blue</option>
            <option value="zielony" ${settings.theme === 'zielony' ? 'selected' : ''}>Green</option>
        </select>
    `;

    // Wallpaper
    const wallGroup = document.createElement('div');
    wallGroup.className = 'settings-group';
    wallGroup.innerHTML = `
        <label>Wallpaper</label>
        <input type="file" id="settingsWallpaper" accept="image/*" />
        <div style="margin-top:6px;font-size:13px;color:var(--text-secondary);">
            Current: ${settings.wallpaper === 'default' ? 'Default gradient' : 'Custom image'}
        </div>
        <button id="resetWallpaperBtn" style="margin-top:6px;">Reset to default</button>
    `;

    // Password
    const pwdGroup = document.createElement('div');
    pwdGroup.className = 'settings-group';
    pwdGroup.innerHTML = `
        <label>Change Password</label>
        <input type="password" id="settingsNewPassword" placeholder="New password" />
        <button id="settingsSetPassword" style="margin-top:4px;">Set Password</button>
        <div style="font-size:12px;color:var(--text-secondary);margin-top:4px;">Current: ${settings.password === 'admin' ? 'Default (admin)' : 'Custom'}</div>
    `;

    // Language
    const langGroup = document.createElement('div');
    langGroup.className = 'settings-group';
    langGroup.innerHTML = `
        <label>Language</label>
        <select id="settingsLanguage">
            <option value="en" ${settings.language === 'en' ? 'selected' : ''}>English</option>
            <option value="pl" ${settings.language === 'pl' ? 'selected' : ''}>Polski</option>
            <option value="es" ${settings.language === 'es' ? 'selected' : ''}>Español</option>
        </select>
    `;

    // System info
    const infoGroup = document.createElement('div');
    infoGroup.className = 'settings-group';
    infoGroup.innerHTML = `
        <label>System Information</label>
        <div class="setting-info"><strong>OS:</strong> CortexOS v1.0</div>
        <div class="setting-info"><strong>Kernel:</strong> Cortex Kernel</div>
        <div class="setting-info"><strong>Theme:</strong> ${settings.theme}</div>
        <div class="setting-info"><strong>Language:</strong> ${settings.language}</div>
        <div class="setting-info"><strong>Storage:</strong> ${localStorage.length} items in localStorage</div>
        <button id="resetSettingsBtn" style="margin-top:8px;background:#e74c3c;color:#fff;">Reset All Settings</button>
    `;

    container.append(themeGroup, wallGroup, pwdGroup, langGroup, infoGroup);

    // ============================================================
    // EVENT LISTENERY - DOPIERO TERAZ, PO DODANIU DO DOM
    // ============================================================

    // Theme
    const themeSelect = container.querySelector('#settingsTheme');
    if (themeSelect) {
        themeSelect.addEventListener('change', function(e) {
            SystemSettings.set('theme', e.target.value);
        });
    }

    // Wallpaper upload
    const wallpaperInput = container.querySelector('#settingsWallpaper');
    if (wallpaperInput) {
        wallpaperInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(ev) {
                    const dataUrl = ev.target.result;
                    SystemSettings.set('wallpaper', dataUrl);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Reset wallpaper
    const resetWallpaperBtn = container.querySelector('#resetWallpaperBtn');
    if (resetWallpaperBtn) {
        resetWallpaperBtn.addEventListener('click', function() {
            SystemSettings.set('wallpaper', 'default');
            const wall = document.getElementById('wallpaper');
            if (wall) {
                wall.style.backgroundImage = 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)';
                wall.style.backgroundSize = 'cover';
            }
            showToast('🖼️', 'Wallpaper reset to default');
        });
    }

    // Set password
    const setPasswordBtn = container.querySelector('#settingsSetPassword');
    if (setPasswordBtn) {
        setPasswordBtn.addEventListener('click', function() {
            const input = container.querySelector('#settingsNewPassword');
            if (input) {
                const val = input.value.trim();
                if (val) {
                    SystemSettings.set('password', val);
                    input.value = '';
                    showToast('🔒', 'Password updated!');
                } else {
                    showToast('⚠️', 'Password cannot be empty');
                }
            }
        });
    }

    // Language
    const languageSelect = container.querySelector('#settingsLanguage');
    if (languageSelect) {
        languageSelect.addEventListener('change', function(e) {
            SystemSettings.set('language', e.target.value);
        });
    }

    // Reset all settings
    const resetBtn = container.querySelector('#resetSettingsBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            if (confirm('Reset all settings to default?')) {
                SystemSettings.reset();
                
                // Odśwież UI
                const newSettings = SystemSettings.get();
                const themeSel = container.querySelector('#settingsTheme');
                if (themeSel) themeSel.value = newSettings.theme;
                
                const langSel = container.querySelector('#settingsLanguage');
                if (langSel) langSel.value = newSettings.language;
                
                const infoDivs = infoGroup.querySelectorAll('.setting-info');
                if (infoDivs.length >= 4) {
                    infoDivs[2].textContent = 'Theme: ' + newSettings.theme;
                    infoDivs[3].textContent = 'Language: ' + newSettings.language;
                }
                showToast('🔄', 'Settings reset to default');
            }
        });
    }

    return container;
}
