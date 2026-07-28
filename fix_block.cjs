const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const oldBlock = `<button onclick="showDeveloperModal()" class="flex items-center justify-center sm:justify-start w-full gap-3 group cursor-pointer active:scale-95 transition-all !mt-4 sm:!mt-3 pt-2">
            <div class="h-px w-10 sm:w-16 bg-[#ff6b00] opacity-40 group-hover:opacity-60 transition-all"></div>
            <p class="text-[12px] sm:text-sm font-bold text-[#475569] group-hover:text-[#ff6b00] transition-all flex items-center gap-1.5 whitespace-nowrap">
              <span class="text-[#ff6b00]">&lt;/&gt;</span> Developed by <span class="text-[#ff6b00]">Web Code Studio</span>
            </p>
            <div class="h-px w-10 sm:w-16 bg-[#ff6b00] opacity-40 group-hover:opacity-60 transition-all"></div>
          </button>`;

const newBlock = `<button onclick="showDeveloperModal()" class="flex items-center justify-center sm:justify-start w-full gap-4 group cursor-pointer active:scale-95 transition-all !mt-10 sm:!mt-8 pb-4">
            <div class="h-[2px] w-12 sm:w-20 bg-[#ff6b00] opacity-30 group-hover:opacity-60 transition-all rounded-full"></div>
            <p class="text-[13px] sm:text-[15px] font-bold text-[#475569] group-hover:text-[#ff6b00] transition-all flex items-center gap-2 whitespace-nowrap">
              <span class="text-[#ff6b00] bg-[#ff6b00]/10 px-2 py-0.5 rounded">&lt;/&gt;</span> 
              Developed by <span class="text-[#ff6b00]">Web Code Studio</span>
            </p>
            <div class="h-[2px] w-12 sm:w-20 bg-[#ff6b00] opacity-30 group-hover:opacity-60 transition-all rounded-full"></div>
          </button>`;

html = html.replace(oldBlock, newBlock);
fs.writeFileSync('index.html', html);
console.log("Fixed click and spacing");
