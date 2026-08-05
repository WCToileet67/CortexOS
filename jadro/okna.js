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

        // Resize handles
        const handles = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];
        handles.forEach((h) => {
            const handle = document.createElement('div');
            handle.className = `resize-handle ${h}`;
            el.appendChild(handle);
        });

        container.appendChild(el);

        // Render content
        if (typeof render === 'function') {
            const content = render(params, el);
            if (content instanceof HTMLElement) {
                body.appendChild(content);
            } else if (typeof content === 'string') {
                body.innerHTML = content;
            }
        }

        // Store window data
        const winData = {
            id: winId,
            el,
            body,
            title,
            icon,
            onClose,
            isMaximized: false,
            isMinimized: false,
            savedRect: null,
        };

        // ---- Event Bindings ----
        // Titlebar drag
        let drag = false,
            dx = 0,
            dy = 0;
        titlebar.addEventListener('mousedown', (e) => {
            if (e.target.closest('.win-controls')) return;
            if (winData.isMaximized) return;
            drag = true;
            const rect = el.getBoundingClientRect();
            dx = e.clientX - rect.left;
            dy = e.clientY - rect.top;
            el.style.cursor = 'grabbing';
            document.addEventListener('mousemove', onDrag);
            document.addEventListener('mouseup', offDrag);
        });

        const onDrag = (e) => {
            if (!drag) return;
            let x = e.clientX - dx;
            let y = e.clientY - dy;
            x = Math.max(0, Math.min(window.innerWidth - el.offsetWidth, x));
            y = Math.max(0, Math.min(window.innerHeight - 48 - el.offsetHeight, y));
            el.style.left = x + 'px';
            el.style.top = y + 'px';
        };
        const offDrag = () => {
            drag = false;
            el.style.cursor = '';
            document.removeEventListener('mousemove', onDrag);
            document.removeEventListener('mouseup', offDrag);
        };

        // Resize
        const resizeHandles = el.querySelectorAll('.resize-handle');
        resizeHandles.forEach((handle) => {
            handle.addEventListener('mousedown', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const dir = handle.className.split(' ')[1];
                const startX = e.clientX;
                const startY = e.clientY;
                const startW = el.offsetWidth;
                const startH = el.offsetHeight;
                const startL = el.offsetLeft;
                const startT = el.offsetTop;

                const onResize = (ev) => {
                    let dx = ev.clientX - startX;
                    let dy = ev.clientY - startY;
                    let newW = startW,
                        newH = startH,
                        newL = startL,
                        newT = startT;

                    if (dir.includes('e')) { newW = Math.max(260, startW + dx); }
                    if (dir.includes('w')) { newW = Math.max(260, startW - dx);
                        newL = startL + startW - newW; }
                    if (dir.includes('s')) { newH = Math.max(160, startH + dy); }
                    if (dir.includes('n')) { newH = Math.max(160, startH - dy);
                        newT = startT + startH - newH; }

                    el.style.width = newW + 'px';
                    el.style.height = newH + 'px';
                    el.style.left = newL + 'px';
                    el.style.top = newT + 'px';
                };
                const offResize = () => {
                    document.removeEventListener('mousemove', onResize);
                    document.removeEventListener('mouseup', offResize);
                };
                document.addEventListener('mousemove', onResize);
                document.addEventListener('mouseup', offResize);
            });
        });

        // Controls
        const closeBtn = titlebar.querySelector('.win-close');
        const minBtn = titlebar.querySelector('.win-min');
        const maxBtn = titlebar.querySelector('.win-max');

        closeBtn.addEventListener('click', () => this.closeWindow(winId));

        minBtn.addEventListener('click', () => {
            winData.isMinimized = !winData.isMinimized;
            if (winData.isMinimized) {
                el.classList.add('minimized');
            } else {
                el.classList.remove('minimized');
                this.focusWindow(winId);
            }
            // Update taskbar
            import('./pasekZadan.js').then(({ Taskbar }) => {
                Taskbar.updateWindowState(winId, winData.isMinimized);
            });
        });

        maxBtn.addEventListener('click', () => {
            if (winData.isMaximized) {
                // Restore
                winData.isMaximized = false;
                el.classList.remove('maximized');
                if (winData.savedRect) {
                    el.style.left = winData.savedRect.left + 'px';
                    el.style.top = winData.savedRect.top + 'px';
                    el.style.width = winData.savedRect.width + 'px';
                    el.style.height = winData.savedRect.height + 'px';
                }
                maxBtn.textContent = '☐';
            } else {
                // Maximize
                winData.isMaximized = true;
                winData.savedRect = {
                    left: el.offsetLeft,
                    top: el.offsetTop,
                    width: el.offsetWidth,
                    height: el.offsetHeight,
                };
                el.classList.add('maximized');
                maxBtn.textContent = '⧉';
            }
        });

        // Store
        Core.windows[winId] = winData;

        // Focus
        this.focusWindow(winId);

        // Emit toast
        showToast('🪟', `Opened "${title}"`);

        return winData;
    },

    focusWindow(winId) {
        const win = Core.windows[winId];
        if (!win) return;
        if (win.isMinimized) {
            win.isMinimized = false;
            win.el.classList.remove('minimized');
            import('./pasekZadan.js').then(({ Taskbar }) => {
                Taskbar.updateWindowState(winId, false);
            });
        }
        win.el.style.zIndex = ++zIndexCounter;
        Core.activeWindow = winId;
        // Update taskbar active
        import('./pasekZadan.js').then(({ Taskbar }) => {
            Taskbar.setActiveWindow(winId);
        });
        // Bring to front
        const container = document.getElementById('windowContainer');
        container.appendChild(win.el);
    },

    closeWindow(winId) {
        const win = Core.windows[winId];
        if (!win) return;
        if (win.onClose) {
            const result = win.onClose();
            if (result === false) return;
        }
        win.el.remove();
        delete Core.windows[winId];
        if (Core.activeWindow === winId) {
            Core.activeWindow = null;
        }
        import('./pasekZadan.js').then(({ Taskbar }) => {
            Taskbar.removeWindow(winId);
        });
        // Focus next
        const keys = Object.keys(Core.windows);
        if (keys.length > 0) {
            this.focusWindow(keys[keys.length - 1]);
        }
    },

    getWindow(winId) {
        return Core.windows[winId] || null;
    },

    getAllWindows() {
        return Object.values(Core.windows);
    },
};
