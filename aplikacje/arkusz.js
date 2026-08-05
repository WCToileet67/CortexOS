// ============================================================
// aplikacje/arkusz.js – Spreadsheet App
// ============================================================

export default function Spreadsheet() {
    const container = document.createElement('div');
    container.className = 'spreadsheet-wrap';
    container.setAttribute('role', 'application');
    container.setAttribute('aria-label', 'Spreadsheet');

    // Stan danych
    const STORAGE_KEY = 'cortexos_spreadsheet';
    let data = [];
    const ROWS = 20;
    const COLS = 10;

    // Załaduj dane lub utwórz puste
    function loadData() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                data = JSON.parse(saved);
                return;
            }
        } catch (_) { /* ignore */ }
        
        // Inicjalizacja pustymi danymi
        data = [];
        for (let r = 0; r < ROWS; r++) {
            data[r] = [];
            for (let c = 0; c < COLS; c++) {
                data[r][c] = '';
            }
        }
    }

    function saveData() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (_) { /* ignore */ }
    }

    loadData();

    // Toolbar
    const toolbar = document.createElement('div');
    toolbar.className = 'spreadsheet-toolbar';

    const addRowBtn = document.createElement('button');
    addRowBtn.textContent = '➕ Add Row';
    const addColBtn = document.createElement('button');
    addColBtn.textContent = '➕ Add Column';
    const clearBtn = document.createElement('button');
    clearBtn.textContent = '🗑️ Clear All';

    toolbar.append(addRowBtn, addColBtn, clearBtn);

    // Tabela
    const tableWrap = document.createElement('div');
    tableWrap.style.cssText = 'overflow:auto;max-height:400px;';

    const table = document.createElement('table');
    tableWrap.appendChild(table);

    function render() {
        table.innerHTML = '';
        
        // Nagłówki kolumn (A, B, C, ...)
        const headerRow = document.createElement('tr');
        const corner = document.createElement('th');
        corner.textContent = '';
        headerRow.appendChild(corner);
        
        for (let c = 0; c < data[0]?.length || COLS; c++) {
            const th = document.createElement('th');
            th.textContent = String.fromCharCode(65 + c);
            headerRow.appendChild(th);
        }
        table.appendChild(headerRow);

        // Wiersze z danymi
        for (let r = 0; r < data.length; r++) {
            const tr = document.createElement('tr');
            
            // Nagłówek wiersza (numer)
            const th = document.createElement('th');
            th.textContent = r + 1;
            tr.appendChild(th);

            // Komórki
            for (let c = 0; c < data[r].length; c++) {
                const td = document.createElement('td');
                const input = document.createElement('input');
                input.type = 'text';
                input.value = data[r][c] || '';
                input.dataset.row = r;
                input.dataset.col = c;
                
                input.addEventListener('input', (e) => {
                    const row = parseInt(e.target.dataset.row);
                    const col = parseInt(e.target.dataset.col);
                    data[row][col] = e.target.value;
                    saveData();
                });

                // Obsługa klawiszy do nawigacji
                input.addEventListener('keydown', (e) => {
                    const row = parseInt(e.target.dataset.row);
                    const col = parseInt(e.target.dataset.col);
                    let newRow = row;
                    let newCol = col;

                    if (e.key === 'ArrowDown') newRow = Math.min(row + 1, data.length - 1);
                    else if (e.key === 'ArrowUp') newRow = Math.max(row - 1, 0);
                    else if (e.key === 'ArrowRight') newCol = Math.min(col + 1, data[row].length - 1);
                    else if (e.key === 'ArrowLeft') newCol = Math.max(col - 1, 0);
                    else if (e.key === 'Tab') {
                        e.preventDefault();
                        newCol = e.shiftKey ? Math.max(col - 1, 0) : Math.min(col + 1, data[row].length - 1);
                    }

                    if (newRow !== row || newCol !== col) {
                        const inputs = table.querySelectorAll('input');
                        const target = Array.from(inputs).find(
                            inp => parseInt(inp.dataset.row) === newRow && parseInt(inp.dataset.col) === newCol
                        );
                        if (target) target.focus();
                    }
                });

                td.appendChild(input);
                tr.appendChild(td);
            }
            table.appendChild(tr);
        }
    }

    // Dodaj wiersz
    addRowBtn.addEventListener('click', () => {
        const newRow = [];
        const cols = data[0]?.length || COLS;
        for (let c = 0; c < cols; c++) {
            newRow[c] = '';
        }
        data.push(newRow);
        saveData();
        render();
    });

    // Dodaj kolumnę
    addColBtn.addEventListener('click', () => {
        for (let r = 0; r < data.length; r++) {
            data[r].push('');
        }
        saveData();
        render();
    });

    // Wyczyść wszystkie dane
    clearBtn.addEventListener('click', () => {
        if (confirm('Clear all spreadsheet data?')) {
            for (let r = 0; r < data.length; r++) {
                for (let c = 0; c < data[r].length; c++) {
                    data[r][c] = '';
                }
            }
            saveData();
            render();
        }
    });

    container.append(toolbar, tableWrap);
    render();

    return container;
}
