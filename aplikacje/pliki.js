// ============================================================
// aplikacje/pliki.js – Menedżer plików
// ============================================================

import { showToast } from '../main.js';

export default function Pliki() {
    const container = document.createElement('div');
    container.style.cssText = 'padding:8px;max-width:500px;margin:0 auto;';
    container.setAttribute('role', 'application');
    container.setAttribute('aria-label', 'File Manager');

    const storageKey = 'cortexos-files';
    let files = JSON.parse(localStorage.getItem(storageKey) || '[]');

    function saveFiles() {
        localStorage.setItem(storageKey, JSON.stringify(files));
    }

    function render() {
        const list = container.querySelector('#fileList');
        if (!list) return;
        list.innerHTML = '';

        if (files.length === 0) {
            list.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-secondary);">📭 Brak plików</div>';
            return;
        }

        files.forEach((f, i) => {
            const div = document.createElement('div');
            div.style.cssText = 'display:flex;align-items:center;gap:10px;padding:6px 8px;border-bottom:1px solid var(--border-color);';

            const iconMap = { 'txt':'📄', 'js':'📜', 'html':'🌐', 'css':'🎨', 'json':'📋', 'md':'📝' };
            const ext = f.name.split('.').pop();
            const icon = iconMap[ext] || '📎';

            const iconSpan = document.createElement('span');
            iconSpan.style.fontSize = '18px';
            iconSpan.textContent = icon;

            const nameSpan = document.createElement('span');
            nameSpan.style.flex = '1';
            nameSpan.textContent = f.name;

            const sizeSpan = document.createElement('span');
            sizeSpan.style.cssText = 'font-size:10px;color:var(--text-secondary);';
            sizeSpan.textContent = `${f.size || 0} B`;

            const deleteBtn = document.createElement('button');
            deleteBtn.dataset.del = String(i);
            deleteBtn.style.cssText = 'background:none;border:none;color:#ff6b6b;cursor:pointer;';
            deleteBtn.setAttribute('aria-label', `Usuń plik ${f.name}`);
            deleteBtn.textContent = '🗑️';

            div.append(iconSpan, nameSpan, sizeSpan, deleteBtn);
            list.appendChild(div);
        });

        container.querySelectorAll('[data-del]').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.del);
                files.splice(idx, 1);
                saveFiles();
                render();
                showToast('🗑️', 'Plik usunięty');
            });
        });
    }

    container.innerHTML = `
        <div style="display:flex;gap:8px;margin-bottom:12px;">
            <input type="text" id="fileInput" placeholder="Nazwa pliku (np. notatka.txt)" style="flex:1;padding:8px;border:1px solid var(--border-color);border-radius:4px;background:rgba(0,0,0,0.2);color:#fff;">
            <button id="fileAddBtn" style="padding:8px 16px;border:none;border-radius:4px;background:var(--accent);color:#0a0a1a;font-weight:600;cursor:pointer;">+ Dodaj</button>
        </div>
        <div id="fileList"></div>
        <p style="font-size:10px;color:var(--text-secondary);margin-top:8px;">Pliki przechowywane w localStorage</p>
    `;

    render();

    container.querySelector('#fileAddBtn').addEventListener('click', () => {
        const inp = container.querySelector('#fileInput');
        const name = inp.value.trim();
        if (!name) {
            showToast('⚠️', 'Wprowadź nazwę pliku');
            return;
        }
        files.push({
            name,
            size: Math.floor(Math.random() * 5000) + 100,
            date: new Date().toISOString()
        });
        saveFiles();
        render();
        inp.value = '';
        showToast('✅', 'Plik dodany: ' + name);
    });

    return container;
}
