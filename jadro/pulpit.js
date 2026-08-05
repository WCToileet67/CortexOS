// ============================================================
// jadro/pulpit.js – Desktop & Icons
// ============================================================

import { APP_REGISTRY, Core, launchApp, showToast } from '../main.js';

let iconPositions = {};

export const Desktop = {
    init() {
        this.renderIcons();
        this.setupContextMenu();
        this.setupWallpaperUpload();
        this.loadIconPositions();
    },

    renderIcons() {
        const container = document.getElementById('desktopIcons');
        container.setAttribute('role', 'list');
        container.setAttribute('aria-label', 'Desktop applications');
        container.innerHTML = '';

        const apps = Object.values(APP_REGISTRY);
        apps.forEach((app) => {
            const div = document.createElement('div');
            div.className = 'desktop-icon';
            div.dataset.appId = app.id;
            div.innerHTML = `
                <span class="icon-img">${app.icon}</span>
                <span class="icon-label">${app.name}</span>
            `;
            div.addEventListener('dblclick', () => {
                launchApp(app.id);
            });

            // Drag
            div.draggable = true;
            div.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', app.id);
                div.classList.add('dragging');
            });
            div.addEventListener('dragend', (e) => {
                div.classList.remove('dragging');
            });

            container.appendChild(div);
        });

        // Drop target for reordering
        container.addEventListener('dragover', (e) => e.preventDefault());
        container.addEventListener('drop', (e) => {
            e.preventDefault();
            const id = e.dataTransfer.getData('text/plain');
            if (id) {
                // reposition - just re-render
                this.renderIcons();
                showToast('📌', 'Icon position updated');
            }
        });

        // Right-click on desktop icons
        container.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const icon = e.target.closest('.desktop-icon');
            if (icon) {
                // Could add per-icon context menu
            }
        });
    },

    setupContextMenu() {
        const desktop = document.getElementById('desktop');
        const menu = document.getElementById('desktopContextMenu');

        desktop.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if (e.target.closest('.cortex-window')) return;
            if (e.target.closest('#taskbar')) return;
            menu.style.display = 'block';
            menu.style.left = Math.min(e.clientX, window.innerWidth - 200) + 'px';
            menu.style.top = Math.min(e.clientY, window.innerHeight - 120) + 'px';
        });

        document.addEventListener('click', () => {
            menu.style.display = 'none';
        });

        menu.querySelectorAll('[data-action]').forEach((item) => {
            item.addEventListener('click', () => {
                const action = item.dataset.action;
                menu.style.display = 'none';
                if (action === 'refresh') {
                    this.renderIcons();
                    showToast('🔄', 'Desktop refreshed');
                } else if (action === 'changeWallpaper') {
                    document.getElementById('wallpaperUpload').click();
                } else if (action === 'personalize') {
                    launchApp('ustawienia');
                }
            });
        });
    },

    setupWallpaperUpload() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.id = 'wallpaperUpload';
        input.style.display = 'none';
        document.body.appendChild(input);

        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    const dataUrl = ev.target.result;
                    const wall = document.getElementById('wallpaper');
                    wall.style.backgroundImage = `url(${dataUrl})`;
                    wall.style.backgroundSize = 'cover';
                    wall.style.backgroundPosition = 'center';
                    Core.settings.wallpaper = dataUrl;
                    import('../main.js').then(({ saveSettings }) => {
                        saveSettings();
                    });
                    showToast('🖼️', 'Wallpaper updated!');
                };
                reader.readAsDataURL(file);
            }
            input.value = '';
        });
    },

    loadIconPositions() {
        try {
            const saved = localStorage.getItem('cortexos_icons');
            if (saved) {
                iconPositions = JSON.parse(saved);
                // Apply positions
                const icons = document.querySelectorAll('.desktop-icon');
                icons.forEach((icon) => {
                    const id = icon.dataset.appId;
                    if (iconPositions[id]) {
                        icon.style.transform = `translate(${iconPositions[id].x}px, ${iconPositions[id].y}px)`;
                    }
                });
            }
        } catch (_) { /* ignore */ }
    },

    saveIconPositions() {
        const icons = document.querySelectorAll('.desktop-icon');
        const positions = {};
        icons.forEach((icon) => {
            const id = icon.dataset.appId;
            const rect = icon.getBoundingClientRect();
            positions[id] = { x: rect.left, y: rect.top };
        });
        localStorage.setItem('cortexos_icons', JSON.stringify(positions));
    },
};
