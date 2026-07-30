const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const targetStr = `                                   <!-- Right: Product Controls -->
                                   <div class="bg-white p-6 lg:p-10 rounded-2xl border border-slate-100 shadow-sm space-y-5">
                                       \${p.sku ? \`
                                       <div class="flex items-center justify-between border-b border-dashed border-slate-100 pb-4">
                                           <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">SKU / কোড:</p>
                                           <span class="text-[11px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 tracking-widest uppercase">\${p.sku}</span>
                                       </div>
                                       \` : ''}`;

const newStr = `                                   <!-- Right: Product Controls -->
                                   <div class="bg-white p-6 lg:p-10 rounded-2xl border border-slate-100 shadow-sm space-y-5">
                                       <div class="space-y-2 mb-4">
                                           <h1 class="text-xl md:text-2xl font-black text-slate-800 leading-tight">\${p.title}</h1>
                                           <div class="flex items-center gap-1 text-amber-400 text-sm">
                                               \${Array(p.rating || 5).fill('<i class="fas fa-star"></i>').join('')}\${Array(5 - (p.rating || 5)).fill('<i class="far fa-star"></i>').join('')}
                                               <span class="text-xs text-slate-400 font-bold ml-2">(\${p.rating || 5} স্টার রেটিং)</span>
                                           </div>
                                       </div>
                                       \${p.sku ? \`
                                       <div class="flex items-center justify-between border-b border-dashed border-slate-100 pb-4">
                                           <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">SKU / কোড:</p>
                                           <span class="text-[11px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 tracking-widest uppercase">\${p.sku}</span>
                                       </div>
                                       \` : ''}`;

if (html.includes(targetStr)) {
    html = html.replace(targetStr, newStr);
    fs.writeFileSync('index.html', html);
    console.log("Fixed product detail title and rating.");
} else {
    console.log("Could not find product detail target.");
}
