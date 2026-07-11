const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// In loadLandingProducts, categories:
const oldCatHtml = `
                return \`
                  <div onclick="selectLandingCategory('\${cat}')" class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center group">
                    <div class="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-slate-50 border border-slate-100 mb-4 flex items-center justify-center relative shadow-inner">
                      <img src="\${imageUrl}" alt="\${cat}" referrerpolicy="no-referrer" loading="lazy" class="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" onerror="this.src='https://via.placeholder.com/150'">
                    </div>
                    <h4 class="text-sm font-bold text-slate-700 group-hover:text-orange-600 transition-colors leading-tight line-clamp-2">\${cat}</h4>
                    <span class="text-[10px] text-slate-400 mt-2 font-bold bg-slate-100 px-2.5 py-1 rounded-full group-hover:bg-orange-50 group-hover:text-orange-600 transition-all">
                       \${count} টি প্রোডাক্ট
                    </span>
                  </div>
                \`;
`;

const newCatHtml = `
                return \`
                  <div onclick="selectLandingCategory('\${cat}')" class="bg-white rounded flex flex-col items-center p-1.5 shadow-sm cursor-pointer relative group border border-transparent hover:shadow-md transition-all">
                    <div class="absolute top-1 right-1.5 text-[10px] font-bold text-[#6a1b9a] z-10">\${typeof toBengaliNumber === 'function' ? toBengaliNumber(count) : count}</div>
                    <div class="w-full aspect-square flex items-center justify-center p-2 mb-1">
                      <img src="\${imageUrl}" alt="\${cat}" referrerpolicy="no-referrer" loading="lazy" class="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500" onerror="this.src='https://via.placeholder.com/150'">
                    </div>
                    <div class="text-center w-full pb-1">
                      <p class="text-[11px] sm:text-[12px] font-semibold text-[#6a1b9a] truncate">\${cat}</p>
                    </div>
                  </div>
                \`;
`;

html = html.replace(oldCatHtml, newCatHtml);

// And update the landing product card
const oldLandProd = `
              <div class="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden p-3 group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col font-bold cursor-pointer" onclick="showAuth(false)">
                <div class="relative w-full aspect-square rounded-lg overflow-hidden mb-3 bg-white">
                  <img src="\${mainImg}" alt="\${title}" referrerpolicy="no-referrer" loading="lazy" class="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700" onerror="this.src='https://via.placeholder.com/150'">
                </div>
                <div class="space-y-1 mb-2 flex-grow px-1 text-left">
                  <h3 class="text-[12px] font-bold text-slate-600 line-clamp-2 leading-snug">\${title}</h3>
                  <div class="flex items-center gap-1.5 mt-1">
                    <span class="text-[10px] font-bold text-slate-400">প্রাইস</span>
                    <span class="text-[12px] font-black text-pink-600">৳\${price}</span>
                  </div>
                </div>
                <button class="w-full py-1.5 bg-orange-50 hover:bg-orange-500 hover:text-white text-orange-600 rounded-lg text-[11px] font-bold transition-all border border-orange-100 mt-1">
                  বিস্তারিত দেখুন
                </button>
              </div>
`;

const newLandProd = `
              <div class="bg-white rounded flex flex-col items-center p-1.5 shadow-sm cursor-pointer relative group border border-transparent hover:shadow-md transition-all" onclick="showAuth(false)">
                  <div class="absolute top-1 right-1.5 text-[10px] sm:text-[12px] font-bold text-[#6a1b9a] z-10">\${typeof toBengaliNumber === 'function' ? toBengaliNumber(price) : price}</div>
                  <div class="w-full aspect-square flex items-center justify-center p-2 mb-1 relative overflow-hidden">
                      <img src="\${mainImg}" alt="\${title}" referrerpolicy="no-referrer" loading="lazy" class="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500" onerror="this.src='https://via.placeholder.com/150'">
                  </div>
                  <div class="text-center w-full pb-1">
                      <p class="text-[11px] sm:text-[12px] font-semibold text-[#6a1b9a] truncate">\${title}</p>
                  </div>
              </div>
`;
html = html.replace(oldLandProd, newLandProd);

// Change grid columns for landing
html = html.replace(
    'class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6"',
    'class="grid grid-cols-3 min-[400px]:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1.5 md:gap-3"'
);
html = html.replace(
    '<div id="landingProductsGrid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6 w-full">',
    '<div id="landingProductsGrid" class="grid grid-cols-3 min-[400px]:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1.5 md:gap-3 w-full">'
);

fs.writeFileSync('index.html', html);
