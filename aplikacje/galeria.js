// ============================================================
// aplikacje/galeria.js – Gallery App
// ============================================================

export default function Gallery() {
    const container = document.createElement('div');
    container.style.cssText = 'padding:8px;';
    container.setAttribute('role', 'application');
    container.setAttribute('aria-label', 'Gallery');

    let images = [];

    // Load
    try {
        const saved = localStorage.getItem('cortexos_gallery');
        if (saved) images = JSON.parse(saved);
    } catch (_) { /* ignore */ }

    function saveImages() {
        try {
            localStorage.setItem('cortexos_gallery', JSON.stringify(images));
        } catch (_) { /* ignore */ }
    }

    const addSection = document.createElement('div');
    addSection.className = 'gallery-add';
    const urlInput = document.createElement('input');
    urlInput.type = 'text';
    urlInput.placeholder = 'Image URL...';
    const addUrlBtn = document.createElement('button');
    addUrlBtn.textContent = 'Add URL';
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.multiple = true;
    const fileLabel = document.createElement('button');
    fileLabel.textContent = '📁 Choose Images';

    fileLabel.addEventListener('click', () => fileInput.click());

    addSection.append(urlInput, addUrlBtn, fileLabel, fileInput);

    const grid = document.createElement('div');
    grid.className = 'gallery-grid';

    function render() {
        grid.innerHTML = '';
        if (images.length === 0) {
            const empty = document.createElement('div');
            empty.style.cssText =
                'grid-column:1/-1;padding:40px;text-align:center;color:var(--text-secondary);';
            empty.textContent = 'No images. Add some using URL or file upload.';
            grid.appendChild(empty);
            return;
        }
        images.forEach((img, idx) => {
            const div = document.createElement('div');
            div.className = 'gallery-item';
            const imgEl = document.createElement('img');
            imgEl.src = img;
            imgEl.alt = `Image ${idx+1}`;
            div.appendChild(imgEl);
            div.addEventListener('click', () => {
                // Fullscreen preview
                openFullscreen(img);
            });
            div.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                if (confirm('Remove this image?')) {
                    images.splice(idx, 1);
                    saveImages();
                    render();
                    import('../main.js').then(({ showToast }) => {
                        showToast('🗑️', 'Image removed');
                    });
                }
            });
            grid.appendChild(div);
        });
    }

    function openFullscreen(src) {
        const overlay = document.createElement('div');
        overlay.style.cssText =
            'position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:9999;display:flex;align-items:center;justify-content:center;cursor:pointer;';
        const img = document.createElement('img');
        img.src = src;
        img.style.cssText =
            'max-width:90%;max-height:90%;border-radius:8px;box-shadow:0 8px 40px rgba(0,0,0,0.8);';
        overlay.appendChild(img);
        overlay.addEventListener('click', () => overlay.remove());
        document.body.appendChild(overlay);
    }

    // Add URL
    addUrlBtn.addEventListener('click', () => {
        const url = urlInput.value.trim();
        if (url) {
            images.push(url);
            saveImages();
            render();
            urlInput.value = '';
            import('../main.js').then(({ showToast }) => {
                showToast('🖼️', 'Image added from URL');
            });
        }
    });

    // Add files
    fileInput.addEventListener('change', (e) => {
        const files = e.target.files;
        if (files) {
            Array.from(files).forEach((file) => {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    images.push(ev.target.result);
                    saveImages();
                    render();
                };
                reader.readAsDataURL(file);
            });
            import('../main.js').then(({ showToast }) => {
                showToast('🖼️', `${files.length} image(s) added`);
            });
        }
        fileInput.value = '';
    });

    container.append(addSection, grid);
    render();

    return container;
}
