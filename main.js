// ============================================================
// main.js – CortexOS Kernel (Ulepszona wersja)
// ============================================================

import { WindowManager } from './jadro/okna.js';
import { Taskbar } from './jadro/pasekZadan.js';
import { StartMenu } from './jadro/menuStart.js';
import { Desktop } from './jadro/pulpit.js';
import { NotificationManager } from './jadro/powiadomienia.js';
import { SystemSettings } from './jadro/ustawieniaSystemowe.js';

// ---------- APP REGISTRY ----------
export const APP_REGISTRY = {
    notatnik: {
        id: 'notatnik',
        name: 'Notepad',
        icon: '📝',
        module: () => import('./aplikacje/notatnik.js'),
        pinned: true,
    },
    eksplorator: {
        id: 'eksplorator',
        name: 'File Explorer',
        icon: '📁',
        module: () => import('./aplikacje/eksplorator.js'),
        pinned: true,
    },
    kalkulator: {
        id: 'kalkulator',
        name: 'Calculator',
        icon: '🔢',
        module: () => import('./aplikacje/kalkulator.js'),
        pinned: true,
    },
    rysunek: {
        id: 'rysunek',
        name: 'Paint',
        icon: '🎨',
        module: () => import('./aplikacje/rysunek.js'),
        pinned: false,
    },
    terminal: {
        id: 'terminal',
        name: 'Terminal',
        icon: '💻',
        module: () => import('./aplikacje/terminal.js'),
        pinned: true,
    },
    ustawienia: {
        id: 'ustawienia',
        name: 'Settings',
        icon: '⚙️',
        module: () => import('./aplikacje/ustawienia.js'),
        pinned: true,
    },
    pogoda: {
        id: 'pogoda',
        name: 'Weather',
        icon: '🌤️',
        module: () => import('./aplikacje/pogoda.js'),
        pinned: false,
    },
    kalendarz: {
        id: 'kalendarz',
        name: 'Calendar',
        icon: '📅',
        module: () => import('./aplikacje/kalendarz.js'),
        pinned: false,
    },
    muzyka: {
        id: 'muzyka',
        name: 'Music Player',
        icon: '🎵',
        module: () => import('./aplikacje/muzyka.js'),
        pinned: false,
    },
    galeria: {
        id: 'galeria',
        name: 'Gallery',
        icon: '🖼️',
        module: () => import('./aplikacje/galeria.js'),
        pinned: false,
    },
    snake: {
        id: 'snake',
        name: 'Snake',
        icon: '🐍',
        module: () => import('./aplikacje/snake.js'),
        pinned: false,
    },
    quiz: {
        id: 'quiz',
        name: 'Quiz',
        icon: '🧠',
        module: () => import('./aplikacje/quiz.js'),
        pinned: false,
    },
    arkusz: {
        id: 'arkusz',
        name: 'Spreadsheet',
        icon: '📊',
        module: () => import('./aplikacje/arkusz.js'),
        pinned: false,
    },
    // ========== NOWE APLIKACJE ==========
    gra: {
        id: 'gra',
        name: 'Guess Number',
        icon: '🎮',
        module: () => import('./aplikacje/gra.js'),
        pinned: false,
    },
    pliki: {
        id: 'pliki',
        name: 'File Manager',
        icon: '📁',
        module: () => import('./aplikacje/pliki.js'),
        pinned: false,
    },
};

// ---------- CORE STATE ----------
export const Core = {
    apps: APP_REGISTRY,
    windows: {},
    activeWindow: null,
    settings: {
        theme: 'ciemny',
        wallpaper: 'default',
        language: 'en',
        password: 'admin',
    },
    booted: false,
    loggedIn: false,
    sessionTimer: null,
    lastActivity: Date.now(),
};

// ---------- BOOT ----------
export function boot() {
    const bootScreen = document.getElementById('bootScreen');
    const progress = document.getElementById('bootProgressBar');
    const status = document.getElementById('bootStatus');

    let p = 0;
    const steps = [
        { at: 10, msg: 'Loading kernel...' },
        { at: 30, msg: 'Initializing modules...' },
        { at: 55, msg: 'Loading applications...' },
        { at: 75, msg: 'Configuring desktop...' },
        { at: 90, msg: 'Finalizing...' },
        { at: 100, msg: 'Ready' },
    ];

    const interval = setInterval(() => {
        p += Math.random() * 4 + 1;
        if (p > 100) p = 100;
        progress.style.width = p + '%';
        const step = steps.reduce((a, s) => (p >= s.at ? s : a), steps[0]);
        status.textContent = step.msg;

        if (p >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                bootScreen.classList.add('hidden');
                setTimeout(() => {
                    bootScreen.style.display = 'none';
                    showLogin();
                }, 400);
            }, 400);
        }
    }, 80);
}

