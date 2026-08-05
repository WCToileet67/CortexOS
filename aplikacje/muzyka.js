diff --git a/aplikacje/muzyka.js b/aplikacje/muzyka.js
index bfbea93bb1dfb5fba59a097ebee09a90484ece88..33d86855b2d16130dac5100a56233c16f861a8ab 100644
--- a/aplikacje/muzyka.js
+++ b/aplikacje/muzyka.js
@@ -1,191 +1,193 @@
-// ============================================================
-// aplikacje/muzyka.js – Music Player
-// ============================================================
-
-export default function Music() {
-    const container = document.createElement('div');
-    container.className = 'music-player';
-
-    let playlist = [];
-    let currentIndex = -1;
-    let isPlaying = false;
-
-    // Load playlist
-    try {
-        const saved = localStorage.getItem('cortexos_music');
-        if (saved) playlist = JSON.parse(saved);
-    } catch (_) { /* ignore */ }
-
-    function savePlaylist() {
-        try {
-            localStorage.setItem('cortexos_music', JSON.stringify(playlist));
-        } catch (_) { /* ignore */ }
-    }
-
-    const audio = new Audio();
-
-    const controls = document.createElement('div');
-    controls.className = 'mp-controls';
-
-    const playBtn = document.createElement('button');
-    playBtn.textContent = '▶ Play';
-    const stopBtn = document.createElement('button');
-    stopBtn.textContent = '⏹ Stop';
-    const prevBtn = document.createElement('button');
-    prevBtn.textContent = '⏮ Prev';
-    const nextBtn = document.createElement('button');
-    nextBtn.textContent = '⏭ Next';
-
-    const volumeInput = document.createElement('input');
-    volumeInput.type = 'range';
-    volumeInput.min = '0';
-    volumeInput.max = '1';
-    volumeInput.step = '0.01';
-    volumeInput.value = '0.7';
-    volumeInput.style.width = '80px';
-
-    const volLabel = document.createElement('span');
-    volLabel.textContent = '🔊';
-
-    controls.append(prevBtn, playBtn, stopBtn, nextBtn, volLabel, volumeInput);
-
-    const playlistEl = document.createElement('div');
-    playlistEl.className = 'mp-playlist';
-
-    function renderPlaylist() {
-        playlistEl.innerHTML = '';
-        if (playlist.length === 0) {
-            const empty = document.createElement('div');
-            empty.style.cssText = 'padding:12px;color:var(--text-secondary);text-align:center;';
-            empty.textContent = 'No tracks. Use "Add MP3" to add music.';
-            playlistEl.appendChild(empty);
-            return;
-        }
-        playlist.forEach((track, idx) => {
-            const div = document.createElement('div');
-            div.className = 'mp-track';
-            if (idx === currentIndex) div.classList.add('active');
-            div.innerHTML = `
-                <span>${track.name || `Track ${idx+1}`}</span>
-                <span style="font-size:12px;color:var(--text-secondary);">${(track.size ? (track.size/1024).toFixed(1) : '?')} KB</span>
-            `;
-            div.addEventListener('click', () => {
-                playTrack(idx);
-            });
-            playlistEl.appendChild(div);
-        });
-    }
-
-    function playTrack(idx) {
-        if (idx < 0 || idx >= playlist.length) return;
-        currentIndex = idx;
-        const track = playlist[idx];
-        audio.src = track.data;
-        audio.volume = parseFloat(volumeInput.value);
-        audio.play();
-        isPlaying = true;
-        playBtn.textContent = '⏸ Pause';
-        renderPlaylist();
-        import('../main.js').then(({ showToast }) => {
-            showToast('🎵', `Playing: ${track.name || `Track ${idx+1}`}`);
-        });
-    }
-
-    // Add file
-    const addBtn = document.createElement('button');
-    addBtn.textContent = '➕ Add MP3';
-    addBtn.style.cssText =
-        'padding:4px 12px;border:1px solid var(--border-color);border-radius:4px;background:rgba(255,255,255,0.06);color:var(--text-primary);cursor:pointer;';
-
-    const fileInput = document.createElement('input');
-    fileInput.type = 'file';
-    fileInput.accept = 'audio/mpeg';
-    fileInput.style.display = 'none';
-
-    addBtn.addEventListener('click', () => fileInput.click());
-
-    fileInput.addEventListener('change', (e) => {
-        const file = e.target.files[0];
-        if (file) {
-            const reader = new FileReader();
-            reader.onload = (ev) => {
-                const data = ev.target.result;
-                playlist.push({
-                    name: file.name,
-                    data: data,
-                    size: file.size,
-                });
-                savePlaylist();
-                renderPlaylist();
-                import('../main.js').then(({ showToast }) => {
-                    showToast('🎵', `Added "${file.name}"`);
-                });
-            };
-            reader.readAsDataURL(file);
-        }
-        fileInput.value = '';
-    });
-
-    // Controls
-    playBtn.addEventListener('click', () => {
-        if (currentIndex < 0 && playlist.length > 0) {
-            playTrack(0);
-            return;
-        }
-        if (audio.paused) {
-            audio.play();
-            isPlaying = true;
-            playBtn.textContent = '⏸ Pause';
-        } else {
-            audio.pause();
-            isPlaying = false;
-            playBtn.textContent = '▶ Play';
-        }
-    });
-
-    stopBtn.addEventListener('click', () => {
-        audio.pause();
-        audio.currentTime = 0;
-        isPlaying = false;
-        playBtn.textContent = '▶ Play';
-    });
-
-    prevBtn.addEventListener('click', () => {
-        if (playlist.length === 0) return;
-        const idx = currentIndex > 0 ? currentIndex - 1 : playlist.length - 1;
-        playTrack(idx);
-    });
-
-    nextBtn.addEventListener('click', () => {
-        if (playlist.length === 0) return;
-        const idx = currentIndex < playlist.length - 1 ? currentIndex + 1 : 0;
-        playTrack(idx);
-    });
-
-    volumeInput.addEventListener('input', () => {
-        audio.volume = parseFloat(volumeInput.value);
-    });
-
-    audio.addEventListener('ended', () => {
-        if (playlist.length > 0) {
-            const idx = currentIndex < playlist.length - 1 ? currentIndex + 1 : 0;
-            playTrack(idx);
-        } else {
-            isPlaying = false;
-            playBtn.textContent = '▶ Play';
-        }
-    });
-
-    container.append(
-        document.createElement('div'),
-        controls,
-        document.createElement('div'),
-        addBtn,
-        fileInput,
-        playlistEl
-    );
-
-    renderPlaylist();
-
-    return container;
-}
\ No newline at end of file
+// ============================================================
+// aplikacje/muzyka.js – Music Player
+// ============================================================
+
+export default function Music() {
+    const container = document.createElement('div');
+    container.className = 'music-player';
+    container.setAttribute('role', 'application');
+    container.setAttribute('aria-label', 'Music Player');
+
+    let playlist = [];
+    let currentIndex = -1;
+    let isPlaying = false;
+
+    // Load playlist
+    try {
+        const saved = localStorage.getItem('cortexos_music');
+        if (saved) playlist = JSON.parse(saved);
+    } catch (_) { /* ignore */ }
+
+    function savePlaylist() {
+        try {
+            localStorage.setItem('cortexos_music', JSON.stringify(playlist));
+        } catch (_) { /* ignore */ }
+    }
+
+    const audio = new Audio();
+
+    const controls = document.createElement('div');
+    controls.className = 'mp-controls';
+
+    const playBtn = document.createElement('button');
+    playBtn.textContent = '▶ Play';
+    const stopBtn = document.createElement('button');
+    stopBtn.textContent = '⏹ Stop';
+    const prevBtn = document.createElement('button');
+    prevBtn.textContent = '⏮ Prev';
+    const nextBtn = document.createElement('button');
+    nextBtn.textContent = '⏭ Next';
+
+    const volumeInput = document.createElement('input');
+    volumeInput.type = 'range';
+    volumeInput.min = '0';
+    volumeInput.max = '1';
+    volumeInput.step = '0.01';
+    volumeInput.value = '0.7';
+    volumeInput.style.width = '80px';
+
+    const volLabel = document.createElement('span');
+    volLabel.textContent = '🔊';
+
+    controls.append(prevBtn, playBtn, stopBtn, nextBtn, volLabel, volumeInput);
+
+    const playlistEl = document.createElement('div');
+    playlistEl.className = 'mp-playlist';
+
+    function renderPlaylist() {
+        playlistEl.innerHTML = '';
+        if (playlist.length === 0) {
+            const empty = document.createElement('div');
+            empty.style.cssText = 'padding:12px;color:var(--text-secondary);text-align:center;';
+            empty.textContent = 'No tracks. Use "Add MP3" to add music.';
+            playlistEl.appendChild(empty);
+            return;
+        }
+        playlist.forEach((track, idx) => {
+            const div = document.createElement('div');
+            div.className = 'mp-track';
+            if (idx === currentIndex) div.classList.add('active');
+            div.innerHTML = `
+                <span>${track.name || `Track ${idx+1}`}</span>
+                <span style="font-size:12px;color:var(--text-secondary);">${(track.size ? (track.size/1024).toFixed(1) : '?')} KB</span>
+            `;
+            div.addEventListener('click', () => {
+                playTrack(idx);
+            });
+            playlistEl.appendChild(div);
+        });
+    }
+
+    function playTrack(idx) {
+        if (idx < 0 || idx >= playlist.length) return;
+        currentIndex = idx;
+        const track = playlist[idx];
+        audio.src = track.data;
+        audio.volume = parseFloat(volumeInput.value);
+        audio.play();
+        isPlaying = true;
+        playBtn.textContent = '⏸ Pause';
+        renderPlaylist();
+        import('../main.js').then(({ showToast }) => {
+            showToast('🎵', `Playing: ${track.name || `Track ${idx+1}`}`);
+        });
+    }
+
+    // Add file
+    const addBtn = document.createElement('button');
+    addBtn.textContent = '➕ Add MP3';
+    addBtn.style.cssText =
+        'padding:4px 12px;border:1px solid var(--border-color);border-radius:4px;background:rgba(255,255,255,0.06);color:var(--text-primary);cursor:pointer;';
+
+    const fileInput = document.createElement('input');
+    fileInput.type = 'file';
+    fileInput.accept = 'audio/mpeg';
+    fileInput.style.display = 'none';
+
+    addBtn.addEventListener('click', () => fileInput.click());
+
+    fileInput.addEventListener('change', (e) => {
+        const file = e.target.files[0];
+        if (file) {
+            const reader = new FileReader();
+            reader.onload = (ev) => {
+                const data = ev.target.result;
+                playlist.push({
+                    name: file.name,
+                    data: data,
+                    size: file.size,
+                });
+                savePlaylist();
+                renderPlaylist();
+                import('../main.js').then(({ showToast }) => {
+                    showToast('🎵', `Added "${file.name}"`);
+                });
+            };
+            reader.readAsDataURL(file);
+        }
+        fileInput.value = '';
+    });
+
+    // Controls
+    playBtn.addEventListener('click', () => {
+        if (currentIndex < 0 && playlist.length > 0) {
+            playTrack(0);
+            return;
+        }
+        if (audio.paused) {
+            audio.play();
+            isPlaying = true;
+            playBtn.textContent = '⏸ Pause';
+        } else {
+            audio.pause();
+            isPlaying = false;
+            playBtn.textContent = '▶ Play';
+        }
+    });
+
+    stopBtn.addEventListener('click', () => {
+        audio.pause();
+        audio.currentTime = 0;
+        isPlaying = false;
+        playBtn.textContent = '▶ Play';
+    });
+
+    prevBtn.addEventListener('click', () => {
+        if (playlist.length === 0) return;
+        const idx = currentIndex > 0 ? currentIndex - 1 : playlist.length - 1;
+        playTrack(idx);
+    });
+
+    nextBtn.addEventListener('click', () => {
+        if (playlist.length === 0) return;
+        const idx = currentIndex < playlist.length - 1 ? currentIndex + 1 : 0;
+        playTrack(idx);
+    });
+
+    volumeInput.addEventListener('input', () => {
+        audio.volume = parseFloat(volumeInput.value);
+    });
+
+    audio.addEventListener('ended', () => {
+        if (playlist.length > 0) {
+            const idx = currentIndex < playlist.length - 1 ? currentIndex + 1 : 0;
+            playTrack(idx);
+        } else {
+            isPlaying = false;
+            playBtn.textContent = '▶ Play';
+        }
+    });
+
+    container.append(
+        document.createElement('div'),
+        controls,
+        document.createElement('div'),
+        addBtn,
+        fileInput,
+        playlistEl
+    );
+
+    renderPlaylist();
+
+    return container;
+}
