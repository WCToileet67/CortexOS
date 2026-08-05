// ============================================================
// jadro/menuStart.js – Start Menu
// ============================================================

import { APP_REGISTRY, Core, launchApp, shutdown, restart, showToast } from '../main.js';

let isOpen = false;
let searchTerm = '';

export const StartMenu = {
    init() {
        const menu = document.getElementById('startMenu');
        menu.setAttribute('role', 'dialog');
        menu.setAttribute('aria-label', 'Start menu');
        const search = document.getElementById('startSearch');
        const pinnedList = document.getElementById('startPinnedList');
        const appList = document.getElementById('startAppList');

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (isOpen) {
                const menuEl = document.getElementById('startMenu');
                const startBtn = document.getElementById('startBtn');
                if (!menuEl.contains(e.target) && !startBtn.contains(e.target)) {
                    this.close();
                }
            }
        });

        // Search
        search.addEventListener('input', (e) => {
            searchTerm = e.target.value.toLowerCase();
            this.renderApps();
        });

        // Power buttons
        document.querySelectorAll('#startPower button').forEach((btn) => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                this.close();
                if (action === 'shutdown') shutdown();
                else if (action === 'restart') restart();
                else if (action === 'sleep') {
                    showToast('💤', 'System sleeping...');
                }
            });
        });

        // Render initial
        this.renderApps();
    },

    toggle() {
        if (isOpen) {
            this.close();
        } else {
            this.open();
        }
    },

    open() {
        const menu = document.getElementById('startMenu');
        menu.classList.add('open');
        menu.style.display = 'flex';
        isOpen = true;
        document.getElementById('startSearch').value = '';
        searchTerm = '';
        this.renderApps();
        setTimeout(() => {
            document.getElementById('startSearch').focus();
        }, 50);
    },

    close() {
        const menu = document.getElementById('startMenu');
        menu.classList.remove('open');
        menu.style.display = 'none';
        isOpen = false;
    },

    renderApps() {
        const pinnedList = document.getElementById('startPinnedList');
        const appList = document.getElementById('startAppList');

        const allApps = Object.values(APP_REGISTRY);
        const pinned = allApps.filter((a) => a.pinned);
        const unpinned = allApps.filter((a) => !a.pinned);

        const filter = (app) =>
            app.name.toLowerCase().includes(searchTerm) ||
            app.id.toLowerCase().includes(searchTerm);

        const renderItem = (app) => {
            const div = document.createElement('div');
            div.className = 'start-app-item';
            div.innerHTML = `
                <span class="app-icon">${app.icon}</span>
                <span class="app-name">${app.name}</span>
            `;
            div.addEventListener('click', () => {
                this.close();
                launchApp(app.id);
            });
            return div;
        };

        pinnedList.innerHTML = '';
        const filteredPinned = pinned.filter(filter);
        filteredPinned.forEach((app) => {
            pinnedList.appendChild(renderItem(app));
        });

        appList.innerHTML = '';
        const filteredUnpinned = unpinned.filter(filter);
        filteredUnpinned.forEach((app) => {
            appList.appendChild(renderItem(app));
        });

        if (filteredPinned.length === 0 && filteredUnpinned.length === 0) {
            const empty = document.createElement('div');
            empty.style.cssText = 'padding: 12px; color: var(--text-secondary); width:100%; text-align:center;';
            empty.textContent = 'No applications found.';
            appList.appendChild(empty);
        }
    },
};
