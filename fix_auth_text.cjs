const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const oldBlock = `<button
              type="button"
              onclick="checkAdminAccess()"
              class="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-orange-600 transition-all px-4 py-2"
            >
              Developed by <span class="text-orange-600">Web Code Studio</span>
            </button>`;

const newBlock = `<button
              type="button"
              onclick="checkAdminAccess()"
              class="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-orange-600 transition-all px-4 py-4 w-full block"
            >
              <span class="pointer-events-none">Developed by</span> <span class="text-orange-600 pointer-events-none">Web Code Studio</span>
            </button>`;

if (html.includes(oldBlock)) {
    html = html.replace(oldBlock, newBlock);
    fs.writeFileSync('index.html', html);
    console.log("Fixed auth text block successfully.");
} else {
    console.log("Could not find the old block in index.html for auth modal");
}
