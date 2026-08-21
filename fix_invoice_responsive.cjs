const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Remove the custom wrapper we added earlier
// <div class="overflow-x-auto w-full pb-6 custom-scrollbar" style="-webkit-overflow-scrolling: touch; min-width: 100%;">\n                          <div style="min-width: 800px; padding: 0 16px;">\n
html = html.replace('<div class="overflow-x-auto w-full pb-6 custom-scrollbar" style="-webkit-overflow-scrolling: touch; min-width: 100%;">\n                          <div style="min-width: 800px; padding: 0 16px;">\n                          ', '');

// And remove the closing tags
html = html.replace('                           </div>\n                          </div>\n                          </div>\n\n                           <div class="flex justify-center pt-24 pb-12">', '                           </div>\n\n                           <div class="flex justify-center pt-24 pb-12">');

// 2. Change invoiceContainer style
html = html.replace('id="invoiceContainer" class="invoice-box" style="width: 800px;', 'id="invoiceContainer" class="invoice-box" style="width: 100%; max-width: 800px;');

// 3. Make header responsive
html = html.replace('<div class="relative bg-[#1e5bb6] text-white p-8 flex justify-between items-center" style="border-bottom-left-radius: 50px;">', '<div class="relative bg-[#1e5bb6] text-white p-4 sm:p-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left" style="border-bottom-left-radius: 50px;">');

// 4. Make Addresses responsive
html = html.replace('<div class="grid grid-cols-2 gap-8 p-8 border-b border-slate-100">', '<div class="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 p-4 sm:p-8 border-b border-slate-100">');

// 5. Wrap the table in overflow-x-auto
// The table is inside <div class="px-8 pb-4"> -> <table ...>
html = html.replace('<div class="px-8 pb-4">\n                                  <table class="w-full text-left border-collapse rounded-xl overflow-hidden shadow-sm">', '<div class="px-4 sm:px-8 pb-4 overflow-x-auto">\n                                  <table class="w-full text-left border-collapse rounded-xl overflow-hidden shadow-sm min-w-[600px]">');

// 6. Make Total section responsive
// <div class="flex justify-between items-start">
// inside <div class="p-8 bg-slate-50 flex justify-between items-start">
html = html.replace('<div class="p-8 bg-slate-50 flex justify-between items-start">', '<div class="p-4 sm:p-8 bg-slate-50 flex flex-col-reverse sm:flex-row justify-between items-center sm:items-start gap-6">');

// 7. Update downloadAndShareInvoice
const downloadOld = `const element = document.getElementById('invoiceContainer');\n                  if (!element || !event) return;`;
const downloadNew = `const element = document.getElementById('invoiceContainer');\n                  if (!element || !event) return;\n                  const originalWidth = element.style.width;\n                  const originalMaxWidth = element.style.maxWidth;\n                  element.style.width = '800px';\n                  element.style.maxWidth = '800px';`;
html = html.replace(downloadOld, downloadNew);

const restoreOld = `btn.innerHTML = originalContent;\n                      btn.disabled = false;`;
const restoreNew = `btn.innerHTML = originalContent;\n                      btn.disabled = false;\n                      element.style.width = originalWidth;\n                      element.style.maxWidth = originalMaxWidth;`;
html = html.replace(restoreOld, restoreNew);

fs.writeFileSync('index.html', html, 'utf8');
console.log("Success making invoice responsive");
