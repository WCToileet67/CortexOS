// ============================================================
// aplikacje/rysunek.js – Paint App
// ============================================================

export default function Paint() {
    const container = document.createElement('div');
    container.className = 'paint-canvas-wrap';

    const tools = document.createElement('div');
    tools.className = 'paint-tools';

    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.value = '#ffffff';

    const sizeInput = document.createElement('input');
    sizeInput.type = 'range';
    sizeInput.min = '1';
    sizeInput.max = '20';
    sizeInput.value = '3';

    const clearBtn = document.createElement('button');
    clearBtn.textContent = '🗑️ Clear';
    const saveBtn = document.createElement('button');
    saveBtn.textContent = '💾 Save PNG';

    const eraserBtn = document.createElement('button');
    eraserBtn.textContent = '🧹 Eraser';
    let isEraser = false;

    tools.append(
        document.createTextNode('Color:'),
        colorInput,
        document.createTextNode('Size:'),
        sizeInput,
        clearBtn,
        saveBtn,
        eraserBtn
    );

    const canvas = document.createElement('canvas');
    canvas.className = 'paint-canvas';
    canvas.width = 480;
    canvas.height = 320;
    canvas.style.width = '100%';
    canvas.style.height = 'auto';
    canvas.style.aspectRatio = '480/320';

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let drawing = false;
    let lastX = 0,
        lastY = 0;

    function getPos(e) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
        const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY,
        };
    }

    function startDraw(e) {
        e.preventDefault();
        drawing = true;
        const pos = getPos(e);
        lastX = pos.x;
        lastY = pos.y;
    }

    function draw(e) {
        e.preventDefault();
        if (!drawing) return;
        const pos = getPos(e);
        const color = isEraser ? '#0a0a0a' : colorInput.value;
        const size = parseInt(sizeInput.value);

        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(pos.x, pos.y);
        ctx.strokeStyle = color;
        ctx.lineWidth = size;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();

        lastX = pos.x;
        lastY = pos.y;
    }

    function endDraw(e) {
        drawing = false;
    }

    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', endDraw);
    canvas.addEventListener('mouseleave', endDraw);

    // Touch support
    canvas.addEventListener('touchstart', startDraw);
    canvas.addEventListener('touchmove', draw);
    canvas.addEventListener('touchend', endDraw);

    clearBtn.addEventListener('click', () => {
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    });

    saveBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = 'painting.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
        import('../main.js').then(({ showToast }) => {
            showToast('🖼️', 'Image saved as PNG!');
        });
    });

    eraserBtn.addEventListener('click', () => {
        isEraser = !isEraser;
        eraserBtn.style.background = isEraser ? 'rgba(255,50,50,0.3)' : '';
        eraserBtn.textContent = isEraser ? '🧹 Eraser ON' : '🧹 Eraser';
    });

    container.append(tools, canvas);

    // Save on window close
    return container;
}