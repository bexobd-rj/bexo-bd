const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Replace the main image drag-and-drop label to have drag events
const mainImageLabelRegex = /<label for="adminImageInput" class="w-full aspect-square border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-orange-50 hover:border-orange-200 transition-all group overflow-hidden relative">/;
html = html.replace(mainImageLabelRegex, `<label for="adminImageInput" id="mainImageDropzone" ondragover="event.preventDefault(); this.classList.add('border-orange-400', 'bg-orange-50')" ondragleave="event.preventDefault(); this.classList.remove('border-orange-400', 'bg-orange-50')" ondrop="handleMainImageDrop(event)" class="w-full aspect-square border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-orange-50 hover:border-orange-200 transition-all group overflow-hidden relative">`);

const galleryInputRegex = /<div class="space-y-4">\s*<div class="space-y-2">\s*<label class="text-\[10px\] uppercase font-black text-slate-400 tracking-widest">ছবির লিঙ্ক \(ম্যানুয়াল\)<\/label>[\s\S]*?(?=<div class="space-y-2">\s*<label class="text-\[10px\] uppercase font-black text-slate-400 tracking-widest">বিস্তারিত তথ্য \(টেকনিক্যাল ডিটেইলস\)<\/label>)/;

const newGalleryHtml = `<div class="space-y-4" id="dynamicGalleryContainer">
                                                      <div class="space-y-3">
                                                          <label class="text-[10px] uppercase font-black text-slate-400 tracking-widest flex items-center justify-between">
                                                              <span>গ্যালারি ছবি (Sub-Images)</span>
                                                          </label>
                                                          
                                                          <!-- Hidden textarea for backward compatibility with backend save logic -->
                                                          <textarea id="apImages" class="hidden">\${p && p.images && p.images.length > 1 ? p.images.slice(1).join('\\n') : ''}</textarea>
                                                          
                                                          <div id="galleryInputsList" class="space-y-3">
                                                              <!-- Inputs will be injected here -->
                                                          </div>
                                                          
                                                          <button type="button" onclick="addGalleryImageField()" class="w-full py-3 border-2 border-dashed border-slate-200 bg-slate-50 rounded-xl text-slate-500 font-bold text-xs hover:border-orange-400 hover:text-orange-500 hover:bg-orange-50 transition-all flex items-center justify-center gap-2">
                                                              <i class="fas fa-plus"></i> Add Another Image
                                                          </button>

                                                          \${!p ? \`<div class="flex items-center gap-2 mt-4 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                                              <label class="relative inline-flex items-center cursor-pointer">
                                                                  <input type="checkbox" id="apBulkUpload" class="sr-only peer">
                                                                  <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500"></div>
                                                              </label>
                                                              <span class="text-[11px] font-bold text-slate-600">প্রতিটি ছবির জন্য আলাদা প্রোডাক্ট তৈরি করুন (Bulk Upload)</span>
                                                          </div>\` : ''}
                                                      </div>
                                                  </div>
                                                  `;

html = html.replace(galleryInputRegex, newGalleryHtml);

const initCallRegex = /addAdminVariantGroup\('Size', true, \['M', 'L', 'XL'\]\);\s*\}\s*\}/;
html = html.replace(initCallRegex, `addAdminVariantGroup('Size', true, ['M', 'L', 'XL']);\n                  }\n                  initGalleryFields();\n              }`);

