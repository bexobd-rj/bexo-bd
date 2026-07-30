const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const targetStr = `                                      <!-- SKU Assignment -->
                                      <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                                          <div class="flex items-center gap-4">
                                              <div class="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">`;

const newStr = `                                      <!-- SKU Assignment -->
                                      <div class="lg:col-span-12 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                          <div class="flex items-center gap-4">
                                              <div class="w-10 h-10 shrink-0 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">`;

if (html.includes(targetStr)) {
    html = html.replace(targetStr, newStr);
    fs.writeFileSync('index.html', html);
    console.log("Fixed SKU Assignment layout.");
} else {
    console.log("Could not find SKU Assignment target.");
}
