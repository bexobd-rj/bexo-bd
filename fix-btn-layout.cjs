const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const regex = /<label class="text-\[10px\] uppercase font-black text-slate-400 tracking-widest flex items-center justify-between">\s*<span>ইউটিউব ভিডিও \(Product Video URL\)<\/span>\s*<a href="\$\{p && p\.videoUrl \? 'https:\/\/www\.youtube\.com\/watch\?v=' \+ p\.videoUrl : '#'}" target="_blank" rel="noopener noreferrer" id="openYoutubeBtn" class="\$\{p && p\.videoUrl \? '' : 'hidden'\} text-\[10px\] font-black text-red-600 bg-red-50 px-3 py-1 rounded-full hover:bg-red-100 transition-colors flex items-center gap-1">\s*<i class="fab fa-youtube text-red-600"><\/i> Open in YouTube\s*<\/a>\s*<\/label>\s*<input type="text" id="apVideoUrl" value="\$\{p \? \(p\.videoUrl \|\| ''\) : ''\}" oninput="handleVideoPreview\(this\.value\)" class="w-full px-6 py-3\.5 bg-slate-50 border border-transparent rounded-xl outline-none focus:border-orange-500 font-bold text-sm transition-all pr-32" placeholder="YouTube Link \/ Video ID \/ Embed Code">\s*<div id="videoPreviewContainer" class="\$\{p && p\.videoUrl \? '' : 'hidden'\} mt-4">\s*<label class="text-\[10px\] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2"><i class="fas fa-eye text-emerald-500"><\/i> ভিডিও প্রিভিউ \(Video Preview\)<\/label>\s*<div class="aspect-video w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shadow-sm relative">\s*<div id="videoLoadingState" class="hidden absolute inset-0 flex items-center justify-center bg-slate-900\/80 z-10 text-white backdrop-blur-sm">\s*<i class="fas fa-spinner fa-spin text-2xl text-orange-500"><\/i>\s*<\/div>\s*<iframe id="videoPreviewIframe" class="w-full h-full" src="\$\{p && p\.videoUrl \? 'https:\/\/www\.youtube\.com\/embed\/' \+ p\.videoUrl : ''\}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen><\/iframe>\s*<\/div>\s*<\/div>/g;

const newHtml = `<label class="text-[10px] uppercase font-black text-slate-400 tracking-widest flex items-center justify-between">
                                                              <span>ইউটিউব ভিডিও (Product Video URL)</span>
                                                          </label>
                                                          <input type="text" id="apVideoUrl" value="\${p ? (p.videoUrl || '') : ''}" oninput="handleVideoPreview(this.value)" class="w-full px-6 py-3.5 bg-slate-50 border border-transparent rounded-xl outline-none focus:border-orange-500 font-bold text-sm transition-all" placeholder="YouTube Link / Video ID / Embed Code">
                                                          
                                                          <div id="videoPreviewContainer" class="\${p && p.videoUrl ? '' : 'hidden'} mt-4 space-y-3">
                                                              <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><i class="fas fa-eye text-emerald-500"></i> ভিডিও প্রিভিউ (Video Preview)</label>
                                                              <div class="aspect-video w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shadow-sm relative">
                                                                  <div id="videoLoadingState" class="hidden absolute inset-0 flex items-center justify-center bg-slate-900/80 z-10 text-white backdrop-blur-sm">
                                                                      <i class="fas fa-spinner fa-spin text-2xl text-orange-500"></i>
                                                                  </div>
                                                                  <iframe id="videoPreviewIframe" class="w-full h-full" src="\${p && p.videoUrl ? 'https://www.youtube.com/embed/' + p.videoUrl : ''}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
                                                              </div>
                                                              <a href="\${p && p.videoUrl ? 'https://www.youtube.com/watch?v=' + p.videoUrl : '#'}" target="_blank" rel="noopener noreferrer" id="openYoutubeBtn" class="w-full py-3 bg-red-50 text-red-600 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-100 transition-colors border border-red-100 shadow-sm">
                                                                  <i class="fab fa-youtube text-lg"></i> Open in YouTube
                                                              </a>
                                                          </div>`;

html = html.replace(regex, newHtml);
fs.writeFileSync('index.html', html);
