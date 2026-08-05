// ============================================================
// aplikacje/eksplorator.js – File Explorer
// ============================================================

export default function Explorer(params, winEl) {
    const container = document.createElement('div');
    container.style.cssText = 'display:flex;flex-direction:column;height:100%;gap:8px;';
    container.setAttribute('role', 'application');
    container.setAttribute('aria-label', 'File Explorer');

    // Virtual file system (in localStorage)
    const FS_KEY = 'cortexos_fs';
    let fs = {};

    function loadFS() {
        try {
            const raw = localStorage.getItem(FS_KEY);
            if (raw) fs = JSON.parse(raw);
            else fs = { '/': { type: 'folder', children: {} } };
        } catch (_) {
            fs = { '/': { type: 'folder', children: {} } };
        }
        // Ensure root exists
        if (!fs['/']) fs['/'] = { type: 'folder', children: {} };
        return fs;
    }

    function saveFS() {
        try {
            localStorage.setItem(FS_KEY, JSON.stringify(fs));
        } catch (_) { /* ignore */ }
    }

    loadFS();

    let currentPath = '/';

    function getNode(path) {
        if (path === '/') return fs['/'];
        const parts = path.split('/').filter(Boolean);
        let node = fs['/'];
        for (const part of parts) {
            if (!node.children || !node.children[part]) return null;
            node = node.children[part];
        }
        return node;
    }

    function getChildren(path) {
        const node = getNode(path);
        if (!node || node.type !== 'folder') return [];
        return Object.keys(node.children || {}).map((name) => ({
            name,
            ...node.children[name],
        }));
    }

    function createFolder(path, name) {
        const parent = getNode(path);
        if (!parent || parent.type !== 'folder') return false;
        if (parent.children[name]) return false;
        parent.children[name] = { type: 'folder', children: {} };
        saveFS();
        return true;
    }

    function createFile(path, name, content = '') {
        const parent = getNode(path);
        if (!parent || parent.type !== 'folder') return false;
        if (parent.children[name]) return false;
        parent.children[name] = { type: 'file', content };
        saveFS();
        return true;
    }

    function deleteNode(path, name) {
        const parent = getNode(path);
        if (!parent || parent.type !== 'folder') return false;
        if (!parent.children[name]) return false;
        delete parent.children[name];
        saveFS();
        return true;
    }

    // ---- UI ----
    const toolbar = document.createElement('div');
    toolbar.className = 'explorer-toolbar';

    const pathDisplay = document.createElement('span');
    pathDisplay.className = 'explorer-path';
    pathDisplay.textContent = currentPath;

    const mkdirBtn = document.createElement('button');
    mkdirBtn.textContent = '📁 New Folder';
    const mkfileBtn = document.createElement('button');
    mkfileBtn.textContent = '📄 New File';
    const delBtn = document.createElement('button');
    delBtn.textContent = '🗑️ Delete';
    const upBtn = document.createElement('button');
    upBtn.textContent = '⬆ Up';

    toolbar.append(upBtn, pathDisplay, mkdirBtn, mkfileBtn, delBtn);

    const grid = document.createElement('div');
    grid.className = 'explorer-grid';

    function render() {
        grid.innerHTML = '';
        const items = getChildren(currentPath);

        if (currentPath !== '/') {
            const up = document.createElement('div');
            up.className = 'explorer-item';
            up.innerHTML = `<span class="ei-icon">📂</span><span class="ei-name">..</span>`;
            up.addEventListener('dblclick', () => {
                const parts = currentPath.split('/').filter(Boolean);
                parts.pop();
                currentPath = '/' + parts.join('/');
                if (!currentPath) currentPath = '/';
                render();
            });
            grid.appendChild(up);
        }

        items.forEach((item) => {
            const div = document.createElement('div');
            div.className = 'explorer-item';
            const icon = item.type === 'folder' ? '📁' : '📄';
            div.innerHTML = `<span class="ei-icon">${icon}</span><span class="ei-name">${item.name}</span>`;
            div.addEventListener('dblclick', () => {
                if (item.type === 'folder') {
                    currentPath = currentPath === '/' ?
                        '/' + item.name :
                        currentPath + '/' + item.name;
                    render();
                } else {
                    // Open file in notepad
                    import('../main.js').then(({ launchApp, showToast }) => {
                        launchApp('notatnik');
                        setTimeout(() => {
                            const ta = document.querySelector('.notepad-textarea');
                            if (ta) {
                                ta.value = item.content || '';
                                localStorage.setItem('cortexos_notepad', ta.value);
                            }
                        }, 100);
                        showToast('📄', `Opened ${item.name}`);
                    });
                }
            });
            grid.appendChild(div);
        });

        pathDisplay.textContent = currentPath;
    }

    // Toolbar actions
    mkdirBtn.addEventListener('click', () => {
        const name = prompt('Folder name:');
        if (name && name.trim()) {
            if (createFolder(currentPath, name.trim())) {
                render();
                import('../main.js').then(({ showToast }) => {
                    showToast('📁', `Created folder "${name.trim()}"`);
                });
            } else {
                import('../main.js').then(({ showToast }) => {
                    showToast('⚠️', 'Folder already exists or invalid.');
                });
            }
        }
    });

    mkfileBtn.addEventListener('click', () => {
        const name = prompt('File name:');
        if (name && name.trim()) {
            if (createFile(currentPath, name.trim(), '')) {
                render();
                import('../main.js').then(({ showToast }) => {
                    showToast('📄', `Created file "${name.trim()}"`);
                });
            } else {
                import('../main.js').then(({ showToast }) => {
                    showToast('⚠️', 'File already exists or invalid.');
                });
            }
        }
    });

    delBtn.addEventListener('click', () => {
        const name = prompt('Enter name to delete:');
        if (name && name.trim()) {
            if (deleteNode(currentPath, name.trim())) {
                render();
                import('../main.js').then(({ showToast }) => {
                    showToast('🗑️', `Deleted "${name.trim()}"`);
                });
            } else {
                import('../main.js').then(({ showToast }) => {
                    showToast('⚠️', 'Item not found.');
                });
            }
        }
    });

    upBtn.addEventListener('click', () => {
        if (currentPath !== '/') {
            const parts = currentPath.split('/').filter(Boolean);
            parts.pop();
            currentPath = '/' + parts.join('/');
            if (!currentPath) currentPath = '/';
            render();
        }
    });

    container.append(toolbar, grid);
    render();

    return container;
}
