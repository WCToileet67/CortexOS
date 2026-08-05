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
