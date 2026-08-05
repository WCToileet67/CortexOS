// ============================================================
// apps/pliki.js – Menedżer plików (dodawanie/usuwanie)
// ============================================================

(function() {
    if (!window.WebOS || !window.WebOS.registerApp) {
        setTimeout(arguments.callee, 50);
        return;
    }

    window.WebOS.registerApp(
        'files',
        'Menedżer Plików',
        '📁',
        'Narzędzia',
        function(winId) {
            const container = document.createElement('div');
            const storageKey = 'webos-files';
            let files = JSON.parse(localStorage.getItem(storageKey) || '[]');

            function saveFiles() { localStorage.setItem(storageKey, JSON.stringify(files)); }

            function render() {
                const list = container.querySelector('.file-list');
                list.innerHTML = '';
                if (files.length === 0) {
                    list.innerHTML = '<li style="color:#888;justify-content:center;padding:20px;">📭 Brak plików</li>';
                }
                files.forEach((f, i) => {
                    const li = document.createElement('li');
                    const iconMap = { 'txt':'📄', 'js':'📜', 'html':'🌐', 'css':'🎨', 'json':'📋', 'md':'📝' };
                    const ext = f.name.split('.').pop();
                    const icon = iconMap[ext] || '📎';
                    li.innerHTML = `
                        <span class="fi-icon">${icon}</span>
                        <span class="fi-name">${f.name}</span>
                        <span style="font-size:10px;color:#666;">${f.size || 0} B</span>
                        <span class="fi-actions"><button data-del="${i}" title="Usuń">🗑️</button></span>
                    `;
                    list.appendChild(li);
                });
                container.querySelectorAll('[data-del]').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const idx = parseInt(btn.dataset.del);
                        files.splice(idx, 1);
                        saveFiles();
                        render();
                        window.WebOS.showToast('🗑️', 'Plik usunięty');
                    });
                });
            }

            container.innerHTML = `
                <div class="file-add-row">
                    <input type="text" placeholder="Nazwa pliku (np. notatka.txt)" id="file-inp-${winId}">
                    <button class="app-btn success" id="file-add-${winId}">+ Dodaj</button>
                </div>
                <ul class="file-list"></ul>
                <p style="font-size:10px;color:#666;margin-top:8px;">Pliki przechowywane w localStorage</p>
            `;
            render();
            container.querySelector(`#file-add-${winId}`).addEventListener('click', () => {
                const inp = container.querySelector(`#file-inp-${winId}`);
                const name = inp.value.trim();
                if (!name) return;
                files.push({ name, size: Math.floor(Math.random() * 5000) + 100, date: new Date().toISOString() });
                saveFiles();
                render();
                inp.value = '';
                window.WebOS.showToast('✅', 'Plik dodany: ' + name);
            });
            return container;
        },
        550, 420
    );
})();