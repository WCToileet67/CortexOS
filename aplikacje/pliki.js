// ============================================================
// aplikacje/pliki.js – Menedżer plików
// ============================================================

import { showToast } from '../main.js';

export default function Pliki() {
    const container = document.createElement('div');
    container.style.cssText = 'padding:8px;max-width:500px;margin:0 auto;';
    
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
            
            div.innerHTML = `
                <span style="font-size:18px;">${icon}</span>
                <span style="flex:1;">${f.name}</span>
                <span style="font-size:10px;color:var(--text-secondary);">${f.size || 0} B</span>
                <button data-del="${i}" style="background:none;border:none;color:#ff6b6b;cursor:pointer;">🗑️</button>
            `;
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
