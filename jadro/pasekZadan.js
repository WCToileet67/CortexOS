// ============================================================
// jadro/pasekZadan.js – Taskbar
// ============================================================

import { Core, launchApp, showToast } from '../main.js';

let windowButtons = {};

export const Taskbar = {
    init() {
        const startBtn = document.getElementById('startBtn');
        startBtn.setAttribute('aria-label', 'Open Start menu');
        document.getElementById('taskbar').setAttribute('role', 'toolbar');
        startBtn.addEventListener('click', () => {
            import('./menuStart.js').then(({ StartMenu }) => {
                StartMenu.toggle();
            });
        });

        // Notification icon
        document.getElementById('notifIcon').addEventListener('click', () => {
            import('./powiadomienia.js').then(({ NotificationManager }) => {
                NotificationManager.toggle();
            });
        });

        // Volume icon
        document.getElementById('volumeIcon').addEventListener('click', () => {
            showToast('🔊', 'Volume: 75%');
        });

        // Clock click -> show date
        document.getElementById('clockDisplay').addEventListener('click', () => {
            const now = new Date();
            showToast('📅', now.toLocaleString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            }));
        });
    },

    addWindow(winId, title) {
        const container = document.getElementById('taskbarWindows');
        const btn = document.createElement('button');
        btn.className = 'taskbar-window-btn';
        btn.dataset.winId = winId;
        btn.textContent = title;
        btn.title = title;
        btn.addEventListener('click', () => {
            const win = Core.windows[winId];
            if (win) {
                if (win.isMinimized) {
                    win.isMinimized = false;
                    win.el.classList.remove('minimized');
                    import('./okna.js').then(({ WindowManager }) => {
                        WindowManager.focusWindow(winId);
                    });
                } else {
                    import('./okna.js').then(({ WindowManager }) => {
                        WindowManager.focusWindow(winId);
                    });
                }
            }
        });
        container.appendChild(btn);
        windowButtons[winId] = btn;
        this.setActiveWindow(winId);
    },

    removeWindow(winId) {
        const btn = windowButtons[winId];
        if (btn) {
            btn.remove();
            delete windowButtons[winId];
        }
    },

    setActiveWindow(winId) {
        Object.keys(windowButtons).forEach((id) => {
            windowButtons[id].classList.toggle('active', id === winId);
        });
    },

    updateWindowState(winId, minimized) {
        const btn = windowButtons[winId];
        if (btn) {
            btn.classList.toggle('minimized', minimized);
        }
    },

    getWindowButtons() {
        return windowButtons;
    },
};
