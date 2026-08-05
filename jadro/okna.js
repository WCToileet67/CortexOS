// ============================================================
// jadro/okna.js – Window Manager
// ============================================================

import { Core, showToast } from '../main.js';

let zIndexCounter = 100;
let windowIdCounter = 0;

export const WindowManager = {
    init() {
        // Global click to focus
        document.addEventListener('mousedown', (e) => {
            const win = e.target.closest('.cortex-window');
            if (win && win.dataset.winId) {
                this.focusWindow(win.dataset.winId);
            }
        });
    },

    createWindow({ id, title, icon = '📄', render, params = {}, onClose = null, width = 600, height = 400 }) {
        // If window with same id exists, close it first
        if (Core.windows[id]) {
            this.closeWindow(id);
        }

        const winId = id || `win-${++windowIdCounter}`;
        const container = document.getElementById('windowContainer');

        // Create window element
        const el = document.createElement('div');
        el.className = 'cortex-window';
        el.setAttribute('role', 'dialog');
        el.setAttribute('aria-label', title);
        el.dataset.winId = winId;
        el.style.width = width + 'px';
        el.style.height = height + 'px';
        el.style.left = (window.innerWidth / 2 - width / 2) + 'px';
        el.style.top = (window.innerHeight / 2 - height / 2 - 24) + 'px';
        el.style.zIndex = ++zIndexCounter;

        // Titlebar
        const titlebar = document.createElement('div');
        titlebar.className = 'window-titlebar';
        titlebar.innerHTML = `
            <span class="win-icon">${icon}</span>
            <span class="win-title">${title}</span>
            <div class="win-controls">
                <button class="win-min" title="Minimize">─</button>
                <button class="win-max" title="Maximize">☐</button>
                <button class="win-close" title="Close">✕</button>
            </div>
        `;
        el.appendChild(titlebar);

        // Body
        const body = document.createElement('div');
        body.className = 'window-body';
        el.appendChild(body);

        // Render content
        if (typeof render === 'function') {
            const content = render(params, el);
            if (content instanceof HTMLElement) {
                body.appendChild(content);
            } else if (typeof content === 'string') {
                body.innerHTML = content;
            }
        }

        // Titlebar controls
        titlebar.querySelector('.win-close').addEventListener('click', (e) => {
            e.stopPropagation();
            this.closeWindow(winId);
        });

        titlebar.querySelector('.win-min').addEventListener('click', (e) => {
            e.stopPropagation();
            this.minimizeWindow(winId);
        });

        titlebar.querySelector('.win-max').addEventListener('click', (e) => {
            e.stopPropagation();
            this.maximizeWindow(winId);
        });

        // Drag to move
        let isDragging = false;
        let dragOffsetX = 0;
        let dragOffsetY = 0;

        titlebar.addEventListener('mousedown', (e) => {
            if (e.target.closest('.win-controls')) return;
            isDragging = true;
            const rect = el.getBoundingClientRect();
            dragOffsetX = e.clientX - rect.left;
            dragOffsetY = e.clientY - rect.top;
            el.style.cursor = 'grabbing';
            el.style.transition = 'none';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            let x = e.clientX - dragOffsetX;
            let y = e.clientY - dragOffsetY;
            x = Math.max(0, Math.min(x, window.innerWidth - el.offsetWidth));
            y = Math.max(0, Math.min(y, window.innerHeight - el.offsetHeight));
            el.style.left = x + 'px';
            el.style.top = y + 'px';
            el.style.transform = 'none';
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                el.style.cursor = '';
                el.style.transition = '';
            }
        });

        container.appendChild(el);

        // Store window data
        const winData = {
            id: winId,
            el: el,
            title: title,
            icon: icon,
            isMinimized: false,
            isMaximized: false,
            prevBounds: null,
            onClose: onClose,
        };

        return winData;
    },

    closeWindow(winId) {
        const win = Core.windows[winId];
        if (!win) return;

        // Call onClose hook if exists
        if (typeof win.onClose === 'function') {
            if (win.onClose() === false) return;
        }

        // Save notepad content if needed
        const notepadSave = win.el._notepadSave;
        if (typeof notepadSave === 'function') {
            notepadSave();
        }

        win.el.remove();
        delete Core.windows[winId];
        if (Core.activeWindow === winId) {
            Core.activeWindow = null;
        }

        // Remove from taskbar
        import('./pasekZadan.js').then(({ Taskbar }) => {
            Taskbar.removeWindow(winId);
        });

        showToast('🗑️', `Closed ${win.title}`);
    },

    focusWindow(winId) {
        const win = Core.windows[winId];
        if (!win) return;

        if (win.isMinimized) {
            win.isMinimized = false;
            win.el.classList.remove('minimized');
            win.el.style.display = '';
        }

        Core.activeWindow = winId;
        win.el.style.zIndex = ++zIndexCounter;

        // Update taskbar
        import('./pasekZadan.js').then(({ Taskbar }) => {
            Taskbar.setActiveWindow(winId);
        });

        // Focus the window
        win.el.focus();
    },

    minimizeWindow(winId) {
        const win = Core.windows[winId];
        if (!win) return;

        win.isMinimized = true;
        win.el.classList.add('minimized');
        win.el.style.display = 'none';

        if (Core.activeWindow === winId) {
            Core.activeWindow = null;
        }

        import('./pasekZadan.js').then(({ Taskbar }) => {
            Taskbar.updateWindowState(winId, true);
        });
    },

    maximizeWindow(winId) {
        const win = Core.windows[winId];
        if (!win) return;

        if (win.isMaximized) {
            // Restore
            win.isMaximized = false;
            if (win.prevBounds) {
                win.el.style.left = win.prevBounds.left + 'px';
                win.el.style.top = win.prevBounds.top + 'px';
                win.el.style.width = win.prevBounds.width + 'px';
                win.el.style.height = win.prevBounds.height + 'px';
            }
            win.el.style.borderRadius = '';
            const btn = win.el.querySelector('.win-max');
            if (btn) btn.textContent = '☐';
        } else {
            // Maximize
            win.isMaximized = true;
            win.prevBounds = {
                left: parseInt(win.el.style.left),
                top: parseInt(win.el.style.top),
                width: parseInt(win.el.style.width),
                height: parseInt(win.el.style.height),
            };
            win.el.style.left = '0';
            win.el.style.top = '0';
            win.el.style.width = '100%';
            win.el.style.height = '100%';
            win.el.style.borderRadius = '0';
            const btn = win.el.querySelector('.win-max');
            if (btn) btn.textContent = '❐';
        }
    },

    getWindowButtons() {
        return {};
    }
};
