diff --git a/jadro/ustawieniaSystemowe.js b/jadro/ustawieniaSystemowe.js
index 3fb7d2cb34b12450bb345d1212cec24f141fd5f6..14c8a1bdafbd187701ca1cb0ca630db3b227521f 100644
--- a/jadro/ustawieniaSystemowe.js
+++ b/jadro/ustawieniaSystemowe.js
@@ -1,48 +1,49 @@
-// ============================================================
-// jadro/ustawieniaSystemowe.js – System Settings Core
-// ============================================================
-
-import { Core, saveSettings, applyTheme, showToast } from '../main.js';
-
-export const SystemSettings = {
-    get() {
-        return Core.settings;
-    },
-
-    set(key, value) {
-        Core.settings[key] = value;
-        saveSettings();
-        // Apply live
-        if (key === 'theme') {
-            applyTheme(value);
-        }
-        if (key === 'wallpaper') {
-            const wall = document.getElementById('wallpaper');
-            if (value && value !== 'default') {
-                wall.style.backgroundImage = `url(${value})`;
-                wall.style.backgroundSize = 'cover';
-                wall.style.backgroundPosition = 'center';
-            } else {
-                wall.style.backgroundImage =
-                    'linear-gradient(135deg, #0f0c29, #302b63, #24243e)';
-                wall.style.backgroundSize = 'cover';
-            }
-        }
-        showToast('⚙️', `Settings updated: ${key}`);
-    },
-
-    reset() {
-        Core.settings = {
-            theme: 'ciemny',
-            wallpaper: 'default',
-            language: 'en',
-            password: 'admin',
-        };
-        saveSettings();
-        applyTheme('ciemny');
-        const wall = document.getElementById('wallpaper');
-        wall.style.backgroundImage = 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)';
-        wall.style.backgroundSize = 'cover';
-        showToast('🔄', 'Settings reset to default');
-    },
-};
\ No newline at end of file
+// ============================================================
+// jadro/ustawieniaSystemowe.js – System Settings Core
+// ============================================================
+
+import { Core, saveSettings, applyTheme, showToast } from '../main.js';
+
+export const SystemSettings = {
+    get() {
+        return Core.settings;
+    },
+
+    set(key, value) {
+        Core.settings[key] = value;
+        saveSettings();
+        // Apply live
+        if (key === 'theme') {
+            applyTheme(value);
+        }
+        if (key === 'wallpaper') {
+            const wall = document.getElementById('wallpaper');
+            if (value && value !== 'default') {
+                wall.style.backgroundImage = `url(${value})`;
+                wall.style.backgroundSize = 'cover';
+                wall.style.backgroundPosition = 'center';
+            } else {
+                wall.style.backgroundImage =
+                    'linear-gradient(135deg, #0f0c29, #302b63, #24243e)';
+                wall.style.backgroundSize = 'cover';
+            }
+        }
+        showToast('⚙️', `Settings updated: ${key}`);
+        document.dispatchEvent(new CustomEvent('cortexos:settings-changed', { detail: { key, value } }));
+    },
+
+    reset() {
+        Core.settings = {
+            theme: 'ciemny',
+            wallpaper: 'default',
+            language: 'en',
+            password: 'admin',
+        };
+        saveSettings();
+        applyTheme('ciemny');
+        const wall = document.getElementById('wallpaper');
+        wall.style.backgroundImage = 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)';
+        wall.style.backgroundSize = 'cover';
+        showToast('🔄', 'Settings reset to default');
+    },
+};
