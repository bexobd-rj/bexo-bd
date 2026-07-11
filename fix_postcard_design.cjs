const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const oldPostCardHtml = `                  return \`
                  <div class="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden p-3 group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col font-bold">
                      <div class="relative w-full aspect-square rounded-lg overflow-hidden mb-3 bg-white cursor-pointer" onclick="renderPostDetail('ake', 0)" style="display:none"></div>
                      <div class="relative w-full aspect-square rounded-lg overflow-hidden mb-3 bg-white cursor-pointer" onclick="renderPostDetail('\${p.id}', \${imgIdx})">
                          <img src="\${mainImg}" alt="\${p.title}" referrerpolicy="no-referrer" loading="lazy" class="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700">
                          \${(isStockOutPage || productStockOut) ? '<div class="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center"><span class="text-[9px] font-black text-white uppercase tracking-widest border-2 border-white/60 px-4 py-1.5 rounded-full">স্টক আউট</span></div>' : ''}
                      </div>
                      <div class="space-y-1 mb-4 flex-grow px-1">
                          <h3 class="text-[11px] font-bold text-slate-500 truncate">\${p.title}</h3>
                          <div class="flex items-center gap-1.5">
                              <span class="text-[10px] font-bold text-slate-400">প্রাইস</span>
                              <span class="text-[11px] font-black text-pink-600">৳\${p.price}</span>
                          </div>
                      </div>
                      <div class="grid grid-cols-2 gap-2">
                          <button onclick="downloadImage('\${mainImg}')" class="bg-slate-50 text-emerald-600 py-2 rounded-lg border border-slate-100 transition-all flex items-center justify-center hover:bg-emerald-500 hover:text-white hover:border-emerald-500 group/btn">
                              <i class="fas fa-download text-xs transition-transform group-hover/btn:scale-110"></i>
                          </button>
                          <button onclick="toggleFavorite('\${p.id}', \${imgIdx})" class="py-2 rounded-lg border transition-all flex items-center justify-center group/btn \${isFav ? 'bg-rose-50 text-rose-500 border-rose-100' : 'bg-slate-50 text-slate-400 border-slate-100 font-medium'} hover:bg-rose-500 hover:text-white hover:border-rose-500">
                              <i class="\${isFav ? 'fas animate-bounce-short' : 'far'} fa-heart text-xs transition-transform group-hover/btn:scale-110"></i>
                          </button>
                      </div>
                  </div>
                  \`;`;

const newPostCardHtml = `                  return \`
                  <div class="bg-white rounded flex flex-col items-center p-1.5 shadow-sm cursor-pointer relative group border border-transparent hover:shadow-md transition-all" onclick="renderPostDetail('\${p.id}', \${imgIdx})">
                      <div class="absolute top-1 right-1.5 text-[10px] sm:text-[12px] font-bold text-[#6a1b9a] z-10">\${toBengaliNumber(p.price)}</div>
                      <div class="w-full aspect-square flex items-center justify-center p-2 mb-1 relative overflow-hidden">
                          <img src="\${mainImg}" alt="\${p.title}" referrerpolicy="no-referrer" loading="lazy" class="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500">
                          \${(isStockOutPage || productStockOut) ? '<div class="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center"><span class="text-[9px] font-black text-white uppercase tracking-widest border-2 border-white/60 px-4 py-1.5 rounded-full">স্টক আউট</span></div>' : ''}
                      </div>
                      <div class="text-center w-full pb-1">
                          <p class="text-[11px] sm:text-[12px] font-semibold text-[#6a1b9a] truncate">\${p.title}</p>
                      </div>
                  </div>
                  \`;`;

html = html.replace(oldPostCardHtml, newPostCardHtml);

if (html.includes(newPostCardHtml)) {
    console.log("Successfully updated post card layout");
} else {
    console.log("Failed to update post card layout");
}

fs.writeFileSync('index.html', html);
