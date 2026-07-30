const fs = require('fs');
let content = fs.readFileSync('main_script.js', 'utf8');

const subcatAddPattern = `<div class="space-y-1">
                                  <label class="text-\\[10px\\] font-bold text-slate-400 uppercase tracking-widest ml-1">ছবি URL</label>
                                  <input type="text" id="manageSubImage" class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-orange-500 font-bold text-sm" placeholder="https://...">
                              </div>`;

const subcatAddReplace = `<div class="space-y-1">
                                  <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">ছবি আপলোড</label>
                                  <div class="flex gap-2">
                                      <input type="file" accept="image/*" id="manageSubImageFile" class="hidden" onchange="window.handleSubCategoryImageUpload(event, 'manageSubImage')">
                                      <button type="button" onclick="document.getElementById('manageSubImageFile').click()" class="px-4 py-3 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
                                          <i class="fas fa-image"></i> গ্যালারি
                                      </button>
                                      <input type="text" id="manageSubImage" class="flex-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-orange-500 font-bold text-sm" placeholder="URL অথবা গ্যালারি থেকে ছবি নিন...">
                                  </div>
                                  <div id="manageSubImagePreviewContainer" class="hidden mt-2">
                                      <img id="manageSubImagePreview" src="" class="h-20 w-20 object-cover rounded-xl border border-slate-200">
                                  </div>
                              </div>`;

content = content.replace(subcatAddPattern, subcatAddReplace);


const subcatEditPattern = /<div class="space-y-1">\s*<label class="text-\[10px\] font-bold text-slate-400 uppercase tracking-widest ml-1">ছবি URL \(সাব-ক্যাটাগরির জন্য\)<\/label>\s*<input type="text" id="manageCatImage" value="\$\{imageVal\}" class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-orange-500 font-bold text-sm" placeholder="https:\/\/...">\s*<\/div>/g;

const subcatEditReplace = `<div class="space-y-1">
                                  <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">ছবি আপলোড (সাব-ক্যাটাগরির জন্য)</label>
                                  <div class="flex flex-col sm:flex-row gap-2">
                                      <input type="file" accept="image/*" id="manageCatImageFile" class="hidden" onchange="window.handleSubCategoryImageUpload(event, 'manageCatImage')">
                                      <button type="button" onclick="document.getElementById('manageCatImageFile').click()" class="px-4 py-3 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2 whitespace-nowrap">
                                          <i class="fas fa-image"></i> গ্যালারি
                                      </button>
                                      <input type="text" id="manageCatImage" value="\${imageVal}" class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-orange-500 font-bold text-sm" placeholder="URL অথবা গ্যালারি থেকে ছবি নিন...">
                                  </div>
                                  <div id="manageCatImagePreviewContainer" class="\${imageVal ? 'mt-2' : 'hidden mt-2'}">
                                      <img id="manageCatImagePreview" src="\${imageVal}" class="h-20 w-20 object-cover rounded-xl border border-slate-200">
                                  </div>
                              </div>`;

content = content.replace(subcatEditPattern, subcatEditReplace);


// Add the global handler function
const scriptAppend = `
// Image upload handler for subcategories
window.handleSubCategoryImageUpload = function(event, inputId) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Check file size (max 2MB for thumbnails)
    if (file.size > 2 * 1024 * 1024) {
        showToast("ফাইলের আকার ২ মেগাবাইটের বেশি হওয়া যাবে না!", "error");
        event.target.value = '';
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        // Compress image using canvas
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 300;
            const MAX_HEIGHT = 300;
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
            } else {
                if (height > MAX_HEIGHT) {
                    width *= MAX_HEIGHT / height;
                    height = MAX_HEIGHT;
                }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
            
            // Apply to input
            document.getElementById(inputId).value = compressedBase64;
            
            // Apply to preview
            const previewContainer = document.getElementById(inputId + 'PreviewContainer');
            const preview = document.getElementById(inputId + 'Preview');
            if (preview && previewContainer) {
                preview.src = compressedBase64;
                previewContainer.classList.remove('hidden');
            }
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
};
`;

content += scriptAppend;
fs.writeFileSync('main_script.js', content);
