diff --git a/aplikacje/kalendarz.js b/aplikacje/kalendarz.js
index f14b246b0bc32f1e31790cd43e2712d0dc87bace..81f33a6f5597727801c37db25554aafc19c7cf57 100644
--- a/aplikacje/kalendarz.js
+++ b/aplikacje/kalendarz.js
@@ -1,127 +1,129 @@
-// ============================================================
-// aplikacje/kalendarz.js – Calendar App
-// ============================================================
-
-export default function Calendar() {
-    const container = document.createElement('div');
-    container.style.cssText = 'padding:8px;max-width:480px;margin:0 auto;';
-
-    let currentYear = new Date().getFullYear();
-    let currentMonth = new Date().getMonth();
-    let events = {};
-
-    // Load events
-    try {
-        const saved = localStorage.getItem('cortexos_calendar');
-        if (saved) events = JSON.parse(saved);
-    } catch (_) { /* ignore */ }
-
-    function saveEvents() {
-        try {
-            localStorage.setItem('cortexos_calendar', JSON.stringify(events));
-        } catch (_) { /* ignore */ }
-    }
-
-    const nav = document.createElement('div');
-    nav.className = 'cal-nav';
-    const prevBtn = document.createElement('button');
-    prevBtn.textContent = '‹';
-    const label = document.createElement('span');
-    label.className = 'cal-month-label';
-    const nextBtn = document.createElement('button');
-    nextBtn.textContent = '›';
-    nav.append(prevBtn, label, nextBtn);
-
-    const grid = document.createElement('div');
-    grid.className = 'cal-grid';
-
-    function render() {
-        grid.innerHTML = '';
-        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
-        days.forEach((d) => {
-            const div = document.createElement('div');
-            div.className = 'cal-header';
-            div.textContent = d;
-            grid.appendChild(div);
-        });
-
-        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
-        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
-        const today = new Date();
-        const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
-
-        for (let i = 0; i < firstDay; i++) {
-            const div = document.createElement('div');
-            div.className = 'cal-day other-month';
-            grid.appendChild(div);
-        }
-
-        for (let d = 1; d <= daysInMonth; d++) {
-            const div = document.createElement('div');
-            div.className = 'cal-day';
-            const dateStr =
-                `${currentYear}-${String(currentMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
-            div.textContent = d;
-
-            if (dateStr === todayStr) div.classList.add('today');
-            if (events[dateStr] && events[dateStr].length > 0) {
-                div.classList.add('has-event');
-                div.title = events[dateStr].join('\n');
-            }
-
-            div.addEventListener('click', () => {
-                const ev = prompt(`Events for ${dateStr} (one per line):`, events[dateStr]?.join('\n') || '');
-                if (ev !== null) {
-                    if (ev.trim()) {
-                        events[dateStr] = ev.split('\n').filter(Boolean);
-                    } else {
-                        delete events[dateStr];
-                    }
-                    saveEvents();
-                    render();
-                    import('../main.js').then(({ showToast }) => {
-                        showToast('📅', 'Calendar updated');
-                    });
-                }
-            });
-
-            grid.appendChild(div);
-        }
-
-        label.textContent = new Date(currentYear, currentMonth).toLocaleString(
-            'en-US', { month: 'long', year: 'numeric' }
-        );
-    }
-
-    prevBtn.addEventListener('click', () => {
-        currentMonth--;
-        if (currentMonth < 0) { currentMonth = 11;
-            currentYear--; }
-        render();
-    });
-
-    nextBtn.addEventListener('click', () => {
-        currentMonth++;
-        if (currentMonth > 11) { currentMonth = 0;
-            currentYear++; }
-        render();
-    });
-
-    // Jump to today
-    const todayBtn = document.createElement('button');
-    todayBtn.textContent = 'Today';
-    todayBtn.style.cssText =
-        'padding:4px 12px;border:1px solid var(--border-color);border-radius:4px;background:rgba(255,255,255,0.06);color:var(--text-primary);cursor:pointer;margin-left:12px;';
-    todayBtn.addEventListener('click', () => {
-        const now = new Date();
-        currentYear = now.getFullYear();
-        currentMonth = now.getMonth();
-        render();
-    });
-    nav.appendChild(todayBtn);
-
-    container.append(nav, grid);
-    render();
-
-    return container;
-}
\ No newline at end of file
+// ============================================================
+// aplikacje/kalendarz.js – Calendar App
+// ============================================================
+
+export default function Calendar() {
+    const container = document.createElement('div');
+    container.style.cssText = 'padding:8px;max-width:480px;margin:0 auto;';
+    container.setAttribute('role', 'application');
+    container.setAttribute('aria-label', 'Calendar');
+
+    let currentYear = new Date().getFullYear();
+    let currentMonth = new Date().getMonth();
+    let events = {};
+
+    // Load events
+    try {
+        const saved = localStorage.getItem('cortexos_calendar');
+        if (saved) events = JSON.parse(saved);
+    } catch (_) { /* ignore */ }
+
+    function saveEvents() {
+        try {
+            localStorage.setItem('cortexos_calendar', JSON.stringify(events));
+        } catch (_) { /* ignore */ }
+    }
+
+    const nav = document.createElement('div');
+    nav.className = 'cal-nav';
+    const prevBtn = document.createElement('button');
+    prevBtn.textContent = '‹';
+    const label = document.createElement('span');
+    label.className = 'cal-month-label';
+    const nextBtn = document.createElement('button');
+    nextBtn.textContent = '›';
+    nav.append(prevBtn, label, nextBtn);
+
+    const grid = document.createElement('div');
+    grid.className = 'cal-grid';
+
+    function render() {
+        grid.innerHTML = '';
+        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
+        days.forEach((d) => {
+            const div = document.createElement('div');
+            div.className = 'cal-header';
+            div.textContent = d;
+            grid.appendChild(div);
+        });
+
+        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
+        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
+        const today = new Date();
+        const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
+
+        for (let i = 0; i < firstDay; i++) {
+            const div = document.createElement('div');
+            div.className = 'cal-day other-month';
+            grid.appendChild(div);
+        }
+
+        for (let d = 1; d <= daysInMonth; d++) {
+            const div = document.createElement('div');
+            div.className = 'cal-day';
+            const dateStr =
+                `${currentYear}-${String(currentMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
+            div.textContent = d;
+
+            if (dateStr === todayStr) div.classList.add('today');
+            if (events[dateStr] && events[dateStr].length > 0) {
+                div.classList.add('has-event');
+                div.title = events[dateStr].join('\n');
+            }
+
+            div.addEventListener('click', () => {
+                const ev = prompt(`Events for ${dateStr} (one per line):`, events[dateStr]?.join('\n') || '');
+                if (ev !== null) {
+                    if (ev.trim()) {
+                        events[dateStr] = ev.split('\n').filter(Boolean);
+                    } else {
+                        delete events[dateStr];
+                    }
+                    saveEvents();
+                    render();
+                    import('../main.js').then(({ showToast }) => {
+                        showToast('📅', 'Calendar updated');
+                    });
+                }
+            });
+
+            grid.appendChild(div);
+        }
+
+        label.textContent = new Date(currentYear, currentMonth).toLocaleString(
+            'en-US', { month: 'long', year: 'numeric' }
+        );
+    }
+
+    prevBtn.addEventListener('click', () => {
+        currentMonth--;
+        if (currentMonth < 0) { currentMonth = 11;
+            currentYear--; }
+        render();
+    });
+
+    nextBtn.addEventListener('click', () => {
+        currentMonth++;
+        if (currentMonth > 11) { currentMonth = 0;
+            currentYear++; }
+        render();
+    });
+
+    // Jump to today
+    const todayBtn = document.createElement('button');
+    todayBtn.textContent = 'Today';
+    todayBtn.style.cssText =
+        'padding:4px 12px;border:1px solid var(--border-color);border-radius:4px;background:rgba(255,255,255,0.06);color:var(--text-primary);cursor:pointer;margin-left:12px;';
+    todayBtn.addEventListener('click', () => {
+        const now = new Date();
+        currentYear = now.getFullYear();
+        currentMonth = now.getMonth();
+        render();
+    });
+    nav.appendChild(todayBtn);
+
+    container.append(nav, grid);
+    render();
+
+    return container;
+}
