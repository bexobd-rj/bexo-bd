const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const targetStr = `                                                              <label class="text-[10px] font-bold text-slate-400 uppercase tracking-tighter text-emerald-600">ডিসকাউন্ট পরিমাণ (৳)</label>
                                                              <input type="number" id="apDiscount" value="\${p ? p.discountAmount : 0}" class="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-orange-500 font-bold text-sm text-emerald-600">
                                                          </div>
                                                          <div class="space-y-1">
                                                              <label class="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">প্রাইভেট নোট (Private Remarks)</label>
                                                              <input type="text" id="apRemarks" value="\${p ? p.remarks : ''}" placeholder="এডমিনদের জন্য বিশেষ নোট..." class="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-orange-500 font-bold text-sm">
                                                          </div>
                                                      </div>`;

const newStr = `                                                              <label class="text-[10px] font-bold text-slate-400 uppercase tracking-tighter text-emerald-600">ডিসকাউন্ট পরিমাণ (৳)</label>
                                                              <input type="number" id="apDiscount" value="\${p ? p.discountAmount : 0}" class="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-orange-500 font-bold text-sm text-emerald-600">
                                                          </div>
                                                          <div class="space-y-1">
                                                              <label class="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">প্রাইভেট নোট (Private Remarks)</label>
                                                              <input type="text" id="apRemarks" value="\${p ? p.remarks : ''}" placeholder="এডমিনদের জন্য বিশেষ নোট..." class="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-orange-500 font-bold text-sm">
                                                          </div>
                                                      </div>
                                                      <div class="space-y-1 mt-6">
                                                          <label class="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">প্রোডাক্ট রেটিং (স্টার)</label>
                                                          <select id="apRating" class="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-orange-500 font-black text-sm text-amber-500">
                                                              <option value="5" \${!p || p.rating == 5 ? 'selected' : ''}>★★★★★ (৫ স্টার)</option>
                                                              <option value="4" \${p && p.rating == 4 ? 'selected' : ''}>★★★★☆ (৪ স্টার)</option>
                                                              <option value="3" \${p && p.rating == 3 ? 'selected' : ''}>★★★☆☆ (৩ স্টার)</option>
                                                              <option value="2" \${p && p.rating == 2 ? 'selected' : ''}>★★☆☆☆ (২ স্টার)</option>
                                                              <option value="1" \${p && p.rating == 1 ? 'selected' : ''}>★☆☆☆☆ (১ স্টার)</option>
                                                          </select>
                                                      </div>`;

if (html.includes(targetStr)) {
    html = html.replace(targetStr, newStr);
    fs.writeFileSync('index.html', html);
    console.log("Added rating to admin form");
} else {
    console.log("Target string not found for rating addition");
}
