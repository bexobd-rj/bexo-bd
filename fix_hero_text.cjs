const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const oldBlock = `<button onclick="showDeveloperModal()" class="flex items-center justify-center sm:justify-start w-full gap-4 group cursor-pointer active:scale-95 transition-all !mt-10 sm:!mt-8 pb-4">
            <div class="h-[2px] w-12 sm:w-20 bg-[#ff6b00] opacity-30 group-hover:opacity-60 transition-all rounded-full"></div>
            <p class="text-[13px] sm:text-[15px] font-bold text-[#475569] group-hover:text-[#ff6b00] transition-all flex items-center gap-2 whitespace-nowrap">
              <span class="text-[#ff6b00] bg-[#ff6b00]/10 px-2 py-0.5 rounded">&lt;/&gt;</span> 
              Developed by <span class="text-[#ff6b00]">Web Code Studio</span>
            </p>
            <div class="h-[2px] w-12 sm:w-20 bg-[#ff6b00] opacity-30 group-hover:opacity-60 transition-all rounded-full"></div>
          </button>`;

const newBlock = `<div class="flex items-center justify-center sm:justify-start w-full gap-4 !mt-10 sm:!mt-8 pb-4 relative z-[200]">
            <div class="h-[2px] w-12 sm:w-20 bg-[#ff6b00] opacity-30 rounded-full"></div>
            <p onclick="showDeveloperModal()" class="text-[13px] sm:text-[15px] font-bold text-[#475569] hover:text-[#ff6b00] transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer active:scale-95 select-none" style="padding: 10px;">
              <span class="text-[#ff6b00] bg-[#ff6b00]/10 px-2 py-0.5 rounded pointer-events-none">&lt;/&gt;</span> 
              <span class="pointer-events-none">Developed by</span> <span class="text-[#ff6b00] pointer-events-none">Web Code Studio</span>
            </p>
            <div class="h-[2px] w-12 sm:w-20 bg-[#ff6b00] opacity-30 rounded-full"></div>
          </div>`;

if (html.includes(oldBlock)) {
    html = html.replace(oldBlock, newBlock);
    fs.writeFileSync('index.html', html);
    console.log("Fixed hero text block successfully.");
} else {
    console.log("Could not find the old block in index.html");
}