// ---------- LOGIN ----------
function showLogin() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('loginPassword').focus();
}

export function login(password) {
    const settings = loadSettings();
    const correct = settings.password || 'admin';

    if (password === correct) {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('desktop').style.display = 'block';
        Core.loggedIn = true;
        Core.lastActivity = Date.now();
        initDesktop();
        startSessionTimer();
        showToast('🎉', 'Welcome to CortexOS!');
        systemLog('info', 'User logged in');
    } else {
        const err = document.getElementById('loginError');
        err.textContent = 'Incorrect password. Try again.';
        setTimeout(() => (err.textContent = ''), 2000);
        document.getElementById('loginPassword').value = '';
        document.getElementById('loginPassword').focus();
        systemLog('warning', 'Failed login attempt');
    }
}

export function logout() {
    if (Core.loggedIn) {
        document.getElementById('desktop').style.display = 'none';
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('loginPassword').value = '';
        document.getElementById('loginPassword').focus();
        Core.loggedIn = false;
        clearTimeout(Core.sessionTimer);
        // Close all windows
        Object.keys(Core.windows).forEach((id) => {
            WindowManager.closeWindow(id);
        });
        showToast('👋', 'Logged out');
        systemLog('info', 'User logged out');
    }
}

// ---------- SESSION TIMER ----------
function startSessionTimer() {
    clearTimeout(Core.sessionTimer);
    Core.sessionTimer = setTimeout(() => {
        if (Core.loggedIn) {
            showToast('⏰', 'Session timeout - logging out');
            logout();
        }
    }, 1800000); // 30 minut
}

// Reset session timer on activity
document.addEventListener('click', () => {
    if (Core.loggedIn) {
        Core.lastActivity = Date.now();
        startSessionTimer();
    }
});
document.addEventListener('keydown', () => {
    if (Core.loggedIn) {
        Core.lastActivity = Date.now();
        startSessionTimer();
    }
});

// ---------- SYSTEM LOGS ----------
const logs = [];

export function systemLog(type, message) {
    logs.push({ type, message, time: new Date().toISOString() });
    if (logs.length > 100) logs.shift();
    try {
        localStorage.setItem('cortexos_logs', JSON.stringify(logs));
    } catch (_) { /* ignore */ }
}

export function getLogs() {
    return logs;
}

// ---------- LOAD / SAVE SETTINGS ----------
export function loadSettings() {
    try {
        const raw = localStorage.getItem('cortexos_settings');
        if (raw) {
            const parsed = JSON.parse(raw);
            Core.settings = { ...Core.settings, ...parsed };
        }
    } catch (_) { /* ignore */ }
    return Core.settings;
}

export function saveSettings() {
    try {
        localStorage.setItem('cortexos_settings', JSON.stringify(Core.settings));
    } catch (_) { /* ignore */ }
}

