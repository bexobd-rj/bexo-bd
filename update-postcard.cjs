const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const regexPostCard = /function renderPostCard\(p, imgIdx = 0, isStockOutPage = false\) \{([\s\S]*?)\}/;

const targetPostCard = `function renderPostCard(p, imgIdx = 0, isStockOutPage = false) {
                  const isFav = (userProfile && userProfile.favorites && userProfile.favorites.includes(\`\${p.id}-\${imgIdx}\`));
                  const mainImg = (p.images && p.images.length > 0) ? (p.images[imgIdx] || p.images[0]) : 'https://picsum.photos/seed/placeholder/400/400';
                  const productStockOut = p.isStockOut || (p.stockCount !== undefined && p.stockCount <= 0);

                  const isLoggedInUser = userProfile && userProfile.phone && userProfile.password;
                  
                  const priceHtml = isLoggedInUser 
                      ? \`<div class="flex items-center gap-1.5"><span class="text-[10px] font-bold text-slate-400">প্রাইস</span><span class="text-[11px] font-black text-pink-600">৳\${p.price}</span></div>\` 
                      : \`<div class="flex items-center gap-1.5"><span class="text-[10px] font-bold text-slate-400">প্রাইস: </span><span class="text-[10px] font-bold text-rose-500"><i class="fas fa-lock text-[9px] mr-1"></i>লগইন করুন</span></div>\`;
                  
                  const clickAction = isLoggedInUser ? \`renderPostDetail('\${p.id}', \${imgIdx})\` : \`showAuth(true)\`;

                  return \`
                  <div class="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden p-3 group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col font-bold">
                      <div class="relative w-full aspect-square rounded-lg overflow-hidden mb-3 bg-white cursor-pointer" onclick="\${clickAction}">
                          <img src="\${mainImg}" alt="\${p.title}" referrerpolicy="no-referrer" loading="lazy" class="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700">
                          \${(isStockOutPage || productStockOut) ? '<div class="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center"><span class="text-[9px] font-black text-white uppercase tracking-widest border-2 border-white/60 px-4 py-1.5 rounded-full">স্টক আউট</span></div>' : ''}
                      </div>
                      <div class="space-y-1 mb-4 flex-grow px-1">
                          <h3 class="text-[11px] font-bold text-slate-500 truncate cursor-pointer" onclick="\${clickAction}">\${p.title}</h3>
                          \${priceHtml}
                      </div>
                      <div class="grid grid-cols-2 gap-2">
                          <button onclick="\${isLoggedInUser ? \`downloadImage('\${mainImg}')\` : \`showAuth(true)\`}" class="bg-slate-50 text-emerald-600 py-2 rounded-lg border border-slate-100 transition-all flex items-center justify-center hover:bg-emerald-500 hover:text-white hover:border-emerald-500 group/btn">
                              <i class="fas fa-download text-xs transition-transform group-hover/btn:scale-110"></i>
                          </button>
                          <button onclick="\${isLoggedInUser ? \`toggleFavorite('\${p.id}', \${imgIdx})\` : \`showAuth(true)\`}" class="py-2 rounded-lg border transition-all flex items-center justify-center group/btn \${isFav ? 'bg-rose-50 text-rose-500 border-rose-100' : 'bg-slate-50 text-slate-400 border-slate-100 font-medium'} hover:bg-rose-500 hover:text-white hover:border-rose-500">
                              <i class="\${isFav ? 'fas animate-bounce-short' : 'far'} fa-heart text-xs transition-transform group-hover/btn:scale-110"></i>
                          </button>
                      </div>
                  </div>
                  \`;
              }`;

html = html.replace(regexPostCard, targetPostCard);
fs.writeFileSync('index.html', html);
console.log("Updated renderPostCard");
