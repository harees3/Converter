
        (function() {
            'use strict';

            // ─── DOM refs ───
            const dropZone = document.getElementById('dropZone');
            const fileInput = document.getElementById('fileInput');
            const dzIcon = document.getElementById('dzIcon');
            const dzTitle = document.getElementById('dzTitle');
            const dzDesc = document.getElementById('dzDesc');
            const dzHint = document.getElementById('dzHint');

            const previewRow = document.getElementById('previewRow');
            const thumbImg = document.getElementById('thumbImg');
            const thumbPlaceholder = document.getElementById('thumbPlaceholder');
            const infoName = document.getElementById('infoName');
            const infoSize = document.getElementById('infoSize');
            const infoDims = document.getElementById('infoDims');
            const infoPages = document.getElementById('infoPages');
            const fileStatus = document.getElementById('fileStatus');

            const formatPills = document.getElementById('formatPills');
            const formatSection = document.getElementById('formatSection');
            const qualityGroup = document.getElementById('qualityGroup');
            const qualityRange = document.getElementById('qualityRange');
            const qualityLabel = document.getElementById('qualityLabel');
            const convertBtn = document.getElementById('convertBtn');
            const controlsRow = document.getElementById('controlsRow');

            const outputArea = document.getElementById('outputArea');
            const outputLabel = document.getElementById('outputLabel');
            const outputImage = document.getElementById('outputImage');
            const outputPdfCanvas = document.getElementById('outputPdfCanvas');
            const outputPlaceholder = document.getElementById('outputPlaceholder');
            const outputPdfPages = document.getElementById('outputPdfPages');
            const downloadBtn = document.getElementById('downloadBtn');
            const base64Box = document.getElementById('base64Box');
            const base64Text = document.getElementById('base64Text');
            const copyBtn = document.getElementById('copyBtn');

            const batchArea = document.getElementById('batchArea');
            const batchFileList = document.getElementById('batchFileList');
            const batchConvertBtn = document.getElementById('batchConvertBtn');
            const batchClearBtn = document.getElementById('batchClearBtn');
            const batchStatus = document.getElementById('batchStatus');

            const mergeArea = document.getElementById('mergeArea');
            const mergeFileList = document.getElementById('mergeFileList');
            const mergeBtn = document.getElementById('mergeBtn');
            const mergeClearBtn = document.getElementById('mergeClearBtn');
            const mergeStatus = document.getElementById('mergeStatus');

            const modeTabs = document.querySelectorAll('.tab-btn');
            const popularGrid = document.getElementById('popularGrid');

            // ─── State ───
            let currentFile = null;
            let currentMode = 'convert';
            let selectedFormat = 'png';
            let imageData = null;
            let pdfData = null;
            let convertedBlob = null;
            let convertedDataURL = null;

            let batchFiles = [];
            let mergeFiles = [];

            // ─── Format config ───
            const FORMATS = {
                convert: [
                    { id: 'png', label: 'PNG', icon: 'fa-image', mime: 'image/png', ext: 'png' },
                    { id: 'jpg', label: 'JPG', icon: 'fa-image', mime: 'image/jpeg', ext: 'jpg' },
                    { id: 'webp', label: 'WEBP', icon: 'fa-image', mime: 'image/webp', ext: 'webp' },
                    { id: 'bmp', label: 'BMP', icon: 'fa-image', mime: 'image/bmp', ext: 'bmp' },
                    { id: 'svg', label: 'SVG', icon: 'fa-code', mime: 'image/svg+xml', ext: 'svg' },
                    { id: 'ico', label: 'ICO', icon: 'fa-window-maximize', mime: 'image/x-icon', ext: 'ico' },
                    { id: 'base64', label: 'Base64', icon: 'fa-code', mime: 'text/plain', ext: 'txt' },
                    { id: 'pdf', label: 'PDF', icon: 'fa-file-pdf', mime: 'application/pdf', ext: 'pdf' },
                ],
                batch: [
                    { id: 'png', label: 'PNG', icon: 'fa-image', mime: 'image/png', ext: 'png' },
                    { id: 'jpg', label: 'JPG', icon: 'fa-image', mime: 'image/jpeg', ext: 'jpg' },
                    { id: 'webp', label: 'WEBP', icon: 'fa-image', mime: 'image/webp', ext: 'webp' },
                    { id: 'bmp', label: 'BMP', icon: 'fa-image', mime: 'image/bmp', ext: 'bmp' },
                    { id: 'svg', label: 'SVG', icon: 'fa-code', mime: 'image/svg+xml', ext: 'svg' },
                    { id: 'ico', label: 'ICO', icon: 'fa-window-maximize', mime: 'image/x-icon', ext: 'ico' },
                    { id: 'pdf', label: 'PDF', icon: 'fa-file-pdf', mime: 'application/pdf', ext: 'pdf' },
                ],
                merge: [
                    { id: 'pdf', label: 'PDF', icon: 'fa-file-pdf', mime: 'application/pdf', ext: 'pdf' },
                ]
            };

            const POPULAR_FORMATS = [
                { id: 'png-to-jpg', icon: 'fa-image', label: 'PNG to JPG', mode: 'convert', format: 'jpg' },
                { id: 'jpg-to-png', icon: 'fa-image', label: 'JPG to PNG', mode: 'convert', format: 'png' },
                { id: 'pdf-to-jpg', icon: 'fa-file-pdf', label: 'PDF to JPG', mode: 'convert', format: 'jpg' },
                { id: 'image-to-pdf', icon: 'fa-file-pdf', label: 'Image to PDF', mode: 'convert', format: 'pdf' },
                { id: 'webp-to-png', icon: 'fa-image', label: 'WEBP to PNG', mode: 'convert', format: 'png' },
                { id: 'png-to-webp', icon: 'fa-image', label: 'PNG to WEBP', mode: 'convert', format: 'webp' },
                { id: 'png-to-svg', icon: 'fa-code', label: 'PNG to SVG', mode: 'convert', format: 'svg' },
                { id: 'jpg-to-ico', icon: 'fa-window-maximize', label: 'JPG to ICO', mode: 'convert', format: 'ico' },
            ];

            // ─── Render Popular Formats ───
            function renderPopularFormats() {
                popularGrid.innerHTML = '';
                POPULAR_FORMATS.forEach(f => {
                    const card = document.createElement('div');
                    card.className = 'popular-card';
                    card.dataset.mode = f.mode;
                    card.dataset.format = f.format;
                    card.innerHTML =
                        `<i class="fas ${f.icon}"></i><div class="pc-info"><span class="pc-title">${f.label}</span><span class="pc-desc">Convert now</span></div>`;
                    card.addEventListener('click', () => setModeAndFormat(f.mode, f.format));
                    popularGrid.appendChild(card);
                });
            }

            // ─── Render format pills ───
            function renderPills(mode) {
                const formats = FORMATS[mode] || FORMATS.convert;
                formatPills.innerHTML = '';
                const firstId = formats[0]?.id || 'png';
                selectedFormat = firstId;

                formats.forEach(f => {
                    const pill = document.createElement('div');
                    pill.className = 'format-pill' + (f.id === selectedFormat ? ' active' : '');
                    pill.dataset.format = f.id;
                    pill.innerHTML =
                        `<i class="fas ${f.icon} pill-icon"></i><span class="pill-label">${f.label}</span>`;
                    pill.addEventListener('click', () => {
                        document.querySelectorAll('.format-pill').forEach(p => p.classList.remove('active'));
                        pill.classList.add('active');
                        selectedFormat = f.id;
                        updateQualityVisibility();
                        outputArea.classList.remove('visible');
                        base64Box.classList.remove('visible');
                        convertedBlob = null;
                        convertedDataURL = null;
                        if (mode === 'batch') {
                            batchConvertBtn.dataset.format = f.id;
                        }
                    });
                    formatPills.appendChild(pill);
                });
                updateQualityVisibility();
            }

            function updateQualityVisibility() {
                const noQuality = ['base64', 'pdf', 'svg', 'ico'];
                const hide = noQuality.includes(selectedFormat) || currentMode === 'merge';
                qualityGroup.classList.toggle('disabled', hide);
            }

            // ─── Update drop zone ───
            function updateDropZone(mode) {
                const map = {
                    convert: {
                        icon: 'fa-cloud-upload-alt',
                        title: 'Drop your file here',
                        desc: 'or click to browse · PNG, JPG, WEBP, BMP, SVG, ICO, PDF',
                        hint: 'Supports images, PDFs, and text files'
                    },
                    batch: {
                        icon: 'fa-layer-group',
                        title: 'Drop multiple files here',
                        desc: 'or click to browse · any supported files',
                        hint: 'Upload multiple files to convert them all at once'
                    },
                    merge: {
                        icon: 'fa-object-ungroup',
                        title: 'Drop PDFs here to merge',
                        desc: 'or click to browse · PDF files only',
                        hint: 'Add PDFs to merge into a single file'
                    }
                };
                const data = map[mode] || map.convert;
                dzIcon.className = 'fas ' + data.icon + ' dz-icon';
                dzTitle.textContent = data.title;
                dzDesc.textContent = data.desc;
                dzHint.innerHTML = '<i class="fas fa-info-circle"></i> ' + data.hint;

                // ─── Set accept attribute based on mode ───
                if (mode === 'merge') {
                    fileInput.accept = 'application/pdf';
                    fileInput.multiple = true;
                } else if (mode === 'convert') {
                    fileInput.accept = 'image/*,application/pdf';
                    fileInput.multiple = false;
                } else {
                    // batch mode - all files
                    fileInput.accept = '*/*';
                    fileInput.multiple = true;
                }

                const isMerge = mode === 'merge';
                const isBatch = mode === 'batch';

                formatSection.style.display = (isMerge) ? 'none' : 'block';
                controlsRow.style.display = (isMerge || isBatch) ? 'none' : 'flex';
                batchArea.classList.toggle('visible', isBatch);
                mergeArea.classList.toggle('visible', isMerge);

                if (isBatch) {
                    updateBatchUI();
                    batchConvertBtn.dataset.format = selectedFormat;
                }

                if (isMerge) {
                    updateMergeUI();
                }

                // ─── Clear output when switching away from convert ───
                if (mode !== 'convert') {
                    previewRow.style.display = 'none';
                    outputArea.classList.remove('visible');
                    base64Box.classList.remove('visible');
                    convertedBlob = null;
                    convertedDataURL = null;
                    convertBtn.disabled = true;
                } else {
                    // If switching back to convert and we have a file, show preview
                    if (currentFile) {
                        previewRow.style.display = 'flex';
                        if (imageData) {
                            thumbImg.src = imageData.dataURL;
                            thumbImg.style.display = 'block';
                            thumbPlaceholder.style.display = 'none';
                            infoDims.textContent = `${imageData.width} × ${imageData.height}`;
                            infoName.textContent = currentFile.name;
                            infoSize.textContent = formatFileSize(currentFile.size);
                            fileStatus.innerHTML = '<i class="fas fa-folder-open"></i> loaded';
                            convertBtn.disabled = false;
                        } else if (pdfData) {
                            infoName.textContent = currentFile.name;
                            infoSize.textContent = formatFileSize(currentFile.size);
                            infoDims.textContent = `PDF · ${pdfData.numPages} pages`;
                            fileStatus.innerHTML = '<i class="fas fa-folder-open"></i> loaded';
                            convertBtn.disabled = false;
                            // Regenerate thumbnail
                            loadPDF(currentFile).catch(() => {});
                        }
                    }
                }
            }

            // ─── Mode switch ───
            function setMode(mode) {
                if (mode === currentMode) return;
                currentMode = mode;
                modeTabs.forEach(tab => {
                    tab.classList.toggle('active', tab.dataset.mode === mode);
                });
                updateDropZone(mode);
                renderPills(mode);

                if (mode === 'batch') {
                    batchConvertBtn.disabled = batchFiles.length === 0;
                    batchConvertBtn.dataset.format = selectedFormat;
                    batchStatus.textContent = batchFiles.length === 0 ? 'No files' : `${batchFiles.length} file(s)`;
                }

                if (mode === 'merge') {
                    mergeBtn.disabled = mergeFiles.length < 2;
                    mergeStatus.textContent = mergeFiles.length === 0 ? 'No PDFs' :
                        `${mergeFiles.length} PDF(s) - drag to reorder`;
                }
            }

            function setModeAndFormat(mode, format) {
                setMode(mode);
                setTimeout(() => {
                    document.querySelectorAll('.format-pill').forEach(p => {
                        if (p.dataset.format === format) p.click();
                    });
                }, 50);
                document.querySelector('.drop-zone').scrollIntoView({ behavior: 'smooth', block: 'center' });
            }

            // ─── Tab clicks ───
            modeTabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    const mode = tab.dataset.mode;
                    if (mode !== currentMode) setMode(mode);
                });
            });

            // ─── Quality slider ───
            qualityRange.addEventListener('input', () => {
                qualityLabel.textContent = qualityRange.value + '%';
            });

            // ─── File handling ───
            async function handleFile(file) {
                if (!file) return;

                if (currentMode === 'batch') {
                    addBatchFile(file);
                    return;
                }

                if (currentMode === 'merge') {
                    if (file.type !== 'application/pdf') {
                        alert('Please select a PDF file for merging.');
                        return;
                    }
                    addMergeFile(file);
                    return;
                }

                // Convert mode
                // Validate file type for convert mode
                const validTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/bmp', 'image/svg+xml', 'image/x-icon',
                    'image/vnd.microsoft.icon', 'application/pdf'
                ];
                const ext = file.name.split('.').pop().toLowerCase();
                const validExt = ['png', 'jpg', 'jpeg', 'webp', 'bmp', 'svg', 'ico', 'pdf'];
                if (!validTypes.includes(file.type) && !validExt.includes(ext)) {
                    alert('Unsupported file type. Please upload an image or PDF.');
                    return;
                }

                currentFile = file;
                previewRow.style.display = 'flex';
                infoName.textContent = file.name;
                infoSize.textContent = formatFileSize(file.size);
                infoDims.textContent = '—';
                infoPages.textContent = '';
                fileStatus.innerHTML = '<i class="fas fa-folder-open"></i> loaded';
                outputArea.classList.remove('visible');
                base64Box.classList.remove('visible');
                convertedBlob = null;
                convertedDataURL = null;

                try {
                    if (file.type === 'application/pdf' || ext === 'pdf') {
                        await loadPDF(file);
                    } else if (file.type.startsWith('image/') || ['svg', 'ico'].includes(ext)) {
                        await loadImage(file);
                    } else {
                        await loadAnyFile(file);
                    }
                    convertBtn.disabled = false;
                } catch (err) {
                    console.error(err);
                    alert('Error loading file: ' + err.message);
                    convertBtn.disabled = true;
                }
            }

            function loadImage(file) {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const img = new Image();
                        img.onload = () => {
                            const canvas = document.createElement('canvas');
                            canvas.width = img.naturalWidth || img.width;
                            canvas.height = img.naturalHeight || img.height;
                            const ctx = canvas.getContext('2d');
                            ctx.drawImage(img, 0, 0);
                            imageData = {
                                canvas,
                                ctx,
                                width: canvas.width,
                                height: canvas.height,
                                dataURL: e.target.result,
                                file: file
                            };
                            thumbImg.src = e.target.result;
                            thumbImg.style.display = 'block';
                            thumbPlaceholder.style.display = 'none';
                            infoDims.textContent = `${canvas.width} × ${canvas.height}`;
                            resolve();
                        };
                        img.onerror = () => reject(new Error('Failed to decode image'));
                        img.src = e.target.result;
                    };
                    reader.onerror = () => reject(new Error('Failed to read file'));
                    reader.readAsDataURL(file);
                });
            }

            async function loadPDF(file) {
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                pdfData = { pdf, file, numPages: pdf.numPages };
                const page = await pdf.getPage(1);
                const viewport = page.getViewport({ scale: 0.5 });
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                await page.render({ canvasContext: ctx, viewport: viewport }).promise;
                thumbImg.src = canvas.toDataURL();
                thumbImg.style.display = 'block';
                thumbPlaceholder.style.display = 'none';
                infoDims.textContent = `${Math.round(viewport.width * 2)} × ${Math.round(viewport.height * 2)}`;
                infoPages.textContent = `📄 ${pdf.numPages} page${pdf.numPages > 1 ? 's' : ''}`;
            }

            async function loadAnyFile(file) {
                if (file.type.startsWith('image/')) {
                    await loadImage(file);
                    infoPages.textContent = '🖼️ Image → PDF';
                } else if (file.type.startsWith('text/')) {
                    const text = await file.text();
                    thumbImg.style.display = 'none';
                    thumbPlaceholder.style.display = 'inline';
                    thumbPlaceholder.className = 'fas fa-file-alt thumb-placeholder';
                    infoDims.textContent = `📄 ${text.length} characters`;
                    infoPages.textContent = '📝 Text file → PDF';
                    imageData = { text, isText: true, file };
                } else {
                    thumbImg.style.display = 'none';
                    thumbPlaceholder.style.display = 'inline';
                    thumbPlaceholder.className = 'fas fa-file-archive thumb-placeholder';
                    infoDims.textContent = `🔒 ${formatFileSize(file.size)}`;
                    infoPages.textContent = '📦 Binary file → PDF';
                    imageData = { isBinary: true, file };
                }
            }

            // ─── Batch functions ───
            function addBatchFile(file) {
                const exists = batchFiles.some(f => f.file.name === file.name && f.file.size === file.size);
                if (exists) {
                    alert('File already in batch list.');
                    return;
                }
                batchFiles.push({ file, status: 'pending', resultBlob: null, resultExt: null, error: null });
                updateBatchUI();
                batchConvertBtn.disabled = false;
                batchStatus.textContent = `${batchFiles.length} file(s)`;
            }

            function removeBatchFile(index) {
                batchFiles.splice(index, 1);
                updateBatchUI();
                if (batchFiles.length === 0) {
                    batchConvertBtn.disabled = true;
                    batchStatus.textContent = 'No files';
                } else {
                    batchStatus.textContent = `${batchFiles.length} file(s)`;
                }
            }

            function updateBatchUI() {
                batchFileList.innerHTML = '';
                if (batchFiles.length === 0) {
                    batchFileList.innerHTML =
                        `<div style="text-align:center;padding:1.5rem;color:var(--text-muted);font-size:0.8rem;">
                            <i class="fas fa-inbox" style="font-size:2rem;display:block;margin-bottom:0.5rem;opacity:0.3;"></i>
                            No files added yet. Drop files in the box above.
                        </div>`;
                    return;
                }
                batchFiles.forEach((item, idx) => {
                    const div = document.createElement('div');
                    div.className = 'batch-file-item';
                    const icon = item.file.type.startsWith('image/') ? 'fa-image' : item.file.type === 'application/pdf' ?
                        'fa-file-pdf' : 'fa-file';
                    div.innerHTML = `
                        <i class="fas ${icon} bfi-icon"></i>
                        <span class="bfi-name" title="${item.file.name}">${item.file.name}</span>
                        <span class="bfi-size">${formatFileSize(item.file.size)}</span>
                        <span class="bfi-status ${item.status === 'done' ? 'done' : item.status === 'error' ? 'error' : item.status === 'converting' ? 'converting' : ''}">${item.status}</span>
                        ${item.status === 'done' ? `<button class="bfi-download" data-idx="${idx}"><i class="fas fa-download"></i></button>` : ''}
                        <button class="bfi-download" data-idx="${idx}" style="color:#f87171;" title="Remove"><i class="fas fa-times"></i></button>
                    `;
                    const dlBtn = div.querySelector('.bfi-download:not([style*="color"])');
                    if (dlBtn) {
                        dlBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            const i = parseInt(dlBtn.dataset.idx);
                            if (batchFiles[i].resultBlob) {
                                const url = URL.createObjectURL(batchFiles[i].resultBlob);
                                const a = document.createElement('a');
                                a.href = url;
                                const baseName = batchFiles[i].file.name.replace(/\.[^.]+$/, '');
                                a.download = baseName + '.' + batchFiles[i].resultExt;
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                setTimeout(() => URL.revokeObjectURL(url), 5000);
                            }
                        });
                    }
                    const rmBtn = div.querySelector('.bfi-download[style*="color"]');
                    if (rmBtn) {
                        rmBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            removeBatchFile(idx);
                        });
                    }
                    batchFileList.appendChild(div);
                });
            }

            async function batchConvertAll() {
                const format = selectedFormat;
                const quality = parseInt(qualityRange.value, 10) / 100;
                const ext = getExtension(format);

                batchConvertBtn.disabled = true;
                batchConvertBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Converting...';

                for (let i = 0; i < batchFiles.length; i++) {
                    const item = batchFiles[i];
                    if (item.status === 'done' || item.status === 'error') continue;
                    item.status = 'converting';
                    updateBatchUI();

                    try {
                        let result = null;
                        const file = item.file;

                        if (file.type.startsWith('image/')) {
                            await loadImage(file);
                            result = await convertImage(format, quality);
                        } else if (file.type === 'application/pdf') {
                            await loadPDF(file);
                            result = await convertPDFtoImage(format, quality);
                        } else {
                            await loadAnyFile(file);
                            result = await convertAnyToPDF();
                        }

                        if (result && result.blob) {
                            item.resultBlob = result.blob;
                            item.resultExt = result.ext || ext;
                            item.status = 'done';
                        } else {
                            item.status = 'error';
                            item.error = 'No output';
                        }
                    } catch (err) {
                        console.error(err);
                        item.status = 'error';
                        item.error = err.message || 'Conversion failed';
                    }
                    updateBatchUI();
                }

                batchConvertBtn.disabled = false;
                batchConvertBtn.innerHTML = '<i class="fas fa-play"></i> Convert All';
                const done = batchFiles.filter(f => f.status === 'done').length;
                const failed = batchFiles.filter(f => f.status === 'error').length;
                batchStatus.textContent = `${done} done, ${failed} failed`;
            }

            function clearBatch() {
                batchFiles = [];
                updateBatchUI();
                batchConvertBtn.disabled = true;
                batchStatus.textContent = 'No files';
            }

            // ─── MERGE FUNCTIONS ───
            function addMergeFile(file) {
                if (file.type !== 'application/pdf') {
                    alert('Please select a PDF file.');
                    return;
                }
                const exists = mergeFiles.some(f => f.name === file.name && f.size === file.size);
                if (exists) {
                    alert('PDF already in merge list.');
                    return;
                }
                mergeFiles.push(file);
                updateMergeUI();
                mergeBtn.disabled = mergeFiles.length < 2;
                mergeStatus.textContent = `${mergeFiles.length} PDF(s) - drag to reorder`;
            }

            function removeMergeFile(index) {
                mergeFiles.splice(index, 1);
                updateMergeUI();
                mergeBtn.disabled = mergeFiles.length < 2;
                mergeStatus.textContent = mergeFiles.length === 0 ? 'No PDFs' :
                    `${mergeFiles.length} PDF(s) - drag to reorder`;
            }

            function moveMergeFile(from, to) {
                if (from === to) return;
                const [item] = mergeFiles.splice(from, 1);
                mergeFiles.splice(to, 0, item);
                updateMergeUI();
            }

            function updateMergeUI() {
                mergeFileList.innerHTML = '';
                if (mergeFiles.length === 0) {
                    mergeFileList.innerHTML =
                        `<div style="text-align:center;padding:1.5rem;color:var(--text-muted);font-size:0.8rem;">
                            <i class="fas fa-file-pdf" style="font-size:2rem;display:block;margin-bottom:0.5rem;opacity:0.3;"></i>
                            No PDFs added yet. Drop PDFs in the box above.
                        </div>`;
                    return;
                }

                mergeFiles.forEach((file, idx) => {
                    const div = document.createElement('div');
                    div.className = 'merge-file-item';
                    div.draggable = true;
                    div.dataset.index = idx;

                    div.innerHTML = `
                        <span class="mfi-index">${idx + 1}</span>
                        <span class="mfi-handle"><i class="fas fa-grip-vertical"></i></span>
                        <i class="fas fa-file-pdf mfi-icon"></i>
                        <span class="mfi-name" title="${file.name}">${file.name}</span>
                        <span class="mfi-size">${formatFileSize(file.size)}</span>
                        <div class="mfi-actions">
                            <button class="danger" title="Remove"><i class="fas fa-times"></i></button>
                        </div>
                    `;

                    div.addEventListener('dragstart', (e) => {
                        div.classList.add('dragging');
                        e.dataTransfer.effectAllowed = 'move';
                        e.dataTransfer.setData('text/plain', idx);
                    });
                    div.addEventListener('dragend', () => {
                        div.classList.remove('dragging');
                    });
                    div.addEventListener('dragover', (e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                    });
                    div.addEventListener('drop', (e) => {
                        e.preventDefault();
                        const fromIdx = parseInt(e.dataTransfer.getData('text/plain'));
                        const toIdx = parseInt(div.dataset.index);
                        if (fromIdx !== toIdx) {
                            moveMergeFile(fromIdx, toIdx);
                        }
                    });

                    const removeBtn = div.querySelector('.mfi-actions button');
                    removeBtn.addEventListener('click', () => {
                        removeMergeFile(idx);
                    });

                    mergeFileList.appendChild(div);
                });
            }

            async function executeMerge() {
                if (mergeFiles.length < 2) {
                    alert('Please add at least 2 PDFs to merge.');
                    return;
                }

                try {
                    mergeBtn.disabled = true;
                    mergeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Merging...';
                    mergeStatus.textContent = 'Merging...';

                    const mergedPdf = await PDFLib.PDFDocument.create();

                    for (const file of mergeFiles) {
                        const arrayBuffer = await file.arrayBuffer();
                        const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
                        const indices = pdf.getPageIndices();
                        const copiedPages = await mergedPdf.copyPages(pdf, indices);
                        copiedPages.forEach(page => mergedPdf.addPage(page));
                    }

                    const pdfBytes = await mergedPdf.save();
                    const blob = new Blob([pdfBytes], { type: 'application/pdf' });

                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'merged.pdf';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    setTimeout(() => URL.revokeObjectURL(url), 5000);

                    mergeStatus.textContent = `✅ Merged successfully! ${mergeFiles.length} PDFs combined.`;

                } catch (err) {
                    console.error(err);
                    alert('Error merging PDFs: ' + err.message);
                    mergeStatus.textContent = '❌ Merge failed';
                } finally {
                    mergeBtn.disabled = mergeFiles.length < 2;
                    mergeBtn.innerHTML = '<i class="fas fa-play"></i> Merge All';
                }
            }

            function clearMerge() {
                mergeFiles = [];
                updateMergeUI();
                mergeBtn.disabled = true;
                mergeStatus.textContent = 'No PDFs';
            }

            // ─── Helpers ───
            function formatFileSize(bytes) {
                if (bytes < 1024) return bytes + ' B';
                if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
                return (bytes / 1048576).toFixed(1) + ' MB';
            }

            function getMimeType(format) {
                const map = { png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp', bmp: 'image/bmp' };
                return map[format] || 'image/png';
            }

            function getExtension(format) {
                const map = { png: 'png', jpg: 'jpg', webp: 'webp', bmp: 'bmp', svg: 'svg', ico: 'ico', base64: 'txt',
                    pdf: 'pdf' };
                return map[format] || 'bin';
            }

            // ─── BMP encoder ───
            function encodeBMP(canvas) {
                const w = canvas.width,
                    h = canvas.height;
                const ctx = canvas.getContext('2d');
                const imageData = ctx.getImageData(0, 0, w, h);
                const data = imageData.data;
                const fileHeader = new Uint8Array(14);
                fileHeader[0] = 0x42;
                fileHeader[1] = 0x4D;
                const infoHeader = new Uint8Array(40);
                infoHeader[0] = 40;
                infoHeader[4] = w & 0xFF;
                infoHeader[5] = (w >> 8) & 0xFF;
                infoHeader[6] = (w >> 16) & 0xFF;
                infoHeader[7] = (w >> 24) & 0xFF;
                infoHeader[8] = h & 0xFF;
                infoHeader[9] = (h >> 8) & 0xFF;
                infoHeader[10] = (h >> 16) & 0xFF;
                infoHeader[11] = (h >> 24) & 0xFF;
                infoHeader[12] = 1;
                infoHeader[14] = 24;
                const rowSize = ((w * 3 + 3) & ~3);
                const imageSize = rowSize * h;
                const fileSize = 54 + imageSize;
                fileHeader[2] = fileSize & 0xFF;
                fileHeader[3] = (fileSize >> 8) & 0xFF;
                fileHeader[4] = (fileSize >> 16) & 0xFF;
                fileHeader[5] = (fileSize >> 24) & 0xFF;
                fileHeader[10] = 54;
                infoHeader[20] = imageSize & 0xFF;
                infoHeader[21] = (imageSize >> 8) & 0xFF;
                infoHeader[22] = (imageSize >> 16) & 0xFF;
                infoHeader[23] = (imageSize >> 24) & 0xFF;
                const pixelData = new Uint8Array(imageSize);
                for (let y = 0; y < h; y++) {
                    const srcRow = (h - 1 - y) * w * 4;
                    const dstRow = y * rowSize;
                    for (let x = 0; x < w; x++) {
                        const src = srcRow + x * 4;
                        const dst = dstRow + x * 3;
                        pixelData[dst] = data[src + 2];
                        pixelData[dst + 1] = data[src + 1];
                        pixelData[dst + 2] = data[src];
                    }
                }
                const result = new Uint8Array(fileHeader.length + infoHeader.length + pixelData.length);
                result.set(fileHeader, 0);
                result.set(infoHeader, 14);
                result.set(pixelData, 54);
                return new Blob([result], { type: 'image/bmp' });
            }

            // ─── ICO encoder ───
            function encodeICO(canvas) {
                const w = canvas.width,
                    h = canvas.height;
                const ctx = canvas.getContext('2d');
                const imageData = ctx.getImageData(0, 0, w, h);
                const data = imageData.data;

                const dirHeader = new Uint8Array(6);
                dirHeader[0] = 0;
                dirHeader[1] = 0;
                dirHeader[2] = 1;
                dirHeader[3] = 0;
                dirHeader[4] = 1;
                dirHeader[5] = 0;

                const entry = new Uint8Array(16);
                entry[0] = w > 255 ? 0 : w;
                entry[1] = h > 255 ? 0 : h;
                entry[2] = 0;
                entry[3] = 0;
                entry[4] = 1;
                entry[5] = 0;
                entry[6] = 32;
                entry[7] = 0;

                const bmpHeader = new Uint8Array(40);
                bmpHeader[0] = 40;
                bmpHeader[4] = w & 0xFF;
                bmpHeader[5] = (w >> 8) & 0xFF;
                bmpHeader[6] = (w >> 16) & 0xFF;
                bmpHeader[7] = (w >> 24) & 0xFF;
                bmpHeader[8] = h & 0xFF;
                bmpHeader[9] = (h >> 8) & 0xFF;
                bmpHeader[10] = (h >> 16) & 0xFF;
                bmpHeader[11] = (h >> 24) & 0xFF;
                bmpHeader[12] = 1;
                bmpHeader[13] = 0;
                bmpHeader[14] = 32;
                bmpHeader[15] = 0;

                const pixelSize = w * h * 4;
                const pixelData = new Uint8Array(pixelSize);
                for (let y = 0; y < h; y++) {
                    const srcRow = (h - 1 - y) * w * 4;
                    const dstRow = y * w * 4;
                    for (let x = 0; x < w; x++) {
                        const src = srcRow + x * 4;
                        const dst = dstRow + x * 4;
                        pixelData[dst] = data[src + 2];
                        pixelData[dst + 1] = data[src + 1];
                        pixelData[dst + 2] = data[src];
                        pixelData[dst + 3] = data[src + 3];
                    }
                }

                const offset = 6 + 16;
                const imageSize = 40 + pixelSize;
                const totalSize = offset + imageSize;

                entry[8] = imageSize & 0xFF;
                entry[9] = (imageSize >> 8) & 0xFF;
                entry[10] = (imageSize >> 16) & 0xFF;
                entry[11] = (imageSize >> 24) & 0xFF;
                entry[12] = offset & 0xFF;
                entry[13] = (offset >> 8) & 0xFF;
                entry[14] = (offset >> 16) & 0xFF;
                entry[15] = (offset >> 24) & 0xFF;

                const result = new Uint8Array(totalSize);
                result.set(dirHeader, 0);
                result.set(entry, 6);
                result.set(bmpHeader, offset);
                result.set(pixelData, offset + 40);

                return new Blob([result], { type: 'image/x-icon' });
            }

            // ─── Render PDF preview ───
            async function renderPdfPreview(blob) {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = async (e) => {
                        try {
                            const arrayBuffer = e.target.result;
                            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                            const page = await pdf.getPage(1);
                            const viewport = page.getViewport({ scale: 0.8 });
                            const canvas = document.getElementById('outputPdfCanvas');
                            const ctx = canvas.getContext('2d');
                            canvas.width = viewport.width;
                            canvas.height = viewport.height;
                            canvas.style.display = 'block';
                            await page.render({ canvasContext: ctx, viewport }).promise;
                            outputImage.style.display = 'none';
                            outputPlaceholder.style.display = 'none';
                            outputPdfPages.textContent = `${pdf.numPages} page${pdf.numPages > 1 ? 's' : ''}`;
                            resolve();
                        } catch (err) {
                            reject(err);
                        }
                    };
                    reader.onerror = () => reject(new Error('Failed to read PDF'));
                    reader.readAsArrayBuffer(blob);
                });
            }

            // ─── Convert functions ───
            async function convertImage(format, quality) {
                if (!imageData || !imageData.canvas) throw new Error('No image loaded');
                const { canvas, width, height } = imageData;

                if (format === 'base64') {
                    const dataURL = canvas.toDataURL('image/png', quality);
                    return { type: 'base64', data: dataURL, blob: null, ext: 'txt' };
                }
                if (format === 'pdf') {
                    const { jsPDF } = window.jspdf;
                    const pdf = new jsPDF('p', 'mm', 'a4');
                    const pw = pdf.internal.pageSize.getWidth();
                    const ph = pdf.internal.pageSize.getHeight();
                    const ratio = Math.min(pw / width, ph / height);
                    const iw = width * ratio,
                        ih = height * ratio;
                    const x = (pw - iw) / 2,
                        y = (ph - ih) / 2;
                    const imgData = canvas.toDataURL('image/png');
                    pdf.addImage(imgData, 'PNG', x, y, iw, ih);
                    const blob = pdf.output('blob');
                    return { type: 'pdf', data: null, blob, ext: 'pdf' };
                }
                if (format === 'bmp') {
                    const blob = encodeBMP(canvas);
                    return { type: 'image', data: null, blob, ext: 'bmp' };
                }
                if (format === 'svg') {
                    const pngData = canvas.toDataURL('image/png');
                    const svgStr =
                        `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><image href="${pngData}" width="${width}" height="${height}"/></svg>`;
                    const blob = new Blob([svgStr], { type: 'image/svg+xml' });
                    return { type: 'image', data: null, blob, ext: 'svg' };
                }
                if (format === 'ico') {
                    const blob = encodeICO(canvas);
                    return { type: 'image', data: null, blob, ext: 'ico' };
                }
                const mime = getMimeType(format);
                return new Promise((resolve, reject) => {
                    canvas.toBlob(
                        (blob) => {
                            if (!blob) reject(new Error('Canvas toBlob failed'));
                            else {
                                const dataURL = canvas.toDataURL(mime, quality);
                                resolve({ type: 'image', data: dataURL, blob, ext: getExtension(format) });
                            }
                        },
                        mime, quality
                    );
                });
            }

            async function convertPDFtoImage(format, quality) {
                if (!pdfData || !pdfData.pdf) throw new Error('No PDF loaded');
                const page = await pdfData.pdf.getPage(1);
                const scale = 1.5;
                const viewport = page.getViewport({ scale });
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                await page.render({ canvasContext: ctx, viewport }).promise;

                if (format === 'bmp') {
                    const blob = encodeBMP(canvas);
                    return { type: 'image', data: null, blob, ext: 'bmp' };
                }
                const mime = getMimeType(format);
                const q = quality;
                return new Promise((resolve, reject) => {
                    canvas.toBlob(
                        (blob) => {
                            if (!blob) reject(new Error('PDF to image failed'));
                            else {
                                const dataURL = canvas.toDataURL(mime, q);
                                resolve({ type: 'image', data: dataURL, blob, ext: getExtension(format) });
                            }
                        },
                        mime, q
                    );
                });
            }

            async function convertAnyToPDF() {
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pw = pdf.internal.pageSize.getWidth();
                const ph = pdf.internal.pageSize.getHeight();

                if (imageData && imageData.canvas) {
                    const { canvas, width, height } = imageData;
                    const ratio = Math.min(pw / width, ph / height);
                    const iw = width * ratio,
                        ih = height * ratio;
                    const x = (pw - iw) / 2,
                        y = (ph - ih) / 2;
                    const imgData = canvas.toDataURL('image/png');
                    pdf.addImage(imgData, 'PNG', x, y, iw, ih);
                } else if (imageData && imageData.isText) {
                    const text = imageData.text || 'No text content';
                    const lines = pdf.splitTextToSize(text, pw - 20);
                    pdf.text(lines, 10, 20);
                } else {
                    const name = currentFile ? currentFile.name : 'file';
                    const size = currentFile ? formatFileSize(currentFile.size) : 'unknown';
                    pdf.setFontSize(16);
                    pdf.text('File Information', 10, 20);
                    pdf.setFontSize(12);
                    pdf.text(`Name: ${name}`, 10, 35);
                    pdf.text(`Size: ${size}`, 10, 45);
                    pdf.text(`Type: ${currentFile ? currentFile.type || 'Unknown' : 'Unknown'}`, 10, 55);
                    pdf.text('This file was packaged as PDF.', 10, 70);
                }
                const blob = pdf.output('blob');
                return { type: 'pdf', data: null, blob, ext: 'pdf' };
            }

            // ─── Convert ───
            async function doConvert() {
                if (!currentFile) return;
                const format = selectedFormat;
                const quality = parseInt(qualityRange.value, 10) / 100;

                try {
                    convertBtn.disabled = true;
                    convertBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Converting…';

                    let result = null;
                    if (currentFile.type === 'application/pdf') {
                        result = await convertPDFtoImage(format, quality);
                    } else if (currentFile.type.startsWith('image/') || ['svg', 'ico'].includes(currentFile.name.split('.')
                            .pop().toLowerCase())) {
                        result = await convertImage(format, quality);
                    } else {
                        if (format !== 'pdf') {
                            alert('This file type can only be converted to PDF. Please select PDF format.');
                            convertBtn.disabled = false;
                            convertBtn.innerHTML = '<i class="fas fa-bolt"></i> Convert';
                            return;
                        }
                        result = await convertAnyToPDF();
                    }

                    if (!result) throw new Error('Conversion failed');
                    await showOutput(result, format);

                } catch (err) {
                    console.error(err);
                    alert('Conversion error: ' + err.message);
                } finally {
                    convertBtn.disabled = false;
                    convertBtn.innerHTML = '<i class="fas fa-bolt"></i> Convert';
                }
            }

            // ─── Show output ───
            async function showOutput(result, format) {
                outputArea.classList.add('visible');
                base64Box.classList.remove('visible');
                outputImage.style.display = 'none';
                outputPdfCanvas.style.display = 'none';
                outputPlaceholder.style.display = 'none';
                outputPdfPages.textContent = '';

                const isBase64 = (format === 'base64' || result.type === 'base64');
                const isPDF = (format === 'pdf' || result.type === 'pdf');

                if (isBase64) {
                    base64Text.value = result.data;
                    base64Box.classList.add('visible');
                    outputImage.src = result.data;
                    outputImage.style.display = 'block';
                    convertedDataURL = result.data;
                    convertedBlob = null;
                    outputLabel.textContent = 'Base64';
                } else if (isPDF) {
                    try {
                        await renderPdfPreview(result.blob);
                        convertedBlob = result.blob;
                        convertedDataURL = null;
                        outputLabel.textContent = 'PDF';
                    } catch (err) {
                        outputPlaceholder.style.display = 'block';
                        outputPlaceholder.innerHTML =
                            `<i class="fas fa-file-pdf"></i><p>PDF ready</p><span class="page-count">Download to view</span>`;
                        convertedBlob = result.blob;
                        convertedDataURL = null;
                        outputLabel.textContent = 'PDF';
                    }
                } else {
                    const url = URL.createObjectURL(result.blob);
                    outputImage.src = url;
                    outputImage.style.display = 'block';
                    convertedBlob = result.blob;
                    convertedDataURL = result.data || null;
                    outputLabel.textContent = 'Image';
                }

                downloadBtn.disabled = false;
                downloadBtn.dataset.ext = result.ext || getExtension(format);
                downloadBtn.dataset.format = format;
            }

            function downloadResult() {
                const format = downloadBtn.dataset.format || selectedFormat;
                const ext = downloadBtn.dataset.ext || getExtension(format);

                if (format === 'base64' && convertedDataURL) {
                    const blob = new Blob([convertedDataURL], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    const baseName = currentFile ? currentFile.name.replace(/\.[^.]+$/, '') : 'image';
                    a.download = baseName + '_base64.txt';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    return;
                }

                if (convertedBlob) {
                    const url = URL.createObjectURL(convertedBlob);
                    const a = document.createElement('a');
                    a.href = url;
                    const baseName = currentFile ? currentFile.name.replace(/\.[^.]+$/, '') : 'converted';
                    a.download = baseName + '.' + ext;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    setTimeout(() => URL.revokeObjectURL(url), 5000);
                }
            }

            copyBtn.addEventListener('click', () => {
                if (base64Text.value) {
                    navigator.clipboard.writeText(base64Text.value).then(() => {
                        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                        setTimeout(() => { copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy'; }, 1800);
                    }).catch(() => {
                        base64Text.select();
                        document.execCommand('copy');
                        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                        setTimeout(() => { copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy'; }, 1800);
                    });
                }
            });

            // ─── Event listeners ───
            fileInput.addEventListener('change', (e) => {
                if (e.target.files.length) {
                    if (currentMode === 'batch') {
                        for (const f of e.target.files) addBatchFile(f);
                    } else if (currentMode === 'merge') {
                        for (const f of e.target.files) {
                            if (f.type === 'application/pdf') addMergeFile(f);
                            else alert(`${f.name} is not a PDF.`);
                        }
                    } else if (e.target.files.length === 1) {
                        handleFile(e.target.files[0]);
                    } else {
                        alert('Please select only one file for Convert mode.');
                    }
                }
                e.target.value = '';
            });

            dropZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropZone.classList.add('dragover');
            });
            dropZone.addEventListener('dragleave', () => {
                dropZone.classList.remove('dragover');
            });
            dropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                dropZone.classList.remove('dragover');
                if (e.dataTransfer.files.length) {
                    if (currentMode === 'batch') {
                        for (const f of e.dataTransfer.files) addBatchFile(f);
                    } else if (currentMode === 'merge') {
                        for (const f of e.dataTransfer.files) {
                            if (f.type === 'application/pdf') addMergeFile(f);
                            else alert(`${f.name} is not a PDF.`);
                        }
                    } else if (e.dataTransfer.files.length === 1) {
                        handleFile(e.dataTransfer.files[0]);
                    } else {
                        alert('Please drop only one file for Convert mode.');
                    }
                }
            });

            convertBtn.addEventListener('click', doConvert);
            downloadBtn.addEventListener('click', downloadResult);

            batchConvertBtn.addEventListener('click', batchConvertAll);
            batchClearBtn.addEventListener('click', clearBatch);

            mergeBtn.addEventListener('click', executeMerge);
            mergeClearBtn.addEventListener('click', clearMerge);

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !convertBtn.disabled && document.activeElement?.tagName !== 'TEXTAREA') {
                    convertBtn.click();
                }
            });

            // ─── INIT ───
            // Wait for DOM to be fully ready before initializing
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', init);
            } else {
                init();
            }

            function init() {
                renderPopularFormats();
                // Ensure initial mode is 'convert' and render pills
                setMode('convert');
                // Also render pills explicitly in case setMode didn't (it should)
                renderPills('convert');
                console.log('🔄 Converter Pro ready!');
            }

        })();
    