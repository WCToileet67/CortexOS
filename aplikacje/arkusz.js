
// ============================================================
// aplikacje/arkusz.js – Spreadsheet App
// ============================================================

export default function Spreadsheet() {
    const container = document.createElement('div');
    container.className = 'spreadsheet-wrap';

    const toolbar = document.createElement('div');
    toolbar.className = 'spreadsheet-toolbar';
    const sumBtn = document.createElement('button');
    sumBtn.textContent = 'Σ Sum Selected';
    const clearBtn = document.createElement('button');
    clearBtn.textContent = '🗑️ Clear All';
    const saveBtn = document.createElement('button');
    saveBtn.textContent = '💾 Save';
    toolbar.append(sumBtn, clearBtn, saveBtn);

    const tableWrap = document.createElement('div');
    tableWrap.style.cssText = 'overflow:auto;max-height:400px;';

    const table = document.createElement('table');
    const ROWS = 10;
    const COLS = 10;

    // Load saved data
    let data = [];
    try {
        const saved = localStorage.getItem('cortexos_spreadsheet');
        if (saved) data = JSON.parse(saved);
    } catch (_) { /* ignore */ }

    if (!data || data.length === 0) {
        data = Array.from({ length: ROWS }, () =>
            Array.from({ length: COLS }, () => '')
        );
    }

    function render() {
        table.innerHTML = '';
        // Header row
        const thead = document.createElement('thead');
        const hRow = document.createElement('tr');
        const corner = document.createElement('th');
        corner.textContent = '';
        hRow.appendChild(corner);
        for (let c = 0; c < COLS; c++) {
            const th = document.createElement('th');
            th.textContent = String.fromCharCode(65 + c);
            hRow.appendChild(th);
        }
        thead.appendChild(hRow);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        for (let r = 0; r < ROWS; r++) {
            const tr = document.createElement('tr');
            const th = document.createElement('th');
            th.textContent = r + 1;
            tr.appendChild(th);
            for (let c = 0; c < COLS; c++) {
                const td = document.createElement('td');
                const input = document.createElement('input');
                input.type = 'text';
                input.value = data[r]?.[c] ?? '';
                input.dataset.r = r;
                input.dataset.c = c;
                input.addEventListener('input', (e) => {
                    data[r][c] = e.target.value;
                });
                td.appendChild(input);
                tr.appendChild(td);
            }
            tbody.appendChild(tr);
        }
        table.appendChild(tbody);
        tableWrap.innerHTML = '';
        tableWrap.appendChild(table);
    }

    render();

    // Sum selected: finds all inputs with content and sums numbers
    sumBtn.addEventListener('click', () => {
        let sum = 0;
        const inputs = table.querySelectorAll('input');
        inputs.forEach((inp) => {
            const val = inp.value.trim();
            if (val && !isNaN(val)) {
                sum += parseFloat(val);
            }
        });
        import('../main.js').then(({ showToast }) => {
            showToast('Σ', `Sum: ${sum}`);
        });
    });

    clearBtn.addEventListener('click', () => {
        if (confirm('Clear all spreadsheet data?')) {
            data = Array.from({ length: ROWS }, () =>
                Array.from({ length: COLS }, () => '')
            );
            render();
            import('../main.js').then(({ showToast }) => {
                showToast('🗑️', 'Spreadsheet cleared');
            });
        }
    });

    saveBtn.addEventListener('click', () => {
        // Gather current data
        const inputs = table.querySelectorAll('input');
        inputs.forEach((inp) => {
            const r = parseInt(inp.dataset.r);
            const c = parseInt(inp.dataset.c);
            if (!data[r]) data[r] = [];
            data[r][c] = inp.value;
        });
        try {
            localStorage.setItem('cortexos_spreadsheet', JSON.stringify(data));
            import('../main.js').then(({ showToast }) => {
                showToast('💾', 'Spreadsheet saved!');
            });
        } catch (_) { /* ignore */ }
    });

    // Auto-save on change (debounced)
    let saveTimer = null;
    table.addEventListener('input', () => {
        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => {
            const inputs = table.querySelectorAll('input');
            inputs.forEach((inp) => {
                const r = parseInt(inp.dataset.r);
                const c = parseInt(inp.dataset.c);
                if (!data[r]) data[r] = [];
                data[r][c] = inp.value;
            });
            try {
                localStorage.setItem('cortexos_spreadsheet', JSON.stringify(data));
            } catch (_) { /* ignore */ }
        }, 1000);
    });

    container.append(toolbar, tableWrap);
    return container;
}
