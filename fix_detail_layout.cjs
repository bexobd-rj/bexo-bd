const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const oldLayout = `                                   <!-- Right: Product Controls -->
                                   <div class="bg-white p-6 lg:p-10 rounded-2xl border border-slate-100 shadow-sm space-y-8">
                                       <!-- Price & Rating Bar -->
                                       <div class="flex flex-wrap items-center gap-4 border-b border-dashed border-slate-100 pb-6">
                                           <div class="bg-slate-50 px-6 py-2 rounded-lg border border-slate-100 flex flex-col items-center">
                                               <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">রিসেলার প্রাইস</p>
                                               <div class="flex items-center gap-2">
                                                   <span class="text-pink-600 font-black text-lg">৳\${p.price}</span>
                                                   \${p.discountAmount && parseInt(p.discountAmount) > 0 ? \`<span class="text-[10px] text-slate-400 line-through">৳\${parseInt(p.price) + parseInt(p.discountAmount)}</span>\` : ''}
                                               </div>
                </div>
                                            <div class="bg-slate-50 px-6 py-2 rounded-lg border border-slate-100 pb-2">
                                                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-center font-bold">স্টক: <span class="\${p.isStockOut || (p.stockCount !== undefined && p.stockCount <= 0) ? 'text-rose-500 font-bold' : 'text-emerald-500 font-bold'} ml-1">\${p.isStockOut || (p.stockCount !== undefined && p.stockCount <= 0) ? 'শেষ' : (p.stockCount !== undefined ? p.stockCount + ' পিস' : 'আছে')}</span></p>
                                            </div>
                                            <div class="flex items-center gap-0.5 text-orange-400 text-[10px] ml-auto">
                                                \${p.discountAmount && parseInt(p.discountAmount) > 0 ? \`<span class="bg-emerald-500 text-white px-2 py-0.5 rounded text-[9px] font-bold">-\${Math.round((parseInt(p.discountAmount)/(parseInt(p.price)+parseInt(p.discountAmount)))*100)}% ছাড়</span>\` : ''}
                                            </div>
                                        </div>
                                        <!-- Metadata -->
                                        <div class="space-y-6">
                                            <div>
                                                <p class="text-xs font-bold text-slate-500 text-center bg-slate-50 py-2 rounded-lg border border-slate-100">প্রোডাক্টটির সাজেস্টেড বিক্রয় মূল্য সর্বোচ্চ: <span class="text-emerald-700 font-extrabold ml-1">৳\${p.maxSellingPrice || p.price}</span></p>
                                            </div>`;

const newLayout = `                                   <!-- Right: Product Controls -->
                                   <div class="bg-white p-6 lg:p-10 rounded-2xl border border-slate-100 shadow-sm space-y-5">
                                       \${p.sku ? \`
                                       <div class="flex items-center justify-between border-b border-dashed border-slate-100 pb-4">
                                           <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">SKU / কোড:</p>
                                           <span class="text-[11px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 tracking-widest">\${p.sku}</span>
                                       </div>
                                       \` : ''}
                                       <!-- Price & Rating Bar -->
                                       <div class="grid grid-cols-2 gap-4 border-b border-dashed border-slate-100 pb-4">
                                           <div class="bg-slate-50 px-4 py-3 rounded-lg border border-slate-100 flex flex-col items-center justify-center text-center relative">
                                               \${p.discountAmount && parseInt(p.discountAmount) > 0 ? \`<div class="absolute -top-2 -right-2 bg-emerald-500 text-white px-1.5 py-0.5 rounded text-[8px] font-black shadow-sm">-\${Math.round((parseInt(p.discountAmount)/(parseInt(p.price)+parseInt(p.discountAmount)))*100)}%</div>\` : ''}
                                               <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">রিসেলার প্রাইস</p>
                                               <div class="flex items-center gap-1.5">
                                                   <span class="text-pink-600 font-black text-xl">৳\${p.price}</span>
                                                   \${p.discountAmount && parseInt(p.discountAmount) > 0 ? \`<span class="text-[10px] text-slate-400 line-through">৳\${parseInt(p.price) + parseInt(p.discountAmount)}</span>\` : ''}
                                               </div>
                                           </div>
                                           <div class="bg-slate-50 px-4 py-3 rounded-lg border border-slate-100 flex flex-col items-center justify-center text-center">
                                                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">স্টক</p>
                                                <p class="text-sm \${p.isStockOut || (p.stockCount !== undefined && p.stockCount <= 0) ? 'text-rose-500 font-black' : 'text-emerald-500 font-black'}">\${p.isStockOut || (p.stockCount !== undefined && p.stockCount <= 0) ? 'শেষ' : (p.stockCount !== undefined ? p.stockCount + ' পিস' : 'আছে')}</p>
                                            </div>
                                        </div>
                                        
                                        <!-- Metadata -->
                                        <div class="space-y-5">
                                            <div class="w-full">
                                                <p class="text-[11px] sm:text-xs font-bold text-slate-500 text-center bg-slate-50 py-3 rounded-lg border border-slate-100 w-full px-2">প্রোডাক্টটির সাজেস্টেড বিক্রয় মূল্য সর্বোচ্চ: <span class="text-emerald-700 font-extrabold ml-1">৳\${p.maxSellingPrice || p.price}</span></p>
                                            </div>`;

if (html.includes(oldLayout)) {
    html = html.replace(oldLayout, newLayout);
    fs.writeFileSync('index.html', html);
    console.log("Successfully replaced layout in renderPostDetail");
} else {
    console.log("Could not find old layout!");
    fs.writeFileSync('debug_layout.txt', oldLayout);
}
