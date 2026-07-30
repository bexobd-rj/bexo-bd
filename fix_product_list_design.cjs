const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const oldProductListHtml = `
                      return \`
                          <div class="space-y-4 animate-fade-in">
                              <div class="bg-white/60 py-2.5 px-4 rounded-xl text-center border border-white/40 shadow-sm backdrop-blur-sm">
                                  <h3 class="text-[13px] font-black text-pink-600 tracking-tight">\${cat.name} (\${totalInCat})</h3>
                              </div>
                              <div class="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-3">
                                  \${subsHtml}
                              </div>
                          </div>
                      \`;`;

const newProductListHtml = `
                      return \`
                          <div class="space-y-4 animate-fade-in mt-6">
                              <div class="py-2 px-4 text-center">
                                  <h3 class="text-[16px] sm:text-[18px] font-bold text-[#d81b60] tracking-tight">\${cat.name} (\${toBengaliNumber(totalInCat)})</h3>
                              </div>
                              <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 md:gap-3">
                                  \${subsHtml}
                              </div>
                          </div>
                      \`;`;

html = html.replace(oldProductListHtml, newProductListHtml);
if (html.includes(newProductListHtml)) {
    console.log("Successfully updated category header and grid");
} else {
    console.log("Failed to update category header");
}

const oldSubCard = `
                          return \`
                              <div onclick="renderProductList('\${cat.name}', '\${sub.name}')" class="bg-white rounded-lg border border-slate-50 flex flex-col items-center justify-between p-2 shadow-sm transition-all hover:shadow-md cursor-pointer relative group">
                                  <div class="absolute top-1 right-1 bg-slate-50 text-[8px] font-black text-slate-300 px-1.5 py-0.5 rounded-full z-10 transition-colors group-hover:bg-orange-100 group-hover:text-orange-600">\${count}</div>
                                  <div class="w-20 h-20 flex items-center justify-center p-1.5">
                                      <img src="\${image}" alt="\${sub.name}" class="max-w-full max-h-full object-contain transition-transform group-hover:scale-110 duration-500">
                                  </div>
                                  <div class="mt-1 text-center w-full">
                                      <p class="text-[9px] font-black text-slate-500 truncate translate-y-0.5 transition-colors group-hover:text-pink-600">\${sub.name}</p>
                                  </div>
                              </div>
                          \`;
`;

const newSubCard = `
                          return \`
                              <div onclick="renderProductList('\${cat.name}', '\${sub.name}')" class="bg-white rounded flex flex-col items-center p-1.5 shadow-sm cursor-pointer relative group border border-transparent">
                                  <div class="absolute top-1 right-1.5 text-[10px] font-bold text-[#6a1b9a] z-10">\${toBengaliNumber(count)}</div>
                                  <div class="w-full aspect-square flex items-center justify-center p-2 mb-1">
                                      <img src="\${image}" alt="\${sub.name}" class="w-full h-full object-contain mix-blend-multiply">
                                  </div>
                                  <div class="text-center w-full pb-1">
                                      <p class="text-[11px] sm:text-[12px] font-semibold text-[#6a1b9a] truncate">\${sub.name}</p>
                                  </div>
                              </div>
                          \`;
`;

html = html.replace(oldSubCard, newSubCard);
if (html.includes(newSubCard)) {
    console.log("Successfully updated subcard");
} else {
    console.log("Failed to update subcard");
}

fs.writeFileSync('index.html', html);