const jsScripts = `
              // --- Dynamic Gallery Image Logic ---
              window.galleryImageCount = 0;
              window.galleryImagesData = [];

              window.initGalleryFields = function() {
                  window.galleryImageCount = 0;
                  const ta = document.getElementById('apImages');
                  if (!ta) return;
                  const initialUrls = ta.value.split(/\\n/).map(l => l.trim()).filter(l => l !== '');
                  window.galleryImagesData = [];
                  const list = document.getElementById('galleryInputsList');
                  if (list) list.innerHTML = '';
                  if (initialUrls.length > 0) {
                      initialUrls.forEach(url => addGalleryImageField(url));
                  } else {
                      addGalleryImageField(); // start with one
                  }
              };

              window.syncGalleryToTextarea = function() {
                  const ta = document.getElementById('apImages');
                  if (ta) {
                      ta.value = window.galleryImagesData.filter(v => v).join('\\n');
                  }
              };

              window.handleMainImageDrop = function(event) {
                  event.preventDefault();
                  event.currentTarget.classList.remove('border-orange-400', 'bg-orange-50');
                  const file = event.dataTransfer.files[0];
                  if (file && file.type.startsWith('image/')) {
                      const input = document.getElementById('adminImageInput');
                      const dataTransfer = new DataTransfer();
                      dataTransfer.items.add(file);
                      input.files = dataTransfer.files;
                      handleAdminImageSelect({ target: input });
                  }
              };

              window.addGalleryImageField = function(initialValue = '') {
                  const list = document.getElementById('galleryInputsList');
                  if (!list) return;

                  const idx = window.galleryImageCount++;
                  window.galleryImagesData[idx] = initialValue;

                  const div = document.createElement('div');
                  div.className = "flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm group animate-fade-in relative w-full";
                  div.id = \`gallery-item-\${idx}\`;

                  div.innerHTML = \`
                      <div class="w-16 h-16 shrink-0 bg-slate-50 border border-slate-200 rounded-lg overflow-hidden flex flex-col items-center justify-center relative cursor-pointer hover:bg-slate-100 transition-all" 
                           ondragover="event.preventDefault(); this.classList.add('border-orange-400')" 
                           ondragleave="event.preventDefault(); this.classList.remove('border-orange-400')" 
                           ondrop="handleGalleryDrop(event, \${idx})"
                           onclick="document.getElementById('gallery-file-\${idx}').click()">
                          <img id="gallery-preview-\${idx}" src="\${initialValue}" class="\${initialValue ? '' : 'hidden'} w-full h-full object-cover absolute inset-0 z-10 bg-white" alt="preview">
                          <i class="fas fa-cloud-upload-alt text-slate-300 text-xl z-0 group-hover:text-orange-400 transition-colors"></i>
                          <div class="absolute inset-0 bg-black/50 z-20 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                              <span class="text-[8px] text-white font-bold uppercase text-center leading-tight">Upload<br>File</span>
                          </div>
                          <input type="file" id="gallery-file-\${idx}" class="hidden" accept="image/*" onchange="handleGalleryFile(event, \${idx})">
                      </div>
                      <div class="flex-1 w-full flex flex-col gap-2">
                          <input type="text" id="gallery-url-\${idx}" value="\${initialValue}" oninput="handleGalleryUrlInput(event, \${idx})" class="w-full px-3 py-2 bg-slate-50 border border-transparent rounded-lg outline-none focus:border-orange-500 font-bold text-xs transition-all font-mono" placeholder="Image URL (Or click/drop file left)">
                      </div>
                      <button type="button" onclick="removeGalleryImageField(\${idx})" class="w-8 h-8 shrink-0 flex items-center justify-center rounded-lg text-slate-300 hover:bg-rose-50 hover:text-rose-500 transition-colors">
                          <i class="fas fa-trash-alt"></i>
                      </button>
                  \`;
                  list.appendChild(div);
                  syncGalleryToTextarea();
              };

              window.handleGalleryFile = function(event, idx) {
                  const file = event.target.files[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (e) => {
                      const res = e.target.result;
                      window.galleryImagesData[idx] = res;
                      const preview = document.getElementById(\`gallery-preview-\${idx}\`);
                      if (preview) {
                          preview.src = res;
                          preview.classList.remove('hidden');
                      }
                      const urlInput = document.getElementById(\`gallery-url-\${idx}\`);
                      if (urlInput) {
                          urlInput.value = 'Data URI (Local File)';
                          urlInput.classList.add('text-slate-400', 'bg-slate-100');
                          urlInput.readOnly = true;
                      }
                      syncGalleryToTextarea();
                  };
                  reader.readAsDataURL(file);
              };

              window.handleGalleryDrop = function(event, idx) {
                  event.preventDefault();
                  event.currentTarget.classList.remove('border-orange-400');
                  const file = event.dataTransfer.files[0];
                  if (file && file.type.startsWith('image/')) {
                      const input = document.getElementById(\`gallery-file-\${idx}\`);
                      const dataTransfer = new DataTransfer();
                      dataTransfer.items.add(file);
                      input.files = dataTransfer.files;
                      window.handleGalleryFile({ target: input }, idx);
                  }
              };

              window.handleGalleryUrlInput = function(event, idx) {
                  const val = event.target.value.trim();
                  window.galleryImagesData[idx] = val;
                  const preview = document.getElementById(\`gallery-preview-\${idx}\`);
                  if (preview) {
                      if (val) {
                          preview.src = val;
                          preview.classList.remove('hidden');
                      } else {
                          preview.src = '';
                          preview.classList.add('hidden');
                      }
                  }
                  syncGalleryToTextarea();
              };

              window.removeGalleryImageField = function(idx) {
                  const item = document.getElementById(\`gallery-item-\${idx}\`);
                  if (item) item.remove();
                  window.galleryImagesData[idx] = '';
                  syncGalleryToTextarea();
              };
`;

const jsInsertionPoint = /function changeUserPlan\(id, isPremium\) \{/;
html = html.replace(jsInsertionPoint, jsScripts + '\n              function changeUserPlan(id, isPremium) {');

fs.writeFileSync('index.html', html);
