diff --git a/aplikacje/kalkulator.js b/aplikacje/kalkulator.js
index 56fda6757226ccf79d51c461a9bac75c53035757..4e83f9317cd9811a082c88e532b1d9e5667e639f 100644
--- a/aplikacje/kalkulator.js
+++ b/aplikacje/kalkulator.js
@@ -1,163 +1,165 @@
-// ============================================================
-// aplikacje/kalkulator.js – Scientific Calculator
-// ============================================================
-
-export default function Calculator() {
-    const container = document.createElement('div');
-    container.style.cssText = 'padding:8px;max-width:340px;margin:0 auto;';
-
-    const display = document.createElement('div');
-    display.className = 'calc-display';
-    display.innerHTML = `<div class="calc-expr" id="calcExpr"></div><div id="calcResult">0</div>`;
-
-    const grid = document.createElement('div');
-    grid.className = 'calc-grid';
-
-    const buttons = [
-        ['(', ')', 'C', '⌫'],
-        ['7', '8', '9', '÷'],
-        ['4', '5', '6', '×'],
-        ['1', '2', '3', '−'],
-        ['0', '.', '±', '+'],
-        ['sin', 'cos', 'log', '√'],
-        ['π', 'e', '^', '='],
-    ];
-
-    let expr = '';
-    let result = '0';
-    let history = [];
-
-    function updateDisplay() {
-        document.getElementById('calcExpr').textContent = expr || '\u200b';
-        document.getElementById('calcResult').textContent = result;
-    }
-
-    function compute(expression) {
-        try {
-            // Replace symbols
-            let e = expression
-                .replace(/×/g, '*')
-                .replace(/÷/g, '/')
-                .replace(/−/g, '-')
-                .replace(/π/g, Math.PI)
-                .replace(/e(?![xp])/g, Math.E)
-                .replace(/sin\(/g, 'Math.sin(')
-                .replace(/cos\(/g, 'Math.cos(')
-                .replace(/log\(/g, 'Math.log10(')
-                .replace(/√\(/g, 'Math.sqrt(')
-                .replace(/±/g, (m, offset) => {
-                    // Find number before ± and negate
-                    return '';
-                });
-
-            // Handle ± by negating the number before it
-            let parts = e.split('±');
-            if (parts.length > 1) {
-                // Simple: find the last number and negate
-                // This is a simplified approach
-                let last = parts[parts.length - 1];
-                let match = last.match(/^([\d.]+)/);
-                if (match) {
-                    let num = match[1];
-                    let neg = -parseFloat(num);
-                    last = last.replace(num, neg.toString());
-                    parts[parts.length - 1] = last;
-                }
-                e = parts.join('');
-            }
-
-            // Handle ^
-            e = e.replace(/\^/g, '**');
-
-            const result = Function(`"use strict"; return (${e})`)();
-            return result;
-        } catch (_) {
-            return null;
-        }
-    }
-
-    buttons.forEach((row) => {
-        row.forEach((label) => {
-            const btn = document.createElement('button');
-            btn.className = 'calc-btn';
-            if (['+', '−', '×', '÷', '=', 'sin', 'cos', 'log', '√', '^'].includes(label)) {
-                btn.classList.add('op');
-            }
-            if (label === '=') btn.classList.add('eq');
-            if (label === 'C' || label === '⌫') btn.style.color = '#ff6b6b';
-
-            btn.textContent = label;
-            btn.addEventListener('click', () => {
-                if (label === 'C') {
-                    expr = '';
-                    result = '0';
-                    updateDisplay();
-                    return;
-                }
-                if (label === '⌫') {
-                    expr = expr.slice(0, -1);
-                    updateDisplay();
-                    return;
-                }
-                if (label === '=') {
-                    const res = compute(expr);
-                    if (res !== null) {
-                        result = String(res);
-                        history.push(expr + ' = ' + result);
-                        expr = result;
-                        updateDisplay();
-                    } else {
-                        result = 'Error';
-                        updateDisplay();
-                        setTimeout(() => {
-                            result = '0';
-                            updateDisplay();
-                        }, 800);
-                    }
-                    return;
-                }
-                if (['sin', 'cos', 'log', '√'].includes(label)) {
-                    expr += label + '(';
-                    updateDisplay();
-                    return;
-                }
-                if (['π', 'e'].includes(label)) {
-                    expr += label;
-                    updateDisplay();
-                    return;
-                }
-                if (label === '±') {
-                    expr += '±';
-                    updateDisplay();
-                    return;
-                }
-                expr += label;
-                updateDisplay();
-            });
-
-            grid.appendChild(btn);
-        });
-    });
-
-    container.append(display, grid);
-
-    // History display (simple)
-    const histDiv = document.createElement('div');
-    histDiv.style.cssText =
-        'margin-top:12px;font-size:12px;color:var(--text-secondary);max-height:80px;overflow-y:auto;border-top:1px solid var(--border-color);padding-top:8px;';
-    histDiv.textContent = 'History: ';
-    const histSpan = document.createElement('span');
-    histSpan.id = 'calcHistory';
-    histDiv.appendChild(histSpan);
-    container.appendChild(histDiv);
-
-    // Update history
-    setInterval(() => {
-        const h = document.getElementById('calcHistory');
-        if (h) {
-            h.textContent = history.slice(-5).join('; ');
-        }
-    }, 500);
-
-    return container;
-}
\ No newline at end of file
+// ============================================================
+// aplikacje/kalkulator.js – Scientific Calculator
+// ============================================================
+
+export default function Calculator() {
+    const container = document.createElement('div');
+    container.style.cssText = 'padding:8px;max-width:340px;margin:0 auto;';
+    container.setAttribute('role', 'application');
+    container.setAttribute('aria-label', 'Scientific Calculator');
+
+    const display = document.createElement('div');
+    display.className = 'calc-display';
+    display.innerHTML = `<div class="calc-expr" id="calcExpr"></div><div id="calcResult">0</div>`;
+
+    const grid = document.createElement('div');
+    grid.className = 'calc-grid';
+
+    const buttons = [
+        ['(', ')', 'C', '⌫'],
+        ['7', '8', '9', '÷'],
+        ['4', '5', '6', '×'],
+        ['1', '2', '3', '−'],
+        ['0', '.', '±', '+'],
+        ['sin', 'cos', 'log', '√'],
+        ['π', 'e', '^', '='],
+    ];
+
+    let expr = '';
+    let result = '0';
+    let history = [];
+
+    function updateDisplay() {
+        document.getElementById('calcExpr').textContent = expr || '\u200b';
+        document.getElementById('calcResult').textContent = result;
+    }
+
+    function compute(expression) {
+        try {
+            // Replace symbols
+            let e = expression
+                .replace(/×/g, '*')
+                .replace(/÷/g, '/')
+                .replace(/−/g, '-')
+                .replace(/π/g, Math.PI)
+                .replace(/e(?![xp])/g, Math.E)
+                .replace(/sin\(/g, 'Math.sin(')
+                .replace(/cos\(/g, 'Math.cos(')
+                .replace(/log\(/g, 'Math.log10(')
+                .replace(/√\(/g, 'Math.sqrt(')
+                .replace(/±/g, (m, offset) => {
+                    // Find number before ± and negate
+                    return '';
+                });
+
+            // Handle ± by negating the number before it
+            let parts = e.split('±');
+            if (parts.length > 1) {
+                // Simple: find the last number and negate
+                // This is a simplified approach
+                let last = parts[parts.length - 1];
+                let match = last.match(/^([\d.]+)/);
+                if (match) {
+                    let num = match[1];
+                    let neg = -parseFloat(num);
+                    last = last.replace(num, neg.toString());
+                    parts[parts.length - 1] = last;
+                }
+                e = parts.join('');
+            }
+
+            // Handle ^
+            e = e.replace(/\^/g, '**');
+
+            const result = Function(`"use strict"; return (${e})`)();
+            return result;
+        } catch (_) {
+            return null;
+        }
+    }
+
+    buttons.forEach((row) => {
+        row.forEach((label) => {
+            const btn = document.createElement('button');
+            btn.className = 'calc-btn';
+            if (['+', '−', '×', '÷', '=', 'sin', 'cos', 'log', '√', '^'].includes(label)) {
+                btn.classList.add('op');
+            }
+            if (label === '=') btn.classList.add('eq');
+            if (label === 'C' || label === '⌫') btn.style.color = '#ff6b6b';
+
+            btn.textContent = label;
+            btn.addEventListener('click', () => {
+                if (label === 'C') {
+                    expr = '';
+                    result = '0';
+                    updateDisplay();
+                    return;
+                }
+                if (label === '⌫') {
+                    expr = expr.slice(0, -1);
+                    updateDisplay();
+                    return;
+                }
+                if (label === '=') {
+                    const res = compute(expr);
+                    if (res !== null) {
+                        result = String(res);
+                        history.push(expr + ' = ' + result);
+                        expr = result;
+                        updateDisplay();
+                    } else {
+                        result = 'Error';
+                        updateDisplay();
+                        setTimeout(() => {
+                            result = '0';
+                            updateDisplay();
+                        }, 800);
+                    }
+                    return;
+                }
+                if (['sin', 'cos', 'log', '√'].includes(label)) {
+                    expr += label + '(';
+                    updateDisplay();
+                    return;
+                }
+                if (['π', 'e'].includes(label)) {
+                    expr += label;
+                    updateDisplay();
+                    return;
+                }
+                if (label === '±') {
+                    expr += '±';
+                    updateDisplay();
+                    return;
+                }
+                expr += label;
+                updateDisplay();
+            });
+
+            grid.appendChild(btn);
+        });
+    });
+
+    container.append(display, grid);
+
+    // History display (simple)
+    const histDiv = document.createElement('div');
+    histDiv.style.cssText =
+        'margin-top:12px;font-size:12px;color:var(--text-secondary);max-height:80px;overflow-y:auto;border-top:1px solid var(--border-color);padding-top:8px;';
+    histDiv.textContent = 'History: ';
+    const histSpan = document.createElement('span');
+    histSpan.id = 'calcHistory';
+    histDiv.appendChild(histSpan);
+    container.appendChild(histDiv);
+
+    // Update history
+    setInterval(() => {
+        const h = document.getElementById('calcHistory');
+        if (h) {
+            h.textContent = history.slice(-5).join('; ');
+        }
+    }, 500);
+
+    return container;
+}