// ---------- THEME APPLICATION ----------
export function applyTheme(themeName) {
    const existing = document.querySelector('link[data-theme]');
    if (existing) existing.remove();

    if (themeName === 'ciemny') {
        document.documentElement.style.setProperty('--bg-primary', '#1a1a2e');
        document.documentElement.style.setProperty('--bg-secondary', '#16213e');
        document.documentElement.style.setProperty('--bg-surface', '#0f3460');
        document.documentElement.style.setProperty('--text-primary', '#e0e0e0');
        document.documentElement.style.setProperty('--text-secondary', '#a0a0b8');
        document.documentElement.style.setProperty('--accent', '#4fc3f7');
        document.documentElement.style.setProperty('--border-color', '#2a2a4a');
        document.documentElement.style.setProperty('--bg-window', '#1a1a2e');
        document.documentElement.style.setProperty('--bg-taskbar', 'rgba(20,20,40,0.92)');
        document.documentElement.style.setProperty('--bg-start', 'rgba(22,22,44,0.97)');
        return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.dataset.theme = themeName;
    link.href = `./motywy/${themeName}.css`;
    document.head.appendChild(link);
}

// ---------- TOAST SYSTEM ----------
export function showToast(icon, message, duration = 3000) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <span class="toast-msg">${message}</span>
        <button class="toast-close">✕</button>
    `;
    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.remove();
    });
    container.appendChild(toast);

    if (duration > 0) {
        setTimeout(() => {
            if (toast.parentNode) toast.remove();
        }, duration);
    }
}

// ---------- INIT DESKTOP ----------
function initDesktop() {
    const settings = loadSettings();
    applyTheme(settings.theme || 'ciemny');

    // Apply wallpaper
    const wall = document.getElementById('wallpaper');
    if (settings.wallpaper && settings.wallpaper !== 'default') {
        wall.style.backgroundImage = `url(${settings.wallpaper})`;
        wall.style.backgroundSize = 'cover';
        wall.style.backgroundPosition = 'center';
    } else {
        wall.style.backgroundImage =
            'linear-gradient(135deg, #0f0c29, #302b63, #24243e)';
        wall.style.backgroundSize = 'cover';
    }

    // Init modules
    Desktop.init();
    Taskbar.init();
    StartMenu.init();
    WindowManager.init();
    NotificationManager.init();

    // Clock
    updateClock();
    setInterval(updateClock, 1000);

    // Restore session
    restoreSession();

    // Global key shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl+Shift+Esc -> terminal
        if (e.ctrlKey && e.shiftKey && e.key === 'Escape') {
            e.preventDefault();
            launchApp('terminal');
        }
        // Alt+Tab -> cycle windows
        if (e.altKey && e.key === 'Tab') {
            e.preventDefault();
            const wins = Object.values(Core.windows);
            if (wins.length === 0) return;
            const keys = Object.keys(Core.windows);
            const idx = keys.indexOf(Core.activeWindow || '');
            const next = (idx + 1) % keys.length;
            const nextId = keys[next];
            WindowManager.focusWindow(nextId);
        }
        // Ctrl+N -> Notepad
        if (e.ctrlKey && e.key === 'n' && !e.shiftKey) {
            e.preventDefault();
            launchApp('notatnik');
        }
        // Ctrl+E -> Explorer
        if (e.ctrlKey && e.key === 'e') {
            e.preventDefault();
            launchApp('eksplorator');
        }
        // Ctrl+T -> Terminal
        if (e.ctrlKey && e.key === 't') {
            e.preventDefault();
            launchApp('terminal');
        }
        // Escape -> close active window
        if (e.key === 'Escape' && Core.activeWindow) {
            WindowManager.closeWindow(Core.activeWindow);
        }
        // Ctrl+Shift+L -> logout
        if (e.ctrlKey && e.shiftKey && e.key === 'L') {
            e.preventDefault();
            logout();
        }
    });

    // Detect system theme
    detectSystemTheme();
}

function updateClock() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const d = now.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    });
    const el = document.getElementById('clockDisplay');
    if (el) {
        el.textContent = `${h}:${m}`;
        el.title = `${d} ${now.getFullYear()}`;
    }
}

// ---------- DETECT SYSTEM THEME ----------
function detectSystemTheme() {
    const dark = window.matchMedia('(prefers-color-scheme: dark)');
    if (dark.matches) {
        // User prefers dark - keep default
    } else {
        // User prefers light - ask if they want to switch
        setTimeout(() => {
            if (confirm('Switch to light theme?')) {
                SystemSettings.set('theme', 'jasny');
            }
        }, 2000);
    }
}

// ---------- SAVE / RESTORE SESSION ----------
function saveSession() {
    const open = Object.keys(Core.windows);
    try {
        localStorage.setItem('cortexos_session', JSON.stringify(open));
    } catch (_) { /* ignore */ }
}

function restoreSession() {
    try {
        const open = JSON.parse(localStorage.getItem('cortexos_session') || '[]');
        // Only restore if user wants to
        if (open.length > 0 && confirm('Restore previous session?')) {
            open.forEach(id => {
                if (APP_REGISTRY[id]) {
                    launchApp(id);
                }
            });
        }
    } catch (_) { /* ignore */ }
}

// Save session periodically
setInterval(saveSession, 30000);

// Save session on window close
window.addEventListener('beforeunload', saveSession);

// ---------- LAUNCH APP ----------
export async function launchApp(appId, params = {}) {
    const app = APP_REGISTRY[appId];
    if (!app) {
        showToast('❌', `Application "${appId}" not found.`);
        return;
    }

    // Check if already open
    if (Core.windows[appId]) {
        const win = Core.windows[appId];
        if (win.isMinimized) {
            win.isMinimized = false;
            win.el.classList.remove('minimized');
        }
        WindowManager.focusWindow(appId);
        return;
    }

    try {
        const mod = await app.module();
        const instance = mod.default || mod;

        if (typeof instance === 'function') {
            const win = WindowManager.createWindow({
                id: appId,
                title: app.name,
                icon: app.icon,
                render: instance,
                params,
            });
            Core.windows[appId] = win;
            Taskbar.addWindow(appId, app.name);
            WindowManager.focusWindow(appId);
            systemLog('info', `Launched app: ${app.name}`);
            return win;
        } else if (typeof instance === 'object' && instance.render) {
            const win = WindowManager.createWindow({
                id: appId,
                title: app.name,
                icon: app.icon,
                render: instance.render,
                params,
                onClose: instance.onClose,
            });
            Core.windows[appId] = win;
            Taskbar.addWindow(appId, app.name);
            WindowManager.focusWindow(appId);
            systemLog('info', `Launched app: ${app.name}`);
            return win;
        } else {
            showToast('⚠️', `App "${appId}" has no render function.`);
        }
    } catch (err) {
        console.error('Launch error:', err);
        showToast('❌', `Failed to launch "${app.name}": ${err.message}`);
        systemLog('error', `Failed to launch ${app.name}: ${err.message}`);
    }
}

// ---------- SHUTDOWN / RESTART ----------
export function shutdown() {
    if (confirm('Shut down CortexOS?')) {
        systemLog('info', 'System shutdown');
        saveSession();
        document.getElementById('desktop').style.display = 'none';
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('loginPassword').value = '';
        document.getElementById('loginPassword').focus();
        Core.loggedIn = false;
        clearTimeout(Core.sessionTimer);
        Object.keys(Core.windows).forEach((id) => {
            WindowManager.closeWindow(id);
        });
        showToast('🛑', 'System shut down.');
    }
}

export function restart() {
    if (confirm('Restart CortexOS?')) {
        systemLog('info', 'System restart');
        saveSession();
        document.getElementById('desktop').style.display = 'none';
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('loginPassword').value = '';
        document.getElementById('loginPassword').focus();
        Core.loggedIn = false;
        clearTimeout(Core.sessionTimer);
        Object.keys(Core.windows).forEach((id) => {
            WindowManager.closeWindow(id);
        });
        showToast('🔄', 'System restarting...');
        setTimeout(() => {
            location.reload();
        }, 1000);
    }
}

// ---------- EXPORT / IMPORT DATA ----------
export function exportData() {
    const data = {
        settings: Core.settings,
        version: '1.0.0',
        exported: new Date().toISOString(),
        notes: localStorage.getItem('cortexos_notepad') || '',
        calendar: localStorage.getItem('cortexos_calendar') || '{}',
        spreadsheet: localStorage.getItem('cortexos_spreadsheet') || '[]',
        gallery: localStorage.getItem('cortexos_gallery') || '[]',
        music: localStorage.getItem('cortexos_music') || '[]',
        files: localStorage.getItem('cortexos-files') || '[]',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cortexos_backup.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('💾', 'Data exported successfully!');
    systemLog('info', 'Data exported');
}

export function importData(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            if (data.settings) {
                Core.settings = { ...Core.settings, ...data.settings };
                saveSettings();
                applyTheme(Core.settings.theme);
            }
            if (data.notes) localStorage.setItem('cortexos_notepad', data.notes);
            if (data.calendar) localStorage.setItem('cortexos_calendar', data.calendar);
            if (data.spreadsheet) localStorage.setItem('cortexos_spreadsheet', data.spreadsheet);
            if (data.gallery) localStorage.setItem('cortexos_gallery', data.gallery);
            if (data.music) localStorage.setItem('cortexos_music', data.music);
            if (data.files) localStorage.setItem('cortexos-files', data.files);
            showToast('✅', 'Data imported successfully!');
            systemLog('info', 'Data imported');
            setTimeout(() => location.reload(), 1000);
        } catch (err) {
            showToast('❌', 'Invalid backup file: ' + err.message);
        }
    };
    reader.readAsText(file);
}

// ---------- BOOT ----------
document.addEventListener('DOMContentLoaded', () => {
    boot();

    // Login handler
    document.getElementById('loginBtn').addEventListener('click', () => {
        const pwd = document.getElementById('loginPassword').value;
        login(pwd);
    });
    document.getElementById('loginPassword').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const pwd = document.getElementById('loginPassword').value;
            login(pwd);
        }
    });
    document.getElementById('shutdownBtn').addEventListener('click', () => {
        if (confirm('Shut down system?')) {
            document.getElementById('loginScreen').style.display = 'none';
            document.getElementById('bootScreen').style.display = 'flex';
            document.getElementById('bootScreen').classList.remove('hidden');
            document.getElementById('bootProgressBar').style.width = '0%';
            document.getElementById('bootStatus').textContent = 'Shutting down...';
            setTimeout(() => {
                document.getElementById('bootScreen').style.display = 'none';
                document.getElementById('loginScreen').style.display = 'flex';
                document.getElementById('loginPassword').value = '';
                document.getElementById('loginPassword').focus();
                document.getElementById('bootScreen').classList.add('hidden');
            }, 1200);
        }
    });

    // Expose global for console debugging
    window.__cortex = { 
        Core, 
        launchApp, 
        shutdown, 
        restart, 
        showToast, 
        logout,
        exportData,
        importData,
        systemLog,
        getLogs,
    };
});
