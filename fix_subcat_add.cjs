const fs = require('fs');
let content = fs.readFileSync('main_script.js', 'utf8');

const subcatAddPattern = /<div class="space-y-1">\s*<label class="text-\[10px\] font-bold text-slate-400 uppercase tracking-widest ml-1">ছবি URL<\/label>\s*<input type="text" id="manageSubImage" class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-orange-500 font-bold text-sm" placeholder="https:\/\/...">\s*<\/div>/g;

const subcatAddReplace = `<div class="space-y-1">
                                  <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">ছবি আপলোড</label>
                                  <div class="flex flex-col sm:flex-row gap-2">
                                      <input type="file" accept="image/*" id="manageSubImageFile" class="hidden" onchange="window.handleSubCategoryImageUpload(event, 'manageSubImage')">
                                      <button type="button" onclick="document.getElementById('manageSubImageFile').click()" class="px-4 py-3 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2 whitespace-nowrap">
                                          <i class="fas fa-image"></i> গ্যালারি
                                      </button>
                                      <input type="text" id="manageSubImage" class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-orange-500 font-bold text-sm" placeholder="URL অথবা গ্যালারি থেকে ছবি নিন...">
                                  </div>
                                  <div id="manageSubImagePreviewContainer" class="hidden mt-2">
                                      <img id="manageSubImagePreview" src="" class="h-20 w-20 object-cover rounded-xl border border-slate-200">
                                  </div>
                              </div>`;

content = content.replace(subcatAddPattern, subcatAddReplace);
fs.writeFileSync('main_script.js', content);
