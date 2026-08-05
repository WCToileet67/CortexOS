// ============================================================
// apps/przypomnienia.js – System przypomnień
// ============================================================

(function() {
    if (!window.WebOS || !window.WebOS.registerApp) {
        setTimeout(arguments.callee, 50);
        return;
    }

    window.WebOS.registerApp(
        'reminders',
        'Przypomnienia',
        '⏰',
        'Narzędzia',
        function(winId) {
            const container = document.createElement('div');
            const storageKey = 'webos-reminders';
            let reminders = JSON.parse(localStorage.getItem(storageKey) || '[]');

            function save() { localStorage.setItem(storageKey, JSON.stringify(reminders)); }

            function render() {
                const list = container.querySelector('.reminder-list');
                list.innerHTML = '';
                if (reminders.length === 0) {
                    list.innerHTML = '<li style="color:#888;justify-content:center;">✨ Brak przypomnień</li>';
                }
                reminders.forEach((r, i) => {
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <span style="flex:1;">${r.text}</span>
                        <span style="font-size:10px;color:#666;">${new Date(r.date).toLocaleString('pl-PL')}</span>
                        <button data-delr="${i}" style="background:none;border:none;cursor:pointer;color:#999;font-size:14px;">🗑️</button>
                    `;
                    list.appendChild(li);
                });
                container.querySelectorAll('[data-delr]').forEach(btn => {
                    btn.addEventListener('click', () => {
                        reminders.splice(parseInt(btn.dataset.delr), 1);
                        save();
                        render();
                    });
                });
            }

            container.innerHTML = `
                <div class="reminder-add">
                    <input type="text" placeholder="Treść przypomnienia..." id="rem-text-${winId}">
                    <button class="app-btn success" id="rem-add-${winId}">+ Dodaj</button>
                </div>
                <ul class="reminder-list"></ul>
            `;
            render();
            container.querySelector(`#rem-add-${winId}`).addEventListener('click', () => {
                const inp = container.querySelector(`#rem-text-${winId}`);
                const text = inp.value.trim();
                if (!text) return;
                reminders.push({ text, date: new Date().toISOString() });
                save();
                render();
                inp.value = '';
                window.WebOS.showToast('⏰', 'Przypomnienie dodane!');
                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification('WebOS – Przypomnienie', { body: text, icon: '⏰' });
                }
            });
            return container;
        },
        480, 380
    );
})();