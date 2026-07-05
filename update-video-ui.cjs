const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const regex = /<div class="space-y-2">\s*<label class="text-\[10px\] uppercase font-black text-slate-400 tracking-widest">ইউটিউব ভিডিও আইডি \(ঐচ্ছিক\)<\/label>\s*<input type="text" id="apVideoUrl" value="\$\{p \? \(p\.videoUrl \|\| ''\) : ''\}" class="w-full px-6 py-3\.5 bg-slate-50 border border-transparent rounded-xl outline-none focus:border-orange-500 font-bold text-sm transition-all" placeholder="YouTube Link \/ Video ID \/ Embed Code">\s*<\/div>/;

const replacement = `<div class="space-y-2">
                                                          <label class="text-[10px] uppercase font-black text-slate-400 tracking-widest">ইউটিউব ভিডিও (Product Video URL)</label>
                                                          <input type="text" id="apVideoUrl" value="\${p ? (p.videoUrl || '') : ''}" oninput="handleVideoPreview(this.value)" class="w-full px-6 py-3.5 bg-slate-50 border border-transparent rounded-xl outline-none focus:border-orange-500 font-bold text-sm transition-all" placeholder="YouTube Link / Video ID / Embed Code">
                                                          
                                                          <div id="videoPreviewContainer" class="\${p && p.videoUrl ? '' : 'hidden'} mt-4">
                                                              <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2"><i class="fas fa-eye text-emerald-500"></i> ভিডিও প্রিভিউ (Video Preview)</label>
                                                              <div class="aspect-video w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shadow-sm relative">
                                                                  <div id="videoLoadingState" class="hidden absolute inset-0 flex items-center justify-center bg-slate-900/80 z-10 text-white backdrop-blur-sm">
                                                                      <i class="fas fa-spinner fa-spin text-2xl text-orange-500"></i>
                                                                  </div>
                                                                  <iframe id="videoPreviewIframe" class="w-full h-full" src="\${p && p.videoUrl ? 'https://www.youtube.com/embed/' + p.videoUrl : ''}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
                                                              </div>
                                                          </div>
                                                      </div>`;

html = html.replace(regex, replacement);

fs.writeFileSync('index.html', html);
