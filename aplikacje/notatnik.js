diff --git a/aplikacje/notatnik.js b/aplikacje/notatnik.js
index 43d0b19d6f6e77bd6e83bcb2ccc15e4ebbb9a309..d27b341d8d8ad6e4fdc0deef0f98841a18891a7e 100644
--- a/aplikacje/notatnik.js
+++ b/aplikacje/notatnik.js
@@ -1,100 +1,102 @@
-// ============================================================
-// aplikacje/notatnik.js – Notepad App
-// ============================================================
-
-export default function Notepad(params, winEl) {
-    const container = document.createElement('div');
-    container.style.cssText = 'display:flex;flex-direction:column;height:100%;gap:8px;';
-
-    const toolbar = document.createElement('div');
-    toolbar.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;';
-    const saveBtn = document.createElement('button');
-    saveBtn.textContent = '💾 Save (Ctrl+S)';
-    saveBtn.style.cssText =
-        'padding:4px 12px;border:1px solid var(--border-color);border-radius:4px;background:rgba(255,255,255,0.06);color:var(--text-primary);cursor:pointer;';
-    const clearBtn = document.createElement('button');
-    clearBtn.textContent = '🗑️ Clear';
-    clearBtn.style.cssText = saveBtn.style.cssText;
-    const loadBtn = document.createElement('button');
-    loadBtn.textContent = '📂 Load';
-    loadBtn.style.cssText = saveBtn.style.cssText;
-
-    toolbar.append(saveBtn, loadBtn, clearBtn);
-
-    const textarea = document.createElement('textarea');
-    textarea.className = 'notepad-textarea';
-    textarea.placeholder = 'Write something... (Ctrl+S to save)';
-    textarea.style.cssText =
-        'width:100%;flex:1;background:transparent;border:none;color:var(--text-primary);font-family:monospace;font-size:14px;resize:none;outline:none;padding:4px;line-height:1.6;min-height:280px;';
-
-    // Load saved
-    try {
-        const saved = localStorage.getItem('cortexos_notepad');
-        if (saved) textarea.value = saved;
-    } catch (_) { /* ignore */ }
-
-    container.append(toolbar, textarea);
-
-    // Save
-    const save = () => {
-        try {
-            localStorage.setItem('cortexos_notepad', textarea.value);
-            import('../main.js').then(({ showToast }) => {
-                showToast('💾', 'Notepad saved!');
-            });
-        } catch (_) { /* ignore */ }
-    };
-
-    saveBtn.addEventListener('click', save);
-    clearBtn.addEventListener('click', () => {
-        if (confirm('Clear all text?')) {
-            textarea.value = '';
-            save();
-        }
-    });
-    loadBtn.addEventListener('click', () => {
-        try {
-            const saved = localStorage.getItem('cortexos_notepad');
-            if (saved) {
-                textarea.value = saved;
-                import('../main.js').then(({ showToast }) => {
-                    showToast('📂', 'Notepad loaded!');
-                });
-            } else {
-                import('../main.js').then(({ showToast }) => {
-                    showToast('⚠️', 'No saved content found.');
-                });
-            }
-        } catch (_) { /* ignore */ }
-    });
-
-    // Ctrl+S
-    textarea.addEventListener('keydown', (e) => {
-        if (e.ctrlKey && e.key === 's') {
-            e.preventDefault();
-            save();
-        }
-        // Auto-save on change (debounced)
-        clearTimeout(textarea._saveTimer);
-        textarea._saveTimer = setTimeout(save, 2000);
-    });
-
-    // Save on window close
-    if (winEl) {
-        winEl._notepadSave = save;
-    }
-
-    return container;
-}
-
-// Export onClose hook
-export function onClose() {
-    // Save before closing
-    try {
-        const textarea = document.querySelector('.notepad-textarea');
-        if (textarea) {
-            localStorage.setItem('cortexos_notepad', textarea.value);
-        }
-    } catch (_) { /* ignore */ }
-    return true;
-}
\ No newline at end of file
+// ============================================================
+// aplikacje/notatnik.js – Notepad App
+// ============================================================
+
+export default function Notepad(params, winEl) {
+    const container = document.createElement('div');
+    container.style.cssText = 'display:flex;flex-direction:column;height:100%;gap:8px;';
+    container.setAttribute('role', 'application');
+    container.setAttribute('aria-label', 'Notepad');
+
+    const toolbar = document.createElement('div');
+    toolbar.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;';
+    const saveBtn = document.createElement('button');
+    saveBtn.textContent = '💾 Save (Ctrl+S)';
+    saveBtn.style.cssText =
+        'padding:4px 12px;border:1px solid var(--border-color);border-radius:4px;background:rgba(255,255,255,0.06);color:var(--text-primary);cursor:pointer;';
+    const clearBtn = document.createElement('button');
+    clearBtn.textContent = '🗑️ Clear';
+    clearBtn.style.cssText = saveBtn.style.cssText;
+    const loadBtn = document.createElement('button');
+    loadBtn.textContent = '📂 Load';
+    loadBtn.style.cssText = saveBtn.style.cssText;
+
+    toolbar.append(saveBtn, loadBtn, clearBtn);
+
+    const textarea = document.createElement('textarea');
+    textarea.className = 'notepad-textarea';
+    textarea.placeholder = 'Write something... (Ctrl+S to save)';
+    textarea.style.cssText =
+        'width:100%;flex:1;background:transparent;border:none;color:var(--text-primary);font-family:monospace;font-size:14px;resize:none;outline:none;padding:4px;line-height:1.6;min-height:280px;';
+
+    // Load saved
+    try {
+        const saved = localStorage.getItem('cortexos_notepad');
+        if (saved) textarea.value = saved;
+    } catch (_) { /* ignore */ }
+
+    container.append(toolbar, textarea);
+
+    // Save
+    const save = () => {
+        try {
+            localStorage.setItem('cortexos_notepad', textarea.value);
+            import('../main.js').then(({ showToast }) => {
+                showToast('💾', 'Notepad saved!');
+            });
+        } catch (_) { /* ignore */ }
+    };
+
+    saveBtn.addEventListener('click', save);
+    clearBtn.addEventListener('click', () => {
+        if (confirm('Clear all text?')) {
+            textarea.value = '';
+            save();
+        }
+    });
+    loadBtn.addEventListener('click', () => {
+        try {
+            const saved = localStorage.getItem('cortexos_notepad');
+            if (saved) {
+                textarea.value = saved;
+                import('../main.js').then(({ showToast }) => {
+                    showToast('📂', 'Notepad loaded!');
+                });
+            } else {
+                import('../main.js').then(({ showToast }) => {
+                    showToast('⚠️', 'No saved content found.');
+                });
+            }
+        } catch (_) { /* ignore */ }
+    });
+
+    // Ctrl+S
+    textarea.addEventListener('keydown', (e) => {
+        if (e.ctrlKey && e.key === 's') {
+            e.preventDefault();
+            save();
+        }
+        // Auto-save on change (debounced)
+        clearTimeout(textarea._saveTimer);
+        textarea._saveTimer = setTimeout(save, 2000);
+    });
+
+    // Save on window close
+    if (winEl) {
+        winEl._notepadSave = save;
+    }
+
+    return container;
+}
+
+// Export onClose hook
+export function onClose() {
+    // Save before closing
+    try {
+        const textarea = document.querySelector('.notepad-textarea');
+        if (textarea) {
+            localStorage.setItem('cortexos_notepad', textarea.value);
+        }
+    } catch (_) { /* ignore */ }
+    return true;
+}
