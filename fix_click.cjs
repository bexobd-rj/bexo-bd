const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const oldBlock = `<div class="flex items-center justify-center sm:justify-start w-full gap-3 pt-4 sm:pt-3">
            <div class="h-px w-10 sm:w-16 bg-[#ff6b00] opacity-40"></div>
            <button onclick="showDeveloperModal()" class="text-[12px] sm:text-sm font-bold text-[#475569] hover:text-[#ff6b00] transition-all flex items-center gap-1.5 whitespace-nowrap active:scale-95 cursor-pointer">
              <span class="text-[#ff6b00]">&lt;/&gt;</span> Developed by <span class="text-[#ff6b00]">Web Code Studio</span>
            </button>
            <div class="h-px w-10 sm:w-16 bg-[#ff6b00] opacity-40"></div>
          </div>`;

const newBlock = `<button onclick="showDeveloperModal()" class="flex items-center justify-center sm:justify-start w-full gap-3 pt-3 sm:pt-2 group cursor-pointer active:scale-95 transition-all">
            <div class="h-px w-10 sm:w-16 bg-[#ff6b00] opacity-40 group-hover:opacity-60 transition-all"></div>
            <p class="text-[12px] sm:text-sm font-bold text-[#475569] group-hover:text-[#ff6b00] transition-all flex items-center gap-1.5 whitespace-nowrap">
              <span class="text-[#ff6b00]">&lt;/&gt;</span> Developed by <span class="text-[#ff6b00]">Web Code Studio</span>
            </p>
            <div class="h-px w-10 sm:w-16 bg-[#ff6b00] opacity-40 group-hover:opacity-60 transition-all"></div>
          </button>`;

html = html.replace(oldBlock, newBlock);
fs.writeFileSync('index.html', html);
console.log("Fixed click and spacing");
