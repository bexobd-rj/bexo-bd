const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const uiRegex = /<div class="space-y-2">\s*<label class="text-\[10px\] uppercase font-black text-slate-400 tracking-widest">ইউটিউব ভিডিও \(Product Video URL\)<\/label>\s*<input type="text" id="apVideoUrl" value="\$\{p \? \(p\.videoUrl \|\| ''\) : ''\}" oninput="handleVideoPreview\(this\.value\)" class="w-full px-6 py-3\.5 bg-slate-50 border border-transparent rounded-xl outline-none focus:border-orange-500 font-bold text-sm transition-all" placeholder="YouTube Link \/ Video ID \/ Embed Code">/g;

const newUi = `<div class="space-y-2 relative">
                                                          <label class="text-[10px] uppercase font-black text-slate-400 tracking-widest flex items-center justify-between">
                                                              <span>ইউটিউব ভিডিও (Product Video URL)</span>
                                                              <a href="\${p && p.videoUrl ? 'https://www.youtube.com/watch?v=' + p.videoUrl : '#'}" target="_blank" rel="noopener noreferrer" id="openYoutubeBtn" class="\${p && p.videoUrl ? '' : 'hidden'} text-[10px] font-black text-red-600 bg-red-50 px-3 py-1 rounded-full hover:bg-red-100 transition-colors flex items-center gap-1">
                                                                  <i class="fab fa-youtube text-red-600"></i> Open in YouTube
                                                              </a>
                                                          </label>
                                                          <input type="text" id="apVideoUrl" value="\${p ? (p.videoUrl || '') : ''}" oninput="handleVideoPreview(this.value)" class="w-full px-6 py-3.5 bg-slate-50 border border-transparent rounded-xl outline-none focus:border-orange-500 font-bold text-sm transition-all pr-32" placeholder="YouTube Link / Video ID / Embed Code">`;

html = html.replace(uiRegex, newUi);

const jsRegex = /window\.handleVideoPreview = function\(val\) \{[\s\S]*?if \(!val \|\| val\.trim\(\) === ''\) \{[\s\S]*?container\.classList\.add\('hidden'\);[\s\S]*?iframe\.src = '';[\s\S]*?return;[\s\S]*?\}[\s\S]*?const videoId = extractYouTubeId\(val\);[\s\S]*?if \(videoId && videoId\.length === 11\) \{[\s\S]*?container\.classList\.remove\('hidden'\);[\s\S]*?loading\.classList\.remove\('hidden'\);[\s\S]*?setTimeout\(\(\) => \{[\s\S]*?iframe\.src = 'https:\/\/www\.youtube\.com\/embed\/' \+ videoId;[\s\S]*?loading\.classList\.add\('hidden'\);[\s\S]*?\}, 400\);[\s\S]*?\} else \{[\s\S]*?container\.classList\.add\('hidden'\);[\s\S]*?iframe\.src = '';[\s\S]*?\}[\s\S]*?\};/;

const newJs = `window.handleVideoPreview = function(val) {
                  const container = document.getElementById('videoPreviewContainer');
                  const iframe = document.getElementById('videoPreviewIframe');
                  const loading = document.getElementById('videoLoadingState');
                  const openBtn = document.getElementById('openYoutubeBtn');
                  
                  if (!val || val.trim() === '') {
                      container.classList.add('hidden');
                      iframe.src = '';
                      if (openBtn) openBtn.classList.add('hidden');
                      return;
                  }
                  
                  const videoId = extractYouTubeId(val);
                  
                  if (videoId && videoId.length === 11) {
                      container.classList.remove('hidden');
                      loading.classList.remove('hidden');
                      
                      if (openBtn) {
                          openBtn.href = 'https://www.youtube.com/watch?v=' + videoId;
                          openBtn.classList.remove('hidden');
                      }
                      
                      // Simulate short loading to show processing
                      setTimeout(() => {
                          iframe.src = 'https://www.youtube.com/embed/' + videoId;
                          loading.classList.add('hidden');
                      }, 400);
                  } else {
                      container.classList.add('hidden');
                      iframe.src = '';
                      if (openBtn) openBtn.classList.add('hidden');
                  }
              };`;

html = html.replace(jsRegex, newJs);

fs.writeFileSync('index.html', html);
